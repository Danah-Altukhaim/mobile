'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type FaRoster } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import {
  FOUNDATION_THRESHOLDS, DEGREE_THRESHOLDS_BY_CREDITS,
  getAttendanceThresholds, attendanceLevel, type AttendanceLevel,
} from '@masari/shared';
import { useAuth } from '@/lib/auth';
import { SkeletonPage } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

type Decision = FaRoster['students'][0]['decision'];
const FA_KEY = ['fa', 'rosters'] as const;

const LEVEL_STYLE: Record<AttendanceLevel, string> = {
  ok: 'bg-oasis-50 text-oasis-700',
  first_warning: 'bg-gold-50 text-gold-700',
  second_warning: 'bg-gold-100 text-gold-700',
  fa: 'bg-danger-50 text-danger-700',
};

export default function FaScreenPage() {
  const { t, locale, dir } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: rosters, isError, isLoading, refetch } = useQuery<FaRoster[]>({
    queryKey: FA_KEY,
    queryFn: () => api.getFaRosters() as Promise<FaRoster[]>,
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [scope, setScope] = useState<'mine' | 'all'>('mine');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const decide = async (rowId: string, decision: 'fa_admitted' | 'absence_removed') => {
    setBusy(rowId + decision);
    try {
      await api.decideFa(rowId, decision);
      const next: Decision = decision;
      const warningSent = decision === 'fa_admitted';
      qc.setQueryData<FaRoster[]>(FA_KEY, (prev) =>
        prev?.map((r) => ({
          ...r,
          students: r.students.map((s) => s.id === rowId
            ? { ...s, decision: next, warning_email_sent: warningSent }
            : s),
        })) ?? prev,
      );
      const base = decision === 'fa_admitted' ? t('fa.faImposed') : t('fa.absenceRemoved');
      const tail = warningSent ? ` · ${t('fa.warningSent')}` : ` ${t('fa.forwardedNote')}`;
      showToast(base + tail);
    } finally {
      setBusy(null);
    }
  };

  const visibleRosters = useMemo(() => {
    if (!rosters) return null;
    if (scope === 'all' || !user?.email) return rosters;
    return rosters.filter((r) => r.instructor_email === user.email);
  }, [rosters, scope, user?.email]);

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;
  if (isLoading || !rosters) return <SkeletonPage />;

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('fa.title')}</h1>
      <p className="text-sm text-[#737477] mb-3">{t('fa.subtitle')}</p>

      <div className="mb-4 bg-pair-50 border border-pair-200 rounded-lg px-4 py-2 text-xs text-pair-700 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold">{t('attendancePolicy.title')}:</span>
        <span>
          {t('attendancePolicy.foundationCoursesValue')} · {FOUNDATION_THRESHOLDS.first_warning_hours}/
          {FOUNDATION_THRESHOLDS.second_warning_hours}/
          {FOUNDATION_THRESHOLDS.fa_hours}{t('attendancePolicy.hours')}
        </span>
        <span className="text-[#737477]">·</span>
        {Object.entries(DEGREE_THRESHOLDS_BY_CREDITS).map(([credits, th]) => (
          <span key={credits}>
            {credits} {t('attendancePolicy.creditsUnit')}: {th.first_warning_hours}/
            {th.second_warning_hours}/{th.fa_hours}{t('attendancePolicy.hours')}
          </span>
        ))}
        <Link href="/attendance-policy" className="ms-auto underline font-medium">
          {t('attendancePolicy.notesTitle')} →
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setScope('mine')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              scope === 'mine' ? 'bg-pair-600 text-white' : 'bg-gray-100 text-[#737477]'
            }`}
          >
            {t('fa.myCourses')}
          </button>
          <button
            onClick={() => setScope('all')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              scope === 'all' ? 'bg-pair-600 text-white' : 'bg-gray-100 text-[#737477]'
            }`}
          >
            {t('fa.allCourses')}
          </button>
        </div>
        <p className="text-xs text-[#737477]">
          {scope === 'mine' ? t('fa.scopeHint') : t('fa.scopeHintAll')}
        </p>
      </div>

      {toast && (
        <div role="status" aria-live="polite" className="mb-4 bg-pair-50 border border-pair-200 rounded-lg px-4 py-2 text-sm text-pair-700">
          {toast}
        </div>
      )}

      {!visibleRosters || visibleRosters.length === 0 ? (
        <EmptyState title={t('common.noData')} />
      ) : (
        <div className="space-y-6">
          {visibleRosters.map((r) => {
            const th = getAttendanceThresholds('degree', r.credit_hours);
            return (
            <section key={r.course_code + r.section} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <header className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold">
                  {r.course_code} - {r.course_name}
                </h2>
                <p className="text-xs text-[#737477] mt-1">
                  {r.section} · {locale === 'ar' ? r.instructor_ar : r.instructor_en}
                  {' · '}
                  {r.credit_hours} {t('attendancePolicy.creditsUnit')}
                  {' · '}
                  {t('fa.faThresholdAt', { value: th.fa_hours })}
                </p>
              </header>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#737477] border-b">
                    <th className="px-4 py-3 text-start font-medium">{t('requests.student')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('fa.attendancePct')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('fa.absences')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('fa.attendanceStatus')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('fa.assessmentScores')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('fa.totalGrade')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('fa.decision')}</th>
                  </tr>
                </thead>
                <tbody>
                  {r.students.map((s) => {
                    const level = attendanceLevel(s.absences, th);
                    return (
                    <tr key={s.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{locale === 'ar' ? s.name_ar : s.name_en}</p>
                        <Link
                          href={`/retention/${s.student_id}`}
                          className="text-xs text-pair-600 hover:text-pair-700"
                        >
                          {s.student_id} · {t('fa.viewProfile')}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${
                          level === 'fa' ? 'text-danger-600'
                            : level === 'ok' ? 'text-oasis-600' : 'text-gold-600'
                        }`}>
                          {s.attendance_pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#737477]">
                        {t('fa.absentHours', { value: s.absences })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${LEVEL_STYLE[level]}`}>
                          {t(`fa.level.${level}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#737477]">
                        {s.assessments.map((a) => `${a.label}: ${a.score}`).join(' · ')}
                      </td>
                      <td className="px-4 py-3 font-semibold">{s.total_grade}</td>
                      <td className="px-4 py-3">
                        {s.decision === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => decide(s.id, 'absence_removed')}
                              disabled={busy === s.id + 'absence_removed'}
                              className="px-2.5 py-1 bg-oasis-500 text-white rounded text-xs font-medium hover:bg-oasis-600 disabled:opacity-50"
                            >
                              {t('fa.removeAbsence')}
                            </button>
                            <button
                              onClick={() => decide(s.id, 'fa_admitted')}
                              disabled={busy === s.id + 'fa_admitted'}
                              className="px-2.5 py-1 bg-danger-500 text-white rounded text-xs font-medium hover:bg-danger-600 disabled:opacity-50"
                            >
                              {t('fa.admitFa')}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium w-fit ${
                              s.decision === 'fa_admitted'
                                ? 'bg-danger-50 text-danger-700'
                                : 'bg-oasis-50 text-oasis-700'
                            }`}>
                              {s.decision === 'fa_admitted' ? t('fa.faImposed') : t('fa.absenceRemoved')}
                            </span>
                            <span className="text-xs text-pair-700 font-medium">
                              → {t('fa.goToRegistration')}
                            </span>
                            {s.warning_email_sent && (
                              <span className="text-[10px] text-[#737477]">
                                ✉ {t('fa.warningSent')}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
