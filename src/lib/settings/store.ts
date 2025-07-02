import { create } from 'zustand';

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
 * Global settings store for managing game settings.
 * Uses Zustand with localStorage persistence.
 */
export const useSettingsStore = create<SettingsStore>((set, get) => {
  const initialSettings = loadSettings();
  
  return {
    ...initialSettings,
    
    setMusicVolume: (volume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      const newSettings = { ...get(), musicVolume: clampedVolume };
      set(newSettings);
      saveSettings(newSettings);
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
});
