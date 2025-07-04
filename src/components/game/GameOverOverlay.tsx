'use client';

import React, { useState, useRef, useEffect } from 'react';
import RetroText from '../menu/RetroText';
import RetroButton from '../menu/RetroButton';
import { useFocusManager } from '../../lib/accessibility/useFocusManager';

/**
 * GameOverOverlay with retro styling
 * Overlay shown when the game ends. Allows player to enter their name and submit score.
 * Provides options to play again or return to main menu.
 */
interface GameOverOverlayProps {
  score: number;
  onSubmit: (name: string) => void;
  onMainMenu: () => void;
  onPlayAgain: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ score, onSubmit, onMainMenu, onPlayAgain }) => {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const playAgainButtonRef = useRef<HTMLButtonElement>(null);
  const { removeFocusFromElement } = useFocusManager();

  // Prevent restart button from staying focused to avoid accidental spacebar restarts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ' && document.activeElement === playAgainButtonRef.current) {
        // Only allow spacebar on Play Again button if it's intentionally focused
        // Don't prevent default here - let the button handle it
        return;
      }
      
      // Remove focus from restart-related buttons when spacebar is pressed
      // This prevents accidental restarts when trying to drop tetrominos
      if (event.key === ' ') {
        removeFocusFromElement(playAgainButtonRef.current);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [removeFocusFromElement]);

  // Auto-unfocus the Play Again button after a short delay to prevent spacebar accidents
  const handlePlayAgainClick = () => {
    onPlayAgain();
    // Unfocus the button after action to prevent accidental re-activation
    setTimeout(() => removeFocusFromElement(playAgainButtonRef.current), 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setSubmitted(true);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: `
          radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%),
          linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(25, 25, 112, 0.1) 100%)
        `,
      }}
    >
      <div
        className="bg-gray-900 border-2 border-red-400 shadow-2xl p-8 w-full max-w-md mx-4"
        style={{
          background: `
            linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)
          `,
          boxShadow: `
            0 0 30px rgba(239, 68, 68, 0.5),
            inset 0 0 20px rgba(239, 68, 68, 0.1)
          `,
        }}
      >
        {/* Game Over Title */}
        <div className="text-center mb-6">
          <RetroText size="3xl" variant="warning" glow scanlines>
            Game Over
          </RetroText>
          <div className="mt-2 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-60" />
        </div>

        {/* Score Display */}
        <div 
          className="bg-black bg-opacity-50 border-2 border-yellow-400 p-4 mb-6 text-center"
          style={{
            boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)',
          }}
        >
          <RetroText size="md" variant="accent" glow={false} className="mb-2">
            Final Score
          </RetroText>
          <RetroText size="2xl" variant="accent" glow className="font-mono">
            {score.toLocaleString()}
          </RetroText>
        </div>

        {/* Name Input Form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <RetroText size="md" variant="primary" glow={false} className="mb-3 text-center">
                Enter Your Name
              </RetroText>
              <input
                id="player-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-black bg-opacity-50 border-2 border-cyan-400 text-cyan-400 font-mono text-lg placeholder-cyan-400 placeholder-opacity-50 focus:outline-none focus:border-cyan-300 focus:bg-opacity-70 transition-all duration-200"
                style={{
                  boxShadow: '0 0 10px rgba(34, 211, 238, 0.3)',
                  textShadow: '0 0 5px currentColor',
                }}
                placeholder="Enter name..."
                maxLength={16}
                required
                autoFocus
              />
            </div>
            
            <RetroButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
            >
              Submit Score
            </RetroButton>
          </form>
        ) : (
          <div className="text-center mb-6">
            <div 
              className="bg-green-900 bg-opacity-50 border-2 border-green-400 p-4"
              style={{
                boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)',
              }}
            >
              <RetroText size="lg" variant="secondary" glow>
                ✓ Score Submitted!
              </RetroText>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mt-6">
          <RetroButton
            ref={playAgainButtonRef}
            onClick={handlePlayAgainClick}
            variant="primary"
            size="lg"
            className="w-full"
            aria-label="Play again - Press Enter or Space to restart"
          >
            ↻ Play Again
          </RetroButton>
          
          <RetroButton
            onClick={onMainMenu}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            ← Back to Main Menu
          </RetroButton>
        </div>

        {/* Decorative elements */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(239, 68, 68, 0.3) 2px,
              rgba(239, 68, 68, 0.3) 4px
            )`,
          }}
        />
      </div>
    </div>
  );
};
