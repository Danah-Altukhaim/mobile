'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { ChevronIcon, SparklesIcon } from '@/components/icons';
import type {
  StudentRecord, DataSource, EnrollmentStatus, WarningSeverity, AppChannel,
} from '@/lib/student-records';

const statusColor = (s: EnrollmentStatus) => {
  switch (s) {
    case 'enrolled': return 'cck-chip-positive';
    case 'probation': return 'cck-chip-negative';
    case 'suspended': return 'cck-chip-negative';
    case 'withdrawn': return 'cck-chip-neutral';
    default: return 'cck-chip-neutral';
  }
};

const severityColor = (s: WarningSeverity) => {
  switch (s) {
    case 'critical': return 'cck-chip-negative';
    case 'warning': return 'cck-chip-negative';
    default: return 'cck-chip-neutral';
  }
};

const rateColor = (r: number) =>
  r >= 60 ? 'text-ink' : 'text-danger-600';
const rateBar = (r: number) =>
  r >= 60 ? 'bg-pair-600' : 'bg-danger-500';
const gpaColor = (g: number) =>
  g >= 2 ? 'text-ink' : 'text-danger-600';

const sourceStyle: Record<DataSource, string> = {
  sis: 'bg-pair-50 text-pair-700 border border-pair-100',
  lms: 'bg-pair-50 text-pair-700 border border-pair-100',
  app: 'bg-pair-50 text-pair-700 border border-pair-100',
};

export default function StudentRecordPage() {
  const params = useParams();
  const { t, locale, dir } = useI18n();
  const isAr = locale === 'ar';
  const id = params.id as string;

  const { data, isError, refetch, isLoading } = useQuery<StudentRecord | null>({
    queryKey: ['students', 'record', id],
    queryFn: () => api.getStudentRecord(id) as Promise<StudentRecord | null>,
  });

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;
  if (isLoading) return <SkeletonPage />;
  if (!data) {
    return (
      <div dir={dir}>
        <Link href="/students" className="text-sm text-pair-600 hover:underline mb-4 inline-flex items-center gap-1">
          <ChevronIcon dir="start" className="w-3.5 h-3.5 shrink-0" />{t('students.backToDirectory')}
        </Link>
        <EmptyState title={t('students.notFound')} />
      </div>
    );
  }

  const s = data;
  const name = isAr ? s.name_ar : s.name_en;
  const thAlign = isAr ? 'text-right' : 'text-left';
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(isAr ? 'ar-KW' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString(isAr ? 'ar-KW' : 'en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  const kwd = (n: number) => `${n.toLocaleString(isAr ? 'ar-KW' : 'en-GB')} KWD`;

  const SourceBadge = ({ source }: { source: DataSource }) => (
    <span className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-sm ${sourceStyle[source]}`}>
      {t(`students.source.${source}`)}
    </span>
  );

  const SectionHeader = ({ title, source }: { title: string; source: DataSource }) => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <SourceBadge source={source} />
    </div>
  );

  const activeHolds = s.holds.filter((h) => h.active);

  return (
    <div dir={dir}>
      <Link href="/students" className="text-sm text-pair-600 hover:underline mb-4 inline-flex items-center gap-1">
        <ChevronIcon dir="start" className="w-3.5 h-3.5 shrink-0" />{t('students.backToDirectory')}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-pair-500 text-white flex items-center justify-center text-xl font-bold shrink-0">
            {s.name_en.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">{name}</h1>
            <p className="text-muted text-sm">
              {isAr ? s.name_en : s.name_ar} · #{s.student_number}
            </p>
            <p className="text-muted text-sm">{isAr ? s.program_ar : s.program_en}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-sm text-sm font-medium ${statusColor(s.enrollment_status)}`}>
            {t(`students.status.${s.enrollment_status}`)}
          </span>
          <span className="px-3 py-1 rounded-sm text-sm font-medium bg-canvas text-body">
            {isAr ? s.academic_standing_ar : s.academic_standing_en}
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="cck-card p-4">
          <p className="text-xs text-muted">{t('students.cumulativeGpa')}</p>
          <p className={`text-2xl font-bold ${gpaColor(s.gpa_cumulative)}`}>{s.gpa_cumulative.toFixed(2)}</p>
        </div>
        <div className="cck-card p-4">
          <p className="text-xs text-muted">{t('students.termGpa')}</p>
          <p className={`text-2xl font-bold ${gpaColor(s.gpa_term)}`}>{s.gpa_term.toFixed(2)}</p>
        </div>
        <div className="cck-card p-4">
          <p className="text-xs text-muted">{t('students.credits')}</p>
          <p className="cck-title">{s.credits_completed}<span className="text-sm text-muted font-normal">/{s.credits_required}</span></p>
          <div className="w-full bg-canvas rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full bg-pair-500" style={{ width: `${Math.min(100, (s.credits_completed / s.credits_required) * 100)}%` }} />
          </div>
        </div>
        <div className="cck-card p-4">
          <p className="text-xs text-muted">{t('students.balance')}</p>
          <p className={`text-2xl font-bold ${s.finance.balance > 0 ? 'text-danger-600' : 'text-ink'}`}>{kwd(s.finance.balance)}</p>
        </div>
      </div>

      {/* AI Summary (shell) */}
      <div className="cck-card p-6 mb-6">
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-sm bg-pair-500 text-white flex items-center justify-center shrink-0"><SparklesIcon className="w-4 h-4" /></span>
            <h2 className="text-lg font-semibold">{t('students.sectionAiSummary')}</h2>
            <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-sm bg-pair-50 text-pair-700 border border-pair-100">
              {t('students.aiSummaryBadge')}
            </span>
          </div>
          <button
            type="button"
            disabled
            className="text-sm px-3 py-1.5 rounded-sm bg-pair-500 text-white font-medium opacity-60 cursor-not-allowed"
          >
            {t('students.aiSummaryGenerate')}
          </button>
        </div>
        <p className="text-sm text-muted mb-5">{t('students.aiSummaryEmpty')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {([
            'aiSummaryOverview', 'aiSummaryStrengths', 'aiSummaryRisks', 'aiSummaryActions',
          ] as const).map((key) => (
            <div key={key}>
              <p className="text-xs font-semibold text-muted mb-2">{t(`students.${key}`)}</p>
              <div className="space-y-2">
                <div className="h-3 rounded-sm bg-canvas animate-pulse w-full" />
                <div className="h-3 rounded-sm bg-canvas animate-pulse w-11/12" />
                <div className="h-3 rounded-sm bg-canvas animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-6">{t('students.aiSummaryDisclaimer')}</p>
      </div>

      {/* Identity */}
      <div className="cck-card p-6 mb-6">
        <SectionHeader title={t('students.sectionAcademic')} source="sis" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
          <div><p className="text-muted text-xs">{t('students.civilId')}</p><p className="font-medium">{s.national_id}</p></div>
          <div><p className="text-muted text-xs">{t('students.email')}</p><p className="font-medium break-all">{s.email}</p></div>
          <div><p className="text-muted text-xs">{t('students.phone')}</p><p className="font-medium" dir="ltr">{s.phone}</p></div>
          <div><p className="text-muted text-xs">{t('students.cohort')}</p><p className="font-medium">{s.cohort_year}</p></div>
          <div><p className="text-muted text-xs">{t('students.advisor')}</p><p className="font-medium">{isAr ? s.advisor_ar : s.advisor_en}</p></div>
          <div><p className="text-muted text-xs">{t('students.funding')}</p><p className="font-medium">{t(`students.funding.${s.funding}`)}</p></div>
          <div className="col-span-2"><p className="text-muted text-xs">{t('students.address')}</p><p className="font-medium">{isAr ? s.address_ar : s.address_en}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* GPA History */}
        <div className="cck-card p-6">
          <SectionHeader title={t('students.sectionGpaHistory')} source="sis" />
          <table className="w-full text-sm">
            <thead>
              <tr className={`${thAlign} text-muted border-b`}>
                <th className="pb-2 font-medium">{t('students.term')}</th>
                <th className="pb-2 font-medium">{t('students.colGpa')}</th>
                <th className="pb-2 font-medium">{t('students.credits')}</th>
                <th className="pb-2 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody>
              {s.gpa_history.map((g) => (
                <tr key={g.term} className="border-b border-line">
                  <td className="py-2">{g.term}</td>
                  <td className={`py-2 font-medium ${gpaColor(g.gpa)}`}>{g.gpa.toFixed(2)}</td>
                  <td className="py-2">{g.credits}</td>
                  <td className="py-2 text-xs text-muted">{isAr ? g.status_ar : g.status_en}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Transcript */}
        <div className="cck-card p-6">
          <SectionHeader title={t('students.sectionTranscript')} source="sis" />
          <table className="w-full text-sm">
            <thead>
              <tr className={`${thAlign} text-muted border-b`}>
                <th className="pb-2 font-medium">{t('students.course')}</th>
                <th className="pb-2 font-medium">{t('students.credits')}</th>
                <th className="pb-2 font-medium">{t('students.grade')}</th>
                <th className="pb-2 font-medium">{t('students.points')}</th>
              </tr>
            </thead>
            <tbody>
              {s.transcript.map((c, i) => (
                <tr key={`${c.course_code}-${i}`} className="border-b border-line">
                  <td className="py-2">
                    <span className="font-medium">{c.course_code}</span>
                    <span className="block text-xs text-muted">{isAr ? c.course_ar : c.course_en} · {c.term}</span>
                  </td>
                  <td className="py-2">{c.credits}</td>
                  <td className="py-2 font-semibold">{c.grade}</td>
                  <td className="py-2 text-muted">{c.points.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warnings & Holds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="cck-card p-6">
          <SectionHeader title={t('students.sectionWarnings')} source="sis" />
          {s.warnings.length === 0 ? (
            <p className="text-sm text-muted">{t('students.noWarnings')}</p>
          ) : (
            <div className="space-y-3">
              {s.warnings.map((w) => (
                <div key={w.id} className="border border-line rounded-sm p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-sm">{isAr ? w.type_ar : w.type_en}</span>
                    <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${severityColor(w.severity)}`}>
                      {t(`students.warningStatus.${w.status}`)}
                    </span>
                  </div>
                  <p className="text-sm text-body">{isAr ? w.detail_ar : w.detail_en}</p>
                  <p className="text-xs text-muted mt-1">{w.id} · {w.term} · {fmtDate(w.date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cck-card p-6">
          <SectionHeader title={t('students.sectionHolds')} source="sis" />
          {activeHolds.length === 0 ? (
            <p className="text-sm text-muted">{t('students.noHolds')}</p>
          ) : (
            <div className="space-y-3">
              {s.holds.map((h, i) => (
                <div key={i} className={`border rounded-sm p-3 ${h.active ? 'border-danger-200 bg-danger-50' : 'border-line'}`}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-sm">{isAr ? h.type_ar : h.type_en}</span>
                    <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${h.active ? 'bg-danger-100 text-danger-700' : 'bg-canvas text-body'}`}>
                      {h.active ? t('students.holdActive') : t('students.holdCleared')}
                    </span>
                  </div>
                  <p className="text-sm text-body">{isAr ? h.reason_ar : h.reason_en}</p>
                  <p className="text-xs text-muted mt-1">{t('students.placedBy')}: {isAr ? h.placed_by_ar : h.placed_by_en} · {fmtDate(h.date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LMS Activity */}
      <div className="cck-card p-6 mb-6">
        <SectionHeader title={t('students.sectionLms')} source="lms" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {s.lms_courses.map((c) => (
            <div key={c.course_code} className="border border-line rounded-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{c.course_code}</span>
                <span className="text-xs text-muted">{t('students.lastAccess')}: {fmtDateTime(c.last_access)}</span>
              </div>
              <p className="text-xs text-muted mb-3">{isAr ? c.course_ar : c.course_en}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className={`text-lg font-bold ${rateColor(c.attendance_rate)}`}>{c.attendance_rate}%</p>
                  <p className="text-[11px] text-muted">{t('students.attendance')}</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{c.assignments_submitted}/{c.assignments_total}</p>
                  <p className="text-[11px] text-muted">{t('students.assignments')}</p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${rateColor(c.current_score)}`}>{c.current_score}%</p>
                  <p className="text-[11px] text-muted">{t('students.currentScore')}</p>
                </div>
              </div>
              <div className="w-full bg-canvas rounded-full h-1.5 mt-3">
                <div className={`h-1.5 rounded-full ${rateBar(c.attendance_rate)}`} style={{ width: `${c.attendance_rate}%` }} />
              </div>
              <div className="border-t border-line mt-3 pt-3">
                <div className="grid grid-cols-2 gap-3 text-center mb-3">
                  <div>
                    <p className={`text-lg font-bold ${rateColor(c.midterm_score)}`}>{c.midterm_score}</p>
                    <p className="text-[11px] text-muted">{t('students.midtermGrade')}</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${rateColor(c.final_score)}`}>{c.final_score}</p>
                    <p className="text-[11px] text-muted">{t('students.finalGrade')}</p>
                  </div>
                </div>
                <p className="text-[11px] font-medium text-muted mb-1.5">{t('students.scoreBreakdown')}</p>
                <div className="space-y-1">
                  {c.score_breakdown.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-body">{isAr ? b.label_ar : b.label_en}</span>
                      <span className="flex items-center gap-2">
                        <span className={`font-medium ${rateColor((b.score / b.max) * 100)}`}>{b.score}/{b.max}</span>
                        <span className="text-muted tabular-nums">{b.weight}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Hub App Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="cck-card p-6">
          <SectionHeader title={t('students.sectionApp')} source="app" />
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-canvas rounded-sm py-3">
              <p className="text-lg font-bold">{s.app_logins_30d}</p>
              <p className="text-[11px] text-muted">{t('students.logins30d')}</p>
            </div>
            <div className="bg-canvas rounded-sm py-3">
              <p className="text-lg font-bold">{s.ai_conversations}</p>
              <p className="text-[11px] text-muted">{t('students.aiChats')}</p>
            </div>
            <div className="bg-canvas rounded-sm py-3">
              <p className="text-xs font-bold mt-1">{fmtDate(s.app_last_login)}</p>
              <p className="text-[11px] text-muted">{t('students.lastLogin')}</p>
            </div>
          </div>
          <p className="text-xs font-medium text-muted mb-2">{t('students.activityTimeline')}</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {s.app_timeline.map((e, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-xs text-muted w-24 shrink-0">{fmtDateTime(e.date)}</span>
                <span className="text-body">{isAr ? e.action_ar : e.action_en}</span>
                <span className="text-[10px] text-muted ms-auto shrink-0 self-center">{t(`students.channel.${e.channel}` as const)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service Requests */}
        <div className="cck-card p-6">
          <SectionHeader title={t('students.sectionRequests')} source="app" />
          {s.requests.length === 0 ? (
            <p className="text-sm text-muted">{t('students.noRequests')}</p>
          ) : (
            <div className="space-y-2">
              {s.requests.map((r) => (
                <Link key={r.id} href="/requests" className="flex items-center justify-between p-3 rounded-sm border border-line hover:bg-canvas">
                  <div>
                    <p className="text-sm font-medium">{isAr ? r.type_ar : r.type_en}</p>
                    <p className="text-xs text-muted">{r.id} · {fmtDate(r.submitted_at)}</p>
                  </div>
                  <span className="text-xs text-muted">{t(`students.requestStatus.${r.status}`)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Finance */}
      <div className="cck-card p-6">
        <SectionHeader title={t('students.sectionFinance')} source="sis" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm items-end">
          <div><p className="text-muted text-xs">{t('students.totalPayable')}</p><p className="font-semibold">{kwd(s.finance.total_payable)}</p></div>
          <div><p className="text-muted text-xs">{t('students.paid')}</p><p className="font-semibold text-ink">{kwd(s.finance.paid_amount)}</p></div>
          <div><p className="text-muted text-xs">{t('students.balance')}</p><p className={`font-semibold ${s.finance.balance > 0 ? 'text-danger-600' : 'text-ink'}`}>{kwd(s.finance.balance)}</p></div>
          <div><p className="text-muted text-xs">{t('students.lateFee')}</p><p className="font-semibold">{kwd(s.finance.late_fee)}</p></div>
          <div>
            <p className="text-muted text-xs">{t('students.financeStanding')}</p>
            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-sm text-xs font-medium ${s.finance.standing === 'cleared' ? 'cck-chip-positive' : s.finance.standing === 'hold' ? 'cck-chip-negative' : 'cck-chip-neutral'}`}>
              {t(`students.standing.${s.finance.standing}`)}
            </span>
          </div>
        </div>
        <Link href="/finance" className="text-sm text-pair-600 hover:underline mt-4 inline-flex items-center gap-1">
          {t('students.viewInFinance')} <ChevronIcon dir="end" className="w-3.5 h-3.5 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
