'use client';

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useAudioStore } from '../../lib/audio/store';
import { BG_MUSIC_VOLUME } from '../../lib/audio/constants';
import { useRouter } from 'next/navigation';
import GameModeMenu, { GameMode } from "./GameModeMenu";
import LeaderboardOverlay from './LeaderboardOverlay';
import { useLeaderboard } from '../../lib/highscore/useLeaderboard';
import AnimatedBackground from './AnimatedBackground';
import RetroText from './RetroText';
import RetroButton from './RetroButton';
import { useNoScroll } from '../../lib/game/useNoScroll';

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
  const muted = useAudioStore((s) => s.muted);
  const toggleMuted = useAudioStore((s) => s.toggleMuted);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  // Prevent all scrolling on this page except for modals/overlays
  useNoScroll({ allowModalScroll: true });

  // Toggle audio.muted property and ensure proper audio initialization
  useEffect(() => {
    // Pause any other music (e.g., two-player or single-player)
    const otherAudios = Array.from(document.querySelectorAll('audio')) as HTMLAudioElement[];
    otherAudios.forEach(a => {
      if (a !== audioRef.current && a.src && !a.src.endsWith('/main-menu-music.mp3')) {
        a.pause();
        a.currentTime = 0;
      }
    });
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    audio.volume = BG_MUSIC_VOLUME;
    
    // Start playing music if not muted
    if (!muted) {
      // Remove autoplay, use user interaction to start
      const playAudio = () => {
        if (!audio.muted) {
          audio.play().catch(() => {});
        }
        document.removeEventListener('click', playAudio);
        document.removeEventListener('keydown', playAudio);
      };
      
      // Try to play immediately, but also set up listeners for user interaction
      audio.play().catch(() => {
        // If autoplay fails, wait for user interaction
        document.addEventListener('click', playAudio, { once: true });
        document.addEventListener('keydown', playAudio, { once: true });
      });
    } else {
      audio.pause();
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
      {/* Animated retro background */}
      <AnimatedBackground />
      
      {/* Background music audio element */}
      <audio
        ref={audioRef}
        src="/main-menu-music.mp3"
        loop
        style={{ display: 'none' }}
        aria-label="Main menu background music"
      />
      
      {/* Mute button at top right */}
      <button
        onClick={handleMuteToggle}
        aria-label={muted ? "Unmute background music" : "Mute background music"}
        className="fixed top-4 right-4 z-50 bg-gray-900 bg-opacity-80 hover:bg-gray-700 text-cyan-400 rounded-none border-2 border-cyan-400 p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-all duration-200 hover:shadow-cyan-400/50"
        tabIndex={0}
        style={{
          boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)',
          textShadow: '0 0 5px currentColor',
        }}
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
      
      <nav
        aria-label="Main Menu"
        className="relative flex flex-col items-center justify-center h-screen w-screen text-white px-4 z-10 overflow-hidden"
        style={{
          height: '100vh',
          width: '100vw',
          maxHeight: '100vh',
          maxWidth: '100vw',
          overflow: 'hidden'
        }}
      >
        {/* Main title with retro styling */}
        <div className="mb-8 text-center flex-shrink-0">
          <RetroText size="4xl" variant="primary" glow scanlines className="mb-2">
            Tetris
          </RetroText>
          <RetroText size="sm" variant="secondary" glow={false} className="opacity-80">
            Classic Arcade Experience
          </RetroText>
        </div>

        {/* Highscore Display with retro styling */}
        <div
          className="mb-6 w-full max-w-md flex items-center justify-center bg-gray-900 bg-opacity-50 border-2 border-yellow-400 p-4 backdrop-blur-sm flex-shrink-0"
          aria-live="polite"
          aria-atomic="true"
          style={{
            boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)',
          }}
        >
          <RetroText size="lg" variant="accent" className="mr-3">
            Highscore:
          </RetroText>
          <RetroText
            size="xl"
            variant="accent"
            glow
            aria-labelledby="highscore-label"
          >
            {leaderboardLoading
              ? '...'
              : entries.length > 0
                ? entries[0].score.toLocaleString()
                : '0'}
          </RetroText>
        </div>

        {/* Game mode selection */}
        <div className="mb-6 w-full max-w-md flex-shrink-0">
          <GameModeMenu onSelectMode={handleSelectMode} selectedMode={selectedMode} />
        </div>

        {/* Menu buttons */}
        <div className="w-full max-w-md space-y-3 flex-shrink-0" role="menu">
          <RetroButton
            onClick={handleStartGame}
            disabled={!selectedMode}
            variant="primary"
            size="lg"
            className="w-full"
            role="menuitem"
            tabIndex={0}
            autoFocus
            aria-disabled={!selectedMode}
          >
            {selectedMode ? `Start ${selectedMode === 'single' ? 'Single Player' : 'Two Player'} Game` : 'Start Game'}
          </RetroButton>

          <RetroButton
            onClick={handleShowLeaderboard}
            variant="secondary"
            size="lg"
            className="w-full"
            role="menuitem"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={showLeaderboard}
          >
            Leaderboard
          </RetroButton>

          <RetroButton
            variant="accent"
            size="lg"
            className="w-full"
            role="menuitem"
            tabIndex={0}
          >
            Settings
          </RetroButton>
        </div>

        {/* Retro decorative elements */}
        <div className="mt-8 text-center flex-shrink-0">
          <RetroText size="sm" variant="primary" glow={false} className="opacity-60">
            Use arrow keys to navigate • Enter to select
          </RetroText>
        </div>
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
