import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/**
 * Settings interface for the Tetris game
 */
export interface Settings {
  /** Background music volume (0.0 - 1.0) */
  musicVolume: number;
  /** Sound effects volume (0.0 - 1.0) */
  sfxVolume: number;
  /** Whether the drop assistant is enabled */
  assistantEnabled: boolean;
}

/**
 * Settings store interface
 */
interface SettingsStore extends Settings {
  /** Update music volume */
  setMusicVolume: (volume: number) => void;
  /** Update sound effects volume */
  setSfxVolume: (volume: number) => void;
  /** Toggle assistant feature */
  setAssistantEnabled: (enabled: boolean) => void;
  /** Reset all settings to default */
  resetSettings: () => void;
}

/**
 * Default settings values
 */
const DEFAULT_SETTINGS: Settings = {
  musicVolume: 0.1,
  sfxVolume: 0.8,
  assistantEnabled: false,
};

/**
 * Load settings from localStorage or return defaults
 */
function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const stored = localStorage.getItem('tetris-settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        musicVolume: typeof parsed.musicVolume === 'number' ? Math.max(0, Math.min(1, parsed.musicVolume)) : DEFAULT_SETTINGS.musicVolume,
        sfxVolume: typeof parsed.sfxVolume === 'number' ? Math.max(0, Math.min(1, parsed.sfxVolume)) : DEFAULT_SETTINGS.sfxVolume,
        assistantEnabled: typeof parsed.assistantEnabled === 'boolean' ? parsed.assistantEnabled : DEFAULT_SETTINGS.assistantEnabled,
      };
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  
  return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('tetris-settings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error);
  }
}

/**
 * Update music volume for all audio elements in the DOM
 */
function updateMusicVolume(volume: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Update all audio elements that are playing background music
    const audioElements = Array.from(document.querySelectorAll('audio')) as HTMLAudioElement[];
    audioElements.forEach(audio => {
      // Check if this is a background music audio element (not sound effects)
      if (audio.src && (
        audio.src.includes('main-menu-music.mp3') ||
        audio.src.includes('one-player-music.mp3') ||
        audio.src.includes('two-player-music.mp3')
      )) {
        audio.volume = volume;
      }
    });
  } catch (error) {
    console.warn('Failed to update music volume:', error);
  }
}

/**
 * Global settings store for managing game settings.
 * Uses Zustand with localStorage persistence and subscriptions for immediate updates.
 */
export const useSettingsStore = create<SettingsStore>()(
  subscribeWithSelector((set, get) => {
    const initialSettings = loadSettings();
    
    return {
      ...initialSettings,
      
      setMusicVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        const newSettings = { ...get(), musicVolume: clampedVolume };
        set(newSettings);
        saveSettings(newSettings);
        
        // Apply volume change immediately to all background music
        updateMusicVolume(clampedVolume);
      },
    
    setSfxVolume: (volume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      const newSettings = { ...get(), sfxVolume: clampedVolume };
      set(newSettings);
      saveSettings(newSettings);
    },
    
    setAssistantEnabled: (enabled: boolean) => {
      const newSettings = { ...get(), assistantEnabled: enabled };
      set(newSettings);
      saveSettings(newSettings);
    },
    
    resetSettings: () => {
      set(DEFAULT_SETTINGS);
      saveSettings(DEFAULT_SETTINGS);
    },
  };
  })
);
