import { create } from 'zustand';
import type { AuthUser, TokenPair } from '@masari/shared';

interface AuthState {
  user: AuthUser | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AuthUser, tokens: TokenPair) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, tokens) =>
    set({ user, tokens, isAuthenticated: true, isLoading: false }),

  clearAuth: () =>
    set({ user: null, tokens: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),
}));
