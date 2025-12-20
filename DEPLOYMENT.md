# Ziko Store - Deployment Guide

## Vercel Deployment

This project is configured for easy deployment on Vercel.

### Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Git repository (GitHub, GitLab, or Bitbucket)

### Deployment Steps

#### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push your code to a Git repository
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your Git repository
5. Vercel will auto-detect the Vite configuration
6. Click "Deploy"

#### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the project root:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Configuration Files

- **`vercel.json`**: Configures routing for SPA (Single Page Application)
  - Ensures all routes redirect to `index.html` for client-side routing
  - Handles static assets properly

- **`.vercelignore`**: Excludes unnecessary files from deployment
  - Reduces deployment size
  - Speeds up build process

### Build Settings

The project uses the following build configuration:

- **Build Command**: `npm run build` (automatically detected)
- **Output Directory**: `dist` (automatically detected)
- **Install Command**: `npm install` (automatically detected)

### Environment Variables

If you need to add environment variables:

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add your variables (e.g., API URLs, keys)
4. Redeploy for changes to take effect

### Custom Domain

To add a custom domain:

1. Go to your project settings on Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Automatic Deployments

Vercel automatically deploys:

- **Production**: When you push to the `main` or `master` branch
- **Preview**: For every pull request and branch

### Troubleshooting

**Issue**: Routes return 404
- **Solution**: Ensure `vercel.json` is present and properly configured

**Issue**: Build fails
- **Solution**: Check build logs and ensure all dependencies are in `package.json`

**Issue**: Assets not loading
- **Solution**: Verify asset paths are relative and images are in the `public` directory

### Support

For more information, visit:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
