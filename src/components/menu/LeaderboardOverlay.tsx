/**
 * LeaderboardOverlay
 * Displays the top scores in a modal overlay.
 * Accessible, paginated, and updates in real time (if online).
 */
import React, { useEffect, useRef } from 'react';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}


export interface LeaderboardOverlayProps {
  open: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  loading: boolean;
  onRefresh?: () => void;
}

const LeaderboardOverlay: React.FC<LeaderboardOverlayProps> = ({ open, onClose, entries, loading, onRefresh }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Leaderboard"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onKeyDown={e => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md outline-none">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-800">Leaderboard</h2>
        {onRefresh && (
          <button
            className="mb-4 w-full py-2 px-4 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={onRefresh}
            aria-label="Refresh leaderboard"
          >
            Refresh
          </button>
        )}
        <div className="overflow-y-auto max-h-80" aria-live="polite" aria-atomic="true">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-center text-gray-500">No scores yet.</div>
          ) : (
            <ol className="space-y-2">
              {entries.map(entry => (
                <li key={entry.rank} className="flex items-center px-2 py-1 rounded hover:bg-blue-50">
                  <span className="font-mono text-lg text-blue-700 w-12 text-left">#{entry.rank}</span>
                  <span className="flex-1 text-center truncate text-blue-700 font-semibold mx-2">{entry.name}</span>
                  <span className="font-bold text-blue-700 w-20 text-right">{entry.score.toLocaleString()}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <button
          className="mt-6 w-full py-2 px-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={onClose}
          aria-label="Back to main menu"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default LeaderboardOverlay;
