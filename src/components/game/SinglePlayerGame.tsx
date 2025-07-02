'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAudioStore } from '../../lib/audio/store';
import { BG_MUSIC_VOLUME } from '../../lib/audio/constants';
import { GameOverOverlay } from './GameOverOverlay';
import { gameReducer, initGameState, GameState, GameAction } from '@/lib/game/engine';
import { submitLeaderboardEntry } from '@/lib/highscore/submitLeaderboardEntry';
import { useRouter } from 'next/navigation';
import RetroGameOverlay from './RetroGameOverlay';
import RetroGameHUD from './RetroGameHUD';

/**
 * SinglePlayerGame
 * Main component for single player Tetris game.
 * Handles game state, score, and game over flow.
 * Integrates GameOverOverlay for name entry and main menu navigation.
 */

const BOARD_ROWS = 20;
const BOARD_COLS = 10;

const SinglePlayerGame: React.FC = () => {
  const [state, dispatch] = React.useReducer(gameReducer, undefined, initGameState);
  const [submitting, setSubmitting] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const muted = useAudioStore((s) => s.muted);
  const toggleMuted = useAudioStore((s) => s.toggleMuted);
  const playDrop = useAudioStore((s) => s.playDrop);
  const playVanish = useAudioStore((s) => s.playVanish);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gameOverAudioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  // Vibrate effect state
  const [vibrate, setVibrate] = useState(false);
  // Music: toggle mute and play only when game starts
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    audio.volume = BG_MUSIC_VOLUME / 2;
    // Only play music when game has started and not muted
    if (gameStarted && !muted) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [muted, gameStarted]);

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

  // Game loop - only run when game has started
  React.useEffect(() => {
    if (!gameStarted || state.over) {
      if (state.over) {
        setLastScore(state.score);
        setShowOverlay(true);
        // Play game over sound
        if (gameOverAudioRef.current && !muted) {
          gameOverAudioRef.current.currentTime = 0;
          gameOverAudioRef.current.play().catch(() => {});
        }
      }
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
  }, [gameStarted, state.over, state.level, muted]);

  // Keyboard controls with long-press support - only when game has started
  React.useEffect(() => {
    if (!gameStarted || state.over) return;
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
  }, [gameStarted, state.over]);

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
    setGameStarted(true); // Ensure game is started after restart
  };

  const handlePlayAgain = () => {
    setShowOverlay(false);
    dispatch({ type: 'restart' });
    setGameStarted(true);
  };

  const handleStartGame = () => {
    setGameStarted(true);
    dispatch({ type: 'restart' }); // Reset game state to ensure clean start
  };

  const handleBackToMenu = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    router.push('/');
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

  // Board rendering with retro styling
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
      <div 
        className={`grid grid-rows-20 grid-cols-10 gap-[1px] border-2 border-cyan-400 overflow-hidden backdrop-blur-sm ${vibrate ? 'animate-pulse' : ''}`}
        style={{ 
          width: 320, 
          height: 640,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(15, 15, 35, 0.9) 100%)',
          boxShadow: '0 0 30px rgba(34, 211, 238, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.1)',
        }}
        aria-label="Tetris board"
        role="grid"
      >
        {display.flat().map((cell, i) => (
          <div
            key={i}
            className={`w-8 h-8 flex items-center justify-center text-xs font-bold border border-gray-700 ${
              cell ? `tetromino-${cell}` : 'bg-black bg-opacity-50'
            }`}
            style={cell ? {
              boxShadow: '0 0 5px currentColor',
              textShadow: '0 0 3px currentColor',
            } : {}}
            role="gridcell"
            aria-label={cell ? cell : 'empty'}
          />
        ))}
      </div>
    );
  };

  // Next piece preview with retro styling
  const renderNext = () => {
    const { next } = state;
    return (
      <div 
        className="grid grid-rows-4 grid-cols-4 gap-[1px] border border-purple-400 bg-black bg-opacity-50 p-2"
        style={{
          boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)',
        }}
      >
        {next.shape.flat().map((cell: number, i: number) => (
          <div
            key={i}
            className={`w-5 h-5 border border-gray-700 ${
              cell ? `tetromino-${next.type}` : 'bg-black bg-opacity-30'
            }`}
            style={cell ? {
              boxShadow: '0 0 3px currentColor',
            } : {}}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-4">
      {/* Background music audio element */}
      <audio
        ref={audioRef}
        src="/one-player-music.mp3"
        loop
        style={{ display: 'none' }}
        aria-label="Single player mode background music"
      />
      {/* Game over sound effect */}
      <audio
        ref={gameOverAudioRef}
        src="/game-over.mp3"
        style={{ display: 'none' }}
        aria-label="Game over sound"
      />

      {/* Game Start Overlay */}
      {!gameStarted && (
        <RetroGameOverlay
          title="Single Player"
          subtitle="Classic Tetris Experience"
          onPrimaryAction={handleStartGame}
          primaryActionText="🎮 Start Game"
          onSecondaryAction={handleBackToMenu}
          secondaryActionText="← Main Menu"
          controls={[
            { key: "← → ↓", action: "Move" },
            { key: "↑ or X", action: "Rotate" },
            { key: "Space", action: "Hard Drop" },
            { key: "R", action: "Restart" },
          ]}
        />
      )}

      {/* Main Game Interface */}
      {gameStarted && (
        <div className="flex flex-row gap-8 items-start justify-center w-full max-w-6xl">
          {/* Game Board */}
          <div className="flex-shrink-0">
            {renderBoard()}
          </div>
          
          {/* HUD Panel */}
          <div className="flex-shrink-0 min-w-[240px]">
            <RetroGameHUD
              score={state.score}
              level={state.level}
              lines={state.lines}
              nextPiece={renderNext()}
              onRestart={handleRestart}
              onMainMenu={handleBackToMenu}
              onMuteToggle={handleMuteToggle}
              muted={muted}
              gameStarted={gameStarted}
            />
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {showOverlay && (
        <GameOverOverlay
          score={lastScore}
          onSubmit={handleSubmitScore}
          onMainMenu={handleBackToMenu}
          onPlayAgain={handlePlayAgain}
        />
      )}

      {/* Submitting Score Overlay */}
      {submitting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div 
            className="bg-gray-900 border-2 border-cyan-400 p-6 shadow-2xl backdrop-blur-sm"
            style={{
              boxShadow: '0 0 30px rgba(34, 211, 238, 0.5)',
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-cyan-400 font-mono text-lg">Submitting score...</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Tetromino color styles with glow effects */}
      <style jsx global>{`
        .tetromino-I { 
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: #06b6d4;
        }
        .tetromino-O { 
          background: linear-gradient(135deg, #fde047 0%, #facc15 100%);
          color: #fde047;
        }
        .tetromino-T { 
          background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
          color: #a78bfa;
        }
        .tetromino-S { 
          background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
          color: #4ade80;
        }
        .tetromino-Z { 
          background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
          color: #f87171;
        }
        .tetromino-J { 
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          color: #60a5fa;
        }
        .tetromino-L { 
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #fbbf24;
        }
      `}</style>
    </div>
  );
};

export default SinglePlayerGame;
