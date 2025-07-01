'use client';

import React, { useState } from 'react';
import { GameOverOverlay } from './GameOverOverlay';
// import { useGameEngine } from '@/lib/game/useGameEngine'; // Placeholder for actual game logic
import { submitLeaderboardEntry } from '@/lib/highscore/submitLeaderboardEntry';

/**
 * SinglePlayerGame
 * Main component for single player Tetris game.
 * Handles game state, score, and game over flow.
 * Integrates GameOverOverlay for name entry and main menu navigation.
 */
const SinglePlayerGame: React.FC<{ onMainMenu: () => void }> = ({ onMainMenu }) => {
  // Placeholder state for demonstration
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // TODO: Integrate with actual game engine logic
  // const { board, score, isGameOver, ... } = useGameEngine();

  // Simulate game over for demo
  const handleSimulateGameOver = () => {
    setScore(Math.floor(Math.random() * 10000));
    setGameState('gameover');
  };

  const handleSubmitScore = async (name: string) => {
    setSubmitting(true);
    try {
      await submitLeaderboardEntry(name, score);
      // Optionally show a success message or refetch leaderboard
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Game rendering goes here */}
      {gameState === 'playing' && (
        <>
          <div className="mb-4 text-lg font-bold">Tetris Game (Single Player)</div>
          <div className="mb-2">Score: <span className="font-mono">{score}</span></div>
          {/* TODO: Render game board, controls, etc. */}
          <button
            className="mt-8 px-4 py-2 bg-red-600 text-white rounded"
            onClick={handleSimulateGameOver}
          >
            Simulate Game Over
          </button>
        </>
      )}
      {gameState === 'gameover' && (
        <GameOverOverlay
          score={score}
          onSubmit={handleSubmitScore}
          onMainMenu={onMainMenu}
        />
      )}
      {submitting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-900 rounded p-4 shadow text-lg">Submitting score...</div>
        </div>
      )}
    </div>
  );
};

export default SinglePlayerGame;
