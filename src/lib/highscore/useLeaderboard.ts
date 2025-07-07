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
      const response = await res.json();
      
      // Handle the API response format { success: true, data: array }
      if (response.success && Array.isArray(response.data)) {
        setEntries(response.data);
      } else if (Array.isArray(response)) {
        // Fallback for direct array response
        setEntries(response);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
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
