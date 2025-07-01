import React, { useState, useCallback, useEffect, KeyboardEvent } from 'react';

/**
 * GameMode type for supported modes.
 */
export type GameMode = 'single' | 'two';

/**
 * Props for GameModeMenu component.
 */
export interface GameModeMenuProps {
  /** Callback when a mode is selected */
  onSelectMode: (mode: GameMode) => void;
  /** Optional: currently selected mode */
  selectedMode?: GameMode;
}

/**
 * Accessible, keyboard-navigable menu for selecting game mode.
 * - Highlights selected mode
 * - Supports keyboard shortcuts (1: single, 2: two player)
 * - ARIA labels for accessibility
 */
export const GameModeMenu: React.FC<GameModeMenuProps> = ({ onSelectMode, selectedMode }) => {
  const [focusedMode, setFocusedMode] = useState<GameMode>('single');

  // Handle keyboard navigation and shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      setFocusedMode('single');
      e.preventDefault();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      setFocusedMode('two');
      e.preventDefault();
    } else if (e.key === '1') {
      onSelectMode('single');
    } else if (e.key === '2') {
      onSelectMode('two');
    } else if (e.key === 'Enter' || e.key === ' ') {
      onSelectMode(focusedMode);
    }
  }, [focusedMode, onSelectMode]);

  // Focus management for accessibility
  useEffect(() => {
    setFocusedMode(selectedMode ?? 'single');
  }, [selectedMode]);

  return (
    <div
      role="radiogroup"
      aria-label="Select Game Mode"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-4 items-center focus:outline-none"
    >
      <button
        type="button"
        role="radio"
        aria-checked={selectedMode === 'single'}
        aria-label="Single Player Mode"
        tabIndex={focusedMode === 'single' ? 0 : -1}
        className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-150 focus:ring-2 focus:ring-blue-500 focus:outline-none ${selectedMode === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} ${focusedMode === 'single' ? 'ring-2 ring-blue-400' : ''}`}
        onClick={() => onSelectMode('single')}
        onFocus={() => setFocusedMode('single')}
      >
        Single Player
        {selectedMode === 'single' && (
          <span className="ml-2" aria-hidden="true">✓</span>
        )}
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={selectedMode === 'two'}
        aria-label="Two Player Mode"
        tabIndex={focusedMode === 'two' ? 0 : -1}
        className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-150 focus:ring-2 focus:ring-blue-500 focus:outline-none ${selectedMode === 'two' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} ${focusedMode === 'two' ? 'ring-2 ring-blue-400' : ''}`}
        onClick={() => onSelectMode('two')}
        onFocus={() => setFocusedMode('two')}
      >
        Two Player
        {selectedMode === 'two' && (
          <span className="ml-2" aria-hidden="true">✓</span>
        )}
      </button>
      <div className="mt-2 text-sm text-gray-500" aria-live="polite">
        {selectedMode === 'single' && 'Single Player mode selected.'}
        {selectedMode === 'two' && 'Two Player mode selected.'}
      </div>
    </div>
  );
};

export default GameModeMenu;
