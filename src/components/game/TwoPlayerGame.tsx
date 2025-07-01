
'use client';

import React, { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { useAudioStore } from '../../lib/audio/store';
import {
  twoPlayerGameReducer,
  initTwoPlayerGameState,
  TwoPlayerGameState,
  TwoPlayerAction,
} from '../../lib/game/twoPlayerEngine';
import { Tetromino } from '../../lib/game/types';
import NextTetrominoPreview from './NextTetrominoPreview';

/**
 * TwoPlayerGame component (full logic)
 * Renders two Tetris boards side by side for local competitive play.
 * Handles real-time score, next piece, garbage line, and win/lose mechanics.
 */
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const PLAYER_KEYS = [
  { left: 'a', right: 'd', down: 's', rotate: 'w', drop: ' ' }, // Player 1
  { left: 'ArrowLeft', right: 'ArrowRight', down: 'ArrowDown', rotate: 'ArrowUp', drop: 'Enter' }, // Player 2
];

import { useRouter } from 'next/navigation';


const TwoPlayerGame: React.FC = () => {
  const [state, dispatch] = useReducer(twoPlayerGameReducer, undefined, initTwoPlayerGameState);
  const muted = useAudioStore((s) => s.muted);
  const toggleMuted = useAudioStore((s) => s.toggleMuted);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  // Music: toggle mute and play on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    if (!muted) {
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }, [muted]);

  // Pause music on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleMuteToggle = useCallback(() => {
    toggleMuted();
  }, [toggleMuted]);

  // Keyboard controls for both players
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      PLAYER_KEYS.forEach((keys, idx) => {
        if (e.key === keys.left) dispatch({ type: 'move', player: idx as 0 | 1, dx: -1, dy: 0 });
        if (e.key === keys.right) dispatch({ type: 'move', player: idx as 0 | 1, dx: 1, dy: 0 });
        if (e.key === keys.down) dispatch({ type: 'tick', player: idx as 0 | 1 });
        if (e.key === keys.rotate) dispatch({ type: 'rotate', player: idx as 0 | 1 });
        if (e.key === keys.drop) dispatch({ type: 'drop', player: idx as 0 | 1 });
      });
    },
    [dispatch]
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Game loop (tick)
  React.useEffect(() => {
    if (state.winner) return;
    const interval = setInterval(() => {
      dispatch({ type: 'tick', player: 0 });
      dispatch({ type: 'tick', player: 1 });
    }, 600);
    return () => clearInterval(interval);
  }, [state.winner]);

  // Restart handler
  const handleRestart = () => dispatch({ type: 'restart' });

  // Back to main menu handler
  const handleBackToMenu = () => router.push('/');

  return (
    <div className="relative flex flex-col items-center w-screen h-screen bg-gray-950 overflow-hidden">
      {/* Background music audio element */}
      <audio
        ref={audioRef}
        src="/two-player-music.mp3"
        loop
        autoPlay
        style={{ display: 'none' }}
        aria-label="Two player mode background music"
      />
      {/* Mute button at top right */}
      <button
        onClick={handleMuteToggle}
        aria-label={muted ? "Unmute background music" : "Mute background music"}
        className="fixed top-4 right-4 z-50 bg-blue-800 bg-opacity-80 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
        tabIndex={0}
      >
        {muted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6 6m0-6l-6 6M9 5v14l-5-5H2V9h2l5-5zm7.5 7.5a5.5 5.5 0 00-7.78-7.78" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5v14l-5-5H2V9h2l5-5zm7.5 7.5a5.5 5.5 0 00-7.78-7.78" />
          </svg>
        )}
      </button>
      {/* Back to Main Menu button, always visible */}
      <button
        className="absolute top-4 left-4 z-40 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 text-base font-semibold"
        onClick={handleBackToMenu}
        tabIndex={0}
        aria-label="Back to Main Menu"
      >
        ← Main Menu
      </button>
      {/* Winner overlay at the very top, stacked above the game space */}
      {state.winner && (
        <div className="absolute top-0 left-0 w-full flex justify-center z-30 pointer-events-none">
          <div className="mt-6 bg-white bg-opacity-95 rounded text-gray-900 text-2xl font-bold px-8 py-4 shadow-lg flex items-center gap-4 pointer-events-auto border-2 border-blue-400">
            Player {state.winner} wins!
            <button
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={handleRestart}
              tabIndex={0}
            >
              Restart
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col justify-center items-center w-full">
        <h2 className="text-2xl font-bold mb-2 text-white drop-shadow">Two Player Tetris</h2>
        <div className="flex gap-8 items-center justify-center w-full h-full max-h-[90vh]">
          <PlayerBoard
            player={1}
            state={state.players[0]}
            opponentScore={state.players[1].score}
            isWinner={state.winner === 1}
          />
          <PlayerBoard
            player={2}
            state={state.players[1]}
            opponentScore={state.players[0].score}
            isWinner={state.winner === 2}
          />
        </div>
        <div className="mt-2 text-sm text-blue-200 drop-shadow">P1: WASD/Space | P2: Arrows/Enter</div>
      </div>
    </div>
  );
};


interface PlayerBoardProps {
  player: 1 | 2;
  state: any;
  opponentScore: number;
  isWinner: boolean;
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({ player, state, opponentScore, isWinner }) => {
  // Merge current tetromino into board for display
  const display: (string | null)[][] = state.board.map((row: (string | null)[]) => [...row]);
  const { current, position } = state;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (current.shape[y][x]) {
        const bx = position.x + x;
        const by = position.y + y;
        if (by >= 0 && by < 20 && bx >= 0 && bx < 10) {
          display[by][bx] = current.type;
        }
      }
    }
  }
  // Vibrate effect for this board
  const [vibrate, setVibrate] = useState(false);
  const prevStateRef = React.useRef(state);
  useEffect(() => {
    const prev = prevStateRef.current;
    if (
      (prev.position.y !== state.position.y && state.position.y < prev.position.y) || // restart
      (prev.position.y === state.position.y && prev.board !== state.board && !state.over)
    ) {
      setVibrate(true);
      setTimeout(() => setVibrate(false), 180);
    }
    prevStateRef.current = state;
  }, [state.board, state.position.y, state.over]);
  // If game is over and this player lost, tilt and gray out
  const isLoser = state.over && !isWinner;
  const tiltClass = isLoser ? 'rotate-6' : '';
  const grayClass = isLoser ? 'grayscale opacity-60' : '';
  // Info block (shared NextTetrominoPreview)
  const infoBlock = (
    <div className="flex flex-col items-center gap-1 px-2">
      <div className="text-lg font-semibold text-black mb-1">Player {player}</div>
      <div className="text-black">Score: {state.score}</div>
      <div className="text-black">Level: {state.level}</div>
      <div className="text-black">Opponent: {opponentScore}</div>
      <div className="mt-2"><NextTetrominoPreview tetromino={state.next} /></div>
    </div>
  );
  return (
    <div className={`flex flex-row items-center transition-all duration-300 rounded-xl p-2 bg-white border border-gray-300 shadow ${tiltClass} ${grayClass}`}>
      {player === 1 && infoBlock}
      <div className="bg-white rounded-xl p-1 mx-2 border border-gray-200">
        <BoardGrid board={display} vibrate={vibrate} />
      </div>
      {player === 2 && infoBlock}
    </div>
  );
};




const BoardGrid: React.FC<{ board: (string | null)[][]; vibrate?: boolean }> = ({ board, vibrate }) => {
  // Responsive sizing: fit 90% of viewport height, max 40vw per board
  const [cellSize, setCellSize] = useState(32);

  useEffect(() => {
    function handleResize() {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      // Subtract header, margins, and padding (estimate 120px)
      const availableHeight = Math.max(200, vh - 120);
      const maxWidth = Math.floor((vw * 0.9) / 2);
      const maxHeight = Math.floor(availableHeight);
      // Clamp cell size so board never overflows vertically
      const size = Math.max(16, Math.min(Math.floor(maxHeight / 20), Math.floor(maxWidth / 10), 48));
      setCellSize(size);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const width = cellSize * 10;
  const height = cellSize * 20;
  return (
    <div
      className={`grid grid-rows-20 grid-cols-10 gap-[1px] bg-gray-700 rounded overflow-hidden border-2 border-blue-400 flex-shrink${vibrate ? ' vibrate' : ''}`}
      style={{ width, height, maxHeight: '90vh' }}
      aria-label="Tetris board"
      role="grid"
    >
      {board.flat().map((cell, i) => (
        <div
          key={i}
          className={`flex items-center justify-center text-xs font-bold
            ${cell === 'G' ? 'bg-yellow-600' : cell ? `tetromino-${cell}` : 'bg-gray-900'}
            border border-gray-800`}
          style={{ width: cellSize, height: cellSize, maxHeight: 'clamp(16px, 4vw, 48px)' }}
          role="gridcell"
          aria-label={cell || 'empty'}
        />
      ))}
    </div>
  );
};



// Add tetromino color styles for two player game
if (typeof window !== 'undefined') {
  const styleId = 'tetris-tetromino-colors';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .tetromino-I { background: #06b6d4; }
      .tetromino-O { background: #fde047; }
      .tetromino-T { background: #a78bfa; }
      .tetromino-S { background: #4ade80; }
      .tetromino-Z { background: #f87171; }
      .tetromino-J { background: #60a5fa; }
      .tetromino-L { background: #fbbf24; }
    `;
    document.head.appendChild(style);
  }
}


export default TwoPlayerGame;
