
'use client';

import React, { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { useAudioStore } from '../../lib/audio/store';
import { BG_MUSIC_VOLUME } from '../../lib/audio/constants';
import {
  twoPlayerGameReducer,
  initTwoPlayerGameState,
  TwoPlayerGameState,
  TwoPlayerAction,
} from '../../lib/game/twoPlayerEngine';
import { Tetromino } from '../../lib/game/types';
import NextTetrominoPreview from './NextTetrominoPreview';
import { useRouter } from 'next/navigation';
import RetroGameOverlay from './RetroGameOverlay';
import RetroGameLayout from './RetroGameLayout';
import RetroText from '../menu/RetroText';
import RetroButton from '../menu/RetroButton';
import { useNoScroll } from '../../lib/game/useNoScroll';

/**
 * TwoPlayerGame component with retro styling
 * Renders two Tetris boards side by side for local competitive play.
 * Features retro aesthetics matching the main menu and single-player mode.
 */
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const PLAYER_KEYS = [
  { left: 'a', right: 'd', down: 's', rotate: 'w', drop: ' ' }, // Player 1
  { left: 'ArrowLeft', right: 'ArrowRight', down: 'ArrowDown', rotate: 'ArrowUp', drop: 'Enter' }, // Player 2
];

const TwoPlayerGame: React.FC = () => {
  const [state, dispatch] = useReducer(twoPlayerGameReducer, undefined, initTwoPlayerGameState);
  const [gameStarted, setGameStarted] = useState(false);
  const muted = useAudioStore((s) => s.muted);
  const toggleMuted = useAudioStore((s) => s.toggleMuted);
  const playDrop = useAudioStore((s) => s.playDrop);
  const playVanish = useAudioStore((s) => s.playVanish);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gameEndAudioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  // Prevent all scrolling during gameplay
  useNoScroll();

  // Play game end sound when winner is determined
  useEffect(() => {
    if (state.winner && gameEndAudioRef.current && !muted) {
      gameEndAudioRef.current.currentTime = 0;
      gameEndAudioRef.current.play().catch(() => {});
    }
  }, [state.winner, muted]);

  // Background music logic - only play when game has started
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = BG_MUSIC_VOLUME / 2;
    audio.muted = muted;
    if (gameStarted && !audio.muted) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [muted, gameStarted]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        if (audioRef.current.parentNode) {
          audioRef.current.parentNode.removeChild(audioRef.current);
        }
      }
    };
  }, []);

  const handleMuteToggle = useCallback(() => {
    toggleMuted();
  }, [toggleMuted]);

  // Keyboard controls for both players
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!gameStarted) return;
      PLAYER_KEYS.forEach((keys, idx) => {
        if (e.key === keys.left) dispatch({ type: 'move', player: idx as 0 | 1, dx: -1, dy: 0 });
        if (e.key === keys.right) dispatch({ type: 'move', player: idx as 0 | 1, dx: 1, dy: 0 });
        if (e.key === keys.down) dispatch({ type: 'tick', player: idx as 0 | 1 });
        if (e.key === keys.rotate) dispatch({ type: 'rotate', player: idx as 0 | 1 });
        if (e.key === keys.drop) dispatch({ type: 'drop', player: idx as 0 | 1 });
      });
    },
    [dispatch, gameStarted]
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Game loop
  React.useEffect(() => {
    if (!gameStarted || state.winner) return;
    const interval = setInterval(() => {
      dispatch({ type: 'tick', player: 0 });
      dispatch({ type: 'tick', player: 1 });
    }, 600);
    return () => clearInterval(interval);
  }, [gameStarted, state.winner]);

  // Restart handler
  const handleRestart = () => {
    dispatch({ type: 'restart' });
    setGameStarted(true);
  };

  const handleStartGame = () => {
    setGameStarted(true);
    dispatch({ type: 'restart' });
  };

  // Back to main menu handler
  const handleBackToMenu = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    router.push('/');
  };

  return (
    <RetroGameLayout showAnimatedBg={false}>
      {/* Background music audio element */}
      <audio
        ref={audioRef}
        src="/two-player-music.mp3"
        loop
        style={{ display: 'none' }}
        aria-label="Two player background music"
      />

      {/* Game end sound effect */}
      <audio
        ref={gameEndAudioRef}
        src="/game-end.mp3"
        style={{ display: 'none' }}
        aria-label="Game end sound"
      />

      {/* Top navigation bar */}
      <div className="absolute top-0 left-0 right-0 z-40 flex justify-between items-center p-4">
        {/* Back to Main Menu button */}
        <RetroButton
          onClick={handleBackToMenu}
          variant="secondary"
          size="sm"
          aria-label="Back to Main Menu"
        >
          ← Menu
        </RetroButton>

        {/* Mute button */}
        <RetroButton
          onClick={handleMuteToggle}
          variant="accent"
          size="sm"
          aria-label={muted ? "Unmute background music" : "Mute background music"}
        >
          {muted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6 6m0-6l-6 6M9 5v14l-5-5H2V9h2l5-5zm7.5 7.5a5.5 5.5 0 00-7.78-7.78" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5v14l-5-5H2V9h2l5-5zm7.5 7.5a5.5 5.5 0 00-7.78-7.78" />
            </svg>
          )}
        </RetroButton>
      </div>

      {/* Game Start Overlay */}
      {!gameStarted && (
        <RetroGameOverlay
          title="Two Player Battle"
          subtitle="First player to top out loses!"
          onPrimaryAction={handleStartGame}
          primaryActionText="🎮 Start Battle"
          controls={[
            { key: "Player 1", action: "W A S D + Space" },
            { key: "Player 2", action: "Arrow Keys + Enter" },
          ]}
        />
      )}

      {/* Winner Overlay */}
      {state.winner && (
        <div className="absolute top-20 left-0 right-0 flex justify-center z-30">
          <div
            className="bg-gray-900 border-2 border-yellow-400 p-6 text-center"
            style={{
              background: `linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)`,
              boxShadow: `0 0 30px rgba(251, 191, 36, 0.5), inset 0 0 20px rgba(251, 191, 36, 0.1)`,
            }}
          >
            <RetroText size="2xl" variant="accent" glow className="mb-4">
              🏆 Player {state.winner} Wins! 🏆
            </RetroText>
            <RetroButton
              onClick={handleRestart}
              variant="primary"
              size="md"
            >
              ↻ Play Again
            </RetroButton>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div 
        className="flex flex-col items-center justify-center h-screen w-screen p-4 pt-20 overflow-hidden"
        style={{
          height: '100vh',
          width: '100vw',
          maxHeight: '100vh',
          maxWidth: '100vw',
          overflow: 'hidden'
        }}
      >
        <div className="mb-4 flex-shrink-0">
          <RetroText size="3xl" variant="primary" glow>
            Two Player Battle
          </RetroText>
        </div>

        <div 
          className="flex gap-4 items-center justify-center w-full flex-1 overflow-hidden"
          style={{
            maxHeight: 'calc(100vh - 140px)',
            overflow: 'hidden'
          }}
        >
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

        <div className="mt-4 text-center flex-shrink-0">
          <RetroText size="sm" variant="secondary" glow={false} className="opacity-70">
            P1: WASD + Space | P2: Arrow Keys + Enter
          </RetroText>
        </div>
      </div>
    </RetroGameLayout>
  );
};


interface PlayerBoardProps {
  player: 1 | 2;
  state: any;
  opponentScore: number;
  isWinner: boolean;
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({ player, state, opponentScore, isWinner }) => {
  const playDrop = useAudioStore((s) => s.playDrop);
  const playVanish = useAudioStore((s) => s.playVanish);
  
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
    const prevLines = prev.lines;
    const linesCleared = state.lines - prevLines;
    if (
      (prev.position.y !== state.position.y && state.position.y < prev.position.y) ||
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
  
  // Player status effects
  const isLoser = state.over && !isWinner;
  const tiltClass = isLoser ? 'rotate-3' : '';
  const opacityClass = isLoser ? 'opacity-60' : '';
  const playerColorClasses = player === 1 ? {
    border: 'border-cyan-400',
    text: 'primary',
  } : {
    border: 'border-purple-400', 
    text: 'secondary',
  };
  const playerColorRgb = player === 1 ? '34, 211, 238' : '168, 85, 247';
  
  // Player info panel with retro styling
  const infoBlock = (
    <div className="flex flex-col gap-2 min-w-[180px] max-w-[200px]">
      {/* Player header */}
      <div
        className={`bg-black bg-opacity-50 border-2 ${playerColorClasses.border} p-2 text-center backdrop-blur-sm`}
        style={{
          boxShadow: `0 0 15px rgba(${playerColorRgb}, 0.3)`,
        }}
      >
        <RetroText size="md" variant={playerColorClasses.text as any} glow>
          Player {player}
        </RetroText>
        {isWinner && (
          <RetroText size="sm" variant="accent" glow className="mt-1">
            👑 Winner!
          </RetroText>
        )}
        {isLoser && (
          <RetroText size="sm" variant="warning" glow={false} className="mt-1 opacity-70">
            Game Over
          </RetroText>
        )}
      </div>

      {/* Score panel */}
      <div
        className={`bg-black bg-opacity-50 border-2 ${playerColorClasses.border} p-2 backdrop-blur-sm`}
        style={{
          boxShadow: `0 0 10px rgba(${playerColorRgb}, 0.2)`,
        }}
      >
        <RetroText size="sm" variant={playerColorClasses.text as any} glow={false} className="mb-1">
          Score
        </RetroText>
        <RetroText size="md" variant={playerColorClasses.text as any} glow className="font-mono">
          {state.score.toLocaleString()}
        </RetroText>
      </div>

      {/* Stats panel */}
      <div
        className={`bg-black bg-opacity-50 border-2 ${playerColorClasses.border} p-2 backdrop-blur-sm`}
        style={{
          boxShadow: `0 0 10px rgba(${playerColorRgb}, 0.2)`,
        }}
      >
        <div className="space-y-1">
          <div className="flex justify-between">
            <RetroText size="sm" variant={playerColorClasses.text as any} glow={false}>
              Level:
            </RetroText>
            <RetroText size="sm" variant={playerColorClasses.text as any} glow className="font-mono">
              {state.level}
            </RetroText>
          </div>
          <div className="flex justify-between">
            <RetroText size="sm" variant={playerColorClasses.text as any} glow={false}>
              Lines:
            </RetroText>
            <RetroText size="sm" variant={playerColorClasses.text as any} glow className="font-mono">
              {state.lines}
            </RetroText>
          </div>
          <div className="flex justify-between">
            <RetroText size="sm" variant={playerColorClasses.text as any} glow={false}>
              Opp:
            </RetroText>
            <RetroText size="sm" variant="accent" glow={false} className="font-mono">
              {opponentScore.toLocaleString()}
            </RetroText>
          </div>
        </div>
      </div>

      {/* Next piece panel */}
      <div
        className={`bg-black bg-opacity-50 border-2 ${playerColorClasses.border} p-2 backdrop-blur-sm`}
        style={{
          boxShadow: `0 0 10px rgba(${playerColorRgb}, 0.2)`,
        }}
      >
        <RetroText size="sm" variant={playerColorClasses.text as any} glow={false} className="mb-1 text-center">
          Next
        </RetroText>
        <div className="flex justify-center">
          <NextTetrominoPreview tetromino={state.next} />
        </div>
      </div>
    </div>
  );
  
  return (
    <div className={`flex items-start gap-4 transition-all duration-300 ${tiltClass} ${opacityClass}`}>
      {player === 1 && infoBlock}
      <div
        className={`bg-black bg-opacity-30 border-2 ${playerColorClasses.border} p-2 backdrop-blur-sm`}
        style={{
          boxShadow: `0 0 20px rgba(${playerColorRgb}, 0.4)`,
        }}
      >
        <BoardGrid board={display} vibrate={vibrate} />
      </div>
      {player === 2 && infoBlock}
    </div>
  );
};




const BoardGrid: React.FC<{ board: (string | null)[][]; vibrate?: boolean }> = ({ board, vibrate }) => {
  const [cellSize, setCellSize] = useState(28);

  useEffect(() => {
    function handleResize() {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const availableHeight = Math.max(200, vh - 200);
      const maxWidth = Math.floor((vw * 0.8) / 2);
      const maxHeight = Math.floor(availableHeight);
      const size = Math.max(16, Math.min(Math.floor(maxHeight / 20), Math.floor(maxWidth / 10), 32));
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
      className={`grid grid-rows-20 grid-cols-10 gap-[1px] bg-gray-900 overflow-hidden border-2 border-cyan-400 ${vibrate ? ' vibrate' : ''}`}
      style={{ 
        width, 
        height, 
        maxHeight: '85vh',
        boxShadow: '0 0 20px rgba(34, 211, 238, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
      }}
      aria-label="Tetris board"
      role="grid"
    >
      {board.flat().map((cell, i) => (
        <div
          key={i}
          className={`flex items-center justify-center text-xs font-bold border border-gray-700
            ${cell === 'G' ? 'bg-yellow-600 border-yellow-500' : cell ? `tetromino-${cell}` : 'bg-gray-800 border-gray-700'}
          `}
          style={{ 
            width: cellSize, 
            height: cellSize,
            boxShadow: cell ? '0 0 5px rgba(255, 255, 255, 0.2)' : 'inset 0 0 3px rgba(0, 0, 0, 0.3)',
          }}
          role="gridcell"
          aria-label={cell || 'empty'}
        />
      ))}
    </div>
  );
};



// Add retro tetromino color styles with glow effects
if (typeof window !== 'undefined') {
  const styleId = 'tetris-retro-tetromino-colors';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .tetromino-I { 
        background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); 
        border-color: #22d3ee;
        box-shadow: 0 0 8px rgba(34, 211, 238, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.2);
      }
      .tetromino-O { 
        background: linear-gradient(135deg, #fde047 0%, #facc15 100%); 
        border-color: #fef08a;
        box-shadow: 0 0 8px rgba(254, 240, 138, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.2);
      }
      .tetromino-T { 
        background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%); 
        border-color: #c4b5fd;
        box-shadow: 0 0 8px rgba(196, 181, 253, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.2);
      }
      .tetromino-S { 
        background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); 
        border-color: #86efac;
        box-shadow: 0 0 8px rgba(134, 239, 172, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.2);
      }
      .tetromino-Z { 
        background: linear-gradient(135deg, #f87171 0%, #ef4444 100%); 
        border-color: #fca5a5;
        box-shadow: 0 0 8px rgba(252, 165, 165, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.2);
      }
      .tetromino-J { 
        background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%); 
        border-color: #93c5fd;
        box-shadow: 0 0 8px rgba(147, 197, 253, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.2);
      }
      .tetromino-L { 
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); 
        border-color: #fcd34d;
        box-shadow: 0 0 8px rgba(252, 211, 77, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.2);
      }
      
      /* Vibrate animation for piece landing */
      .vibrate {
        animation: vibrate 0.18s ease-in-out;
      }
      
      @keyframes vibrate {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
      }
    `;
    document.head.appendChild(style);
  }
}


export default TwoPlayerGame;
