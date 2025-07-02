import { test, expect, Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Reduce motion for more stable testing
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('Main menu should be accessible', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Verify ARIA labels and roles
    await expect(page.locator('[role="button"]')).toHaveCount(3); // Single, Double, Settings
    
    // Test screen reader text
    const menuButtons = page.locator('button');
    for (let i = 0; i < await menuButtons.count(); i++) {
      const button = menuButtons.nth(i);
      await expect(button).toHaveAttribute('aria-label');
    }
  });

  test('Single player game should be accessible', async ({ page }) => {
    await page.goto('/single');
    await page.waitForLoadState('networkidle');
    
    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Test game controls accessibility
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Space'); // Rotate
    
    // Verify game state is announced
    const gameBoard = page.locator('[data-testid="game-board"]');
    await expect(gameBoard).toHaveAttribute('aria-live', 'polite');
    
    // Test pause functionality with keyboard
    await page.keyboard.press('Escape');
    const pauseOverlay = page.locator('[data-testid="pause-overlay"]');
    await expect(pauseOverlay).toBeVisible();
    
    // Verify focus management in pause state
    const resumeButton = page.locator('[data-testid="resume-button"]');
    await expect(resumeButton).toBeFocused();
  });

  test('Two player game should be accessible', async ({ page }) => {
    await page.goto('/double');
    await page.waitForLoadState('networkidle');
    
    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Test both player controls
    // Player 1 controls (WASD)
    await page.keyboard.press('KeyA'); // Left
    await page.keyboard.press('KeyD'); // Right
    await page.keyboard.press('KeyS'); // Down
    await page.keyboard.press('KeyW'); // Rotate
    
    // Player 2 controls (Arrow keys)
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp'); // Rotate
    
    // Verify both game boards are accessible
    const player1Board = page.locator('[data-testid="player1-board"]');
    const player2Board = page.locator('[data-testid="player2-board"]');
    
    await expect(player1Board).toHaveAttribute('aria-live', 'polite');
    await expect(player2Board).toHaveAttribute('aria-live', 'polite');
    
    // Test labels for player identification
    await expect(player1Board).toHaveAttribute('aria-label', /Player 1/);
    await expect(player2Board).toHaveAttribute('aria-label', /Player 2/);
  });

  test('Settings overlay should be accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open settings
    await page.click('[data-testid="settings-button"]');
    
    const settingsOverlay = page.locator('[data-testid="settings-overlay"]');
    await expect(settingsOverlay).toBeVisible();
    
    // Run accessibility scan on settings
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Test keyboard navigation in settings
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test volume controls
    const volumeSlider = page.locator('[data-testid="volume-slider"]');
    await expect(volumeSlider).toHaveAttribute('role', 'slider');
    await expect(volumeSlider).toHaveAttribute('aria-label');
    await expect(volumeSlider).toHaveAttribute('aria-valuemin');
    await expect(volumeSlider).toHaveAttribute('aria-valuemax');
    await expect(volumeSlider).toHaveAttribute('aria-valuenow');
    
    // Test assistant toggle
    const assistantToggle = page.locator('[data-testid="assistant-toggle"]');
    await expect(assistantToggle).toHaveAttribute('role', 'switch');
    await expect(assistantToggle).toHaveAttribute('aria-checked');
    
    // Test close button
    await page.keyboard.press('Escape');
    await expect(settingsOverlay).not.toBeVisible();
  });

  test('Leaderboard should be accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Access leaderboard (assume it's accessible from main menu)
    await page.click('[data-testid="leaderboard-button"]');
    
    const leaderboardOverlay = page.locator('[data-testid="leaderboard-overlay"]');
    await expect(leaderboardOverlay).toBeVisible();
    
    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Test table accessibility
    const leaderboardTable = page.locator('[data-testid="leaderboard-table"]');
    await expect(leaderboardTable).toHaveAttribute('role', 'table');
    
    // Check for proper table headers
    const tableHeaders = page.locator('th');
    for (let i = 0; i < await tableHeaders.count(); i++) {
      const header = tableHeaders.nth(i);
      await expect(header).toHaveAttribute('scope', 'col');
    }
    
    // Test keyboard navigation through table
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('Game over overlay should be accessible', async ({ page }) => {
    await page.goto('/single');
    await page.waitForLoadState('networkidle');
    
    // Simulate game over (this might need adjustment based on actual implementation)
    await page.evaluate(() => {
      // Force game over state for testing
      const gameOverEvent = new CustomEvent('gameOver', { 
        detail: { score: 1000, level: 5, lines: 10 } 
      });
      window.dispatchEvent(gameOverEvent);
    });
    
    const gameOverOverlay = page.locator('[data-testid="game-over-overlay"]');
    await expect(gameOverOverlay).toBeVisible();
    
    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Test focus management
    const playAgainButton = page.locator('[data-testid="play-again-button"]');
    await expect(playAgainButton).toBeFocused();
    
    // Test score announcement
    const scoreElement = page.locator('[data-testid="final-score"]');
    await expect(scoreElement).toHaveAttribute('aria-live', 'assertive');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const nextFocused = await page.locator(':focus');
    await expect(nextFocused).toBeVisible();
  });

  test('Color contrast should meet WCAG standards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Run axe with color-contrast rules specifically
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    // Filter for color contrast violations
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      (violation: any) => violation.id === 'color-contrast'
    );
    
    expect(colorContrastViolations).toEqual([]);
  });

  test('Should handle high contrast mode', async ({ page }) => {
    // Enable high contrast mode
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify elements are still visible and accessible
    const menuButtons = page.locator('button');
    await expect(menuButtons.first()).toBeVisible();
    
    // Run accessibility scan in high contrast mode
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Should work with screen reader simulation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test that all interactive elements have proper labels
    const interactiveElements = page.locator('button, input, select, textarea, [role="button"], [role="slider"], [role="switch"]');
    
    for (let i = 0; i < await interactiveElements.count(); i++) {
      const element = interactiveElements.nth(i);
      
      // Check for accessible name
      const hasAriaLabel = await element.getAttribute('aria-label');
      const hasAriaLabelledBy = await element.getAttribute('aria-labelledby');
      const textContent = await element.textContent();
      
      expect(
        hasAriaLabel || hasAriaLabelledBy || (textContent && textContent.trim().length > 0)
      ).toBeTruthy();
    }
  });
});
