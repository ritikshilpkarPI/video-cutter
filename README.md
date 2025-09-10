# VideoClip Pro - YouTube Video Segment Extractor

A professional web application for extracting and merging specific segments from YouTube videos with precision.

## Features

- ✂️ Extract multiple video segments from YouTube videos
- 🎬 Merge segments into a single video file
- 🎨 Modern, responsive UI design
- ⚡ Fast processing with FFmpeg
- 📱 Mobile-friendly interface
- 🔄 Real-time progress tracking

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Video Processing**: FFmpeg
- **Video Download**: Railway API
- **Deployment**: Netlify (Frontend) + Render (Backend)

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd video-cutter
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

3. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:10000

## Deployment

### Frontend (Netlify)

1. **Build the project**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `cd client && npm install && npm run build`
   - Set publish directory: `client/dist`
   - Deploy!

### Backend (Render)

1. **Create a new Web Service on Render**
2. **Connect your GitHub repository**
3. **Set build command**: `cd server && npm install`
4. **Set start command**: `cd server && node index.js`
5. **Add environment variable**: `DATA_DIR=/data`
6. **Deploy!**

### Environment Variables

For production deployment, set these environment variables:

**Frontend (.env.production)**:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Backend**:
```
DATA_DIR=/data
NODE_ENV=production
```

## Usage

1. **Enter YouTube URL**: Paste any YouTube video URL
2. **Specify Time Segments**: Use format `mm:ss-mm:ss` (comma separated)
   - Example: `0:10-0:25, 1:02-1:30, 2:15-2:45`
3. **Click "Cut & Merge Video"**: Wait for processing
4. **Preview & Download**: Watch the result and download MP4

## API Endpoints

- `POST /api/cut` - Process video cutting request
- `GET /api/health` - Health check
- `GET /files/:filename` - Serve generated video files

## Project Structure

```
video-cutter/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main application component
│   │   └── main.jsx       # React entry point
│   ├── index.html         # HTML template
│   └── vite.config.js     # Vite configuration
├── server/                # Express backend
│   ├── index.js          # Main server file
│   ├── ffmpeg.js         # FFmpeg configuration
│   └── utils.js          # Utility functions
├── data/                  # Video storage
│   ├── outputs/          # Generated videos
│   └── tmp/              # Temporary files
├── netlify.toml          # Netlify configuration
└── README.md             # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes!

---

Built with ❤️ for seamless video editing
