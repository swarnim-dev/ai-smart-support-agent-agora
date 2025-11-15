# Vercel Deployment Guide

This guide will help you deploy the Support Chat Bot application to Vercel.

## Deployment Strategy

This application consists of:
- **Frontend**: React + Vite (deploy to Vercel)
- **Backend**: Node.js + Express + MongoDB (deploy separately - see options below)

## Step 1: Deploy Frontend to Vercel

### Option A: Using Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to project root**:
   ```bash
   cd "/Users/swarnimpandey/Downloads/Support Chat Bot"
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? Select your account
   - Link to existing project? **No**
   - Project name? (default or custom)
   - Directory? **client**
   - Override settings? **No**

5. **Set Environment Variables**:
   After deployment, go to your Vercel dashboard:
   - Navigate to your project → Settings → Environment Variables
   - Add the following:
     ```
     VITE_API_URL=https://your-backend-url.com
     VITE_AGORA_APP_ID=your_agora_app_id
     ```

6. **Redeploy** after adding environment variables:
   ```bash
   vercel --prod
   ```

### Option B: Using Vercel Dashboard

1. **Push to GitHub** (if not already done):
   ```bash
   git push origin main
   ```

2. **Import Project**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `client`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://your-backend-url.com
     VITE_AGORA_APP_ID=your_agora_app_id
     ```

4. **Deploy**: Click "Deploy"

## Step 2: Deploy Backend

The backend needs to be deployed separately. Here are recommended options:

### Option 1: Railway (Recommended)

1. **Sign up** at [railway.app](https://railway.app)
2. **Create New Project** → Deploy from GitHub
3. **Select your repository**
4. **Configure**:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add Environment Variables**:
   ```
   MONGODB_URI=your_mongodb_uri
   PORT=3001
   AGORA_APP_ID=your_app_id
   AGORA_REST_API_KEY=your_key
   AGORA_REST_API_SECRET=your_secret
   AGORA_APP_CERTIFICATE=your_certificate
   GEMINI_API_KEY=your_gemini_key
   ELEVENLABS_API_KEY=your_elevenlabs_key
   ELEVENLABS_VOICE_ID=your_voice_id
   AGORA_LLM_PROVIDER=gemini
   AGORA_TTS_PROVIDER=elevenlabs
   ```
6. **Get Backend URL**: Railway will provide a URL like `https://your-app.railway.app`
7. **Update Frontend**: Update `VITE_API_URL` in Vercel to point to your Railway backend URL

### Option 2: Render

1. **Sign up** at [render.com](https://render.com)
2. **Create New Web Service**
3. **Connect GitHub repository**
4. **Configure**:
   - Name: `support-chat-backend`
   - Environment: Node
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Root Directory: `server`
5. **Add Environment Variables** (same as Railway)
6. **Deploy** and get your backend URL

### Option 3: Fly.io

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**:
   ```bash
   fly auth login
   ```

3. **Create app**:
   ```bash
   cd server
   fly launch
   ```

4. **Configure** and deploy

## Step 3: Update Frontend API URL

After deploying the backend:

1. **Get your backend URL** (e.g., `https://your-backend.railway.app`)
2. **Update Vercel Environment Variables**:
   - Go to your Vercel project → Settings → Environment Variables
   - Update `VITE_API_URL` to your backend URL
3. **Redeploy** the frontend

## Step 4: Configure MongoDB

### Option 1: MongoDB Atlas (Cloud)

1. **Create account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a cluster** (free tier available)
3. **Get connection string**
4. **Add to backend environment variables**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-ai-support
   ```

### Option 2: Railway MongoDB

1. **Add MongoDB service** in Railway
2. **Get connection string** from Railway
3. **Add to backend environment variables**

## Environment Variables Summary

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend-url.com
VITE_AGORA_APP_ID=your_agora_app_id
```

### Backend (Railway/Render/etc.)
```
MONGODB_URI=your_mongodb_connection_string
PORT=3001
AGORA_APP_ID=your_agora_app_id
AGORA_REST_API_KEY=your_customer_id
AGORA_REST_API_SECRET=your_customer_secret
AGORA_APP_CERTIFICATE=your_app_certificate
GEMINI_API_KEY=your_gemini_api_key
AGORA_LLM_PROVIDER=gemini
AGORA_LLM_MODEL=gemini-2.0-flash
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_voice_id
AGORA_TTS_PROVIDER=elevenlabs
AGORA_TTS_MODEL_ID=eleven_flash_v2_5
AGORA_ASR_LANGUAGE=en-US
AGORA_ASR_VENDOR=ares
```

## Testing Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend Health Check**: Visit `https://your-backend-url.com/health`
3. **Test Chat**: Send a message and verify it works
4. **Test Voice**: Try starting a voice agent

## Troubleshooting

### Frontend can't connect to backend:
- Verify `VITE_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend is running and accessible

### Backend connection issues:
- Verify MongoDB connection string
- Check all environment variables are set
- Review backend logs for errors

### Build errors:
- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility
- Review build logs in Vercel dashboard

## Quick Deploy Commands

```bash
# Deploy frontend to Vercel
cd "/Users/swarnimpandey/Downloads/Support Chat Bot"
vercel --prod

# Or use GitHub integration for automatic deployments
git push origin main  # Auto-deploys if connected to Vercel
```

## Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Deploy backend to Railway/Render
3. ✅ Set up MongoDB Atlas
4. ✅ Configure environment variables
5. ✅ Test the deployment
6. ✅ Set up custom domain (optional)

