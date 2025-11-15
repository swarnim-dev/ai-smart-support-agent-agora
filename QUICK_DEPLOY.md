# Quick Deploy to Vercel

## 🚀 Fastest Way: Vercel Dashboard

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in

3. **Click "Add New Project"**

4. **Import your GitHub repository**

5. **Configure**:
   - **Framework Preset**: Vite
   - **Root Directory**: `client` ⚠️ **IMPORTANT!
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `dist` (auto)

6. **Add Environment Variables**:
   - `VITE_API_URL` = `https://your-backend-url.com` (add after backend is deployed)
   - `VITE_AGORA_APP_ID` = `your_agora_app_id`

7. **Click "Deploy"**

## 📝 Using Vercel CLI (Alternative)

If you prefer CLI:

```bash
# Install Vercel CLI (may need sudo)
sudo npm install -g vercel

# Or use npx (no install needed)
npx vercel

# Login
vercel login

# Deploy
cd "/Users/swarnimpandey/Downloads/Support Chat Bot"
vercel

# When asked for directory, enter: ./client

# Add environment variables
vercel env add VITE_API_URL production
vercel env add VITE_AGORA_APP_ID production

# Deploy to production
vercel --prod
```

## 🔧 Backend Deployment

Deploy backend to **Railway** or **Render** first, then update `VITE_API_URL`.

See `VERCEL_DEPLOYMENT.md` for detailed backend deployment instructions.

