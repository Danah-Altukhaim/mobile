import { useSafeAreaInsets } from 'react-native-safe-area-context';

// The floating tab bar (MainTabs/CCKTabBar) is absolutely positioned: ~8 top pad
// + 52 row + the device bottom inset, with the AI FAB hovering just above it.
// Scroll content must clear all of that, so screens should never hardcode a
// magic `paddingBottom`. This returns one consistent bottom clearance.
const TAB_BAR_CLEARANCE = 96;

/**
 * Bottom padding for a tab-screen's scroll content so nothing hides behind the
 * floating tab bar / AI FAB. Pass `extra` for screens with a pinned footer
 * (e.g. a sticky "Pay" / "Submit" bar) that needs additional room.
 */
export function useContentBottomInset(extra = 0) {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR_CLEARANCE + extra;
}
