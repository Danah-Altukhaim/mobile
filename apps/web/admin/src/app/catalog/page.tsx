'use client';

import { useState, useMemo } from 'react';
import { COURSES, PROGRAMS, getCourse } from '@masari/shared';
import type { CatalogCourse, CourseType, CourseLanguage } from '@masari/shared';
import { useI18n } from '@/lib/i18n';

const TYPE_STYLE: Record<CourseType, string> = {
  lecture: 'bg-pair-50 text-pair-700',
  lab: 'bg-gold-50 text-gold-700',
  lecture_lab: 'bg-oasis-50 text-oasis-700',
  unknown: 'bg-gray-100 text-gray-600',
};

export default function CatalogPage() {
  const { t, locale, dir } = useI18n();
  const isAr = locale === 'ar';
  const [tab, setTab] = useState<'courses' | 'programs'>('courses');
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>(PROGRAMS[0]?.slug ?? '');

  const courses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return COURSES.filter((c) => {
      if (programFilter !== 'all' && !c.programs.includes(programFilter as CatalogCourse['programs'][number])) return false;
      if (!q) return true;
      return c.code.toLowerCase().includes(q)
        || c.name_en.toLowerCase().includes(q)
        || (c.name_ar?.includes(q) ?? false);
    });
  }, [search, programFilter]);

  const program = PROGRAMS.find((p) => p.slug === selectedProgram) ?? null;

  const courseName = (c: CatalogCourse) => isAr && c.name_ar ? c.name_ar : c.name_en;
  const langLabel = (l: CourseLanguage) => t(`catalog.lang.${l}`);

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('catalog.title')}</h1>
      <p className="text-sm text-[#737477] mb-4">{t('catalog.subtitle')}</p>

      <div className="flex gap-2 border-b border-gray-200 mb-4">
        <button
          onClick={() => setTab('courses')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'courses' ? 'text-pair-600 border-pair-600' : 'text-[#737477] border-transparent'
          }`}
        >
          {t('catalog.tabCourses')} ({COURSES.length})
        </button>
        <button
          onClick={() => setTab('programs')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'programs' ? 'text-pair-600 border-pair-600' : 'text-[#737477] border-transparent'
          }`}
        >
          {t('catalog.tabPrograms')} ({PROGRAMS.length})
        </button>
      </div>

      {tab === 'courses' && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder={t('catalog.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[220px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="all">{t('catalog.allPrograms')}</option>
              {PROGRAMS.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name_en}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#737477] border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium">{t('catalog.code')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('catalog.course')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('catalog.credits')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('catalog.type')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('catalog.language')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('catalog.prerequisites')}</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.code} className="border-b border-gray-50 last:border-0 align-top">
                    <td className="px-4 py-3 font-mono text-xs text-[#222]">{c.code}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{courseName(c)}</p>
                      {c.name_ar && !isAr && <p className="text-xs text-[#737477]">{c.name_ar}</p>}
                    </td>
                    <td className="px-4 py-3">{c.credit_hours}</td>
                    <td className="px-4 py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${TYPE_STYLE[c.course_type]}`}>
                        {t(`catalog.type.${c.course_type}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#737477]">{langLabel(c.language)}</td>
                    <td className="px-4 py-3 text-xs">
                      {c.prerequisites.length === 0
                        ? <span className="text-[#737477]">{t('catalog.noPrereqs')}</span>
                        : <span className="font-mono text-[#222]">{c.prerequisites.join(', ')}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {courses.length === 0 && (
              <p className="text-sm text-[#737477] text-center py-8">{t('common.noData')}</p>
            )}
          </div>
        </>
      )}

      {tab === 'programs' && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {PROGRAMS.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name_en}</option>
              ))}
            </select>
          </div>

          {program && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold">{program.name_en}</h2>
                <p className="text-sm text-[#737477]">
                  {t(`catalog.level.${program.level}`)} · {t('catalog.totalCredits', { value: program.total_credits })}
                </p>
              </div>
              <div className="space-y-4">
                {program.semesters.map((sem) => (
                  <section key={sem.number} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <header className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                      <h3 className="font-semibold text-sm">
                        {t('catalog.semester', { value: sem.number })} · {t('catalog.year', { value: sem.year })}
                      </h3>
                      <span className="text-xs text-[#737477]">
                        {t('catalog.totalCredits', { value: sem.total_credits })}
                      </span>
                    </header>
                    <table className="w-full text-sm">
                      <tbody>
                        {sem.courses.map((code) => {
                          const c = getCourse(code);
                          const prereqs = sem.prerequisites[code] ?? [];
                          const coreqs = sem.corequisites[code] ?? [];
                          return (
                            <tr key={code} className="border-b border-gray-50 last:border-0">
                              <td className="px-4 py-2.5 font-mono text-xs w-24">{code}</td>
                              <td className="px-4 py-2.5">{c ? courseName(c) : code}</td>
                              <td className="px-4 py-2.5 text-[#737477] w-16">{c?.credit_hours ?? '-'}</td>
                              <td className="px-4 py-2.5 text-xs text-end">
                                {prereqs.length > 0 && (
                                  <span className="text-[#737477]">
                                    {t('catalog.prereqShort')}: <span className="font-mono">{prereqs.join(', ')}</span>
                                  </span>
                                )}
                                {coreqs.length > 0 && (
                                  <span className="text-[#737477] block">
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
    </div>
  );
}
