import React, { useState, useRef } from "react";

export default function App() {
  const [url, setUrl] = useState("");
  const [timestamps, setTimestamps] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const videoRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVideoUrl("");
    setError("");
    setProgress("Downloading video...");
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "/api";
      console.log("Making API call to:", `${apiUrl}/cut`);
      const resp = await fetch(`${apiUrl}/cut`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, timestamps })
      });
      
      setProgress("Processing video segments...");
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = resp.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend server is not running. Please deploy the backend first.");
      }
      
      const data = await resp.json();
      if (!data.ok) throw new Error(data.error || "Unknown error");
      
      setProgress("Finalizing...");
      console.log("API Response:", data);
      console.log("Video URL:", data.previewUrl);
      setVideoUrl(data.previewUrl);
      setProgress("");
    } catch (err) {
      setError(err.message);
      setProgress("");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoLoad = () => {
    console.log("Video loaded successfully");
  };
  
  const handleVideoCanPlay = () => {
    console.log("Video can start playing");
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">✂️</div>
            <h1>VideoClip Pro</h1>
          </div>
          <p className="subtitle">Extract and merge video segments from YouTube with precision</p>
        </header>

        <div className="main-content">
          <form onSubmit={submit} className="form">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔗</span>
                YouTube URL
              </label>
        <input
                className="form-input"
                type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">⏱️</span>
                Time Segments
                <span className="label-hint">Format: mm:ss-mm:ss (comma separated)</span>
              </label>
        <textarea
                className="form-textarea"
                placeholder="0:10-0:25, 1:02-1:30, 2:15-2:45"
          value={timestamps}
          onChange={(e) => setTimestamps(e.target.value)}
          required
                disabled={loading}
                rows={3}
              />
              <div className="input-help">
                <span className="help-icon">💡</span>
                Example: 0:10-0:25, 1:02-1:30 will extract 10-25 seconds and 1:02-1:30
              </div>
            </div>

            <button 
              type="submit" 
              className={`submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <span className="btn-icon">✂️</span>
                  Cut & Merge Video
                </>
              )}
        </button>

            {progress && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <span className="progress-text">{progress}</span>
              </div>
            )}

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
      </form>

      {videoUrl && (
            <div className="video-section">
              <div className="video-header">
                <h2 className="video-title">
                  <span className="video-icon">🎬</span>
                  Your Video Preview
                </h2>
                <a 
                  href={videoUrl} 
                  download 
                  className="download-btn"
                >
                  <span className="download-icon">⬇️</span>
                  Download MP4
                </a>
              </div>
              
              <div className="video-container">
                <video 
                  ref={videoRef}
                  src={videoUrl} 
                  controls 
                  className="video-player"
                  onLoadedData={handleVideoLoad}
                  onCanPlay={handleVideoCanPlay}
                  onError={(e) => {
                    console.error("Video load error:", e);
                    console.error("Video src:", videoUrl);
                    setError(`Failed to load video: ${videoUrl}. Please check if the file exists.`);
                    setVideoUrl("");
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="video-info">
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className="info-value success">Ready to play</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Format:</span>
                  <span className="info-value">MP4</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="footer">
          <p>Built with ❤️ for seamless video editing</p>
        </footer>
      </div>

      <style jsx>{`
        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          color: white;
        }

        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 10px;
        }

        .logo-icon {
          font-size: 2.5rem;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }

        .header h1 {
          font-size: 3rem;
          font-weight: 700;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          margin: 0;
          font-weight: 300;
        }

        .main-content {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .form {
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          font-size: 1rem;
        }

        .label-icon {
          font-size: 1.2rem;
        }

        .label-hint {
          font-size: 0.8rem;
          font-weight: 400;
          color: #6b7280;
          margin-left: auto;
        }

        .form-input, .form-textarea {
          width: 100%;
          padding: 15px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #f9fafb;
        }

        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input:disabled, .form-textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
        }

        .input-help {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .help-icon {
          font-size: 1rem;
        }

        .submit-btn {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-icon {
          font-size: 1.2rem;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .progress-container {
          margin-top: 20px;
          text-align: center;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 3px;
          animation: progress 2s ease-in-out infinite;
        }

        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }

        .progress-text {
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 500;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          color: #dc2626;
          margin-top: 20px;
          font-weight: 500;
        }

        .error-icon {
          font-size: 1.2rem;
        }

        .video-section {
          background: #f8fafc;
          border-radius: 16px;
          padding: 30px;
          border: 1px solid #e2e8f0;
        }

        .video-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .video-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .video-icon {
          font-size: 1.5rem;
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #10b981;
          color: white;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .download-btn:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
        }

        .download-icon {
          font-size: 1.1rem;
        }

        .video-container {
          position: relative;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .video-player {
          width: 100%;
          height: auto;
          min-height: 300px;
          display: block;
        }

        .video-info {
          display: flex;
          gap: 30px;
          flex-wrap: wrap;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .info-label {
          font-weight: 600;
          color: #6b7280;
        }

        .info-value {
          color: #374151;
          font-weight: 500;
        }

        .info-value.success {
          color: #10b981;
        }

        .footer {
          text-align: center;
          color: white;
          opacity: 0.8;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .container {
            padding: 15px;
          }

          .main-content {
            padding: 25px;
          }

          .header h1 {
            font-size: 2.2rem;
          }

          .subtitle {
            font-size: 1rem;
          }

          .video-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .video-info {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
}
