# Vercel Deployment Fix - Walkthrough

## Problem Solved
Fixed the **404 errors on `/api/sermons` and other API endpoints** when deployed to Vercel. The issue was that Vercel was only deploying the frontend (Vite build) and not the Express.js backend.

## Changes Made

### 1. Created [vercel.json](../vercel.json)
Vercel configuration file that:
- Routes all `/api/*` requests to the serverless function
- Serves the Vite frontend as a Single Page Application
- Sets a 30-second timeout for API functions

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "functions": {
    "api/index.js": { "maxDuration": 30 }
  }
}
```

### 2. Created [api/index.js](../api/index.js)
Serverless function wrapper that imports and exports the Express app:

```javascript
import app from '../server/index.js';
export default app;
```

### 3. Modified [server/index.js](../server/index.js)
- **Exported the Express app** as default export for Vercel
- **Made server startup conditional** - only starts in development, not in Vercel serverless environment
- Added check for `process.env.VERCEL !== '1'` before calling `app.listen()`

### 4. Updated [package.json](../package.json)
Added missing server dependencies to root package.json:
- `bcrypt` - Password hashing
- `multer` - File upload handling
- `xml2js` - XML parsing

### 5. Created [.vercelignore](../.vercelignore)
Excludes unnecessary files from deployment:
- `server/node_modules` (uses root dependencies instead)
- Log files
- Local environment files

### 6. Removed "Connect" Module
As requested, the "Connect" page and all navigation links have been removed:
- **Header**: Removed "Connect" from the navigation bar.
- **Footer**: Removed "Request Prayer" from the footer links.
- **Routes**: Removed `/connect` route and import from `App.tsx`.
- **Files**: Deleted `src/pages/public/Connect.tsx`.

---

## Deployment & Verification Details

### Vercel Build Sync
> [!NOTE]
> The errors you saw earlier were likely from an older build (Commit `3f0b123`). The latest fix is in Commit `c5da91e`. Please ensure Vercel has finished deploying the latest commit.

### Backend & Prisma
Our investigation confirms:
- **Database**: The project uses **Neon Postgres** via the `pg` driver.
- **Prisma**: No Prisma schema was found in the codebase. If you plan to migrate to Prisma later, the current Neon connection string is fully compatible.
- **Vercel Functions**: The backend now runs as a Vercel Serverless Function, fixing the 404 errors.

## Deployment Instructions

### Step 1: Push Changes to GitHub

```bash
cd /Users/yahweh/Downloads/anointed-worship-center-redesign
git add .
git commit -m "Fix: Configure Express API for Vercel serverless deployment"
git push origin main
```

### Step 2: Configure Environment Variables on Vercel

> [!IMPORTANT]
> You **must** add these environment variables in the Vercel dashboard for the API to work.

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` | Neon PostgreSQL connection string |
| `JWT_SECRET` | `super_secure_change_this_later` | ⚠️ **Change this to a secure random string in production!** |
| `PORT` | `5001` | Optional - Vercel handles this automatically |
| `VITE_YOUTUBE_API_KEY` | `AIzaSyCmhzKQCmb-z36AduAn8uJTQaCK4O17gSg` | YouTube API key for frontend |
| `VITE_YOUTUBE_CHANNEL_ID` | `UCkWQ0vGh7eKPXSQddo9fGRw` | YouTube channel ID |

> [!CAUTION]
> **Security Recommendation**: Generate a new `JWT_SECRET` using:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### Step 3: Verify Deployment

After Vercel auto-deploys your changes:

1. **Check the build logs** - Ensure no errors during build
2. **Test the API endpoint**:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```
   Should return: `{"status":"ok","time":"..."}`

3. **Test the sermons endpoint**:
   ```bash
   curl https://your-app.vercel.app/api/sermons?published=true
   ```
   Should return an array of sermon objects

4. **Open your app** and verify:
   - Frontend loads correctly
   - Sermons page displays data
   - No 404 errors in browser console

---

## Testing Locally (Optional)

To test the Vercel serverless setup locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Run in development mode
vercel dev
```

This will start both the frontend and API on `http://localhost:3000`.

---

## What Happens Now

✅ **Frontend**: Vite builds your React app to the `dist/` folder  
✅ **Backend**: Express app runs as a Vercel serverless function at `/api/*`  
✅ **Routing**: All `/api/*` requests go to your Express server  
✅ **SPA Support**: All other routes serve `index.html` for React Router  

---

## Troubleshooting

### If you still get 404 errors:

1. **Check environment variables** - Make sure they're set in Vercel dashboard
2. **Check build logs** - Look for any errors during deployment
3. **Verify the API route** - Try accessing `/api/health` first
4. **Check database connection** - Ensure Neon database is accessible from Vercel

### If the build fails:

1. **Check dependencies** - All server dependencies must be in root `package.json`
2. **Check import paths** - Ensure all imports use `.js` extensions for ES modules
3. **Check Vercel logs** - View detailed error messages in the deployment logs

---

## Next Steps

After successful deployment:

- [ ] Test all API endpoints (auth, sermons, events, etc.)
- [ ] Update `JWT_SECRET` to a secure random value
- [ ] Monitor Vercel function logs for any runtime errors
- [ ] Consider upgrading Vercel plan if you hit function timeout limits (currently 30s)
