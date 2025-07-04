import React, { useState, useCallback, useEffect, KeyboardEvent } from 'react';
import RetroText from './RetroText';

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
      className="flex flex-col gap-4 items-center focus:outline-none bg-gray-900 bg-opacity-50 border-2 border-cyan-400 p-6 backdrop-blur-sm"
      style={{
        boxShadow: '0 0 15px rgba(34, 211, 238, 0.3)',
      }}
    >
      <RetroText size="lg" variant="primary" className="mb-2">
        Select Mode
      </RetroText>
      
      <button
        type="button"
        role="radio"
        aria-checked={selectedMode === 'single'}
        aria-label="Single Player Mode"
        tabIndex={focusedMode === 'single' ? 0 : -1}
        className={`px-6 py-3 rounded-none text-lg font-mono font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none border-2 ${
          selectedMode === 'single' 
            ? 'bg-cyan-900 border-cyan-400 text-cyan-400 shadow-lg' 
            : 'bg-gray-800 border-gray-600 text-gray-400'
        } ${
          focusedMode === 'single' ? 'ring-2 ring-cyan-300' : ''
        }`}
        style={selectedMode === 'single' ? {
          boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)',
          textShadow: '0 0 5px currentColor',
        } : {}}
        onClick={() => onSelectMode('single')}
        onFocus={() => setFocusedMode('single')}
      >
        Single Player
        {selectedMode === 'single' && (
          <span className="ml-2" aria-hidden="true">◆</span>
        )}
      </button>
      
      <button
        type="button"
        role="radio"
        aria-checked={selectedMode === 'two'}
        aria-label="Two Player Mode"
        tabIndex={focusedMode === 'two' ? 0 : -1}
        className={`px-6 py-3 rounded-none text-lg font-mono font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none border-2 ${
          selectedMode === 'two' 
            ? 'bg-purple-900 border-purple-400 text-purple-400 shadow-lg' 
            : 'bg-gray-800 border-gray-600 text-gray-400'
        } ${
          focusedMode === 'two' ? 'ring-2 ring-purple-300' : ''
        }`}
        style={selectedMode === 'two' ? {
          boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
          textShadow: '0 0 5px currentColor',
        } : {}}
        onClick={() => onSelectMode('two')}
        onFocus={() => setFocusedMode('two')}
      >
        Two Player
        {selectedMode === 'two' && (
          <span className="ml-2" aria-hidden="true">◆</span>
        )}
      </button>
      
      <div className="mt-2 text-center" aria-live="polite">
        <RetroText size="sm" variant="secondary" glow={false} className="opacity-80">
          {selectedMode === 'single' && 'Single Player mode selected.'}
          {selectedMode === 'two' && 'Two Player mode selected.'}
          {!selectedMode && 'Press 1 or 2 to select mode'}
        </RetroText>
      </div>
    </div>
  );
};

export default GameModeMenu;
