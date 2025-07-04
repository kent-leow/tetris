/**
 * useLeaderboard
 * Fetches leaderboard data from localStorage (mock) or backend (future).
 * Returns entries sorted by score descending.
 * Real-time updates via storage events.
 */
import { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../../components/menu/LeaderboardOverlay';


/**
 * useLeaderboard
 * Fetches leaderboard data from backend once on mount.
 * Returns entries sorted by score descending.
 * Provides a manual refetch function for updates.
 * Real-time updates via storage events (future).
 */
import { useCallback } from 'react';

export function useLeaderboard(): {
  entries: LeaderboardEntry[];
  loading: boolean;
  refetch: () => Promise<void>;
} {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data = await res.json();
      if (Array.isArray(data)) {
        setEntries(data);
      }
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    // Optionally, add storage event listener for real-time updates in the future
  }, [fetchLeaderboard]);

  return { entries, loading, refetch: fetchLeaderboard };
}
