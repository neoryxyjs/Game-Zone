# GameZone Social - Deployment Guide

## Issues Fixed

### 1. CORS Configuration ✅
- **Problem**: Server was sending wrong `Access-Control-Allow-Origin` header
- **Solution**: Updated CORS configuration in `server/index.js` to allow specific origins including Vercel deployment

### 2. API URL Configuration ✅
- **Problem**: Frontend was using placeholder URL `https://tu-url-de-railway.railway.app`
- **Solution**: Updated `client/src/config/api.js` to use proper environment-based URL configuration

### 3. Manifest 401 Errors ✅
- **Problem**: Vercel deployment had authentication issues with static files
- **Solution**: Created `vercel.json` configuration and updated manifest.json

## Next Steps

### 1. Update Railway Backend URL
Replace `https://tu-url-de-railway.railway.app` with your actual Railway backend URL:

1. Go to your Railway dashboard
2. Copy the actual backend URL (should look like `https://your-app-name.railway.app`)
3. Update the following files:
   - `client/src/config/api.js` (line 4)
   - `vercel.json` (line 20)
   - Set environment variable `REACT_APP_API_URL` in Vercel dashboard

### 2. Deploy Backend to Railway
1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Node.js project in the `server/` directory
3. Add environment variables in Railway dashboard:
   - `RIOT_API_KEY`: Your Riot Games API key
   - `DATABASE_URL`: Will be provided automatically by Railway

### 3. Deploy Frontend to Vercel
1. Connect your GitHub repository to Vercel
2. Set build settings:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
3. Add environment variable:
   - `REACT_APP_API_URL`: Your Railway backend URL

### 4. Test the Application
1. Visit your Vercel frontend URL
2. Try registering a new user
3. Check browser console for any remaining CORS errors
4. Verify that the backend is receiving requests

## Environment Variables Summary

### Backend (Railway)
- `DATABASE_URL` (auto-provided)
- `RIOT_API_KEY` (your Riot API key)
- `PORT` (auto-set by Railway)

### Frontend (Vercel)
- `REACT_APP_API_URL` (your Railway backend URL)

## Troubleshooting

### CORS Errors
If you still see CORS errors:
1. Check that your Railway backend URL is correct
2. Verify the CORS configuration in `server/index.js`
3. Make sure the frontend URL is in the allowed origins list

### 401/404 Errors
If you see 401 or 404 errors:
1. Check that all files are properly deployed
2. Verify the Vercel configuration
3. Make sure the build process completed successfully

### Database Connection
If database operations fail:
1. Check Railway logs for database connection errors
2. Verify that migrations ran successfully
3. Check that the `DATABASE_URL` is properly set
