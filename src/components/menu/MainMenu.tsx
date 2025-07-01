'use client';

import React, { useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import GameModeMenu, { GameMode } from "./GameModeMenu";
// import { useHighscore } from '../../lib/highscore/useHighscore';
import LeaderboardOverlay from './LeaderboardOverlay';
import { useLeaderboard } from '../../lib/highscore/useLeaderboard';

/**
 * MainMenu component displays the main menu for the Tetris game.
 * - Accessible via keyboard and mouse
 * - Responsive and visually distinct
 * - Uses semantic HTML for accessibility
 */

/**
 * MainMenu component displays the main menu for the Tetris game.
 * Integrates GameModeMenu for mode selection.
 */


const MainMenu: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<GameMode | undefined>(undefined);
  const { entries, loading: leaderboardLoading, refetch: refetchLeaderboard } = useLeaderboard();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const router = useRouter();

  const handleSelectMode = useCallback((mode: GameMode) => {
    setSelectedMode(mode);
  }, []);

  const handleStartGame = useCallback(() => {
    if (!selectedMode) return;
    if (selectedMode === 'single') {
      router.push('/single');
    } else if (selectedMode === 'two') {
      router.push('/double');
    }
  }, [selectedMode, router]);

  const handleShowLeaderboard = useCallback(() => {
    setShowLeaderboard(true);
    refetchLeaderboard();
  }, [refetchLeaderboard]);
  const handleCloseLeaderboard = useCallback(() => {
    setShowLeaderboard(false);
  }, []);


  // Single player game now handled by /single route

  return (
    <>
      {/* Winner message should be rendered at the top of the page, not inside MainMenu. If you want a global winner message, render it here as a fixed/absolute element. */}
      {/* Example: */}
      {/*
      {winner && (
        <div className="fixed top-0 left-0 w-full z-50 flex justify-center mt-4 pointer-events-none">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg text-2xl font-bold">
            {winner}
          </div>
        </div>
      )}
      */}
      <nav
        aria-label="Main Menu"
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white px-4"
      >
        <h1 className="text-4xl font-bold mb-8 focus:outline-none" tabIndex={-1}>
          Tetris
        </h1>
        {/* Highscore Display (from DB) */}
        <div
          className="mb-4 w-full max-w-xs flex items-center justify-center"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="text-lg font-semibold" id="highscore-label">
            Highscore:
          </span>
          <span
            className="ml-2 text-2xl font-bold text-yellow-300"
            aria-labelledby="highscore-label"
          >
            {leaderboardLoading
              ? '...'
              : entries.length > 0
                ? entries[0].score.toLocaleString()
                : 'No highscore yet'}
          </span>
        </div>
        <div className="mb-8 w-full max-w-xs">
          <GameModeMenu onSelectMode={handleSelectMode} selectedMode={selectedMode} />
        </div>
        <ul className="w-full max-w-xs space-y-4" role="menu">
          <li>
            <button
              className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 focus:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              role="menuitem"
              tabIndex={0}
              autoFocus
              onClick={handleStartGame}
              disabled={!selectedMode}
              aria-disabled={!selectedMode}
            >
              {selectedMode ? `Start ${selectedMode === 'single' ? 'Single Player' : 'Two Player'} Game` : 'Start Game'}
            </button>
          </li>
          <li>
            <button
              className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 focus:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition text-lg font-semibold"
              role="menuitem"
              tabIndex={0}
              onClick={handleShowLeaderboard}
              aria-haspopup="dialog"
              aria-expanded={showLeaderboard}
            >
              Leaderboard
            </button>
          </li>
          <li>
            <button
              className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 focus:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition text-lg font-semibold"
              role="menuitem"
              tabIndex={0}
            >
              Settings
            </button>
          </li>
        </ul>
      </nav>
      <LeaderboardOverlay
        open={showLeaderboard}
        onClose={handleCloseLeaderboard}
        entries={entries}
        loading={leaderboardLoading}
        onRefresh={refetchLeaderboard}
      />
    </>
  );
};

export default MainMenu;
