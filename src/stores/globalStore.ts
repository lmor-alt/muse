import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GlobalSettings, Language, InputMethod } from '../types';

interface GlobalStore extends GlobalSettings {
  setLanguage: (language: Language) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setPianoKeySounds: (enabled: boolean) => void;
  setDefaultInputMethod: (method: InputMethod) => void;
}

const defaultSettings: GlobalSettings = {
  language: 'en',
  soundEnabled: true,
  volume: 0.7,
  pianoKeySounds: true,
  defaultInputMethod: 'piano',
};

export const useGlobalStore = create<GlobalStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setLanguage: (language) => set({ language }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setVolume: (volume) => set({ volume }),
      setPianoKeySounds: (pianoKeySounds) => set({ pianoKeySounds }),
      setDefaultInputMethod: (defaultInputMethod) => set({ defaultInputMethod }),
    }),
    {
      name: 'muse-global-settings',
      partialize: (state) => ({
        language: state.language,
        soundEnabled: state.soundEnabled,
        volume: state.volume,
        pianoKeySounds: state.pianoKeySounds,
        defaultInputMethod: state.defaultInputMethod,
      }),
    }
  )
);
