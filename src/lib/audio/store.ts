import { create } from 'zustand';

interface AudioStore {
  muted: boolean;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
}

/**
 * Global audio store for sharing mute state across pages.
 * Uses Zustand with localStorage persistence.
 */
export const useAudioStore = create<AudioStore>((set) => ({
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
}));
