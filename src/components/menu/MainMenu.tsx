'use client';

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useAudioStore } from '../../lib/audio/store';
import { useRouter } from 'next/navigation';
import LeaderboardOverlay from './LeaderboardOverlay';
import SettingsOverlay from './SettingsOverlay';
import { useLeaderboard } from '../../lib/highscore/useLeaderboard';
import { useMainMenuScore } from '../../lib/highscore/useMainMenuScore';
import AnimatedBackground from './AnimatedBackground';
import RetroText from './RetroText';
import RetroButton from './RetroButton';
import { useNoScroll } from '../../lib/game/useNoScroll';
import { useMenuNavigation } from '../../lib/accessibility/useFocusManager';

/**
 * MainMenu component displays the main menu for the Tetris game.
 * - Accessible via keyboard and mouse
 * - Responsive and visually distinct
 * - Uses semantic HTML for accessibility
 */

/**
 * MainMenu component displays the main menu for the Tetris game.
 * Provides direct access to single and two player modes.
 */


const MainMenu: React.FC = () => {
  const { entries, loading: leaderboardLoading, refetch: refetchLeaderboard } = useLeaderboard();
  const { menuScore, loading: menuScoreLoading } = useMainMenuScore();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const muted = useAudioStore((s) => s.muted);
  const toggleMuted = useAudioStore((s) => s.toggleMuted);
  const getMusicVolume = useAudioStore((s) => s.getMusicVolume);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Prevent all scrolling on this page except for modals/overlays
  useNoScroll({ allowModalScroll: true });

  // Menu navigation with arrow keys
  const { handleKeyDown: handleMenuKeyDown } = useMenuNavigation({
    itemSelector: '[role="menuitem"], .game-mode-button',
    container: menuContainerRef.current,
    orientation: 'vertical',
    wrap: true,
  });

  const handleShowLeaderboard = useCallback(() => {
    setShowLeaderboard(true);
    refetchLeaderboard();
  }, [refetchLeaderboard]);
  
  const handleShowSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle keys when overlays are open
      if (showLeaderboard || showSettings) return;

      // Handle menu navigation
      if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
        handleMenuKeyDown(event);
        return;
      }

      // Handle shortcuts
      switch (event.key) {
        case '1':
          event.preventDefault();
          router.push('/single');
          break;
        case '2':
          event.preventDefault();
          router.push('/double');
          break;
        case 'Enter':
        case ' ':
          // Handle action based on focused element
          const activeElement = document.activeElement;
          if (activeElement && activeElement.getAttribute('role') === 'menuitem') {
            event.preventDefault();
            (activeElement as HTMLElement).click();
          }
          break;
        case 'l':
        case 'L':
          event.preventDefault();
          handleShowLeaderboard();
          break;
        case 's':
        case 'S':
          event.preventDefault();
          handleShowSettings();
          break;
        case 'Escape':
          // Clear focus when escape is pressed
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLeaderboard, showSettings, handleMenuKeyDown, handleShowLeaderboard, handleShowSettings, router]);

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
    audio.volume = getMusicVolume();
    
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
  }, [muted, getMusicVolume]);

  // Pause music on unmount
  useEffect(() => {
    const audioElement = audioRef.current;
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, []);

  const handleMuteToggle = useCallback(() => {
    toggleMuted();
  }, [toggleMuted]);

  const handleStartSinglePlayer = useCallback(() => {
    router.push('/single');
  }, [router]);

  const handleStartTwoPlayer = useCallback(() => {
    router.push('/double');
  }, [router]);

  const handleCloseLeaderboard = useCallback(() => {
    setShowLeaderboard(false);
  }, []);
  
  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
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
          className="mb-6 w-full max-w-md bg-gray-900 bg-opacity-50 border-2 border-yellow-400 p-4 backdrop-blur-sm flex-shrink-0"
          aria-live="polite"
          aria-atomic="true"
          style={{
            boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)',
          }}
        >
          <div className="text-center">
            <RetroText size="md" variant="accent" className="mb-2">
              High Score
            </RetroText>
            
            {menuScoreLoading ? (
              <RetroText size="lg" variant="accent" glow>
                Loading...
              </RetroText>
            ) : menuScore ? (
              <>
                <RetroText
                  size="2xl"
                  variant="accent"
                  glow
                  className="font-mono mb-1"
                  aria-labelledby="highscore-label"
                >
                  {menuScore.score.toLocaleString()}
                </RetroText>
                <RetroText 
                  size="sm" 
                  variant="secondary" 
                  className="opacity-80"
                >
                  by {menuScore.name}
                </RetroText>
              </>
            ) : (
              <>
                <RetroText size="lg" variant="accent" glow className="font-mono mb-1">
                  No Score Yet
                </RetroText>
                <RetroText size="sm" variant="secondary" className="opacity-80">
                  Be the first to play!
                </RetroText>
              </>
            )}
          </div>
        </div>

        {/* Game Mode Selection - Special Prominent Buttons */}
        <div ref={menuContainerRef} className="w-full max-w-lg mb-6 flex-shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Single Player - Neon Cyan Theme */}
            <button
              onClick={handleStartSinglePlayer}
              role="menuitem"
              tabIndex={0}
              autoFocus
              aria-describedby="single-player-description"
              className="game-mode-button group relative overflow-hidden bg-gradient-to-br from-cyan-900 via-cyan-800 to-cyan-900 border-3 border-cyan-400 text-cyan-100 px-6 py-8 sm:px-8 sm:py-6 text-lg sm:text-xl font-bold font-mono uppercase tracking-wider transition-all duration-300 hover:border-cyan-300 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-300/50 transform hover:scale-105 active:scale-95 game-mode-button-cyan"
              style={{
                boxShadow: '0 0 20px rgba(34, 211, 238, 0.6), inset 0 0 20px rgba(34, 211, 238, 0.1)',
                textShadow: '0 0 10px currentColor',
                animation: 'pulse 2s infinite',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-3xl sm:text-2xl mb-2 sm:mb-1">🎮</span>
                <span className="text-center">Single Player</span>
                <span className="text-xs opacity-80 mt-2 sm:mt-1">Press 1</span>
              </div>
            </button>

            {/* Two Player - Neon Purple Theme */}
            <button
              onClick={handleStartTwoPlayer}
              role="menuitem"
              tabIndex={0}
              aria-describedby="two-player-description"
              className="game-mode-button group relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 border-3 border-purple-400 text-purple-100 px-6 py-8 sm:px-8 sm:py-6 text-lg sm:text-xl font-bold font-mono uppercase tracking-wider transition-all duration-300 hover:border-purple-300 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-300/50 transform hover:scale-105 active:scale-95 game-mode-button-purple"
              style={{
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(168, 85, 247, 0.1)',
                textShadow: '0 0 10px currentColor',
                animation: 'pulse 2s infinite',
                animationDelay: '1s',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-3xl sm:text-2xl mb-2 sm:mb-1">👥</span>
                <span className="text-center">Two Player</span>
                <span className="text-xs opacity-80 mt-2 sm:mt-1">Press 2</span>
              </div>
            </button>
          </div>
        </div>

        {/* Accessibility descriptions */}
        <div id="single-player-description" className="sr-only">
          Start a single player Tetris game with keyboard shortcut 1
        </div>
        <div id="two-player-description" className="sr-only">
          Start a two player Tetris game with keyboard shortcut 2
        </div>

        {/* Secondary Menu buttons */}
        <div className="w-full max-w-md space-y-3 flex-shrink-0" role="menu" aria-label="Secondary navigation menu">

          <RetroButton
            onClick={handleShowLeaderboard}
            variant="accent"
            size="lg"
            className="w-full"
            role="menuitem"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={showLeaderboard}
            aria-describedby="leaderboard-description"
          >
            Leaderboard
          </RetroButton>
          <div id="leaderboard-description" className="sr-only">
            View high scores and rankings
          </div>

          <RetroButton
            onClick={handleShowSettings}
            variant="warning"
            size="lg"
            className="w-full"
            role="menuitem"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={showSettings}
            aria-describedby="settings-description"
          >
            Settings
          </RetroButton>
          <div id="settings-description" className="sr-only">
            Adjust game settings and preferences
          </div>
        </div>

        {/* Enhanced keyboard navigation hints */}
        <div className="mt-8 text-center flex-shrink-0 space-y-1">
          <RetroText size="sm" variant="primary" glow={false} className="opacity-60">
            ↑↓ Navigate • Enter/Space Activate • 1 Single Player • 2 Two Player
          </RetroText>
          <RetroText size="sm" variant="secondary" glow={false} className="opacity-40">
            L: Leaderboard • S: Settings • Esc: Clear Focus
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
      
      <SettingsOverlay
        open={showSettings}
        onClose={handleCloseSettings}
      />
    </>
  );
};

export default MainMenu;
