// src/lib/deployment/vercel-utils.ts

/**
 * Deployment utilities for Vercel platform
 * Provides helpers for environment detection and configuration
 */

/**
 * Check if running in Vercel environment
 */
export function isVercelEnvironment(): boolean {
  return process.env.VERCEL === '1';
}

/**
 * Get the current deployment environment
 */
export function getDeploymentEnvironment(): 'development' | 'preview' | 'production' {
  if (process.env.VERCEL_ENV === 'production') {
    return 'production';
  }
  if (process.env.VERCEL_ENV === 'preview') {
    return 'preview';
  }
  return 'development';
}

/**
 * Get the deployment URL
 */
export function getDeploymentUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  return 'http://localhost:3000';
}

/**
 * Get the Git information from Vercel environment
 */
export function getGitInfo() {
  return {
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA,
    commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE,
    commitAuthor: process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME,
    branch: process.env.VERCEL_GIT_COMMIT_REF,
    repo: process.env.VERCEL_GIT_REPO_SLUG,
    owner: process.env.VERCEL_GIT_REPO_OWNER,
  };
}

/**
 * Configuration for different environments
 */
export const environmentConfig = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    corsOrigins: ['http://localhost:3000', 'https://localhost:3000'],
    logLevel: 'debug',
  },
  preview: {
    apiUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api` : '/api',
    corsOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
    logLevel: 'info',
  },
  production: {
    apiUrl: '/api',
    corsOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
    logLevel: 'error',
  },
};

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  const env = getDeploymentEnvironment();
  return environmentConfig[env];
}
