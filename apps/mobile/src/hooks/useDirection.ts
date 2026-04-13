import { useUIStore } from '../store/ui.store';

/**
 * Returns layout direction values based on the current locale.
 * Arabic → RTL, English → LTR.
 */
export function useDirection() {
  const locale = useUIStore((s) => s.locale);
  const isRTL = locale === 'ar';

  return {
    isRTL,
    direction: isRTL ? 'rtl' : 'ltr',
    writingDirection: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
    textAlign: (isRTL ? 'right' : 'left') as 'right' | 'left',
  };
}
