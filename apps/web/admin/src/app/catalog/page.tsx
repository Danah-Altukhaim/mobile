'use client';

import { useState, useMemo, useEffect } from 'react';
import type { CatalogCourse, CourseType, CourseLanguage, ProgramSlug } from '@masari/shared';
import { useI18n } from '@/lib/i18n';
import {
  useCatalogCourses,
  useCatalogPrograms,
  useCatalogEdited,
  catalogActions,
} from '@/lib/catalogStore';
import CourseEditModal from '@/components/CourseEditModal';
import ProgramEditModal from '@/components/ProgramEditModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import PageHeader from '@/components/PageHeader';

const TYPE_STYLE: Record<CourseType, string> = {
  lecture: 'cck-chip-neutral',
  lab: 'cck-chip-neutral',
  lecture_lab: 'cck-chip-neutral',
  unknown: 'cck-chip-neutral',
};

/** Readable labels for program slugs that have no published major sheet. */
const FALLBACK_PROGRAM_LABELS: Partial<Record<ProgramSlug, string>> = {
  'diploma-cp': 'Diploma - Computer Programming',
  'diploma-iawd': 'Diploma - Interactive Web Design',
  'diploma-imd': 'Diploma - Interactive Media Design',
  'basc-cs': 'BASc Computer Science',
};

export default function CatalogPage() {
  const { t, locale, dir } = useI18n();
  const isAr = locale === 'ar';
  const courses = useCatalogCourses();
  const programs = useCatalogPrograms();
  const edited = useCatalogEdited();

  const [tab, setTab] = useState<'courses' | 'programs'>('courses');
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('');

  // Modal / dialog state
  const [courseModal, setCourseModal] = useState<{ course: CatalogCourse | null } | null>(null);
  const [programModal, setProgramModal] = useState<{ program: typeof programs[number] | null } | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<CatalogCourse | null>(null);
  const [deleteProgramSlug, setDeleteProgramSlug] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Keep the selected program valid as the list changes.
  useEffect(() => {
    if (programs.length === 0) { setSelectedProgram(''); return; }
    if (!programs.some((p) => p.slug === selectedProgram)) {
      setSelectedProgram(programs[0].slug);
    }
  }, [programs, selectedProgram]);

  const courseByCode = useMemo(() => {
    const map = new Map<string, CatalogCourse>();
    for (const c of courses) map.set(c.code, c);
    return map;
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      if (programFilter !== 'all' && !c.programs.includes(programFilter as ProgramSlug)) return false;
      if (!q) return true;
      return c.code.toLowerCase().includes(q)
        || c.name_en.toLowerCase().includes(q)
        || (c.name_ar?.includes(q) ?? false);
    });
  }, [courses, search, programFilter]);

  const program = programs.find((p) => p.slug === selectedProgram) ?? null;

  const courseName = (c: CatalogCourse) => isAr && c.name_ar ? c.name_ar : c.name_en;
  const langLabel = (l: CourseLanguage) => t(`catalog.lang.${l}`);
  const programLabel = (slug: ProgramSlug): string =>
    programs.find((p) => p.slug === slug)?.name_en ?? FALLBACK_PROGRAM_LABELS[slug] ?? slug;

  const actionBtn = 'px-2.5 py-1 text-xs font-medium rounded-sm border transition';

  return (
    <div dir={dir}>
      <PageHeader
        title={t('catalog.title')}
        subtitle={t('catalog.subtitle')}
        actions={edited ? (
          <>
            <span className="px-2 py-0.5 rounded-sm text-[11px] font-medium cck-chip-neutral">
              {t('catalog.edited')}
            </span>
            <button onClick={() => setConfirmReset(true)} className="btn btn-outline btn-sm">
              {t('catalog.reset')}
            </button>
          </>
        ) : undefined}
      />

      <div className="flex gap-2 border-b border-line mb-4">
        <button
          onClick={() => setTab('courses')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'courses' ? 'text-pair-600 border-pair-600' : 'text-muted border-transparent'
          }`}
        >
          {t('catalog.tabCourses')} ({courses.length})
        </button>
        <button
          onClick={() => setTab('programs')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'programs' ? 'text-pair-600 border-pair-600' : 'text-muted border-transparent'
          }`}
        >
          {t('catalog.tabPrograms')} ({programs.length})
        </button>
      </div>

      {tab === 'courses' && (
        <>
          <div className="cck-card p-4 mb-4 flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder={t('catalog.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[220px] border border-line-strong rounded-sm px-3 py-2 text-sm"
            />
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="border border-line-strong rounded-sm px-3 py-2 text-sm bg-white"
            >
              <option value="all">{t('catalog.allPrograms')}</option>
              {programs.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name_en}</option>
              ))}
            </select>
            <button
              onClick={() => setCourseModal({ course: null })}
              className="btn btn-primary"
            >
              + {t('catalog.addCourse')}
            </button>
          </div>

          <div className="cck-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted border-b bg-canvas">
                  <th className="px-4 py-3 text-start font-medium">{t('catalog.code')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('catalog.course')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('catalog.credits')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('catalog.type')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('catalog.language')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('catalog.prerequisites')}</th>
                  <th className="px-4 py-3 text-end font-medium">{t('catalog.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => (
                  <tr key={c.code} className="border-b border-line last:border-0 align-top">
                    <td className="px-4 py-3 font-mono text-xs text-ink">{c.code}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{courseName(c)}</p>
                      {c.name_ar && !isAr && <p className="text-xs text-muted">{c.name_ar}</p>}
                    </td>
                    <td className="px-4 py-3">{c.credit_hours}</td>
                    <td className="px-4 py-3">
                      <span className={`px-1.5 py-0.5 rounded-sm text-[11px] font-medium ${TYPE_STYLE[c.course_type]}`}>
                        {t(`catalog.type.${c.course_type}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{langLabel(c.language)}</td>
                    <td className="px-4 py-3 text-xs">
                      {c.prerequisites.length === 0
                        ? <span className="text-muted">{t('catalog.noPrereqs')}</span>
                        : <span className="font-mono text-ink">{c.prerequisites.join(', ')}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setCourseModal({ course: c })}
                          className={`${actionBtn} border-line-strong text-ink hover:bg-canvas`}
                        >
                          {t('catalog.edit')}
                        </button>
                        <button
                          onClick={() => setDeleteCourse(c)}
                          className={`${actionBtn} border-danger-200 text-danger-600 hover:bg-danger-50`}
                        >
                          {t('catalog.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCourses.length === 0 && (
              <p className="text-sm text-muted text-center py-8">{t('common.noData')}</p>
            )}
          </div>
        </>
      )}

      {tab === 'programs' && (
        <>
          <div className="cck-card p-4 mb-4 flex flex-wrap gap-3 items-center">
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="flex-1 min-w-[220px] md:flex-none md:w-auto border border-line-strong rounded-sm px-3 py-2 text-sm bg-white"
            >
              {programs.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name_en}</option>
              ))}
            </select>
            <div className="flex gap-2 ms-auto">
              {program && (
                <>
                  <button
                    onClick={() => setProgramModal({ program })}
                    className="btn btn-outline"
                  >
                    {t('catalog.editProgram')}
                  </button>
                  <button
                    onClick={() => setDeleteProgramSlug(program.slug)}
                    className="btn btn-danger"
                  >
                    {t('catalog.deleteProgram')}
                  </button>
                </>
              )}
              <button
                onClick={() => setProgramModal({ program: null })}
                className="btn btn-primary"
              >
                + {t('catalog.addProgram')}
              </button>
            </div>
          </div>

          {program && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold">{program.name_en}</h2>
                <p className="text-sm text-muted">
                  {t(`catalog.level.${program.level}`)} · {t('catalog.totalCredits', { value: program.total_credits })}
                </p>
              </div>
              <div className="space-y-4">
                {program.semesters.map((sem) => (
                  <section key={sem.number} className="cck-card overflow-hidden">
                    <header className="px-5 py-3 border-b border-line bg-canvas flex items-center justify-between">
                      <h3 className="font-semibold text-sm">
                        {t('catalog.semester', { value: sem.number })} · {t('catalog.year', { value: sem.year })}
                      </h3>
                      <span className="text-xs text-muted">
                        {t('catalog.totalCredits', { value: sem.total_credits })}
                      </span>
                    </header>
                    <table className="w-full text-sm">
                      <tbody>
                        {sem.courses.map((code) => {
                          const c = courseByCode.get(code);
                          const prereqs = sem.prerequisites[code] ?? [];
                          const coreqs = sem.corequisites[code] ?? [];
                          return (
                            <tr key={code} className="border-b border-line last:border-0">
                              <td className="px-4 py-2.5 font-mono text-xs w-24">{code}</td>
                              <td className="px-4 py-2.5">{c ? courseName(c) : code}</td>
                              <td className="px-4 py-2.5 text-muted w-16">{c?.credit_hours ?? '-'}</td>
                              <td className="px-4 py-2.5 text-xs text-end">
                                {prereqs.length > 0 && (
                                  <span className="text-muted">
                                    {t('catalog.prereqShort')}: <span className="font-mono">{prereqs.join(', ')}</span>
                                  </span>
                                )}
                                {coreqs.length > 0 && (
                                  <span className="text-muted block">
                                    {t('catalog.coreqShort')}: <span className="font-mono">{coreqs.join(', ')}</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </section>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {courseModal && (
        <CourseEditModal
          course={courseModal.course}
          existingCodes={courses.map((c) => c.code)}
          programLabel={programLabel}
          onClose={() => setCourseModal(null)}
        />
      )}

      {programModal && (
        <ProgramEditModal
          program={programModal.program}
          existingSlugs={programs.map((p) => p.slug)}
          onClose={() => {
            const created = programModal.program;
            setProgramModal(null);
            if (!created) setTab('programs');
          }}
        />
      )}

      <ConfirmDialog
        open={deleteCourse !== null}
        title={t('catalog.deleteCourseTitle')}
        message={t('catalog.deleteCourseMessage', {
          code: deleteCourse?.code ?? '',
          name: deleteCourse ? courseName(deleteCourse) : '',
        })}
        variant="danger"
        confirmLabel={t('catalog.delete')}
        onConfirm={() => {
          if (deleteCourse) catalogActions.deleteCourse(deleteCourse.code);
          setDeleteCourse(null);
        }}
        onCancel={() => setDeleteCourse(null)}
      />

      <ConfirmDialog
        open={deleteProgramSlug !== null}
        title={t('catalog.deleteProgramTitle')}
        message={t('catalog.deleteProgramMessage', {
          name: programs.find((p) => p.slug === deleteProgramSlug)?.name_en ?? '',
        })}
        variant="danger"
        confirmLabel={t('catalog.delete')}
        onConfirm={() => {
          if (deleteProgramSlug) catalogActions.deleteProgram(deleteProgramSlug);
          setDeleteProgramSlug(null);
        }}
        onCancel={() => setDeleteProgramSlug(null)}
      />

      <ConfirmDialog
        open={confirmReset}
        title={t('catalog.resetConfirmTitle')}
        message={t('catalog.resetConfirmMessage')}
        variant="danger"
        confirmLabel={t('catalog.reset')}
        onConfirm={() => { catalogActions.reset(); setConfirmReset(false); }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
