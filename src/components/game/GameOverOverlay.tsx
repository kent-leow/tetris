'use client';

import React, { useState } from 'react';

/**
 * GameOverOverlay
 * Overlay shown when the game ends. Allows player to enter their name and submit score.
 * Provides option to return to main menu.
 *
 * Props:
 * - score: number (final score)
 * - onSubmit: (name: string) => void (called when submitting name)
 * - onMainMenu: () => void (called when returning to main menu)
 */
interface GameOverOverlayProps {
  score: number;
  onSubmit: (name: string) => void;
  onMainMenu: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ score, onSubmit, onMainMenu }) => {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Game Over</h2>
        <p className="mb-2 text-lg text-gray-700 dark:text-gray-200">Your Score: <span className="font-mono">{score}</span></p>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            <label htmlFor="player-name" className="mb-2 text-gray-700 dark:text-gray-300">Enter your name:</label>
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="mb-4 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              maxLength={16}
              required
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mb-2 transition-colors"
            >
              Submit Score
            </button>
          </form>
        ) : (
          <div className="mb-4 text-green-600 dark:text-green-400">Score submitted!</div>
        )}
        <button
          onClick={onMainMenu}
          className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Back to Main Menu
        </button>
      </div>
    </div>
  );
};
