'use client';

import { useEffect, useState } from 'react';
import type { CatalogCourse, CourseType, CourseLanguage, ProgramSlug } from '@masari/shared';
import { useI18n } from '@/lib/i18n';
import { ALL_PROGRAM_SLUGS, catalogActions } from '@/lib/catalogStore';

interface CourseEditModalProps {
  /** The course to edit, or null to create a new one. */
  course: CatalogCourse | null;
  /** Existing codes, used to block duplicates when creating / renaming. */
  existingCodes: string[];
  /** Display label for a program slug. */
  programLabel: (slug: ProgramSlug) => string;
  onClose: () => void;
}

const TYPES: CourseType[] = ['lecture', 'lab', 'lecture_lab', 'unknown'];
const LANGUAGES: CourseLanguage[] = ['en', 'ar', 'bilingual', 'unknown'];

const parseCodes = (value: string): string[] =>
  value
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

export default function CourseEditModal({
  course,
  existingCodes,
  programLabel,
  onClose,
}: CourseEditModalProps) {
  const { t, dir } = useI18n();
  const isNew = course === null;

  const [code, setCode] = useState(course?.code ?? '');
  const [nameEn, setNameEn] = useState(course?.name_en ?? '');
  const [nameAr, setNameAr] = useState(course?.name_ar ?? '');
  const [credits, setCredits] = useState(String(course?.credit_hours ?? 3));
  const [type, setType] = useState<CourseType>(course?.course_type ?? 'lecture');
  const [language, setLanguage] = useState<CourseLanguage>(course?.language ?? 'en');
  const [programs, setPrograms] = useState<ProgramSlug[]>(course?.programs ?? []);
  const [prereqs, setPrereqs] = useState((course?.prerequisites ?? []).join(', '));
  const [descEn, setDescEn] = useState(course?.description_en ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const toggleProgram = (slug: ProgramSlug) =>
    setPrograms((prev) => (prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]));

  const submit = () => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) { setError(t('catalog.codeRequired')); return; }
    if (!nameEn.trim()) { setError(t('catalog.nameRequired')); return; }
    const collides = existingCodes.some(
      (c) => c.toUpperCase() === trimmedCode && c.toUpperCase() !== (course?.code ?? '').toUpperCase(),
    );
    if (collides) { setError(t('catalog.codeDuplicate')); return; }

    const next: CatalogCourse = {
      code: trimmedCode,
      name_en: nameEn.trim(),
      name_ar: nameAr.trim() || null,
      credit_hours: Number(credits) || 0,
      course_type: type,
      language,
      programs,
      prerequisites: parseCodes(prereqs),
      description_en: descEn.trim() || null,
    };
    catalogActions.saveCourse(course?.code ?? null, next);
    onClose();
  };

  const field = 'cck-input';
  const label = 'cck-label';

  return (
    <div role="dialog" aria-modal="true" dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-pine-900/50 backdrop-blur-[1px]" onClick={onClose} aria-hidden />
      <div className="relative cck-card shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-line flex items-center gap-3">
          <span aria-hidden className="h-5 w-1 bg-pair-600 rounded-sm" />
          <h3 className="cck-title text-lg">{isNew ? t('catalog.newCourse') : t('catalog.editCourse')}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={label}>{t('catalog.code')}</label>
            <input className={`${field} font-mono`} value={code} onChange={(e) => setCode(e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className={label}>{t('catalog.credits')}</label>
            <input type="number" min={0} className={field} value={credits} onChange={(e) => setCredits(e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className={label}>{t('catalog.nameEn')}</label>
            <input className={field} value={nameEn} onChange={(e) => setNameEn(e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className={label}>{t('catalog.nameAr')}</label>
            <input className={field} value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />
          </div>
          <div>
            <label className={label}>{t('catalog.type')}</label>
            <select className={field} value={type} onChange={(e) => setType(e.target.value as CourseType)}>
              {TYPES.map((tp) => <option key={tp} value={tp}>{t(`catalog.type.${tp}`)}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>{t('catalog.language')}</label>
            <select className={field} value={language} onChange={(e) => setLanguage(e.target.value as CourseLanguage)}>
              {LANGUAGES.map((l) => <option key={l} value={l}>{t(`catalog.lang.${l}`)}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={label}>{t('catalog.programsField')}</label>
            <div className="flex flex-wrap gap-2">
              {ALL_PROGRAM_SLUGS.map((slug) => {
                const active = programs.includes(slug);
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => toggleProgram(slug)}
                    aria-pressed={active}
                    className={`px-3 py-1.5 border rounded-sm text-sm font-semibold transition ${
                      active
                        ? 'border-pair-600 bg-pair-50 text-pair-700'
                        : 'border-line-strong text-ink hover:bg-canvas'
                    }`}
                  >
                    {programLabel(slug)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={label}>{t('catalog.prereqsField')}</label>
            <input className={`${field} font-mono`} value={prereqs} onChange={(e) => setPrereqs(e.target.value)}
              placeholder={t('catalog.prereqsHint')} dir="ltr" />
          </div>
          <div className="md:col-span-2">
            <label className={label}>{t('catalog.descriptionEn')}</label>
            <textarea className={field} rows={4} value={descEn} onChange={(e) => setDescEn(e.target.value)} dir="ltr" />
          </div>
        </div>
        {error && <p className="px-6 text-sm text-danger-600">{error}</p>}
        <div className="px-6 py-4 border-t border-line flex justify-end gap-3 mt-2">
          <button onClick={onClose} className="btn btn-outline">
            {t('common.cancel')}
          </button>
          <button onClick={submit} className="btn btn-primary">
            {t('catalog.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
