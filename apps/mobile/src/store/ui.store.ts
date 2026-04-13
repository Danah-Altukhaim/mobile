import { create } from 'zustand';

interface UIState {
  locale: 'ar' | 'en';
  themeMode: 'light' | 'dark';
  isAIAdvisorOpen: boolean;
  setLocale: (locale: 'ar' | 'en') => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  toggleThemeMode: () => void;
  toggleAIAdvisor: () => void;
  setAIAdvisorOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  locale: 'ar',
  themeMode: 'light',
  isAIAdvisorOpen: false,

  setLocale: (locale) => set({ locale }),
  setThemeMode: (themeMode) => set({ themeMode }),
  toggleThemeMode: () =>
    set((state) => ({ themeMode: state.themeMode === 'dark' ? 'light' : 'dark' })),
  toggleAIAdvisor: () => set((state) => ({ isAIAdvisorOpen: !state.isAIAdvisorOpen })),
  setAIAdvisorOpen: (isAIAdvisorOpen) => set({ isAIAdvisorOpen }),
}));
