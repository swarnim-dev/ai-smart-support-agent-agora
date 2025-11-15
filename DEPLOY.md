# Quick Deployment Guide to Vercel

## Prerequisites

- GitHub repository (your code should be pushed)
- Vercel account (sign up at [vercel.com](https://vercel.com))

## Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure Project Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `client` (IMPORTANT!)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. **Add Environment Variables**:
   Click "Environment Variables" and add:
   ```
   VITE_API_URL=https://your-backend-url.com
   VITE_AGORA_APP_ID=your_agora_app_id
   ```
   ⚠️ **Note**: You'll need to deploy your backend first to get the URL

6. **Click "Deploy"**

## Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Navigate to project**:
   ```bash
   cd "/Users/swarnimpandey/Downloads/Support Chat Bot"
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   
   When prompted:
   - Set up and deploy? **Yes**
   - Which scope? (select your account)
   - Link to existing project? **No** (first time)
   - Project name? (press enter for default or enter custom name)
   - In which directory is your code located? **./client**
   - Want to override settings? **No**

5. **Set Environment Variables**:
   ```bash
   vercel env add VITE_API_URL
   vercel env add VITE_AGORA_APP_ID
   ```
   Or add them in the Vercel dashboard.

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Backend Deployment

Your backend needs to be deployed separately. Recommended platforms:

### Railway (Easiest)
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select repository
4. Settings → Add environment variables (see VERCEL_DEPLOYMENT.md)
5. Deploy → Get your backend URL
6. Update `VITE_API_URL` in Vercel

### Render
1. Go to [render.com](https://render.com)
2. New Web Service → Connect GitHub
3. Configure:
   - Root Directory: `server`
   - Build: `npm install`
   - Start: `npm start`
4. Add environment variables
5. Deploy

## Environment Variables Checklist

### Frontend (Vercel)
- [ ] `VITE_API_URL` - Your backend URL
- [ ] `VITE_AGORA_APP_ID` - Your Agora App ID

### Backend (Railway/Render)
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `PORT` - Port number (usually 3001)
- [ ] `AGORA_APP_ID` - Agora App ID
- [ ] `AGORA_REST_API_KEY` - Agora Customer ID
- [ ] `AGORA_REST_API_SECRET` - Agora Customer Secret
- [ ] `AGORA_APP_CERTIFICATE` - Agora App Certificate
- [ ] `GEMINI_API_KEY` - Gemini API key
- [ ] `ELEVENLABS_API_KEY` - ElevenLabs API key
- [ ] `ELEVENLABS_VOICE_ID` - ElevenLabs Voice ID
- [ ] `AGORA_LLM_PROVIDER=gemini`
- [ ] `AGORA_TTS_PROVIDER=elevenlabs`

## After Deployment

1. **Test Frontend**: Visit your Vercel URL
2. **Test Backend**: Visit `https://your-backend-url.com/health`
3. **Update Frontend**: Set `VITE_API_URL` to your backend URL
4. **Redeploy Frontend**: Changes to env vars require redeploy

## Troubleshooting

**Build fails?**
- Check that Root Directory is set to `client`
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

**Can't connect to backend?**
- Verify `VITE_API_URL` is correct
- Check backend is running
- Verify CORS is enabled on backend

**Environment variables not working?**
- Make sure they start with `VITE_` for frontend
- Redeploy after adding env vars
- Check variable names are correct

