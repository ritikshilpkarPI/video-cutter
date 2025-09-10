import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:10000", // dev proxy to backend
      "/files": "http://localhost:10000" // proxy video files to backend
    }
  },
  build: {
    outDir: "dist"
  }
});
