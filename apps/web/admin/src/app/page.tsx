'use client';

import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ConfirmDialog from '@/components/ConfirmDialog';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import PageHeader from '@/components/PageHeader';
import {
  UsersIcon, InboxIcon, CalendarIcon, AlertIcon, TrophyIcon, MegaphoneIcon, ChevronIcon,
} from '@/components/icons';
import { api, type SemesterRecord } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { canAccess } from '@/lib/roles';

interface QueueRow {
  key: string;
  label_en: string;
  label_ar: string;
  href: string;
  open: number;
  in_progress: number;
  completed: number;
}

interface AlertRow {
  id: string;
  type: string;
  student_name_en: string;
  student_name_ar: string;
  age_days: number;
  overdue: boolean;
}

interface ActivityRow {
  id: string;
  label_en: string;
  label_ar: string;
  timestamp: string;
}

interface Dashboard {
  stats: {
    assigned_to_me: number;
    open: number;
    due_today: number;
    overdue: number;
    completed_this_week: number;
  };
  queues: QueueRow[];
  alerts: AlertRow[];
  recent_activity: ActivityRow[];
}

interface DigestStatus {
  cadence: string;
  day: string;
  day_ar: string;
  last_sent_at: string;
  next_run_at: string;
  recipients: number;
}

/* Stat cards are monochrome. The only colour a KPI may carry is red, and
 * only when the number itself is a problem (e.g. overdue > 0). */
function StatCard({
  label, value, Icon, negative = false,
}: {
  label: string;
  value: number;
  Icon: ComponentType<{ className?: string }>;
  negative?: boolean;
}) {
  return (
    <div className="cck-card p-5 transition-colors duration-150 hover:border-line-strong">
      <div className="flex items-start justify-between gap-2">
        <p className="cck-eyebrow leading-tight pt-0.5">
          {label}
        </p>
        <Icon aria-hidden className="w-4 h-4 shrink-0 text-muted/50" />
      </div>
      <p className={`text-3xl font-bold mt-3 tabular-nums ${negative ? 'text-danger-600' : 'text-ink'}`}>
        {value}
      </p>
    </div>
  );
}

/* Stacked proportion bar: single green hue, dark→light, grey for waiting. */
function ShareBar({ inProgress, pending, completed }: { inProgress: number; pending: number; completed: number }) {
  const total = inProgress + pending + completed || 1;
  const seg = (n: number, cls: string) =>
    n > 0 ? <span className={cls} style={{ width: `${(n / total) * 100}%` }} /> : null;
  return (
    <span className="flex h-1.5 w-full overflow-hidden bg-line rounded-sm">
      {seg(completed, 'bg-pair-600')}
      {seg(inProgress, 'bg-pair-300')}
      {seg(pending, 'bg-line-strong')}
    </span>
  );
}

export default function StaffDashboardPage() {
  const { t, locale, dir } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isError, refetch } = useQuery<Dashboard>({
    queryKey: ['staff', 'dashboard'],
    queryFn: () => api.getStaffDashboard() as Promise<Dashboard>,
  });
  const { data: semesters } = useQuery<SemesterRecord[]>({
    queryKey: ['semesters'],
    queryFn: () => api.getSemesters() as Promise<SemesterRecord[]>,
  });
  const { data: digest } = useQuery<DigestStatus>({
    queryKey: ['manager-digest'],
    queryFn: () => api.getManagerDigestStatus() as Promise<DigestStatus>,
  });

  const activeKey = semesters?.find((s) => s.status === 'active')?.key ?? '';
  const [semesterKey, setSemesterKey] = useState<string>('');
  const selectedKey = semesterKey || activeKey;
  const selectedSemester = useMemo(
    () => semesters?.find((s) => s.key === selectedKey),
    [semesters, selectedKey],
  );
  const isArchived = selectedSemester?.status === 'closed';

  const [closeOpen, setCloseOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const pendingForActive = data ? (data.stats.open ?? 0) : 0;

  const closeSemester = async () => {
    if (!selectedSemester) return;
    setBusy(true);
    try {
      await api.closeSemester(selectedSemester.key);
      qc.setQueryData<SemesterRecord[]>(['semesters'], (prev) =>
        prev?.map((s) => s.key === selectedSemester.key ? { ...s, status: 'closed' } : s) ?? prev,
      );
      setCloseOpen(false);
      setToast(t('dashboard.semesterClosed') + ' · ' + (locale === 'ar' ? selectedSemester.label_ar : selectedSemester.label_en));
      setTimeout(() => setToast(null), 3500);
    } finally {
      setBusy(false);
    }
  };

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;
  if (!data) return <SkeletonPage stats={5} />;

  const fmtDate = (iso: string) => new Date(iso).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
  const fmtShort = (iso: string) => new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  // Only surface the queues this department can actually open
  const visibleQueues = data.queues.filter((q) => canAccess(user?.role, q.href));
  const showAlerts = canAccess(user?.role, '/requests');

  const queueTotals = visibleQueues.reduce(
    (acc, q) => {
      acc.in_progress += q.in_progress;
      acc.pending += q.open - q.in_progress;
      acc.completed += q.completed;
      return acc;
    },
    { in_progress: 0, pending: 0, completed: 0 },
  );

  const activeAlerts = data.alerts.length;

  return (
    <div dir={dir}>
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        actions={
          <p className="hidden md:block text-xs italic text-muted max-w-[14rem] text-end">
            {t('brand.tagline')}
          </p>
        }
      />

      {/* ── Semester command bar + close-semester guard ───────────────────── */}
      {semesters && semesters.length > 0 && (
        <section className="mb-6 cck-card relative overflow-hidden">
          <span aria-hidden className="absolute inset-y-0 start-0 w-0.5 bg-pine" />
          <div className="flex flex-wrap items-center gap-4 justify-between p-4 ps-5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="cck-eyebrow">
                {t('dashboard.semester')}
              </span>
              <select
                value={selectedKey}
                onChange={(e) => setSemesterKey(e.target.value)}
                className="cck-select w-auto min-w-[13rem] font-medium"
              >
                {semesters.map((s) => (
                  <option key={s.key} value={s.key}>
                    {locale === 'ar' ? s.label_ar : s.label_en}
                    {s.status === 'active' ? ` · ${t('dashboard.semesterActive')}` : ` · ${t('dashboard.semesterClosed')}`}
                  </option>
                ))}
              </select>
              <span
                className={`cck-badge ${
                  selectedSemester?.status === 'active'
                    ? 'cck-chip-positive'
                    : 'cck-chip-neutral'
                }`}
              >
                <span
                  aria-hidden
                  className={`w-1.5 h-1.5 rounded-full ${
                    selectedSemester?.status === 'active' ? 'bg-pair-600' : 'bg-line-strong'
                  }`}
                />
                {selectedSemester?.status === 'active'
                  ? t('dashboard.semesterActive')
                  : t('dashboard.semesterArchived')}
              </span>
            </div>

            {selectedSemester?.status === 'active' && (
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-sm ${
                    pendingForActive === 0 ? 'cck-chip-positive' : 'cck-chip-neutral'
                  }`}
                >
                  {pendingForActive === 0
                    ? <TrophyIcon className="w-4 h-4 shrink-0" />
                    : <AlertIcon className="w-4 h-4 shrink-0" />}
                  {pendingForActive === 0
                    ? t('dashboard.closeSemesterReady')
                    : t('dashboard.closeSemesterBlocked', { value: pendingForActive })}
                </span>
                <button
                  type="button"
                  onClick={() => setCloseOpen(true)}
                  disabled={pendingForActive > 0 || busy}
                  className="btn btn-primary btn-sm"
                >
                  {t('dashboard.closeSemester')}
                </button>
              </div>
            )}
          </div>
          {isArchived && selectedSemester && (
            <p className="px-4 ps-5 pb-3 -mt-1 text-xs text-muted">
              {t('dashboard.semesterClosedNotice', {
                value: locale === 'ar' ? selectedSemester.label_ar : selectedSemester.label_en,
              })}
            </p>
          )}
        </section>
      )}

      {toast && (
        <div role="status" aria-live="polite" className="mb-4 bg-pair-50 border border-pair-200 rounded-sm px-4 py-2 text-sm text-pair-700">
          {toast}
        </div>
      )}

      {/* ── KPI row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label={t('dashboard.assignedToMe')} value={data.stats.assigned_to_me} Icon={UsersIcon} />
        <StatCard label={t('dashboard.openItems')} value={data.stats.open} Icon={InboxIcon} />
        <StatCard label={t('dashboard.dueToday')} value={data.stats.due_today} Icon={CalendarIcon} />
        <StatCard label={t('dashboard.overdue')} value={data.stats.overdue} Icon={AlertIcon} negative={data.stats.overdue > 0} />
        <StatCard label={t('dashboard.completedThisWeek')} value={data.stats.completed_this_week} Icon={TrophyIcon} />
      </div>

      {/* ── Weekly manager digest strip ───────────────────────────────────── */}
      {digest && (
        <section className="mb-6 cck-card px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <MegaphoneIcon aria-hidden className="w-[18px] h-[18px] shrink-0 text-muted/60" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{t('dashboard.managerDigest')}</p>
              <p className="text-xs text-muted mt-0.5">
                {t('dashboard.managerDigestDesc', {
                  day: locale === 'ar' ? digest.day_ar : digest.day,
                  value: fmtShort(digest.last_sent_at),
                })}
              </p>
            </div>
          </div>
          <span className="inline-flex items-baseline gap-1.5 text-xs px-2.5 py-1 rounded-sm cck-chip-neutral font-medium shrink-0">
            <span className="font-bold tabular-nums text-sm">{digest.recipients}</span>
            {t('dashboard.managerDigestRecipients')}
          </span>
        </section>
      )}

      {/* ── Workflow status + deadline alerts ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className={`${showAlerts ? 'lg:col-span-2' : 'lg:col-span-3'} cck-card overflow-hidden`}>
          <div className="flex items-start justify-between gap-3 p-6 pb-4 border-b border-line">
            <div>
              <h2 className="text-lg font-semibold text-ink leading-tight">{t('dashboard.workflowStatus')}</h2>
              <p className="text-xs text-muted mt-0.5">{t('dashboard.workflowCaption')}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="cck-table">
              <thead>
                <tr>
                  <th>{t('requests.type')}</th>
                  <th className="text-center">{t('dashboard.queueInProgress')}</th>
                  <th className="text-center">{t('dashboard.queuePending')}</th>
                  <th className="text-center">{t('dashboard.queueCompleted')}</th>
                  <th className="hidden md:table-cell w-[140px]">{t('dashboard.queueMix')}</th>
                  <th className="text-end"><span className="sr-only">{t('common.actions')}</span></th>
                </tr>
              </thead>
              <tbody>
                {visibleQueues.map((q) => {
                  const pending = q.open - q.in_progress;
                  return (
                    <tr key={q.key} className="group hover:bg-pair-50/60 transition-colors">
                      <td className="font-semibold text-ink whitespace-nowrap">
                        {locale === 'ar' ? q.label_ar : q.label_en}
                      </td>
                      <td className="text-center tabular-nums font-semibold text-ink">{q.in_progress}</td>
                      <td className="text-center tabular-nums text-body">{pending}</td>
                      <td className="text-center tabular-nums text-muted">{q.completed}</td>
                      <td className="hidden md:table-cell">
                        <ShareBar inProgress={q.in_progress} pending={pending} completed={q.completed} />
                      </td>
                      <td className="text-end whitespace-nowrap">
                        <Link
                          href={q.href}
                          className="inline-flex items-center gap-1 text-pair-600 group-hover:text-pair-700 text-sm font-semibold"
                        >
                          {t('dashboard.openQueue')}
                          <ChevronIcon
                            dir={dir === 'rtl' ? 'start' : 'end'}
                            className="w-4 h-4 text-leaf transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                          />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-line-strong">
                  <td className="font-bold text-ink uppercase text-[11px] tracking-wide">{t('dashboard.allQueues')}</td>
                  <td className="text-center font-bold text-ink tabular-nums">{queueTotals.in_progress}</td>
                  <td className="text-center font-bold text-ink tabular-nums">{queueTotals.pending}</td>
                  <td className="text-center font-bold text-ink tabular-nums">{queueTotals.completed}</td>
                  <td className="hidden md:table-cell">
                    <ShareBar inProgress={queueTotals.in_progress} pending={queueTotals.pending} completed={queueTotals.completed} />
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {showAlerts && (
        <section className="cck-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-3 p-6 pb-4 border-b border-line">
            <h2 className="text-lg font-semibold text-ink leading-tight">{t('dashboard.deadlineAlerts')}</h2>
            {activeAlerts > 0 && (
              <span className="cck-badge cck-chip-negative shrink-0">
                {t('dashboard.alertsActive', { value: activeAlerts })}
              </span>
            )}
          </div>
          {data.alerts.length === 0 ? (
            <div className="p-6">
              <EmptyState title={t('dashboard.noAlerts')} />
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {data.alerts.map((a) => {
                const overdueDays = a.age_days - 5;
                return (
                  <li key={a.id} className="relative">
                    {a.overdue && <span aria-hidden className="absolute inset-y-0 start-0 w-0.5 bg-danger-500" />}
                    <Link
                      href={`/requests/${a.id}`}
                      className="flex items-start justify-between gap-3 px-6 py-3 transition-colors hover:bg-canvas"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-ink text-sm hover:text-pair-700 truncate block tabular-nums">
                          {a.id}
                        </span>
                        <p className="text-xs text-muted truncate mt-0.5">
                          {locale === 'ar' ? a.student_name_ar : a.student_name_en} · {t(`requestType.${a.type}`)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-sm shrink-0 tabular-nums ${
                        a.overdue ? 'cck-chip-negative' : 'cck-chip-neutral'
                      }`}>
                        {a.overdue && <AlertIcon className="w-3 h-3 shrink-0" />}
                        {a.overdue
                          ? t('dashboard.daysOverdue', { value: overdueDays })
                          : t('dashboard.dueIn', { value: `${5 - a.age_days}d` })}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        )}
      </div>

      {/* ── Recent activity timeline ──────────────────────────────────────── */}
      <section className="mt-6 cck-card overflow-hidden">
        <div className="p-6 pb-4 border-b border-line">
          <h2 className="text-lg font-semibold text-ink leading-tight">{t('dashboard.recentActivity')}</h2>
          <p className="text-xs text-muted mt-0.5">{t('dashboard.activityCaption')}</p>
        </div>
        {data.recent_activity.length === 0 ? (
          <div className="p-6">
            <EmptyState title={t('dashboard.noActivity')} />
          </div>
        ) : (
          <ul className="p-6 ps-7">
            {data.recent_activity.map((a, i) => {
              const last = i === data.recent_activity.length - 1;
              return (
                <li key={a.id} className="relative flex gap-4 ps-5 pb-5 last:pb-0">
                  {!last && <span aria-hidden className="absolute start-[3px] top-2.5 bottom-0 w-px bg-line" />}
                  <span aria-hidden className="absolute start-0 top-1.5 w-[7px] h-[7px] rounded-full bg-pair-600 ring-4 ring-panel" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-body leading-snug">{locale === 'ar' ? a.label_ar : a.label_en}</p>
                    <p className="text-xs text-muted mt-0.5 tabular-nums">{fmtDate(a.timestamp)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={closeOpen}
        title={t('dashboard.closeSemesterConfirm.title', {
          value: selectedSemester
            ? (locale === 'ar' ? selectedSemester.label_ar : selectedSemester.label_en)
            : '',
        })}
        message={t('dashboard.closeSemesterConfirm.message')}
        confirmLabel={t('dashboard.closeSemesterConfirm.confirm')}
        cancelLabel={t('dashboard.closeSemesterConfirm.keep')}
        variant="danger"
        onConfirm={closeSemester}
        onCancel={() => setCloseOpen(false)}
      />
    </div>
  );
}
