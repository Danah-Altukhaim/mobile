'use client';

import { useState, useMemo, useEffect, useId } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type FaRoster } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import {
  FOUNDATION_THRESHOLDS, DEGREE_THRESHOLDS_BY_CREDITS,
  ATTENDANCE_POLICY_NOTES, EXCUSE_SUBMISSION_WINDOW_DAYS,
  getAttendanceThresholds, attendanceLevel, type AttendanceLevel,
} from '@masari/shared';
import { FA_WARNING_STAGES, type FaWarningStage } from '@/lib/cckPolicies';
import { useAuth } from '@/lib/auth';
import { SkeletonPage } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { CloseIcon, CheckIcon, ChevronIcon, MailIcon } from '@/components/icons';
import PageHeader from '@/components/PageHeader';

type Decision = FaRoster['students'][0]['decision'];
const FA_KEY = ['fa', 'rosters'] as const;

const LEVEL_STYLE: Record<AttendanceLevel, string> = {
  ok: 'cck-chip-positive',
  first_warning: 'cck-chip-negative',
  second_warning: 'cck-chip-negative',
  fa: 'cck-chip-negative',
};

// CCK Hub Feedback v3 - each FA row is one of three stages, surfaced as a
// coloured row backdrop so staff can scan the queue.
const STAGE_ROW: Record<AttendanceLevel, { bg: string; stage: FaWarningStage | null }> = {
  ok: { bg: '', stage: 'first_warning' },
  first_warning: { bg: '', stage: 'first_warning' },
  second_warning: { bg: 'bg-danger-50/30', stage: 'second_warning' },
  fa: { bg: 'bg-danger-50/60', stage: 'forcing_withdraw' },
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
  const [policyOpen, setPolicyOpen] = useState(false);
  const [previewStage, setPreviewStage] = useState<{
    stage: FaWarningStage;
    student_en: string;
    student_ar: string;
  } | null>(null);
  const [sentWarnings, setSentWarnings] = useState<Record<string, FaWarningStage>>({});

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

  const sendStageWarning = (
    rowId: string,
    stage: FaWarningStage,
    studentName: string,
  ) => {
    setBusy(rowId + stage);
    const stageInfo = FA_WARNING_STAGES.find((s) => s.stage === stage)!;
    const stageLabel = locale === 'ar' ? stageInfo.label_ar : stageInfo.label_en;
    setSentWarnings((prev) => ({ ...prev, [rowId]: stage }));
    showToast(t('fa.warningStageSent', { stage: stageLabel, student: studentName }));
    setBusy(null);
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
      <PageHeader title={t('fa.title')} subtitle={t('fa.subtitle')} />

      {/* Stage-based warning legend - feedback v3: row colour + per-stage send action. */}
      <div className="mb-3 cck-card px-4 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold">{t('fa.warningQueueTitle')}</p>
          <p className="text-xs text-muted">{t('fa.warningQueueDesc')}</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-canvas ring-1 ring-line" />
            {t('fa.legend.green')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-danger-50 ring-1 ring-danger-200" />
            {t('fa.legend.yellow')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-danger-100 ring-1 ring-danger-300" />
            {t('fa.legend.red')}
          </span>
        </div>
      </div>

      <div className="mb-4 bg-pair-50 border border-pair-200 rounded-sm px-4 py-2 text-xs text-pair-700 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold">{t('attendancePolicy.title')}:</span>
        <span>
          {t('attendancePolicy.foundationCoursesValue')} · {FOUNDATION_THRESHOLDS.first_warning_hours}/
          {FOUNDATION_THRESHOLDS.second_warning_hours}/
          {FOUNDATION_THRESHOLDS.fa_hours}{t('attendancePolicy.hours')}
        </span>
        <span className="text-muted">·</span>
        {Object.entries(DEGREE_THRESHOLDS_BY_CREDITS).map(([credits, th]) => (
          <span key={credits}>
            {credits} {t('attendancePolicy.creditsUnit')}: {th.first_warning_hours}/
            {th.second_warning_hours}/{th.fa_hours}{t('attendancePolicy.hours')}
          </span>
        ))}
        <button
          type="button"
          onClick={() => setPolicyOpen(true)}
          className="ms-auto btn btn-primary btn-sm"
        >
          {t('fa.seePolicy')}
        </button>
      </div>

      <div className="cck-card p-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setScope('mine')}
            className={`px-3 py-1.5 rounded-sm text-sm font-medium ${
              scope === 'mine' ? 'bg-pair-600 text-white' : 'bg-canvas text-muted'
            }`}
          >
            {t('fa.myCourses')}
          </button>
          <button
            onClick={() => setScope('all')}
            className={`px-3 py-1.5 rounded-sm text-sm font-medium ${
              scope === 'all' ? 'bg-pair-600 text-white' : 'bg-canvas text-muted'
            }`}
          >
            {t('fa.allCourses')}
          </button>
        </div>
        <p className="text-xs text-muted">
          {scope === 'mine' ? t('fa.scopeHint') : t('fa.scopeHintAll')}
        </p>
      </div>

      {toast && (
        <div role="status" aria-live="polite" className="mb-4 bg-pair-50 border border-pair-200 rounded-sm px-4 py-2 text-sm text-pair-700">
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
            <section key={r.course_code + r.section} className="cck-card overflow-hidden">
              <header className="px-5 py-4 border-b border-line bg-canvas">
                <h2 className="font-semibold">
                  {r.course_code} - {r.course_name}
                </h2>
                <p className="text-xs text-muted mt-1">
                  {r.section} · {locale === 'ar' ? r.instructor_ar : r.instructor_en}
                  {' · '}
                  {r.credit_hours} {t('attendancePolicy.creditsUnit')}
                  {' · '}
                  {t('fa.faThresholdAt', { value: th.fa_hours })}
                </p>
              </header>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted border-b">
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
                    const stageInfo = STAGE_ROW[level];
                    const studentName = locale === 'ar' ? s.name_ar : s.name_en;
                    const sentStage = sentWarnings[s.id];
                    return (
                    <tr key={s.id} className={`border-b border-line last:border-0 ${stageInfo.bg}`}>
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
                          level === 'fa' ? 'text-danger-600' : 'text-ink'
                        }`}>
                          {s.attendance_pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {t('fa.absentHours', { value: s.absences })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${LEVEL_STYLE[level]}`}>
                          {t(`fa.level.${level}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {s.assessments.map((a) => `${a.label}: ${a.score}`).join(' · ')}
                      </td>
                      <td className="px-4 py-3 font-semibold">{s.total_grade}</td>
                      <td className="px-4 py-3">
                        {s.decision === 'pending' ? (
                          <div className="space-y-2">
                            {stageInfo.stage && level !== 'ok' && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] uppercase tracking-wide text-muted">
                                  {t(`fa.stage.${stageInfo.stage}`)}
                                </span>
                                <button
                                  onClick={() => sendStageWarning(s.id, stageInfo.stage!, studentName)}
                                  disabled={busy === s.id + stageInfo.stage || sentStage === stageInfo.stage}
                                  className="btn btn-primary btn-sm"
                                >
                                  {sentStage === stageInfo.stage ? (
                                    <span className="inline-flex items-center gap-1.5">
                                      <CheckIcon className="w-3.5 h-3.5 shrink-0" />{t('fa.sendWarning')}
                                    </span>
                                  ) : t('fa.sendWarning')}
                                </button>
                                <button
                                  onClick={() => setPreviewStage({
                                    stage: stageInfo.stage!,
                                    student_en: s.name_en,
                                    student_ar: s.name_ar,
                                  })}
                                  className="btn btn-outline btn-sm"
                                >
                                  {t('fa.previewWarning')}
                                </button>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => decide(s.id, 'absence_removed')}
                                disabled={busy === s.id + 'absence_removed'}
                                className="px-2.5 py-1 bg-pair-600 text-white rounded-sm text-xs font-medium hover:bg-pair-700 disabled:opacity-50"
                              >
                                {t('fa.removeAbsence')}
                              </button>
                              <button
                                onClick={() => decide(s.id, 'fa_admitted')}
                                disabled={busy === s.id + 'fa_admitted'}
                                className="btn btn-danger btn-sm"
                              >
                                {t('fa.admitFa')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-0.5 rounded-sm text-xs font-medium w-fit ${
                              s.decision === 'fa_admitted'
                                ? 'cck-chip-negative'
                                : 'cck-chip-positive'
                            }`}>
                              {s.decision === 'fa_admitted' ? t('fa.faImposed') : t('fa.absenceRemoved')}
                            </span>
                            <span className="text-xs text-pair-700 font-medium inline-flex items-center gap-1.5">
                              <ChevronIcon dir="end" className="w-3.5 h-3.5 shrink-0" />{t('fa.goToRegistration')}
                            </span>
                            {s.warning_email_sent && (
                              <span className="text-[10px] text-muted inline-flex items-center gap-1.5">
                                <MailIcon className="w-3.5 h-3.5 shrink-0" />{t('fa.warningSent')}
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

      <AttendancePolicyModal open={policyOpen} onClose={() => setPolicyOpen(false)} />

      {previewStage && (() => {
        const info = FA_WARNING_STAGES.find((s) => s.stage === previewStage.stage)!;
        const subject = locale === 'ar' ? info.email_subject_ar : info.email_subject_en;
        const body = locale === 'ar' ? info.body_ar : info.body_en;
        const student = locale === 'ar' ? previewStage.student_ar : previewStage.student_en;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" dir={dir} onClick={() => setPreviewStage(null)}>
            <div
              className="cck-card w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted">{t('fa.previewTitle')}</p>
                  <p className="text-sm font-semibold mt-1">{t(`fa.stage.${previewStage.stage}`)}</p>
                </div>
                <button onClick={() => setPreviewStage(null)} className="text-sm text-muted hover:text-ink">
                  {t('fa.previewClose')}
                </button>
              </header>
              <p className="text-xs text-muted mb-1">To: {student}</p>
              <p className="text-sm font-medium mb-2">{subject}</p>
              <p className="text-sm text-ink whitespace-pre-line bg-canvas border border-line rounded-sm p-3">
                {body}
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function AttendancePolicyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale, dir } = useI18n();
  const titleId = useId();
  const notes = locale === 'ar' ? ATTENDANCE_POLICY_NOTES.ar : ATTENDANCE_POLICY_NOTES.en;
  const degreeRows = Object.entries(DEGREE_THRESHOLDS_BY_CREDITS)
    .map(([credits, th]) => ({ credits: Number(credits), ...th }))
    .sort((a, b) => a.credits - b.credits);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      dir={dir}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-sm shadow-xl border border-line max-w-3xl w-full my-8">
        <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-line">
          <div>
            <h2 id={titleId} className="cck-title text-xl">{t('attendancePolicy.title')}</h2>
            <p className="text-sm text-muted mt-1">{t('attendancePolicy.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.cancel')}
            className="p-1.5 rounded-sm hover:bg-canvas text-muted hover:text-ink shrink-0"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="p-6 space-y-6">
          <section className="rounded-sm border border-line overflow-hidden">
            <header className="px-5 py-4 border-b border-line bg-canvas">
              <h3 className="font-semibold">{t('attendancePolicy.foundationTitle')}</h3>
              <p className="text-xs text-muted mt-1">{t('attendancePolicy.cumulativeHoursHint')}</p>
            </header>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted border-b">
                  <th className="px-4 py-3 text-start font-medium">{t('attendancePolicy.foundationCourses')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('attendancePolicy.firstWarning')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('attendancePolicy.secondWarning')}</th>
                  <th className="px-4 py-3 text-start font-medium text-danger-700">{t('attendancePolicy.fa')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 font-medium">{t('attendancePolicy.foundationCoursesValue')}</td>
                  <td className="px-4 py-3">{FOUNDATION_THRESHOLDS.first_warning_hours} {t('attendancePolicy.hours')}</td>
                  <td className="px-4 py-3">{FOUNDATION_THRESHOLDS.second_warning_hours} {t('attendancePolicy.hours')}</td>
                  <td className="px-4 py-3 font-semibold text-danger-700">
                    {FOUNDATION_THRESHOLDS.fa_hours} {t('attendancePolicy.hours')}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="rounded-sm border border-line overflow-hidden">
            <header className="px-5 py-4 border-b border-line bg-canvas">
              <h3 className="font-semibold">{t('attendancePolicy.degreeTitle')}</h3>
              <p className="text-xs text-muted mt-1">{t('attendancePolicy.cumulativeHoursHint')}</p>
            </header>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted border-b">
                  <th className="px-4 py-3 text-start font-medium">{t('attendancePolicy.credits')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('attendancePolicy.firstWarning')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('attendancePolicy.secondWarning')}</th>
                  <th className="px-4 py-3 text-start font-medium text-danger-700">{t('attendancePolicy.fa')}</th>
                </tr>
              </thead>
              <tbody>
                {degreeRows.map((row) => (
                  <tr key={row.credits} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium">{row.credits} {t('attendancePolicy.creditsUnit')}</td>
                    <td className="px-4 py-3">{row.first_warning_hours} {t('attendancePolicy.hours')}</td>
                    <td className="px-4 py-3">{row.second_warning_hours} {t('attendancePolicy.hours')}</td>
                    <td className="px-4 py-3 font-semibold text-danger-700">
                      {row.fa_hours} {t('attendancePolicy.hours')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-sm border border-line p-5">
            <h3 className="font-semibold mb-1">{t('attendancePolicy.notesTitle')}</h3>
            <p className="text-xs text-muted mb-4">
              {t('attendancePolicy.windowChip', { days: EXCUSE_SUBMISSION_WINDOW_DAYS })}
            </p>
            <ul className="space-y-2 text-sm text-ink">
              {notes.map((n, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-pair-600 shrink-0" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
