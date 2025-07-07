/**
 * LeaderboardOverlay
 * Displays the top scores in a modal overlay with retro styling.
 * Accessible, paginated, and updates in real time (if online).
 */
import React, { useEffect, useRef } from 'react';
import RetroText from './RetroText';
import RetroButton from './RetroButton';
import './leaderboard-styles.css';

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

const LeaderboardOverlay: React.FC<LeaderboardOverlayProps> = ({ 
  open, 
  onClose, 
  entries, 
  loading, 
  onRefresh 
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: `
          radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%),
          linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(25, 25, 112, 0.1) 100%)
        `,
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Leaderboard"
        className="bg-gray-900 border-2 border-cyan-400 shadow-2xl p-6 w-full max-w-md mx-4 outline-none backdrop-blur-sm"
        style={{
          background: `
            linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)
          `,
          boxShadow: `
            0 0 30px rgba(34, 211, 238, 0.5),
            inset 0 0 20px rgba(34, 211, 238, 0.1)
          `,
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') onClose();
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <RetroText size="2xl" variant="primary" glow scanlines>
            Leaderboard
          </RetroText>
          <div
            className="mt-2 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
          />
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <div className="mb-4">
            <RetroButton
              onClick={onRefresh}
              variant="accent"
              size="sm"
              className="w-full"
              aria-label="Refresh leaderboard"
            >
              ⟳ Refresh
            </RetroButton>
          </div>
        )}

        {/* Leaderboard Content */}
        <div 
          className="leaderboard-scroll overflow-y-auto max-h-80 bg-black bg-opacity-30 border border-cyan-400 p-4 rounded-none"
          style={{
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)',
            touchAction: 'pan-y', // Allow vertical scrolling on touch devices
            overscrollBehavior: 'contain', // Prevent scroll chaining to parent
            scrollbarWidth: 'thin', // Firefox
            scrollbarColor: 'rgba(34, 211, 238, 0.8) rgba(0, 0, 0, 0.3)', // Firefox
          }}
          aria-live="polite" 
          aria-atomic="true"
          data-scrollable="true" // Mark as scrollable for accessibility
        >
          {loading ? (
            <div className="text-center py-8">
              <RetroText size="md" variant="secondary" glow={false}>
                Loading...
              </RetroText>
              <div className="mt-2">
                <div 
                  className="inline-block w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"
                />
              </div>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8">
              <RetroText size="md" variant="accent" glow={false}>
                No scores yet.
              </RetroText>
              <RetroText size="sm" variant="secondary" glow={false} className="mt-2 opacity-70">
                Be the first to set a record!
              </RetroText>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div 
                  key={entry.rank} 
                  className="flex items-center p-2 border border-gray-600 bg-black bg-opacity-20 hover:bg-opacity-40 transition-all duration-200"
                  style={{
                    background: index < 3 
                      ? `linear-gradient(90deg, 
                          ${index === 0 ? 'rgba(255, 215, 0, 0.1)' : 
                            index === 1 ? 'rgba(192, 192, 192, 0.1)' : 
                            'rgba(205, 127, 50, 0.1)'} 0%, 
                          transparent 100%)`
                      : 'rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {/* Rank */}
                  <div className="w-12 text-left">
                    <RetroText 
                      size="md" 
                      variant={index < 3 ? 'accent' : 'primary'} 
                      glow={index < 3}
                      className="font-mono"
                    >
                      #{entry.rank}
                    </RetroText>
                  </div>
                  
                  {/* Medal for top 3 */}
                  {index < 3 && (
                    <div className="w-8 text-center">
                      <span className="text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    </div>
                  )}
                  
                  {/* Name */}
                  <div className="flex-1 text-center mx-2">
                    <RetroText 
                      size="md" 
                      variant={index < 3 ? 'accent' : 'secondary'} 
                      glow={false}
                      className="truncate"
                    >
                      {entry.name}
                    </RetroText>
                  </div>
                  
                  {/* Score */}
                  <div className="w-24 text-right">
                    <RetroText 
                      size="md" 
                      variant={index < 3 ? 'accent' : 'primary'} 
                      glow={index < 3}
                      className="font-mono"
                    >
                      {entry.score.toLocaleString()}
                    </RetroText>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <RetroButton
            onClick={onClose}
            variant="primary"
            size="md"
            className="w-full"
            aria-label="Back to main menu"
            autoFocus
          >
            ← Back
          </RetroButton>
        </div>

        {/* Decorative scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(34, 211, 238, 0.3) 2px,
              rgba(34, 211, 238, 0.3) 4px
            )`,
          }}
        />
      </div>
    </div>
  );
};

export default LeaderboardOverlay;
