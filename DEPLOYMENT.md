# Deployment Guide

## Current Issue
You're getting "Cannot POST /api/cut" because the backend isn't deployed yet. The frontend is trying to call an API that doesn't exist.

## Solution: Deploy Backend First

### Step 1: Deploy Backend to Render

1. **Go to [render.com](https://render.com)**
2. **Create New Web Service**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `video-cutter-api`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node index.js`
   - **Environment**: `Node`
   - **Plan**: `Free` (or paid if you prefer)

5. **Add Environment Variables:**
   - `NODE_ENV` = `production`
   - `DATA_DIR` = `/data`

6. **Deploy!** Wait for it to be live.

### Step 2: Update Frontend Configuration

After your backend is deployed, you'll get a URL like: `https://video-cutter-api.onrender.com`

1. **Update `netlify.toml`:**
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://video-cutter-api.onrender.com/api/:splat"
     status = 200

   [[redirects]]
     from = "/files/*"
     to = "https://video-cutter-api.onrender.com/files/:splat"
     status = 200
   ```

2. **Or set environment variable in Netlify:**
   - Go to your Netlify site settings
   - Add environment variable: `VITE_API_URL` = `https://video-cutter-api.onrender.com/api`

### Step 3: Redeploy Frontend

1. **Commit the changes:**
   ```bash
   git add .
   git commit -m "Update API URLs for production"
   git push
   ```

2. **Netlify will auto-deploy** the updated frontend

## Alternative: Full-Stack on Netlify Functions

If you prefer to keep everything on Netlify, you can convert the backend to Netlify Functions, but this is more complex and has limitations for video processing.

## Testing

After deployment:
1. **Test backend**: Visit `https://your-backend-url.onrender.com/api/health`
2. **Test frontend**: Visit your Netlify URL and try the video cutter

## Current Status
- ✅ Frontend deployed to Netlify
- ❌ Backend not deployed yet
- 🔄 Need to deploy backend and update URLs
