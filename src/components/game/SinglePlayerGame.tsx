'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAudioStore } from '../../lib/audio/store';
import { BG_MUSIC_VOLUME } from '../../lib/audio/constants';
import { GameOverOverlay } from './GameOverOverlay';
import { gameReducer, initGameState, GameState, GameAction } from '@/lib/game/engine';
import { submitLeaderboardEntry } from '@/lib/highscore/submitLeaderboardEntry';

/**
 * SinglePlayerGame
 * Main component for single player Tetris game.
 * Handles game state, score, and game over flow.
 * Integrates GameOverOverlay for name entry and main menu navigation.
 */

const BOARD_ROWS = 20;
const BOARD_COLS = 10;

const SinglePlayerGame: React.FC<{ onMainMenu: () => void }> = ({ onMainMenu }) => {
  const [state, dispatch] = React.useReducer(gameReducer, undefined, initGameState);
  const [submitting, setSubmitting] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const muted = useAudioStore((s) => s.muted);
  const toggleMuted = useAudioStore((s) => s.toggleMuted);
  const playDrop = useAudioStore((s) => s.playDrop);
  const playVanish = useAudioStore((s) => s.playVanish);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Vibrate effect state
  const [vibrate, setVibrate] = useState(false);
  // Music: toggle mute and play on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    audio.volume = BG_MUSIC_VOLUME;
    if (!muted) {
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

  // Game loop
  React.useEffect(() => {
    if (state.over) {
      setLastScore(state.score);
      setShowOverlay(true);
      return;
    }
    setShowOverlay(false);
    const interval = setInterval(() => {
      // Custom tick: detect if block lands
      const prevY = state.position.y;
      const nextPos = { x: state.position.x, y: state.position.y + 1 };
      // If moving down would collide, vibrate
      // (simulate what gameReducer does for 'tick')
      // We can't call checkCollision here, so vibrate after reducer if position doesn't change
      dispatch({ type: 'tick' });
    }, Math.max(1000 - (state.level - 1) * 75, 100));
    return () => clearInterval(interval);
  }, [state.over, state.level]);

  // Keyboard controls with long-press support
  React.useEffect(() => {
    if (state.over) return;
    let leftInterval: NodeJS.Timeout | null = null;
    let rightInterval: NodeJS.Timeout | null = null;
    let downInterval: NodeJS.Timeout | null = null;

    const startMove = (dir: 'left' | 'right' | 'down') => {
      let action, intervalSetter;
      switch (dir) {
        case 'left':
          action = () => dispatch({ type: 'move', payload: { dx: -1, dy: 0 } });
          intervalSetter = (val: NodeJS.Timeout | null) => { leftInterval = val; };
          break;
        case 'right':
          action = () => dispatch({ type: 'move', payload: { dx: 1, dy: 0 } });
          intervalSetter = (val: NodeJS.Timeout | null) => { rightInterval = val; };
          break;
        case 'down':
          action = () => dispatch({ type: 'move', payload: { dx: 0, dy: 1 } });
          intervalSetter = (val: NodeJS.Timeout | null) => { downInterval = val; };
          break;
        default:
          return;
      }
      action();
      intervalSetter(setTimeout(function repeat() {
        action();
        intervalSetter(setTimeout(repeat, 50));
      }, 150));
    };

    const stopMove = (dir: 'left' | 'right' | 'down') => {
      switch (dir) {
        case 'left':
          if (leftInterval) clearTimeout(leftInterval);
          leftInterval = null;
          break;
        case 'right':
          if (rightInterval) clearTimeout(rightInterval);
          rightInterval = null;
          break;
        case 'down':
          if (downInterval) clearTimeout(downInterval);
          downInterval = null;
          break;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      switch (e.key) {
        case 'ArrowLeft':
          startMove('left');
          break;
        case 'ArrowRight':
          startMove('right');
          break;
        case 'ArrowDown':
          startMove('down');
          break;
        case 'ArrowUp':
        case 'x':
          dispatch({ type: 'rotate' });
          break;
        case ' ': // Hard drop
          dispatch({ type: 'drop' });
          break;
        case 'r':
          dispatch({ type: 'restart' });
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          stopMove('left');
          break;
        case 'ArrowRight':
          stopMove('right');
          break;
        case 'ArrowDown':
          stopMove('down');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      stopMove('left');
      stopMove('right');
      stopMove('down');
    };
  }, [state.over]);

  const handleSubmitScore = async (name: string) => {
    setSubmitting(true);
    try {
      await submitLeaderboardEntry(name, lastScore);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    dispatch({ type: 'restart' });
  };

  // Vibrate and play sound when block lands (tick or drop), and play vanish when lines are cleared
  const prevStateRef = React.useRef(state);
  React.useEffect(() => {
    // If y position didn't change but board changed, block landed
    const prev = prevStateRef.current;
    // Detect lines cleared
    const prevLines = prev.lines;
    const linesCleared = state.lines - prevLines;
    if (
      (prev.position.y !== state.position.y && state.position.y < prev.position.y) || // restart
      (prev.position.y === state.position.y && prev.board !== state.board && !state.over)
    ) {
      setVibrate(true);
      setTimeout(() => setVibrate(false), 180);
      playDrop();
    }
    if (linesCleared > 0) {
      playVanish();
    }
    prevStateRef.current = state;
  }, [state.board, state.position.y, state.over, state.lines, playDrop, playVanish]);

  // Board rendering
  const renderBoard = () => {
    // Merge current tetromino into board for display
    const display: (string | null)[][] = state.board.map((row: (string | null)[]) => [...row]);
    const { current, position } = state;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (current.shape[y][x]) {
          const bx = position.x + x;
          const by = position.y + y;
          if (by >= 0 && by < BOARD_ROWS && bx >= 0 && bx < BOARD_COLS) {
            display[by][bx] = current.type;
          }
        }
      }
    }
    return (
      <div className={`grid grid-rows-20 grid-cols-10 gap-[1px] bg-gray-700 rounded overflow-hidden border-2 border-blue-400${vibrate ? ' vibrate' : ''}`}
        style={{ width: 320, height: 640 }}
        aria-label="Tetris board"
        role="grid"
      >
        {display.flat().map((cell, i) => (
          <div
            key={i}
            className={`w-8 h-8 flex items-center justify-center text-xs font-bold
              ${cell ? `tetromino-${cell}` : 'bg-gray-900'}
              border border-gray-800`}
            role="gridcell"
            aria-label={cell ? cell : 'empty'}
          >
            {/* Optionally: cell */}
          </div>
        ))}
      </div>
    );
  };

  // Next piece preview
  const renderNext = () => {
    const { next } = state;
    return (
      <div className="flex flex-col items-center">
        <div className="text-sm mb-1">Next</div>
        <div className="grid grid-rows-4 grid-cols-4 gap-[1px] bg-gray-700 rounded">
          {next.shape.flat().map((cell: number, i: number) => (
            <div
              key={i}
              className={`w-5 h-5 ${cell ? `tetromino-${next.type}` : 'bg-gray-900'} border border-gray-800`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Background music audio element */}
      <audio
        ref={audioRef}
        src="/one-player-music.mp3"
        loop
        autoPlay
        style={{ display: 'none' }}
        aria-label="Single player mode background music"
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
      <div className="flex flex-row gap-8 items-start mt-8">
        {renderBoard()}
        <div className="flex flex-col gap-4 ml-4">
          {renderNext()}
          <div className="mt-4 text-lg font-bold">Score: <span className="font-mono">{state.score}</span></div>
          <div className="text-md">Level: {state.level}</div>
          <div className="text-md">Lines: {state.lines}</div>
          <button
            className="mt-8 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleRestart}
            aria-label="Restart game"
          >
            Restart (R)
          </button>
          <button
            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded"
            onClick={onMainMenu}
            aria-label="Back to main menu"
          >
            Main Menu
          </button>
        </div>
      </div>
      {showOverlay && (
        <GameOverOverlay
          score={lastScore}
          onSubmit={handleSubmitScore}
          onMainMenu={onMainMenu}
        />
      )}
      {submitting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-900 rounded p-4 shadow text-lg">Submitting score...</div>
        </div>
      )}
      {/* Tetromino color styles */}
      <style jsx global>{`
        .tetromino-I { background: #06b6d4; }
        .tetromino-O { background: #fde047; }
        .tetromino-T { background: #a78bfa; }
        .tetromino-S { background: #4ade80; }
        .tetromino-Z { background: #f87171; }
        .tetromino-J { background: #60a5fa; }
        .tetromino-L { background: #fbbf24; }
      `}</style>
    </div>
  );
};

export default SinglePlayerGame;
