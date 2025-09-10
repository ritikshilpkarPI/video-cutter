import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { mkdir, writeFile, unlink } from "fs/promises";
import { createWriteStream } from "fs";
import { randomUUID } from "crypto";
import ffmpeg from "./ffmpeg.js";
import { parseRanges } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// persistent disk on Render
const DATA_DIR = process.env.DATA_DIR
  ? process.env.DATA_DIR
  : path.join(__dirname, "..", "data");
  const OUT_DIR  = path.join(DATA_DIR, "outputs");
const TMP_DIR  = path.join(DATA_DIR, "tmp");

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: "1mb" }));
app.use("/files", express.static(OUT_DIR, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".mp4")) {
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "public, max-age=3600");
    }
  }
}));

async function ensureDirs() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(TMP_DIR,  { recursive: true });
}
ensureDirs();

// ---------- core helpers ----------
async function cleanupOldVideos() {
  try {
    const fs = await import('fs');
    const files = await fs.promises.readdir(OUT_DIR);
    const videoFiles = files.filter(file => file.endsWith('.mp4'));
    
    // Keep only the 5 most recent files, delete the rest
    if (videoFiles.length > 5) {
      const fileStats = await Promise.all(
        videoFiles.map(async (file) => {
          const filePath = path.join(OUT_DIR, file);
          const stats = await fs.promises.stat(filePath);
          return { file, mtime: stats.mtime, path: filePath };
        })
      );
      
      // Sort by modification time (newest first)
      fileStats.sort((a, b) => b.mtime - a.mtime);
      
      // Delete old files (keep first 5)
      const filesToDelete = fileStats.slice(5);
      for (const fileInfo of filesToDelete) {
        try {
          await fs.promises.unlink(fileInfo.path);
          console.log(`Deleted old video: ${fileInfo.file}`);
        } catch (err) {
          console.error(`Failed to delete ${fileInfo.file}:`, err.message);
        }
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error.message);
  }
}

function cutSegment(src, out, start, end) {
  return new Promise((resolve, reject) => {
    ffmpeg(src)
      .setStartTime(start)
      .setDuration(end - start)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions(["-preset veryfast", "-crf 23"])
      .on("end", resolve)
      .on("error", reject)
      .save(out);
  });
}

function concatSegments(listPath, finalPath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(listPath)
      .inputOptions(["-f concat", "-safe 0"])
      .outputOptions(["-c copy"])
      .on("end", resolve)
      .on("error", reject)
      .save(finalPath);
  });
}

// ---------- routes ----------
app.post("/api/cut", async (req, res) => {
  try {
    const { url, timestamps } = req.body || {};
    if (!url || !timestamps) throw new Error("url and timestamps required");

    // Clean up old videos to save space
    await cleanupOldVideos();

    const ranges = parseRanges(timestamps);

    const jobId = randomUUID().slice(0, 8);
    const work  = path.join(TMP_DIR, jobId);
    await mkdir(work, { recursive: true });

    const srcPath = path.join(work, "src.mp4");
    // Download YT using Railway API
    await new Promise(async (resolve, reject) => {
      try {
        const response = await fetch("https://vd-yt-production.up.railway.app/v1/download", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            url: url,
            format: "mp4"
          })
        });

        if (!response.ok) {
          throw new Error(`Railway API failed with status: ${response.status}`);
        }

        // Convert ReadableStream to Buffer and write to file
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(srcPath, buffer);
        resolve();
      } catch (error) {
        reject(new Error(`Failed to download video: ${error.message}`));
      }
    });

    // Cut segments
    const listLines = [];
    for (let i = 0; i < ranges.length; i++) {
      const [st, en] = ranges[i];
      const cutPath = path.join(work, `cut_${i}.mp4`);
      await cutSegment(srcPath, cutPath, st, en);
      listLines.push(`file '${cutPath.replace(/'/g,"'\\''")}'`);
    }

    const listFile  = path.join(work, "concat.txt");
    await writeFile(listFile, listLines.join("\n"));

    const finalName = `clip_${jobId}.mp4`;
    const finalPath = path.join(OUT_DIR, finalName);
    await concatSegments(listFile, finalPath);

    // Clean temp files
    try { await unlink(srcPath); } catch {}
    try { await unlink(listFile); } catch {}
    
    // Clean up old temporary directories (older than 1 hour)
    try {
      const fs = await import('fs');
      const tempDirs = await fs.promises.readdir(TMP_DIR);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      for (const dir of tempDirs) {
        const dirPath = path.join(TMP_DIR, dir);
        try {
          const stats = await fs.promises.stat(dirPath);
          if (now - stats.mtime.getTime() > oneHour) {
            await fs.promises.rm(dirPath, { recursive: true, force: true });
            console.log(`Cleaned up old temp directory: ${dir}`);
          }
        } catch (err) {
          // Ignore errors for individual directories
        }
      }
    } catch (error) {
      console.error('Error cleaning temp directories:', error.message);
    }

    // Verify file exists before returning
    const fileExists = await import('fs').then(fs => fs.promises.access(finalPath).then(() => true).catch(() => false));
    
    if (!fileExists) {
      throw new Error("Generated video file not found");
    }

    res.json({
      ok: true,
      downloadUrl: `/files/${finalName}`,
      previewUrl:  `/files/${finalName}`,
      filename: finalName
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ ok: false, error: e.message });
  }
});

// healthy
app.get("/api/health", (_, res) => res.json({ ok: true }));

// test file serving
app.get("/api/test-file/:filename", async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(OUT_DIR, filename);
  try {
    const fs = await import('fs');
    const stats = await fs.promises.stat(filePath);
    res.json({
      ok: true,
      filename,
      exists: true,
      size: stats.size,
      url: `/files/${filename}`
    });
  } catch (error) {
    res.json({
      ok: false,
      filename,
      exists: false,
      error: error.message
    });
  }
});

// manual cleanup endpoint
app.post("/api/cleanup", async (req, res) => {
  try {
    await cleanupOldVideos();
    res.json({ ok: true, message: "Cleanup completed" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// serve UI (built React) if you want single service
app.use(express.static(path.join(__dirname, "..", "client", "dist")));
app.get("*", (_, res) =>
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"))
);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("API listening on", PORT));
