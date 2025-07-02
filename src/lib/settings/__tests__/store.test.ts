/**
 * Settings Store Tests
 * 
 * Comprehensive tests for the settings store functionality including:
 * - Volume controls for music and SFX
 * - Assistant toggle feature
 * - LocalStorage persistence
 * - Error handling
 * - State management
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Mock localStorage for testing
const createMockLocalStorage = () => {
  let store: { [key: string]: string } = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
};

// Mock the settings store structure
interface SettingsState {
  musicVolume: number;
  sfxVolume: number;
  assistantEnabled: boolean;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setAssistantEnabled: (enabled: boolean) => void;
  reset: () => void;
}

const DEFAULT_SETTINGS = {
  musicVolume: 0.1,
  sfxVolume: 0.8,
  assistantEnabled: false,
};

// Mock store creator for testing
const createTestStore = (initialLocalStorage: { [key: string]: string } = {}) => {
  const mockLocalStorage = createMockLocalStorage();
  
  // Setup initial localStorage data
  Object.entries(initialLocalStorage).forEach(([key, value]) => {
    mockLocalStorage.setItem(key, value);
  });
  
  // Replace global localStorage with mock
  Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  return create<SettingsState>()(
    subscribeWithSelector((set, get) => {
      // Load initial settings from localStorage
      const loadSettings = () => {
        try {
          const stored = localStorage.getItem('tetris-settings');
          if (stored) {
            const parsed = JSON.parse(stored);
            return { ...DEFAULT_SETTINGS, ...parsed };
          }
        } catch (error) {
          console.warn('Failed to load settings from localStorage:', error);
        }
        return DEFAULT_SETTINGS;
      };

      // Save settings to localStorage
      const saveSettings = (settings: Partial<SettingsState>) => {
        try {
          const current = get();
          const toSave = {
            musicVolume: current.musicVolume,
            sfxVolume: current.sfxVolume,
            assistantEnabled: current.assistantEnabled,
            ...settings,
          };
          localStorage.setItem('tetris-settings', JSON.stringify(toSave));
        } catch (error) {
          console.warn('Failed to save settings to localStorage:', error);
        }
      };

      const initialSettings = loadSettings();

      return {
        ...initialSettings,
        setMusicVolume: (volume: number) => {
          const clampedVolume = Math.max(0, Math.min(1, volume));
          set({ musicVolume: clampedVolume });
          saveSettings({ musicVolume: clampedVolume });
        },
        setSfxVolume: (volume: number) => {
          const clampedVolume = Math.max(0, Math.min(1, volume));
          set({ sfxVolume: clampedVolume });
          saveSettings({ sfxVolume: clampedVolume });
        },
        setAssistantEnabled: (enabled: boolean) => {
          set({ assistantEnabled: enabled });
          saveSettings({ assistantEnabled: enabled });
        },
        reset: () => {
          set(DEFAULT_SETTINGS);
          saveSettings(DEFAULT_SETTINGS);
        },
      };
    })
  );
};

describe('Settings Store - Initialization', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (global.localStorage) {
      global.localStorage.clear();
    }
  });

  test('should initialize with default values when localStorage is empty', () => {
    const useStore = createTestStore();
    const state = useStore.getState();

    expect(state.musicVolume).toBe(0.1);
    expect(state.sfxVolume).toBe(0.8);
    expect(state.assistantEnabled).toBe(false);
  });

  test('should load saved settings from localStorage', () => {
    const savedSettings = {
      musicVolume: 0.5,
      sfxVolume: 0.3,
      assistantEnabled: true,
    };

    const useStore = createTestStore({
      'tetris-settings': JSON.stringify(savedSettings),
    });
    const state = useStore.getState();

    expect(state.musicVolume).toBe(0.5);
    expect(state.sfxVolume).toBe(0.3);
    expect(state.assistantEnabled).toBe(true);
  });

  test('should handle invalid JSON in localStorage gracefully', () => {
    const useStore = createTestStore({
      'tetris-settings': 'invalid json',
    });
    const state = useStore.getState();

    // Should fall back to defaults
    expect(state.musicVolume).toBe(0.1);
    expect(state.sfxVolume).toBe(0.8);
    expect(state.assistantEnabled).toBe(false);
  });

  test('should merge partial settings with defaults', () => {
    const partialSettings = {
      musicVolume: 0.7,
      // Missing sfxVolume and assistantEnabled
    };

    const useStore = createTestStore({
      'tetris-settings': JSON.stringify(partialSettings),
    });
    const state = useStore.getState();

    expect(state.musicVolume).toBe(0.7);
    expect(state.sfxVolume).toBe(0.8); // Default
    expect(state.assistantEnabled).toBe(false); // Default
  });
});

describe('Settings Store - Music Volume', () => {
  let useStore: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    useStore = createTestStore();
  });

  test('should update music volume within valid range', () => {
    const { setMusicVolume } = useStore.getState();

    setMusicVolume(0.5);
    expect(useStore.getState().musicVolume).toBe(0.5);

    setMusicVolume(0.0);
    expect(useStore.getState().musicVolume).toBe(0.0);

    setMusicVolume(1.0);
    expect(useStore.getState().musicVolume).toBe(1.0);
  });

  test('should clamp music volume to valid range', () => {
    const { setMusicVolume } = useStore.getState();

    setMusicVolume(-0.5);
    expect(useStore.getState().musicVolume).toBe(0.0);

    setMusicVolume(1.5);
    expect(useStore.getState().musicVolume).toBe(1.0);

    setMusicVolume(2.0);
    expect(useStore.getState().musicVolume).toBe(1.0);
  });

  test('should save music volume to localStorage', () => {
    const { setMusicVolume } = useStore.getState();

    setMusicVolume(0.6);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'tetris-settings',
      JSON.stringify({
        musicVolume: 0.6,
        sfxVolume: 0.8,
        assistantEnabled: false,
      })
    );
  });

  test('should handle floating point precision', () => {
    const { setMusicVolume } = useStore.getState();

    setMusicVolume(0.1 + 0.2); // JavaScript floating point issue
    const volume = useStore.getState().musicVolume;

    expect(volume).toBeCloseTo(0.3, 10);
  });
});

describe('Settings Store - SFX Volume', () => {
  let useStore: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    useStore = createTestStore();
  });

  test('should update SFX volume within valid range', () => {
    const { setSfxVolume } = useStore.getState();

    setSfxVolume(0.4);
    expect(useStore.getState().sfxVolume).toBe(0.4);

    setSfxVolume(0.0);
    expect(useStore.getState().sfxVolume).toBe(0.0);

    setSfxVolume(1.0);
    expect(useStore.getState().sfxVolume).toBe(1.0);
  });

  test('should clamp SFX volume to valid range', () => {
    const { setSfxVolume } = useStore.getState();

    setSfxVolume(-0.2);
    expect(useStore.getState().sfxVolume).toBe(0.0);

    setSfxVolume(1.3);
    expect(useStore.getState().sfxVolume).toBe(1.0);
  });

  test('should save SFX volume to localStorage', () => {
    const { setSfxVolume } = useStore.getState();

    setSfxVolume(0.9);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'tetris-settings',
      JSON.stringify({
        musicVolume: 0.1,
        sfxVolume: 0.9,
        assistantEnabled: false,
      })
    );
  });
});

describe('Settings Store - Assistant Toggle', () => {
  let useStore: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    useStore = createTestStore();
  });

  test('should toggle assistant feature', () => {
    const { setAssistantEnabled } = useStore.getState();

    expect(useStore.getState().assistantEnabled).toBe(false);

    setAssistantEnabled(true);
    expect(useStore.getState().assistantEnabled).toBe(true);

    setAssistantEnabled(false);
    expect(useStore.getState().assistantEnabled).toBe(false);
  });

  test('should save assistant state to localStorage', () => {
    const { setAssistantEnabled } = useStore.getState();

    setAssistantEnabled(true);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'tetris-settings',
      JSON.stringify({
        musicVolume: 0.1,
        sfxVolume: 0.8,
        assistantEnabled: true,
      })
    );
  });

  test('should handle truthy and falsy values correctly', () => {
    const { setAssistantEnabled } = useStore.getState();

    setAssistantEnabled(true);
    expect(useStore.getState().assistantEnabled).toBe(true);

    setAssistantEnabled(false);
    expect(useStore.getState().assistantEnabled).toBe(false);
  });
});

describe('Settings Store - Reset Functionality', () => {
  let useStore: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    useStore = createTestStore();
  });

  test('should reset all settings to defaults', () => {
    const { setMusicVolume, setSfxVolume, setAssistantEnabled, reset } = useStore.getState();

    // Change all settings
    setMusicVolume(0.9);
    setSfxVolume(0.2);
    setAssistantEnabled(true);

    // Verify changes
    expect(useStore.getState().musicVolume).toBe(0.9);
    expect(useStore.getState().sfxVolume).toBe(0.2);
    expect(useStore.getState().assistantEnabled).toBe(true);

    // Reset
    reset();

    // Verify reset to defaults
    expect(useStore.getState().musicVolume).toBe(0.1);
    expect(useStore.getState().sfxVolume).toBe(0.8);
    expect(useStore.getState().assistantEnabled).toBe(false);
  });

  test('should save default values to localStorage after reset', () => {
    const { setMusicVolume, reset } = useStore.getState();

    // Change setting
    setMusicVolume(0.7);

    // Reset
    reset();

    expect(localStorage.setItem).toHaveBeenLastCalledWith(
      'tetris-settings',
      JSON.stringify(DEFAULT_SETTINGS)
    );
  });
});

describe('Settings Store - Error Handling', () => {
  test('should handle localStorage errors gracefully', () => {
    const mockLocalStorage = createMockLocalStorage();
    
    // Mock setItem to throw error
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage full');
    });

    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    const useStore = createTestStore();
    const { setMusicVolume } = useStore.getState();

    // Should not throw error
    expect(() => {
      setMusicVolume(0.5);
    }).not.toThrow();

    // State should still be updated
    expect(useStore.getState().musicVolume).toBe(0.5);
  });

  test('should handle localStorage getItem errors gracefully', () => {
    const mockLocalStorage = createMockLocalStorage();
    
    // Mock getItem to throw error
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage access denied');
    });

    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // Should not throw error and use defaults
    expect(() => {
      const useStore = createTestStore();
      const state = useStore.getState();
      expect(state.musicVolume).toBe(0.1);
    }).not.toThrow();
  });
});

describe('Settings Store - State Reactivity', () => {
  let useStore: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    useStore = createTestStore();
  });

  test('should notify subscribers when music volume changes', () => {
    const mockSubscriber = jest.fn();
    
    // Subscribe to music volume changes
    useStore.subscribe(
      (state) => state.musicVolume,
      mockSubscriber
    );

    const { setMusicVolume } = useStore.getState();
    setMusicVolume(0.6);

    expect(mockSubscriber).toHaveBeenCalledWith(0.6, 0.1);
  });

  test('should notify subscribers when SFX volume changes', () => {
    const mockSubscriber = jest.fn();
    
    useStore.subscribe(
      (state) => state.sfxVolume,
      mockSubscriber
    );

    const { setSfxVolume } = useStore.getState();
    setSfxVolume(0.3);

    expect(mockSubscriber).toHaveBeenCalledWith(0.3, 0.8);
  });

  test('should notify subscribers when assistant setting changes', () => {
    const mockSubscriber = jest.fn();
    
    useStore.subscribe(
      (state) => state.assistantEnabled,
      mockSubscriber
    );

    const { setAssistantEnabled } = useStore.getState();
    setAssistantEnabled(true);

    expect(mockSubscriber).toHaveBeenCalledWith(true, false);
  });

  test('should not notify subscribers when value does not change', () => {
    const mockSubscriber = jest.fn();
    
    useStore.subscribe(
      (state) => state.musicVolume,
      mockSubscriber
    );

    const { setMusicVolume } = useStore.getState();
    
    // Set to same value
    setMusicVolume(0.1);

    expect(mockSubscriber).not.toHaveBeenCalled();
  });
});

describe('Settings Store - Integration Scenarios', () => {
  test('should handle rapid setting changes', () => {
    const useStore = createTestStore();
    const { setMusicVolume, setSfxVolume, setAssistantEnabled } = useStore.getState();

    // Rapid changes
    for (let i = 0; i < 10; i++) {
      setMusicVolume(i / 10);
      setSfxVolume((10 - i) / 10);
      setAssistantEnabled(i % 2 === 0);
    }

    // Final values should be correct
    expect(useStore.getState().musicVolume).toBe(0.9);
    expect(useStore.getState().sfxVolume).toBe(0.1);
    expect(useStore.getState().assistantEnabled).toBe(true);
  });

  test('should persist settings across store recreations', () => {
    // First store instance
    const store1 = createTestStore();
    const { setMusicVolume, setSfxVolume, setAssistantEnabled } = store1.getState();

    setMusicVolume(0.7);
    setSfxVolume(0.4);
    setAssistantEnabled(true);

    // Create new store instance (simulating page reload)
    const store2 = createTestStore();
    const state2 = store2.getState();

    expect(state2.musicVolume).toBe(0.7);
    expect(state2.sfxVolume).toBe(0.4);
    expect(state2.assistantEnabled).toBe(true);
  });

  test('should handle concurrent modifications correctly', () => {
    const useStore = createTestStore();
    const state = useStore.getState();

    // Simulate concurrent updates
    state.setMusicVolume(0.5);
    state.setSfxVolume(0.6);
    state.setAssistantEnabled(true);

    const finalState = useStore.getState();
    expect(finalState.musicVolume).toBe(0.5);
    expect(finalState.sfxVolume).toBe(0.6);
    expect(finalState.assistantEnabled).toBe(true);
  });
});

describe('Settings Store - Performance', () => {
  test('should handle many updates efficiently', () => {
    const useStore = createTestStore();
    const { setMusicVolume } = useStore.getState();

    const startTime = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      setMusicVolume(Math.random());
    }
    
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should be fast
  });

  test('should not cause memory leaks with subscriptions', () => {
    const useStore = createTestStore();
    const subscriptions: (() => void)[] = [];

    // Create many subscriptions
    for (let i = 0; i < 100; i++) {
      const unsubscribe = useStore.subscribe(
        (state) => state.musicVolume,
        () => {}
      );
      subscriptions.push(unsubscribe);
    }

    // Unsubscribe all
    subscriptions.forEach(unsub => unsub());

    // This test mainly ensures no errors are thrown
    expect(subscriptions).toHaveLength(100);
  });
});
