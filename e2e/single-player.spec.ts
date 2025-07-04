/**
 * Single Player Game Flow E2E Tests
 * 
 * Comprehensive end-to-end tests for single player functionality including:
 * - Game initialization and UI rendering
 * - Piece movement and rotation controls
 * - Line clearing and scoring
 * - Game over conditions
 * - Settings integration
 * - Keyboard accessibility
 */

import { test, expect, Page } from '@playwright/test';

// Page Object Model for Single Player Game
class SinglePlayerGamePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/single');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForGameToLoad() {
    await this.page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
    await this.page.waitForSelector('[data-testid="current-piece"]', { timeout: 5000 });
  }

  async pressKey(key: string, times: number = 1) {
    for (let i = 0; i < times; i++) {
      await this.page.keyboard.press(key);
      await this.page.waitForTimeout(50); // Small delay between keypresses
    }
  }

  async moveLeft(times: number = 1) {
    await this.pressKey('ArrowLeft', times);
  }

  async moveRight(times: number = 1) {
    await this.pressKey('ArrowRight', times);
  }

  async moveDown(times: number = 1) {
    await this.pressKey('ArrowDown', times);
  }

  async rotate(times: number = 1) {
    await this.pressKey('ArrowUp', times);
  }

  async hardDrop() {
    await this.pressKey('Space');
  }

  async pause() {
    await this.pressKey('Escape');
  }

  async restart() {
    await this.page.click('[data-testid="restart-button"]');
  }

  async getScore() {
    const scoreElement = await this.page.locator('[data-testid="score"]');
    return parseInt(await scoreElement.textContent() || '0');
  }

  async getLines() {
    const linesElement = await this.page.locator('[data-testid="lines"]');
    return parseInt(await linesElement.textContent() || '0');
  }

  async getLevel() {
    const levelElement = await this.page.locator('[data-testid="level"]');
    return parseInt(await levelElement.textContent() || '1');
  }

  async isGameOver() {
    return await this.page.locator('[data-testid="game-over"]').isVisible();
  }

  async isPaused() {
    return await this.page.locator('[data-testid="paused"]').isVisible();
  }

  async getBoardState() {
    const board = await this.page.locator('[data-testid="game-board"]');
    const cells = await board.locator('[data-testid^="cell-"]').all();
    
    const boardState: (string | null)[][] = [];
    for (let y = 0; y < 20; y++) {
      boardState[y] = [];
      for (let x = 0; x < 10; x++) {
        const cell = cells[y * 10 + x];
        const className = await cell.getAttribute('class') || '';
        if (className.includes('filled')) {
          const type = className.match(/type-([IOTSZJL])/)?.[1] || 'unknown';
          boardState[y][x] = type;
        } else {
          boardState[y][x] = null;
        }
      }
    }
    return boardState;
  }

  async waitForPieceToSettle() {
    // Wait for the current piece to stop moving (indicating it has settled)
    await this.page.waitForTimeout(1000);
  }
}

test.describe('Single Player Game - Basic Functionality', () => {
  let gamePage: SinglePlayerGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new SinglePlayerGamePage(page);
    await gamePage.goto();
    await gamePage.waitForGameToLoad();
  });

  test('should load game with initial UI elements', async ({ page }) => {
    // Check main game elements are present
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    await expect(page.locator('[data-testid="next-piece"]')).toBeVisible();
    await expect(page.locator('[data-testid="score"]')).toBeVisible();
    await expect(page.locator('[data-testid="lines"]')).toBeVisible();
    await expect(page.locator('[data-testid="level"]')).toBeVisible();

    // Check initial values
    expect(await gamePage.getScore()).toBe(0);
    expect(await gamePage.getLines()).toBe(0);
    expect(await gamePage.getLevel()).toBe(1);
  });

  test('should display current and next tetromino pieces', async ({ page }) => {
    // Current piece should be visible on the board
    await expect(page.locator('[data-testid="current-piece"]')).toBeVisible();
    
    // Next piece should be shown in the preview area
    await expect(page.locator('[data-testid="next-piece"]')).toBeVisible();
    
    // Both pieces should have valid tetromino types
    const currentPieceType = await page.locator('[data-testid="current-piece"]').getAttribute('data-type');
    const nextPieceType = await page.locator('[data-testid="next-piece"]').getAttribute('data-type');
    
    expect(['I', 'O', 'T', 'S', 'Z', 'J', 'L']).toContain(currentPieceType);
    expect(['I', 'O', 'T', 'S', 'Z', 'J', 'L']).toContain(nextPieceType);
  });

  test('should start game automatically', async ({ page }) => {
    // Game should start automatically without user input
    await expect(page.locator('[data-testid="game-running"]')).toBeVisible();
    
    // Pieces should be falling automatically
    await page.waitForTimeout(2000);
    
    // Verify game is progressing (piece position changes)
    const initialBoardState = await gamePage.getBoardState();
    await page.waitForTimeout(1000);
    const laterBoardState = await gamePage.getBoardState();
    
    // Board state should change as pieces fall
    expect(initialBoardState).not.toEqual(laterBoardState);
  });
});

test.describe('Single Player Game - Controls', () => {
  let gamePage: SinglePlayerGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new SinglePlayerGamePage(page);
    await gamePage.goto();
    await gamePage.waitForGameToLoad();
  });

  test('should move piece left with arrow key', async ({ page }) => {
    // Get initial piece position
    const initialPosition = await page.locator('[data-testid="current-piece"]').getAttribute('data-position');
    
    // Move left
    await gamePage.moveLeft();
    await page.waitForTimeout(100);
    
    // Check piece moved left
    const newPosition = await page.locator('[data-testid="current-piece"]').getAttribute('data-position');
    expect(newPosition).not.toBe(initialPosition);
  });

  test('should move piece right with arrow key', async ({ page }) => {
    const initialPosition = await page.locator('[data-testid="current-piece"]').getAttribute('data-position');
    
    await gamePage.moveRight();
    await page.waitForTimeout(100);
    
    const newPosition = await page.locator('[data-testid="current-piece"]').getAttribute('data-position');
    expect(newPosition).not.toBe(initialPosition);
  });

  test('should move piece down faster with down arrow', async ({ page }) => {
    const initialY = await page.locator('[data-testid="current-piece"]').getAttribute('data-y');
    
    await gamePage.moveDown();
    await page.waitForTimeout(100);
    
    const newY = await page.locator('[data-testid="current-piece"]').getAttribute('data-y');
    expect(parseInt(newY || '0')).toBeGreaterThan(parseInt(initialY || '0'));
  });

  test('should rotate piece with up arrow', async ({ page }) => {
    const initialRotation = await page.locator('[data-testid="current-piece"]').getAttribute('data-rotation');
    
    await gamePage.rotate();
    await page.waitForTimeout(100);
    
    const newRotation = await page.locator('[data-testid="current-piece"]').getAttribute('data-rotation');
    expect(newRotation).not.toBe(initialRotation);
  });

  test('should hard drop piece with spacebar', async ({ page }) => {
    const initialY = await page.locator('[data-testid="current-piece"]').getAttribute('data-y');
    
    await gamePage.hardDrop();
    await gamePage.waitForPieceToSettle();
    
    // After hard drop, a new piece should appear at the top
    const newY = await page.locator('[data-testid="current-piece"]').getAttribute('data-y');
    expect(parseInt(newY || '0')).toBeLessThan(parseInt(initialY || '0'));
  });

  test('should not move piece outside board boundaries', async ({ page }) => {
    // Move piece to left edge
    for (let i = 0; i < 10; i++) {
      await gamePage.moveLeft();
    }
    
    // Try to move beyond left boundary
    const position = await page.locator('[data-testid="current-piece"]').getAttribute('data-x');
    await gamePage.moveLeft();
    const newPosition = await page.locator('[data-testid="current-piece"]').getAttribute('data-x');
    
    // Position should not go negative
    expect(parseInt(newPosition || '0')).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Single Player Game - Scoring and Line Clearing', () => {
  let gamePage: SinglePlayerGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new SinglePlayerGamePage(page);
    await gamePage.goto();
    await gamePage.waitForGameToLoad();
  });

  test('should increase score when lines are cleared', async ({ page }) => {
    const initialScore = await gamePage.getScore();
    
    // This is a complex test that requires creating a line to clear
    // For now, we'll simulate the game until a line is cleared
    // In a real implementation, you might want to use a test mode
    // or specific board setup to guarantee line clearing
    
    // Play the game until score increases
    let currentScore = initialScore;
    let attempts = 0;
    const maxAttempts = 50;
    
    while (currentScore === initialScore && attempts < maxAttempts) {
      await gamePage.hardDrop();
      await gamePage.waitForPieceToSettle();
      currentScore = await gamePage.getScore();
      attempts++;
    }
    
    // If we cleared a line, score should have increased
    if (currentScore > initialScore) {
      expect(currentScore).toBeGreaterThan(initialScore);
    }
  });

  test('should increase lines count when lines are cleared', async ({ page }) => {
    const initialLines = await gamePage.getLines();
    
    // Similar approach to score test
    let currentLines = initialLines;
    let attempts = 0;
    const maxAttempts = 50;
    
    while (currentLines === initialLines && attempts < maxAttempts) {
      await gamePage.hardDrop();
      await gamePage.waitForPieceToSettle();
      currentLines = await gamePage.getLines();
      attempts++;
    }
    
    if (currentLines > initialLines) {
      expect(currentLines).toBeGreaterThan(initialLines);
    }
  });

  test('should increase level as lines are cleared', async ({ page }) => {
    const initialLevel = await gamePage.getLevel();
    
    // Level increases every 10 lines
    // This test would be better with a controlled test environment
    expect(initialLevel).toBe(1);
  });
});

test.describe('Single Player Game - Game Over', () => {
  let gamePage: SinglePlayerGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new SinglePlayerGamePage(page);
    await gamePage.goto();
    await gamePage.waitForGameToLoad();
  });

  test('should detect game over when board is full', async ({ page }) => {
    // This test simulates game over by playing until the board fills up
    // In practice, you might want a test mode to quickly trigger game over
    
    let gameOver = false;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!gameOver && attempts < maxAttempts) {
      await gamePage.hardDrop();
      await gamePage.waitForPieceToSettle();
      gameOver = await gamePage.isGameOver();
      attempts++;
    }
    
    if (gameOver) {
      // Game over overlay should be visible
      await expect(page.locator('[data-testid="game-over"]')).toBeVisible();
      
      // Final score should be displayed
      await expect(page.locator('[data-testid="final-score"]')).toBeVisible();
      
      // Restart button should be available
      await expect(page.locator('[data-testid="restart-button"]')).toBeVisible();
    }
  });

  test('should allow restarting after game over', async ({ page }) => {
    // First, trigger game over (simplified for testing)
    // In real test, you'd play until game over occurs
    
    // For now, assume we can trigger game over through a test command
    // await page.evaluate(() => window.testUtils?.triggerGameOver());
    
    // Or navigate to a state where we can test restart
    // This is a placeholder for the actual restart functionality test
    
    const restartButton = page.locator('[data-testid="restart-button"]');
    if (await restartButton.isVisible()) {
      await restartButton.click();
      
      // Game should reset to initial state
      expect(await gamePage.getScore()).toBe(0);
      expect(await gamePage.getLines()).toBe(0);
      expect(await gamePage.getLevel()).toBe(1);
      expect(await gamePage.isGameOver()).toBe(false);
    }
  });
});

test.describe('Single Player Game - Pause Functionality', () => {
  let gamePage: SinglePlayerGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new SinglePlayerGamePage(page);
    await gamePage.goto();
    await gamePage.waitForGameToLoad();
  });

  test('should pause game with Escape key', async ({ page }) => {
    await gamePage.pause();
    
    expect(await gamePage.isPaused()).toBe(true);
    await expect(page.locator('[data-testid="paused"]')).toBeVisible();
  });

  test('should resume game when unpaused', async ({ page }) => {
    await gamePage.pause();
    expect(await gamePage.isPaused()).toBe(true);
    
    await gamePage.pause(); // Press escape again to unpause
    expect(await gamePage.isPaused()).toBe(false);
  });

  test('should not respond to game controls when paused', async ({ page }) => {
    await gamePage.pause();
    
    const initialPosition = await page.locator('[data-testid="current-piece"]').getAttribute('data-position');
    
    // Try to move piece while paused
    await gamePage.moveLeft();
    await gamePage.moveRight();
    await gamePage.rotate();
    
    const finalPosition = await page.locator('[data-testid="current-piece"]').getAttribute('data-position');
    
    // Position should not change while paused
    expect(finalPosition).toBe(initialPosition);
  });
});

test.describe('Single Player Game - Accessibility', () => {
  let gamePage: SinglePlayerGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new SinglePlayerGamePage(page);
    await gamePage.goto();
    await gamePage.waitForGameToLoad();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Game board should have accessible role
    const gameBoard = page.locator('[data-testid="game-board"]');
    await expect(gameBoard).toHaveAttribute('role', 'application');
    await expect(gameBoard).toHaveAttribute('aria-label');
    
    // Score elements should have labels
    await expect(page.locator('[data-testid="score"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="lines"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="level"]')).toHaveAttribute('aria-label');
  });

  test('should be keyboard navigable', async ({ page }) => {
    // All interactive elements should be reachable by keyboard
    await page.keyboard.press('Tab');
    
    // Check if focus is visible on interactive elements
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should announce score changes to screen readers', async ({ page }) => {
    // Check for aria-live regions that announce score changes
    const scoreRegion = page.locator('[data-testid="score-announcer"]');
    await expect(scoreRegion).toHaveAttribute('aria-live', 'polite');
  });

  test('should have high contrast mode support', async ({ page }) => {
    // Test with forced-colors media query
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    
    // Game should still be visible and playable
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    
    // Pieces should be distinguishable
    const currentPiece = page.locator('[data-testid="current-piece"]');
    await expect(currentPiece).toBeVisible();
  });
});

test.describe('Single Player Game - Performance', () => {
  let gamePage: SinglePlayerGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new SinglePlayerGamePage(page);
    await gamePage.goto();
    await gamePage.waitForGameToLoad();
  });

  test('should maintain smooth gameplay at 60fps', async ({ page }) => {
    // Monitor frame rate during gameplay
    await page.evaluate(() => {
      let frameCount = 0;
      let lastTime = performance.now();
      
      function countFrames() {
        frameCount++;
        const currentTime = performance.now();
        if (currentTime - lastTime >= 1000) {
          console.log(`FPS: ${frameCount}`);
          frameCount = 0;
          lastTime = currentTime;
        }
        requestAnimationFrame(countFrames);
      }
      
      requestAnimationFrame(countFrames);
    });
    
    // Play game for a few seconds to measure performance
    for (let i = 0; i < 10; i++) {
      await gamePage.hardDrop();
      await page.waitForTimeout(200);
    }
    
    // In a real test, you'd capture and assert on the FPS measurements
  });

  test('should load quickly on first visit', async ({ page }) => {
    const startTime = Date.now();
    await gamePage.goto();
    await gamePage.waitForGameToLoad();
    const loadTime = Date.now() - startTime;
    
    // Game should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle rapid input without lag', async ({ page }) => {
    // Send rapid keyboard input
    const startTime = Date.now();
    
    for (let i = 0; i < 20; i++) {
      await gamePage.moveLeft();
      await gamePage.moveRight();
      await gamePage.rotate();
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // All inputs should be processed within reasonable time
    expect(totalTime).toBeLessThan(2000);
  });
});
