/**
 * submitLeaderboardEntry
 * Submits a new leaderboard entry to the backend API.
 * Validates input and returns success or error.
 */
export async function submitLeaderboardEntry(name: string, score: number): Promise<{ success: boolean; error?: string }> {
  if (typeof name !== 'string' || name.trim().length === 0 || typeof score !== 'number' || score < 0) {
    return { success: false, error: 'Invalid input' };
  }
  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim().slice(0, 12), score }),
    });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error || 'Failed to submit score' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Network error' };
  }
}
