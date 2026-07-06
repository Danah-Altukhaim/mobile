import { create } from 'zustand';

interface ProfileSheetState {
  visible: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useProfileSheet = create<ProfileSheetState>((set) => ({
  visible: false,
  open: () => set({ visible: true }),
  close: () => set({ visible: false }),
  toggle: () => set((s) => ({ visible: !s.visible })),
}));
