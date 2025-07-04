import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Start browser for initial setup if needed
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Wait for the dev server to be ready
  await page.goto(config.webServer?.url || 'http://localhost:3000');
  await page.waitForSelector('body', { timeout: 30000 });
  
  await browser.close();
}

export default globalSetup;
