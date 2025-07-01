/**
 * HighscoreService
 * Provides methods to fetch and update the player's highscore.
 * Uses localStorage for now; can be swapped for backend API in the future.
 * All methods are type-safe and validated.
 */

export interface Highscore {
  value: number;
  updatedAt: string; // ISO date string
}

const HIGHSCORE_KEY = 'tetris_highscore';

/**
 * Get the current highscore from localStorage.
 * Returns null if no highscore exists or data is invalid.
 */
export function getHighscore(): Highscore | null {
  try {
    const raw = localStorage.getItem(HIGHSCORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.value === 'number' &&
      typeof parsed.updatedAt === 'string'
    ) {
      return parsed as Highscore;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Set a new highscore in localStorage.
 * Only updates if the new score is higher.
 */
export function setHighscore(newScore: number): Highscore {
  const prev = getHighscore();
  if (prev && prev.value >= newScore) return prev;
  const highscore: Highscore = {
    value: newScore,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(highscore));
  return highscore;
}
