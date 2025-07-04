/**
 * React hook to get and subscribe to the player's highscore.
 * Uses localStorage and window events for sync across tabs.
 *
 * @returns { highscore, loading }
 */
import { useEffect, useState } from 'react';
import { getHighscore, Highscore } from './service';

export function useHighscore(): { highscore: Highscore | null; loading: boolean } {
  const [highscore, setHighscore] = useState<Highscore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHighscore(getHighscore());
    setLoading(false);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'tetris_highscore') {
        setHighscore(getHighscore());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return { highscore, loading };
}
