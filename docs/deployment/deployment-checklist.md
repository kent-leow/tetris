# Deployment Checklist

Use this checklist to ensure a successful deployment to Vercel.

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm run test:all`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Code coverage meets requirements
- [ ] All accessibility tests passing

### Configuration
- [ ] Environment variables configured in `.env.example`
- [ ] `vercel.json` configuration updated
- [ ] `next.config.ts` optimized for production
- [ ] Database connection strings prepared
- [ ] CORS origins configured for production domains

### Security
- [ ] No sensitive data in code or environment files
- [ ] Strong secrets generated for `NEXTAUTH_SECRET`
- [ ] Database credentials secured
- [ ] API input validation implemented
- [ ] Security headers configured

## Database Setup

### MongoDB Atlas
- [ ] Cluster created and configured
- [ ] Database user created with appropriate permissions
- [ ] Network access configured (IP whitelist)
- [ ] Connection string obtained and tested
- [ ] Backup and monitoring configured

### Local MongoDB (Development)
- [ ] Docker container running
- [ ] Test data populated (optional)
- [ ] Connection verified

## Vercel Configuration

### Project Setup
- [ ] GitHub repository connected to Vercel
- [ ] Project settings configured:
  - [ ] Framework: Next.js
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `.next`
  - [ ] Install command: `npm install`
  - [ ] Node.js version: 18.x or later

### Environment Variables
- [ ] `MONGODB_URI` - Database connection string
- [ ] `NEXTAUTH_SECRET` - Secure random secret
- [ ] `NEXTAUTH_URL` - Production URL
- [ ] `ALLOWED_ORIGINS` - CORS allowed origins
- [ ] `API_BASE_URL` - API base URL (optional)

### Domain Configuration
- [ ] Custom domain added (if applicable)
- [ ] DNS records configured
- [ ] SSL certificate provisioned
- [ ] www redirect configured

## Deployment

### Initial Deployment
- [ ] Deploy from `main` branch
- [ ] Verify deployment successful
- [ ] Check deployment logs for errors
- [ ] Test health check endpoint (`/api/health`)

### Verification Tests
- [ ] Main page loads successfully
- [ ] API endpoints respond correctly
- [ ] Database connection working
- [ ] CORS headers present
- [ ] Security headers configured
- [ ] Performance metrics acceptable

### Functional Testing
- [ ] Single player game works
- [ ] Two player game works
- [ ] Leaderboard submission works
- [ ] Leaderboard retrieval works
- [ ] Game audio works
- [ ] Keyboard controls responsive

## Post-Deployment

### Monitoring Setup
- [ ] Vercel Analytics configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Database monitoring configured

### Documentation
- [ ] README updated with deployment info
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide updated

### Backup and Recovery
- [ ] Database backup strategy confirmed
- [ ] Rollback procedure documented
- [ ] Emergency contacts identified

## Continuous Deployment

### Branch Strategy
- [ ] `main` branch → Production deployment
- [ ] `dev` branch → Preview deployment  
- [ ] Feature branches → Preview deployments
- [ ] Auto-deployment configured

### Quality Gates
- [ ] Tests must pass before deployment
- [ ] Code review required for main branch
- [ ] Staging environment testing (if applicable)

## Performance Optimization

### Core Web Vitals
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

### Optimization Features
- [ ] Image optimization enabled
- [ ] Compression configured
- [ ] Caching headers set
- [ ] Bundle size optimized

## Troubleshooting

### Common Issues
- [ ] Database connection timeouts
- [ ] CORS errors from production domains
- [ ] Environment variable typos
- [ ] Build failures due to dependencies
- [ ] Performance issues under load

### Debug Resources
- [ ] Vercel deployment logs
- [ ] MongoDB Atlas metrics
- [ ] Browser developer tools
- [ ] Health check endpoint status
- [ ] Error tracking dashboard

## Sign-off

- [ ] **Developer**: Code review complete and deployment tested
- [ ] **QA**: All tests passing and functionality verified  
- [ ] **DevOps**: Infrastructure and monitoring configured
- [ ] **Product**: User acceptance criteria met

**Deployment Date**: ___________

**Deployed By**: ___________

**Version**: ___________

**Notes**: 
_____________________
_____________________
_____________________
