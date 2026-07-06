// Maps a course's instruction language to its i18n label key.
// CCK courses are taught in Arabic, English, or bilingually (Schedule Process
// and Rules doc).
export function languageLabelKey(language: string | undefined): string {
  switch (language) {
    case 'ar':
      return 'academics.langAr';
    case 'bilingual':
      return 'academics.langBilingual';
    default:
      return 'academics.langEn';
  }
}
