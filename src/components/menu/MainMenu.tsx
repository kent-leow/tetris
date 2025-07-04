'use client';

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useAudioStore } from '../../lib/audio/store';
import { useRouter } from 'next/navigation';
import GameModeMenu, { GameMode } from "./GameModeMenu";
import LeaderboardOverlay from './LeaderboardOverlay';
import SettingsOverlay from './SettingsOverlay';
import { useLeaderboard } from '../../lib/highscore/useLeaderboard';
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
 * Integrates GameModeMenu for mode selection.
 */


const MainMenu: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<GameMode | undefined>(undefined);
  const { entries, loading: leaderboardLoading, refetch: refetchLeaderboard } = useLeaderboard();
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
    itemSelector: '[role="menuitem"], [data-menu-item]',
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
          setSelectedMode('single');
          break;
        case '2':
          event.preventDefault();
          setSelectedMode('two');
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
  }, [showLeaderboard, showSettings, handleMenuKeyDown, handleShowLeaderboard, handleShowSettings]);

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
        <div className="mb-6 w-full max-w-md flex-shrink-0" data-menu-item>
          <GameModeMenu onSelectMode={handleSelectMode} selectedMode={selectedMode} />
        </div>

        {/* Menu buttons */}
        <div ref={menuContainerRef} className="w-full max-w-md space-y-3 flex-shrink-0" role="menu" aria-label="Main navigation menu">
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
            aria-describedby="start-game-description"
          >
            {selectedMode ? `Start ${selectedMode === 'single' ? 'Single Player' : 'Two Player'} Game` : 'Start Game'}
          </RetroButton>
          <div id="start-game-description" className="sr-only">
            {selectedMode ? `Press Enter to start ${selectedMode} player game` : 'Select a game mode first'}
          </div>

          <RetroButton
            onClick={handleShowLeaderboard}
            variant="secondary"
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
            variant="accent"
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
            ↑↓ Navigate • Enter/Space Activate • 1/2 Select Mode
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
