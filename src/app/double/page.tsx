import React from 'react';
import TwoPlayerGame from '../../components/game/TwoPlayerGame';
import RetroGameLayout from '../../components/game/RetroGameLayout';

/**
 * Double Player Game Page with retro styling
 * Renders the two-player Tetris game.
 */
const DoublePlayerPage = () => (
  <RetroGameLayout title="Two Player">
    <TwoPlayerGame />
  </RetroGameLayout>
);

export default DoublePlayerPage;
