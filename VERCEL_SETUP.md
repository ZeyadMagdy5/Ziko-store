# Vercel Production Setup

To ensure the application connects to the correct backend in production, you must configure the Environment Variables in your Vercel Project Settings.

## Required Environment Variable

- **Key:** `VITE_API_BASE_URL`
- **Value:** `https://bags-shop.runasp.net` (or your production backend URL)

## Steps to Configure in Vercel

1. Go to your Vercel Dashboard.
2. Select the **ziko-store** (or appropriate) project.
3. Click on **Settings** -> **Environment Variables**.
4. Add a new variable:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://bags-shop.runasp.net`
5. Click **Save**.
6. **Redeploy** your application for the changes to take effect (go to Deployments -> Redeploy).

## Why is this needed?
The application intentionally avoids using relative paths (e.g., `/api`) to prevent issues where the frontend tries to serve API requests as HTML files (causing "Unexpected token <" errors). By mocking the configuration explicitly, we ensure all data is fetched from the running backend server.
