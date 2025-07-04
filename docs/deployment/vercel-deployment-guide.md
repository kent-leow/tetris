# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the Tetris application to Vercel with full stack support (frontend, backend APIs, and database).

## Prerequisites

- GitHub repository with the project
- Vercel account (free tier available)
- MongoDB Atlas account or external MongoDB instance

## Environment Variables Setup

Before deployment, you'll need to configure the following environment variables in Vercel:

### Required Environment Variables

```bash
# Database Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
MONGODB_DB_NAME=tetris

# Application Configuration
NEXTAUTH_SECRET=your-secure-random-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app

# CORS Configuration
ALLOWED_ORIGINS=https://your-domain.vercel.app,https://www.your-domain.vercel.app,https://your-custom-domain.com,https://www.your-custom-domain.com

# API Configuration
API_BASE_URL=https://your-domain.vercel.app/api
```

### Optional Environment Variables

```bash
# Enable debug logging in development
DEBUG=true

# Custom database name (defaults to 'tetris')
MONGODB_DB_NAME=your-custom-db-name
```

## Step 1: Prepare Your MongoDB Database

### Option A: MongoDB Atlas (Recommended)

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user with read/write permissions
4. Whitelist Vercel's IP addresses (or use 0.0.0.0/0 for all IPs)
5. Get your connection string from the Atlas dashboard

### Option B: External MongoDB Instance

1. Ensure your MongoDB instance is accessible from the internet
2. Create appropriate user credentials
3. Configure firewall rules to allow Vercel connections

## Step 2: Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended for first deployment)

1. Visit [vercel.com/import](https://vercel.com/import)
2. Connect your GitHub account
3. Import your repository
4. Configure the following build settings:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`
   - **Node.js Version:** 18.x or later

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts to configure your project
```

## Step 3: Configure Environment Variables

1. Go to your project dashboard on Vercel
2. Navigate to **Settings** > **Environment Variables**
3. Add all required environment variables listed above
4. Make sure to set the correct environment (Production, Preview, Development)

## Step 4: Configure Custom Domains (Optional)

1. In your Vercel project dashboard, go to **Settings** > **Domains**
2. Add your custom domain(s)
3. Configure DNS records as instructed by Vercel
4. Update your `ALLOWED_ORIGINS` environment variable to include the new domains

## Step 5: Verify Deployment

### Health Check

Visit `https://your-domain.vercel.app/api/health` to verify:
- API endpoints are working
- Database connection is established
- All services are healthy

### Test API Endpoints

1. **Leaderboard GET:** `https://your-domain.vercel.app/api/leaderboard`
2. **Leaderboard POST:** Send a POST request with `{\"name\": \"Test\", \"score\": 1000}`

### Test CORS

Use browser developer tools to verify CORS headers are present in API responses.

## Step 6: Set Up Automatic Deployments

1. In your Vercel project settings, ensure Git integration is enabled
2. Configure which branches trigger deployments:
   - `main` branch → Production deployment
   - `dev` branch → Preview deployment
   - Feature branches → Preview deployments

## Performance Optimization

### Recommended Settings

The deployment includes several performance optimizations:

- **Image Optimization:** WebP and AVIF support
- **Compression:** Gzip/Brotli compression enabled
- **Caching:** Proper cache headers for static assets
- **Connection Pooling:** MongoDB connection pooling for serverless
- **Security Headers:** CSP, CORS, and security headers configured

### Monitoring

- Use Vercel Analytics to monitor Core Web Vitals
- Set up monitoring for the `/api/health` endpoint
- Monitor database performance and connection usage

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify MongoDB URI is correct
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

2. **CORS Errors**
   - Verify `ALLOWED_ORIGINS` includes all necessary domains
   - Check that domains include protocol (https://)
   - Ensure both www and non-www versions are included

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are listed in package.json
   - Review build logs for specific error messages

4. **Performance Issues**
   - Monitor database connection pool usage
   - Check API response times in Vercel dashboard
   - Review serverless function timeout settings

### Debug Mode

Enable debug logging by setting `DEBUG=true` in environment variables for development deployments.

## Security Considerations

- Never commit sensitive environment variables to Git
- Use strong, unique secrets for `NEXTAUTH_SECRET`
- Regularly rotate database credentials
- Monitor access logs for suspicious activity
- Keep dependencies updated for security patches

## Cost Optimization

- Vercel Free tier includes generous limits for personal projects
- MongoDB Atlas free tier (M0) suitable for development and small applications
- Monitor usage in both Vercel and MongoDB dashboards
- Consider upgrading plans based on actual usage patterns

## Support

For deployment issues:
1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review MongoDB Atlas documentation: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
3. Check project-specific logs in Vercel dashboard
4. Review health check endpoint for system status
