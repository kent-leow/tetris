# GitHub Secrets Setup for CI/CD

To complete your automated deployment setup, you need to configure these secrets in your GitHub repository:

## Required Secrets

Navigate to: **Repository Settings → Secrets and variables → Actions → New repository secret**

### Vercel Integration
```
VERCEL_TOKEN=your_vercel_token_here
ORG_ID=your_vercel_org_id_here  
PROJECT_ID=your_vercel_project_id_here
```

### Optional (for enhanced features)
```
CODECOV_TOKEN=your_codecov_token_here
LHCI_GITHUB_APP_TOKEN=your_lighthouse_ci_token_here
```

## How to Get These Values

### 1. Vercel Token
1. Go to [Vercel Dashboard](https://vercel.com/account/tokens)
2. Create a new token with appropriate permissions
3. Copy the token value

### 2. Organization ID
1. Go to your Vercel team settings
2. Copy the Team ID (this is your ORG_ID)

### 3. Project ID  
1. Go to your Vercel project settings
2. Copy the Project ID from the General tab

### 4. Codecov Token (Optional)
1. Sign up at [codecov.io](https://codecov.io)
2. Connect your GitHub repository
3. Copy the upload token

### 5. Lighthouse CI Token (Optional)
1. Install the [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci)
2. Configure it for your repository
3. Get the token from the app settings

## Verification

Once secrets are set up, your deployment will be fully automated:

1. **Push to `dev`** → Runs all tests
2. **Open PR to `main`** → Runs tests + creates preview deployment  
3. **Merge to `main`** → Runs all tests + deploys to production

Check the **Actions** tab in your GitHub repository to monitor deployments.
