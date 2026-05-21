'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Card from '@/components/Card';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

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

export default function StaffDashboardPage() {
  const { t, locale, dir } = useI18n();
  const { data, isError, refetch } = useQuery<Dashboard>({
    queryKey: ['staff', 'dashboard'],
    queryFn: () => api.getStaffDashboard() as Promise<Dashboard>,
  });

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;
  if (!data) return <SkeletonPage stats={5} />;

  const fmtDate = (iso: string) => new Date(iso).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div dir={dir}>
      <header className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pair-600">
          {t('brand.institution')}
        </p>
        <div className="flex items-end justify-between gap-4 mt-1.5">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#222] truncate">{t('dashboard.title')}</h1>
            <p className="text-sm text-[#737477] mt-1">{t('dashboard.subtitle')}</p>
          </div>
          <p className="hidden md:block text-xs italic text-[#737477] max-w-[14rem] text-end shrink-0">
            {t('brand.tagline')}
          </p>
        </div>
        <div className="mt-3 h-0.5 bg-pair-600/30" />
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card title={t('dashboard.assignedToMe')} value={data.stats.assigned_to_me.toString()} />
        <Card title={t('dashboard.openItems')} value={data.stats.open.toString()} />
        <Card title={t('dashboard.dueToday')} value={data.stats.due_today.toString()} />
        <Card title={t('dashboard.overdue')} value={data.stats.overdue.toString()} />
        <Card title={t('dashboard.completedThisWeek')} value={data.stats.completed_this_week.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('dashboard.workflowStatus')}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#737477] border-b">
                  <th className="text-start py-2 pe-4">{t('requests.type')}</th>
                  <th className="text-start py-2 pe-4">{t('dashboard.queueInProgress')}</th>
                  <th className="text-start py-2 pe-4">{t('dashboard.queuePending')}</th>
                  <th className="text-start py-2 pe-4">{t('dashboard.queueCompleted')}</th>
                  <th className="text-end py-2"><span className="sr-only">{t('common.actions')}</span></th>
                </tr>
              </thead>
              <tbody>
                {data.queues.map((q) => (
                  <tr key={q.key} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 font-medium">{locale === 'ar' ? q.label_ar : q.label_en}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-pair-50 text-pair-700 text-xs font-medium">
                        {q.in_progress}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-gold-50 text-gold-700 text-xs font-medium">
                        {q.open - q.in_progress}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-oasis-50 text-oasis-700 text-xs font-medium">
                        {q.completed}
                      </span>
                    </td>
                    <td className="py-3 text-end">
                      <Link href={q.href} className="text-pair-600 hover:text-pair-700 text-sm font-medium">
                        {t('dashboard.openQueue')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">{t('dashboard.deadlineAlerts')}</h2>
          {data.alerts.length === 0 ? (
            <EmptyState title={t('dashboard.noAlerts')} />
          ) : (
            <ul className="space-y-3">
              {data.alerts.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <Link href={`/requests/${a.id}`} className="font-medium text-[#222] hover:text-pair-600 truncate block">
                      {a.id}
                    </Link>
                    <p className="text-xs text-[#737477] truncate">
                      {locale === 'ar' ? a.student_name_ar : a.student_name_en} · {t(`requestType.${a.type}`)}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded shrink-0 ${
                    a.overdue ? 'bg-danger-50 text-danger-700' : 'bg-gold-50 text-gold-700'
                  }`}>
                    {a.overdue
                      ? t('dashboard.daysOverdue', { value: a.age_days - 5 })
                      : t('dashboard.dueIn', { value: `${5 - a.age_days}d` })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">{t('dashboard.recentActivity')}</h2>
        {data.recent_activity.length === 0 ? (
          <EmptyState title={t('dashboard.noActivity')} />
        ) : (
          <ul className="space-y-3">
            {data.recent_activity.map((a) => (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                <span className="w-1.5 h-1.5 mt-2 rounded-full bg-pair-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[#222]">{locale === 'ar' ? a.label_ar : a.label_en}</p>
                  <p className="text-xs text-[#737477] mt-0.5">{fmtDate(a.timestamp)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
