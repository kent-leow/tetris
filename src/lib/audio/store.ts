import { create } from 'zustand';
import { useSettingsStore } from '../settings/store';

interface AudioStore {
  muted: boolean;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  playDrop: () => void;
  playVanish: () => void;
  /** Get current music volume from settings */
  getMusicVolume: () => number;
  /** Get current SFX volume from settings */
  getSfxVolume: () => number;
}

/**
 * Global audio store for sharing mute state across pages.
 * Uses Zustand with localStorage persistence.
 */
export const useAudioStore = create<AudioStore>((set, get) => ({
  muted: typeof window !== 'undefined' ? (localStorage.getItem('tetris-muted') === 'true') : false,
  setMuted: (muted: boolean) => {
    set(() => ({ muted }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('tetris-muted', muted ? 'true' : 'false');
    }
  },
  toggleMuted: () => set((state) => {
    const newMuted = !state.muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tetris-muted', newMuted ? 'true' : 'false');
    }
    return { muted: newMuted };
  }),
  getMusicVolume: () => {
    return useSettingsStore.getState().musicVolume;
  },
  getSfxVolume: () => {
    return useSettingsStore.getState().sfxVolume;
  },
  playDrop: () => {
    if (typeof window === 'undefined' || get().muted) return;
    const audio = new window.Audio('/drop-sound.mp3');
    audio.volume = get().getSfxVolume();
    audio.play().catch(() => {});
  },
  playVanish: () => {
    if (typeof window === 'undefined' || get().muted) return;
    const audio = new window.Audio('/vanish-sound.mp3');
    audio.volume = get().getSfxVolume();
    audio.play().catch(() => {});
  },
}));
