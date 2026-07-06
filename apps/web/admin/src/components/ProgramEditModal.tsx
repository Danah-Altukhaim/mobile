'use client';

import { useEffect, useState } from 'react';
import type { DegreeProgram, ProgramSemester, ProgramSlug } from '@masari/shared';
import { useI18n } from '@/lib/i18n';
import { catalogActions } from '@/lib/catalogStore';

interface ProgramEditModalProps {
  /** The degree plan to edit, or null to create a new one. */
  program: DegreeProgram | null;
  /** Existing slugs, used to block duplicates when creating / renaming. */
  existingSlugs: string[];
  onClose: () => void;
}

type Level = DegreeProgram['level'];

/** A semester in editable (string-backed) form. */
interface EditSemester {
  number: string;
  year: string;
  total_credits: string;
  coursesText: string;
  prereqs: Record<string, string>;
  coreqs: Record<string, string>;
}

const parseCodes = (value: string): string[] =>
  value
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

const joinReqs = (map: Record<string, string[]>, code: string): string =>
  (map[code] ?? []).join(', ');

function toEditSemester(sem: ProgramSemester): EditSemester {
  const prereqs: Record<string, string> = {};
  const coreqs: Record<string, string> = {};
  for (const code of sem.courses) {
    prereqs[code] = joinReqs(sem.prerequisites, code);
    coreqs[code] = joinReqs(sem.corequisites, code);
  }
  return {
    number: String(sem.number),
    year: String(sem.year),
    total_credits: String(sem.total_credits),
    coursesText: sem.courses.join(', '),
    prereqs,
    coreqs,
  };
}

function blankSemester(index: number): EditSemester {
  return {
    number: String(index + 1),
    year: String(Math.ceil((index + 1) / 2)),
    total_credits: '0',
    coursesText: '',
    prereqs: {},
    coreqs: {},
  };
}

export default function ProgramEditModal({ program, existingSlugs, onClose }: ProgramEditModalProps) {
  const { t, dir } = useI18n();
  const isNew = program === null;

  const [slug, setSlug] = useState(program?.slug ?? '');
  const [level, setLevel] = useState<Level>(program?.level ?? 'diploma');
  const [nameEn, setNameEn] = useState(program?.name_en ?? '');
  const [nameAr, setNameAr] = useState(program?.name_ar ?? '');
  const [totalCredits, setTotalCredits] = useState(String(program?.total_credits ?? 0));
  const [semesters, setSemesters] = useState<EditSemester[]>(
    program ? program.semesters.map(toEditSemester) : [],
  );
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

  const updateSem = (idx: number, patch: Partial<EditSemester>) =>
    setSemesters((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const updateReq = (idx: number, kind: 'prereqs' | 'coreqs', code: string, value: string) =>
    setSemesters((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [kind]: { ...s[kind], [code]: value } } : s)),
    );

  const addSemester = () => setSemesters((prev) => [...prev, blankSemester(prev.length)]);
  const removeSemester = (idx: number) => setSemesters((prev) => prev.filter((_, i) => i !== idx));

  const submit = () => {
    const trimmedSlug = slug.trim().toLowerCase();
    if (!trimmedSlug) { setError(t('catalog.slugRequired')); return; }
    if (!nameEn.trim()) { setError(t('catalog.nameRequired')); return; }
    const collides = existingSlugs.some(
      (s) => s.toLowerCase() === trimmedSlug && s.toLowerCase() !== (program?.slug ?? '').toLowerCase(),
    );
    if (collides) { setError(t('catalog.slugDuplicate')); return; }

    const builtSemesters: ProgramSemester[] = semesters.map((s) => {
      const courses = parseCodes(s.coursesText);
      const prerequisites: Record<string, string[]> = {};
      const corequisites: Record<string, string[]> = {};
      for (const code of courses) {
        const p = parseCodes(s.prereqs[code] ?? '');
        if (p.length) prerequisites[code] = p;
        const c = parseCodes(s.coreqs[code] ?? '');
        if (c.length) corequisites[code] = c;
      }
      return {
        number: Number(s.number) || 0,
        year: Number(s.year) || 0,
        total_credits: Number(s.total_credits) || 0,
        courses,
        prerequisites,
        corequisites,
      };
    });

    const next: DegreeProgram = {
      slug: trimmedSlug as ProgramSlug,
      level,
      name_en: nameEn.trim(),
      name_ar: nameAr.trim() || null,
      total_credits: Number(totalCredits) || 0,
      semesters: builtSemesters,
    };
    catalogActions.saveProgram(program?.slug ?? null, next);
    onClose();
  };

  const field = 'cck-input';
  const label = 'cck-label';

  return (
    <div role="dialog" aria-modal="true" dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-pine-900/50 backdrop-blur-[1px]" onClick={onClose} aria-hidden />
      <div className="relative cck-card shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-line flex items-center gap-3">
          <span aria-hidden className="h-5 w-1 bg-pair-600 rounded-sm" />
          <h3 className="cck-title text-lg">{isNew ? t('catalog.newProgram') : t('catalog.editProgram')}</h3>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={label}>{t('catalog.slug')}</label>
            <input className={`${field} font-mono`} value={slug} onChange={(e) => setSlug(e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className={label}>{t('catalog.level')}</label>
            <select className={field} value={level} onChange={(e) => setLevel(e.target.value as Level)}>
              <option value="diploma">{t('catalog.level.diploma')}</option>
              <option value="bachelor">{t('catalog.level.bachelor')}</option>
            </select>
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
            <label className={label}>{t('catalog.totalCreditsField')}</label>
            <input type="number" min={0} className={field} value={totalCredits}
              onChange={(e) => setTotalCredits(e.target.value)} dir="ltr" />
          </div>
        </div>

        <div className="px-6 pb-2 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-ink">{t('catalog.semesters')}</h4>
          <button type="button" onClick={addSemester} className="btn btn-outline btn-sm text-pair-700 border-pair-300 hover:border-pair-600">
            + {t('catalog.addSemester')}
          </button>
        </div>

        <div className="px-6 pb-4 space-y-4">
          {semesters.map((sem, idx) => {
            const codes = parseCodes(sem.coursesText);
            return (
              <section key={idx} className="border border-line rounded-sm overflow-hidden">
                <header className="px-4 py-2.5 bg-canvas border-b border-line flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">
                    {t('catalog.semester', { value: sem.number || idx + 1 })}
                  </span>
                  <button type="button" onClick={() => removeSemester(idx)}
                    className="text-xs text-danger-600 hover:text-danger-700">
                    {t('catalog.removeSemester')}
                  </button>
                </header>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={label}>{t('catalog.semesterNumber')}</label>
                      <input type="number" min={1} className={field} value={sem.number}
                        onChange={(e) => updateSem(idx, { number: e.target.value })} dir="ltr" />
                    </div>
                    <div>
                      <label className={label}>{t('catalog.semesterYear')}</label>
                      <input type="number" min={1} className={field} value={sem.year}
                        onChange={(e) => updateSem(idx, { year: e.target.value })} dir="ltr" />
                    </div>
                    <div>
                      <label className={label}>{t('catalog.semesterCredits')}</label>
                      <input type="number" min={0} className={field} value={sem.total_credits}
                        onChange={(e) => updateSem(idx, { total_credits: e.target.value })} dir="ltr" />
                    </div>
                  </div>
                  <div>
                    <label className={label}>{t('catalog.coursesField')}</label>
                    <textarea className={`${field} font-mono`} rows={2} value={sem.coursesText}
                      onChange={(e) => updateSem(idx, { coursesText: e.target.value })}
                      placeholder={t('catalog.coursesHint')} dir="ltr" />
                  </div>
                  <div>
                    <p className={label}>{t('catalog.perCourseReqs')}</p>
                    {codes.length === 0 ? (
                      <p className="text-xs text-muted">{t('catalog.noCoursesYet')}</p>
                    ) : (
                      <div className="space-y-2">
                        {codes.map((code) => (
                          <div key={code} className="grid grid-cols-[5rem_1fr_1fr] gap-2 items-center">
                            <span className="font-mono text-xs text-ink">{code}</span>
                            <input className={`${field} font-mono`} value={sem.prereqs[code] ?? ''}
                              onChange={(e) => updateReq(idx, 'prereqs', code, e.target.value)}
                              placeholder={t('catalog.prereqsField')} dir="ltr" />
                            <input className={`${field} font-mono`} value={sem.coreqs[code] ?? ''}
                              onChange={(e) => updateReq(idx, 'coreqs', code, e.target.value)}
                              placeholder={t('catalog.coreqsField')} dir="ltr" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {error && <p className="px-6 text-sm text-danger-600">{error}</p>}
        <div className="px-6 py-4 border-t border-line flex justify-end gap-3">
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
