/**
 * useMainMenuScore
 * Combines local highscore and leaderboard data for main menu display.
 * Shows the highest global score with the associated player name.
 */
import { useEffect, useState } from 'react';
import { useLeaderboard } from './useLeaderboard';
import { useHighscore } from './useHighscore';

export interface MainMenuScore {
  score: number;
  name: string;
  isPersonal: boolean; // true if this is the player's personal best
}

export function useMainMenuScore(): {
  menuScore: MainMenuScore | null;
  loading: boolean;
} {
  const { entries, loading: leaderboardLoading } = useLeaderboard();
  const { highscore, loading: localLoading } = useHighscore();
  const [menuScore, setMenuScore] = useState<MainMenuScore | null>(null);

  useEffect(() => {
    if (leaderboardLoading || localLoading) return;

    // If we have leaderboard data, show the top score
    if (entries.length > 0) {
      const topScore = entries[0];
      setMenuScore({
        score: topScore.score,
        name: topScore.name,
        isPersonal: false
      });
    } 
    // Fallback to local highscore if no leaderboard data
    else if (highscore) {
      setMenuScore({
        score: highscore.value,
        name: 'You', // Default name for local scores
        isPersonal: true
      });
    } 
    // No scores available
    else {
      setMenuScore(null);
    }
  }, [entries, highscore, leaderboardLoading, localLoading]);

  return {
    menuScore,
    loading: leaderboardLoading || localLoading
  };
}
