import React from 'react';
import TwoPlayerGame from '../../components/game/TwoPlayerGame';

/**
 * Double Player Game Page
 * Renders the two-player Tetris game.
 */
const DoublePlayerPage = () => (
  <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950">
    <TwoPlayerGame />
  </main>
);

export default DoublePlayerPage;
