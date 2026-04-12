import i18n from './index';

/**
 * Pick the `_ar` or `_en` field from a data object based on the current
 * language. Strictly prefers the current language — only falls back to the
 * other language if the current-language field is missing/null/undefined.
 * Falsy non-null values like empty strings are respected.
 *
 * Do NOT default to Arabic: in EN mode, English content must win.
 */
export function localized(obj: any, field: string): string {
  if (!obj) return '';
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const other = lang === 'ar' ? 'en' : 'ar';
  const primary = obj[`${field}_${lang}`];
  if (primary != null) return primary;
  const secondary = obj[`${field}_${other}`];
  if (secondary != null) return secondary;
  return obj[field] ?? '';
}

/**
 * Get the current locale string for Intl formatters.
 * Arabic requests `-u-nu-latn` as a hint, but Hermes' ICU doesn't always honor
 * it — call `toLatnDigits()` on the formatted string to guarantee Latin digits.
 */
export function currentLocale(): string {
  return i18n.language === 'ar' ? 'ar-KW-u-nu-latn' : 'en-KW';
}

/** Locale string for date formatters, with calendar + forced Latin numerals. */
export function dateLocale(calendar: 'islamic-umalqura' | 'gregory'): string {
  const base = i18n.language === 'ar' ? 'ar' : 'en-US';
  return `${base}-u-ca-${calendar}-nu-latn`;
}

/**
 * Convert any Arabic-Indic (٠-٩) or Extended Arabic-Indic (۰-۹) digits in
 * a string to Latin 0-9. Used to force cohesive numerals across the app
 * regardless of whether Hermes honors the `-nu-latn` locale extension.
 */
export function toLatnDigits(input: string): string {
  return input
    .replace(/[\u0660-\u0669]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x30),
    )
    .replace(/[\u06F0-\u06F9]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0x06F0 + 0x30),
    );
}

/**
 * Currency formatting metadata. Hermes' Intl.NumberFormat with `style: currency`
 * in an Arabic locale injects bidi marks around the decimal separator, which
 * renders visually as "500 , 000". Instead, format the number portion in
 * en-US (stable grouping + decimals) and append the localized symbol manually.
 */
const currencyInfo: Record<string, { en: string; ar: string; decimals: number }> = {
  KWD: { en: 'KD', ar: 'د.ك.', decimals: 3 },
  SAR: { en: 'SAR', ar: 'ر.س.', decimals: 2 },
  USD: { en: '$', ar: '$', decimals: 2 },
  EUR: { en: '€', ar: '€', decimals: 2 },
};

export function formatCurrency(amount: number | string | null | undefined, currency: string = 'KWD'): string {
  if (amount == null) return '—';
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!Number.isFinite(n)) return '—';
  const info = currencyInfo[currency] ?? { en: currency, ar: currency, decimals: 2 };
  const number = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: info.decimals,
    maximumFractionDigits: info.decimals,
  }).format(n);
  const label = i18n.language === 'ar' ? info.ar : info.en;
  return `${number} ${label}`;
}
