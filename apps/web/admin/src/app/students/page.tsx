'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import PageHeader from '@/components/PageHeader';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import type { StudentDirectoryEntry, EnrollmentStatus } from '@/lib/student-records';

const STUDENTS_KEY = ['students', 'directory'] as const;

const statusColor = (s: EnrollmentStatus) => {
  switch (s) {
    case 'enrolled': return 'cck-chip-positive';
    case 'probation': return 'cck-chip-negative';
    case 'suspended': return 'cck-chip-negative';
    case 'withdrawn': return 'cck-chip-neutral';
    default: return 'cck-chip-neutral';
  }
};

const gpaColor = (g: number) =>
  g >= 2 ? 'text-ink' : 'text-danger-600';

export default function StudentsDirectoryPage() {
  const { t, locale, dir } = useI18n();
  const isAr = locale === 'ar';
  const [search, setSearch] = useState('');

  const { data, isError, refetch } = useQuery<StudentDirectoryEntry[]>({
    queryKey: STUDENTS_KEY,
    queryFn: () => api.getStudentRecords() as Promise<StudentDirectoryEntry[]>,
  });

  const students = data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      s.name_en.toLowerCase().includes(q) ||
      s.name_ar.includes(search.trim()) ||
      s.student_number.includes(q),
    );
  }, [students, search]);

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;
  if (!data) return <SkeletonPage />;

  const thAlign = isAr ? 'text-right' : 'text-left';

  return (
    <div dir={dir}>
      <PageHeader title={t('students.title')} subtitle={t('students.subtitle')} />

      <div className="cck-card p-4 mb-4">
        <input
          type="text"
          autoFocus
          placeholder={t('students.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="cck-input"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t('students.noResults')} description={t('students.emptyHint')} />
      ) : (
        <div className="cck-card overflow-hidden">
          <div className="px-4 py-3 border-b border-line text-xs text-muted">
            {t('students.resultsCount', { count: filtered.length })}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className={`${thAlign} text-muted border-b border-line`}>
                <th className="px-4 py-2 font-medium">{t('students.colName')}</th>
                <th className="px-4 py-2 font-medium">{t('students.colProgram')}</th>
                <th className="px-4 py-2 font-medium">{t('students.colGpa')}</th>
                <th className="px-4 py-2 font-medium">{t('students.colStatus')}</th>
                <th className="px-4 py-2 font-medium">{t('students.colFlags')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-line hover:bg-canvas/60">
                  <td className="px-4 py-3">
                    <Link href={`/students/${s.id}`} className="font-medium text-pair-700 hover:underline">
                      {isAr ? s.name_ar : s.name_en}
                    </Link>
                    <span className="block text-xs text-muted">#{s.student_number}</span>
                  </td>
                  <td className="px-4 py-3 text-body">
                    {isAr ? s.program_ar : s.program_en}
                    <span className="block text-xs text-muted">{t(`students.level.${s.level}`)} · {s.cohort_year}</span>
                  </td>
                  <td className={`px-4 py-3 font-semibold ${gpaColor(s.gpa_cumulative)}`}>{s.gpa_cumulative.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${statusColor(s.enrollment_status)}`}>
                      {t(`students.status.${s.enrollment_status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {s.active_warnings > 0 && (
                        <span className="px-2 py-0.5 rounded-sm text-xs cck-chip-negative">
                          {t('students.flagWarnings', { count: s.active_warnings })}
                        </span>
                      )}
                      {s.active_holds > 0 && (
                        <span className="px-2 py-0.5 rounded-sm text-xs cck-chip-negative">
                          {t('students.flagHolds', { count: s.active_holds })}
                        </span>
                      )}
                      {s.balance > 0 && (
                        <span className="px-2 py-0.5 rounded-sm text-xs cck-chip-neutral">
                          {t('students.flagBalance')}
                        </span>
                      )}
                      {s.active_warnings === 0 && s.active_holds === 0 && s.balance <= 0 && (
                        <span className="text-xs text-muted">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
