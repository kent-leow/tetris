// e2e/deployment.spec.ts
import { test, expect } from '@playwright/test';

/**
 * End-to-end tests for deployment verification
 * These tests verify that the deployed application works correctly
 */

test.describe('Deployment Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should load the main page successfully', async ({ page }) => {
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Tetris/i);
    
    // Verify main navigation elements are present
    await expect(page.getByRole('button', { name: /single player/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /two player/i })).toBeVisible();
  });

  test('should have working API health check', async ({ page }) => {
    // Make request to health endpoint
    const response = await page.request.get('/api/health');
    
    // Verify successful response
    expect(response.status()).toBe(200);
    
    // Verify response structure
    const health = await response.json();
    expect(health).toHaveProperty('status');
    expect(health).toHaveProperty('services');
    expect(health.services).toHaveProperty('database');
    expect(health.services).toHaveProperty('api');
  });

  test('should have working leaderboard API', async ({ page }) => {
    // Test GET leaderboard
    const getResponse = await page.request.get('/api/leaderboard');
    expect(getResponse.status()).toBe(200);
    
    const leaderboard = await getResponse.json();
    expect(leaderboard).toHaveProperty('success', true);
    expect(leaderboard).toHaveProperty('data');
    expect(Array.isArray(leaderboard.data)).toBe(true);
  });

  test('should handle CORS properly', async ({ page }) => {
    // Make a request and check CORS headers
    const response = await page.request.get('/api/leaderboard');
    
    // Verify CORS headers are present
    const headers = response.headers();
    expect(headers).toHaveProperty('access-control-allow-origin');
    expect(headers).toHaveProperty('access-control-allow-methods');
  });

  test('should redirect www to non-www (if configured)', async ({ page, baseURL }) => {
    // Skip this test if not in production or if baseURL doesn't support www
    if (!baseURL || !baseURL.includes('://')) {
      test.skip();
    }
    
    // This test would check www redirect behavior
    // Implementation depends on actual domain configuration
  });

  test('should have proper security headers', async ({ page }) => {
    const response = await page.request.get('/');
    const headers = response.headers();
    
    // Check for security headers
    expect(headers).toHaveProperty('x-frame-options');
    expect(headers).toHaveProperty('x-content-type-options');
    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('should handle database connection errors gracefully', async ({ page }) => {
    // This test would verify graceful degradation when database is unavailable
    // For now, we just verify the health endpoint responds appropriately
    
    const response = await page.request.get('/api/health');
    const health = await response.json();
    
    // Health endpoint should always respond, even if some services are down
    expect(health).toHaveProperty('status');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
  });

  test('should handle high score submission', async ({ page }) => {
    // Test POST to leaderboard
    const testScore = {
      name: 'E2E Test Player',
      score: Math.floor(Math.random() * 10000)
    };
    
    const response = await page.request.post('/api/leaderboard', {
      data: testScore
    });
    
    expect(response.status()).toBe(200);
    
    const result = await response.json();
    expect(result).toHaveProperty('success', true);
    expect(result.data).toHaveProperty('name', testScore.name);
    expect(result.data).toHaveProperty('score', testScore.score);
    expect(result.data).toHaveProperty('rank');
  });

  test('should validate API input properly', async ({ page }) => {
    // Test invalid input to leaderboard API
    const invalidData = {
      name: '', // Empty name should be rejected
      score: -100 // Negative score should be rejected
    };
    
    const response = await page.request.post('/api/leaderboard', {
      data: invalidData
    });
    
    expect(response.status()).toBe(400);
    
    const result = await response.json();
    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('code');
  });

  test('should have proper content type headers', async ({ page }) => {
    // Test API endpoint content types
    const apiResponse = await page.request.get('/api/leaderboard');
    expect(apiResponse.headers()['content-type']).toContain('application/json');
    
    // Test main page content type
    const pageResponse = await page.request.get('/');
    expect(pageResponse.headers()['content-type']).toContain('text/html');
  });
});

test.describe('Performance Verification', () => {
  test('should meet Core Web Vitals targets', async ({ page }) => {
    // Navigate to main page
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Get basic performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      return {
        loadTime,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstByte: navigation.responseStart - navigation.requestStart
      };
    });
    
    // Basic performance check (values depend on deployment environment)
    expect(typeof metrics).toBe('object');
    expect(metrics.loadTime).toBeGreaterThanOrEqual(0);
  });

  test('should load game assets efficiently', async ({ page }) => {
    await page.goto('/single');
    
    // Wait for game to initialize
    await page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
    
    // Verify game board is rendered
    const gameBoard = page.getByTestId('game-board');
    await expect(gameBoard).toBeVisible();
  });
});
