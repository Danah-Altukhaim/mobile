import { create } from 'zustand';

interface UIState {
  locale: 'ar' | 'en';
  isAIAdvisorOpen: boolean;
  setLocale: (locale: 'ar' | 'en') => void;
  toggleAIAdvisor: () => void;
  setAIAdvisorOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  locale: 'ar',
  isAIAdvisorOpen: false,

  setLocale: (locale) => set({ locale }),
  toggleAIAdvisor: () => set((state) => ({ isAIAdvisorOpen: !state.isAIAdvisorOpen })),
  setAIAdvisorOpen: (isAIAdvisorOpen) => set({ isAIAdvisorOpen }),
}));
