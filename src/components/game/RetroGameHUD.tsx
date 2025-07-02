'use client';

import React, { useRef, useEffect } from 'react';
import RetroText from '../menu/RetroText';
import RetroButton from '../menu/RetroButton';
import { useFocusManager } from '../../lib/accessibility/useFocusManager';

/**
 * Retro-styled HUD component for game interface
 * Displays score, level, lines, next piece, and controls
 */

interface RetroGameHUDProps {
  score: number;
  level: number;
  lines: number;
  nextPiece?: React.ReactNode;
  onRestart?: () => void;
  onPause?: () => void;
  onMainMenu?: () => void;
  onMuteToggle?: () => void;
  muted?: boolean;
  gameStarted?: boolean;
  className?: string;
}

const RetroGameHUD: React.FC<RetroGameHUDProps> = ({
  score,
  level,
  lines,
  nextPiece,
  onRestart,
  onPause,
  onMainMenu,
  onMuteToggle,
  muted = false,
  gameStarted = true,
  className = "",
}) => {
  const restartButtonRef = useRef<HTMLButtonElement>(null);
  const { removeFocusFromElement } = useFocusManager();

  // Prevent restart button from staying focused to avoid accidental spacebar restarts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        // Remove focus from restart button when spacebar is pressed during gameplay
        // This prevents accidental restarts when trying to drop tetrominos
        removeFocusFromElement(restartButtonRef.current);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [removeFocusFromElement]);

  // Auto-unfocus the restart button after a short delay to prevent spacebar accidents
  const handleRestartClick = () => {
    if (onRestart) {
      onRestart();
      // Unfocus the button after action to prevent accidental re-activation
      setTimeout(() => removeFocusFromElement(restartButtonRef.current), 100);
    }
  };
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Top row - Navigation buttons */}
      <div className="flex justify-between items-start gap-2">
        {/* Main Menu Button */}
        {onMainMenu && (
          <RetroButton
            onClick={onMainMenu}
            variant="secondary"
            size="sm"
            className="px-3 py-2"
            aria-label="Back to Main Menu"
          >
            ← Menu
          </RetroButton>
        )}

        {/* Mute Button */}
        {onMuteToggle && (
          <RetroButton
            onClick={onMuteToggle}
            variant="accent"
            size="sm"
            className="px-3 py-2"
            aria-label={muted ? "Unmute background music" : "Mute background music"}
          >
            {muted ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6 6m0-6l-6 6M9 5v14l-5-5H2V9h2l5-5zm7.5 7.5a5.5 5.5 0 00-7.78-7.78" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5v14l-5-5H2V9h2l5-5zm7.5 7.5a5.5 5.5 0 00-7.78-7.78" />
              </svg>
            )}
          </RetroButton>
        )}
      </div>

      {/* Score Panel */}
      <div
        className="bg-black bg-opacity-50 border-2 border-yellow-400 p-4 backdrop-blur-sm"
        style={{
          boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)',
        }}
      >
        <RetroText size="lg" variant="accent" glow className="mb-3 text-center">
          Score
        </RetroText>
        <RetroText size="2xl" variant="accent" glow className="font-mono text-center">
          {score.toLocaleString()}
        </RetroText>
      </div>

      {/* Stats Panel */}
      <div
        className="bg-black bg-opacity-50 border-2 border-cyan-400 p-4 backdrop-blur-sm"
        style={{
          boxShadow: '0 0 15px rgba(34, 211, 238, 0.3)',
        }}
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <RetroText size="md" variant="primary" glow={false}>
              Level:
            </RetroText>
            <RetroText size="lg" variant="primary" glow className="font-mono">
              {level}
            </RetroText>
          </div>
          
          <div className="flex justify-between items-center">
            <RetroText size="md" variant="primary" glow={false}>
              Lines:
            </RetroText>
            <RetroText size="lg" variant="primary" glow className="font-mono">
              {lines}
            </RetroText>
          </div>
        </div>
      </div>

      {/* Next Piece Panel */}
      {nextPiece && (
        <div
          className="bg-black bg-opacity-50 border-2 border-purple-400 p-4 backdrop-blur-sm"
          style={{
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)',
          }}
        >
          <RetroText size="md" variant="secondary" glow className="mb-3 text-center">
            Next
          </RetroText>
          <div className="flex justify-center">
            {nextPiece}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {onPause && (
          <RetroButton
            onClick={onPause}
            variant="secondary"
            size="sm"
            className="w-full"
            disabled={!gameStarted}
          >
            ⏸ Pause
          </RetroButton>
        )}
        
        {onRestart && (
          <RetroButton
            ref={restartButtonRef}
            onClick={handleRestartClick}
            variant="primary"
            size="sm"
            className="w-full"
            disabled={!gameStarted}
            aria-label="Restart game - Press Enter to restart, avoid using spacebar during gameplay"
          >
            ↻ Restart (R)
          </RetroButton>
        )}
      </div>

      {/* Controls hint */}
      <div
        className="bg-black bg-opacity-30 border border-gray-600 p-3 text-center"
        style={{
          borderStyle: 'dashed',
        }}
      >
        <RetroText size="sm" variant="secondary" glow={false} className="opacity-70">
          ← → ↓ Move • ↑ Rotate • Space Drop
        </RetroText>
      </div>
    </div>
  );
};

export default React.memo(RetroGameHUD);
