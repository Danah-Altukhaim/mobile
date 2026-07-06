'use client';

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type ITTicket, type ITCategory } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import StatusBadge, { type LifecycleStatus } from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';

const IT_KEY = ['it', 'tickets'] as const;
const CATEGORIES: (ITCategory | 'all')[] = ['all', 'account_access', 'sis_lms', 'device'];

const toLifecycle = (s: ITTicket['status']): LifecycleStatus =>
  s === 'open' ? 'not_started'
  : s === 'in_progress' ? 'pending'
  : 'completed';

const CATEGORY_STYLE: Record<ITCategory, string> = {
  account_access: 'cck-chip-neutral',
  sis_lms: 'cck-chip-neutral',
  device: 'cck-chip-neutral',
};

export default function ITHelpdeskPage() {
  const { t, locale, dir } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: tickets, isError, isLoading, refetch } = useQuery<ITTicket[]>({
    queryKey: IT_KEY,
    queryFn: () => api.getITTickets() as Promise<ITTicket[]>,
  });
  const [category, setCategory] = useState<ITCategory | 'all'>('all');
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(
    () => !tickets ? [] : category === 'all' ? tickets : tickets.filter((x) => x.category === category),
    [tickets, category],
  );

  const setStatus = async (id: string, status: ITTicket['status']) => {
    setBusy(id + status);
    try {
      await api.updateITTicketStatus(id, status);
      qc.setQueryData<ITTicket[]>(IT_KEY, (prev) =>
        prev?.map((x) => x.id === id ? { ...x, status } : x) ?? prev);
    } finally {
      setBusy(null);
    }
  };

  const assignToMe = async (id: string) => {
    if (!user) return;
    setBusy(id + 'assign');
    try {
      await api.assignITTicket(id, { en: user.name_en, ar: user.name_ar });
      qc.setQueryData<ITTicket[]>(IT_KEY, (prev) =>
        prev?.map((x) => x.id === id
          ? { ...x, assigned_to_en: user.name_en, assigned_to_ar: user.name_ar, status: x.status === 'open' ? 'in_progress' : x.status }
          : x) ?? prev);
    } finally {
      setBusy(null);
    }
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;

  const openCount = tickets?.filter((x) => x.status !== 'resolved').length ?? 0;

  return (
    <div dir={dir}>
      <PageHeader title={t('itHelpdesk.title')} subtitle={t('itHelpdesk.subtitle')} />

      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-sm text-sm font-medium border ${
              category === c
                ? 'bg-pair-600 text-white border-pair-600'
                : 'bg-white text-muted border-line-strong hover:bg-canvas'
            }`}
          >
            {c === 'all' ? `${t('itHelpdesk.allCategories')} · ${openCount}` : t(`itHelpdesk.category.${c}`)}
          </button>
        ))}
      </div>

      {isLoading || !tickets ? (
        <SkeletonTable rows={5} cols={6} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t('common.noData')} />
      ) : (
        <div className="cck-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted border-b bg-canvas">
                <th className="px-4 py-3 text-start font-medium">{t('itHelpdesk.ticket')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('requests.student')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('itHelpdesk.problem')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('itHelpdesk.origin')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('common.status')}</th>
                <th className="px-4 py-3 text-end font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((x) => (
                <tr key={x.id} className="border-b border-line last:border-0 align-top">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-ink">{x.id}</p>
                    <p className="text-xs text-muted mt-0.5">{fmtDate(x.created_at)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{locale === 'ar' ? x.student_name_ar : x.student_name_en}</p>
                    <p className="text-xs text-muted">{x.student_id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 rounded-sm text-[11px] font-medium ${CATEGORY_STYLE[x.category]}`}>
                      {t(`itHelpdesk.category.${x.category}`)}
                    </span>
                    <p className="text-ink mt-1">{t(`itHelpdesk.problem.${x.problem_key}`)}</p>
                    <p className="text-xs text-muted mt-0.5">{x.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-sm text-xs font-medium bg-canvas text-ink">
                      {t(`dept.${x.origin_department}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={toLifecycle(x.status)} />
                    {x.assigned_to_en && (
                      <p className="text-xs text-muted mt-1">
                        {locale === 'ar' ? x.assigned_to_ar : x.assigned_to_en}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-end">
                    {x.status !== 'resolved' && (
                      <div className="flex flex-col items-end gap-1.5">
                        {!x.assigned_to_en && (
                          <button
                            onClick={() => assignToMe(x.id)}
                            disabled={busy === x.id + 'assign'}
                            className="btn btn-outline btn-sm"
                          >
                            {t('itHelpdesk.assignToMe')}
                          </button>
                        )}
                        <button
                          onClick={() => setStatus(x.id, 'resolved')}
                          disabled={busy === x.id + 'resolved'}
                          className="px-2.5 py-1 bg-pair-600 text-white rounded-sm text-xs font-medium hover:bg-pair-700 disabled:opacity-50"
                        >
                          {t('itHelpdesk.markResolved')}
                        </button>
                      </div>
                    )}
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
