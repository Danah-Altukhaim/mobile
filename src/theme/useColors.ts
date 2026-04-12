import { useUIStore } from '../store/ui.store';
import { lightColors, darkColors, type Colors } from './colors';

export function useColors(): Colors {
  const themeMode = useUIStore((s) => s.themeMode);
  return themeMode === 'dark' ? darkColors : lightColors;
}
