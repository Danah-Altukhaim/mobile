import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';
import { useUIStore } from '../store/ui.store';

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: 'ar', // Arabic-first
  fallbackLng: 'ar',
  interpolation: {
    escapeValue: false,
  },
});

// Keep i18n and ui.store in sync in BOTH directions so every consumer
// (t('...') via i18next subscription AND useUIStore((s) => s.locale) via zustand)
// sees the same language. A one-way sync is not enough: if any code calls
// i18n.changeLanguage() directly, the zustand store would stay stale and
// screens reading from useUIStore would render the wrong language's data
// (Arabic names/content under an English UI chrome).
const normalize = (lang: string): 'ar' | 'en' => (lang === 'ar' ? 'ar' : 'en');

const syncFromStore = (locale: 'ar' | 'en') => {
  if (normalize(i18n.language) !== locale) {
    i18n.changeLanguage(locale);
  }
};

const syncFromI18n = (lang: string) => {
  const normalized = normalize(lang);
  if (useUIStore.getState().locale !== normalized) {
    useUIStore.getState().setLocale(normalized);
  }
};

// Align on module load, then subscribe both directions.
syncFromStore(useUIStore.getState().locale);
useUIStore.subscribe((state) => syncFromStore(state.locale));
i18n.on('languageChanged', syncFromI18n);

/**
 * Change the app language. Updates both i18n and ui.store so all
 * direction-aware components react together. Always use this instead of
 * calling i18n.changeLanguage() directly.
 */
export function changeLanguage(locale: 'ar' | 'en') {
  useUIStore.getState().setLocale(locale);
  i18n.changeLanguage(locale);
}

export default i18n;
