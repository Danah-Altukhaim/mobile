import { useUIStore } from '../store/ui.store';

/** Returns a function that picks the right bilingual field based on current locale */
export function useLocalizedField() {
  const locale = useUIStore((s) => s.locale);

  return function localized(obj: any, field: string): string {
    if (!obj) return '';
    // Try locale-specific field first (e.g., name_ar, name_en)
    const localeField = `${field}_${locale}`;
    if (obj[localeField] != null) return obj[localeField];
    // Fallback to other locale
    const fallbackLocale = locale === 'ar' ? 'en' : 'ar';
    const fallbackField = `${field}_${fallbackLocale}`;
    if (obj[fallbackField] != null) return obj[fallbackField];
    // Fallback to unlocalized field
    if (obj[field] != null) return obj[field];
    return '';
  };
}

/** Shorthand: picks name_ar or name_en */
export function useLocaleName() {
  const l = useLocalizedField();
  return (obj: any) => l(obj, 'name');
}
