# Convert Express API to Vercel Serverless Functions

## Problem
The Vercel deployment is only building the frontend (Vite), but the Express.js backend with API endpoints is not being deployed. This causes all `/api/*` requests to return 404 errors.

## User Review Required

> [!IMPORTANT]
> **Simplified Approach**: Instead of converting 100+ endpoints to individual serverless functions, we'll use Vercel's ability to run Express.js as a single serverless function. This is much simpler and maintains your existing code structure.

> [!WARNING]
> **Environment Variables**: You'll need to add all your environment variables (DATABASE_URL, JWT_SECRET, etc.) to Vercel's dashboard after deployment.

## Proposed Changes

### [NEW] `vercel.json`
Create Vercel configuration to:
- Route all `/api/*` requests to the Express server
- Configure build settings for the Vite frontend
- Set up rewrites to handle SPA routing

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### [NEW] `api/index.js`
Create a Vercel serverless function wrapper for the Express app:
- Import the existing Express app from `server/index.js`
- Export it as a Vercel serverless function
- Handle serverless environment differences

### [MODIFY] `server/index.js`
Minor modifications to make it compatible with Vercel:
- Export the Express app instead of starting the server
- Make the server start conditional (only in development)
- Ensure all paths work in serverless environment

### [MODIFY] `package.json`
Update build scripts:
- Keep existing `vite build` for frontend
- Ensure all dependencies are in `dependencies` (not `devDependencies`)

### [PHASE 2] UI Cleanup & Backend Verification

#### [MODIFY] [Header.tsx](../components/Header.tsx)
- Remove `Connect` from `navItems` array.

#### [MODIFY] [Footer.tsx](../components/Footer.tsx)
- Remove the "Request Prayer" link which points to `/connect`.

#### [MODIFY] [App.tsx](../App.tsx)
- Remove `Connect` import and the `/connect` route definition.

#### [DELETE] [Connect.tsx](../src/pages/public/Connect.tsx)
- Remove the unused page component.

#### [VERIFY] Prisma Postgres Configuration
- Confirm database connection string and driver compatibility.
- Note: Current setup uses `pg` with Neon Postgres, which is compatible with Vercel's Prisma Postgres service.

## Verification Plan

### Local Testing
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel dev` to test serverless functions locally
3. Verify `/api/sermons?published=true` returns data

### Deployment Testing
1. Push changes to GitHub
2. Vercel will auto-deploy
3. Add environment variables in Vercel dashboard
4. Test all API endpoints on production URL
5. Verify frontend loads and connects to API

## Alternative Approach (If Needed)

If the Express-as-serverless approach has issues, we can:
1. Deploy the Express backend to Railway/Render (free tier)
2. Update frontend API calls to point to the separate backend URL
3. Configure CORS properly

Would you like to proceed with this plan?
