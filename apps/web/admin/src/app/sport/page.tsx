'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type SportApplication } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import RejectReasonDialog from '@/components/RejectReasonDialog';
import StatusBadge, { type LifecycleStatus } from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';

const toLifecycle = (s: SportApplication['status']): LifecycleStatus =>
  s === 'pending' ? 'not_started'
  : s === 'approved' ? 'completed'
  : 'rejected';

const SPORT_KEY = ['sport', 'applications'] as const;

export default function SportPage() {
  const { t, locale, dir } = useI18n();
  const qc = useQueryClient();
  const { data: apps, isError, isLoading, refetch } = useQuery<SportApplication[]>({
    queryKey: SPORT_KEY,
    queryFn: () => api.getSportApplications() as Promise<SportApplication[]>,
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<SportApplication | null>(null);

  const decide = async (id: string, decision: 'approved' | 'rejected', reason?: string) => {
    setBusy(id + decision);
    try {
      await api.decideSport(id, decision, reason);
      qc.setQueryData<SportApplication[]>(SPORT_KEY, (prev) =>
        prev?.map((s) => s.id === id ? { ...s, status: decision } : s) ?? prev,
      );
    } finally {
      setBusy(null);
    }
  };

  const confirmReject = async (reason: string) => {
    if (!rejectTarget) return;
    await decide(rejectTarget.id, 'rejected', reason);
    setRejectTarget(null);
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', year: '2-digit',
  });

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;

  return (
    <div dir={dir}>
      <PageHeader title={t('sport.title')} subtitle={t('sport.subtitle')} />

      {isLoading || !apps ? (
        <SkeletonTable rows={3} cols={5} />
      ) : apps.length === 0 ? (
        <EmptyState title={t('common.noData')} />
      ) : (
        <div className="cck-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted border-b bg-canvas">
                <th className="px-4 py-3 text-start font-medium">{t('requests.student')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('sport.activity')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('sport.proofDoc')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('sport.discountPct')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('common.status')}</th>
                <th className="px-4 py-3 text-end font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {apps.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{locale === 'ar' ? s.student_name_ar : s.student_name_en}</p>
                    <p className="text-xs text-muted">{s.student_id} · {fmtDate(s.submitted_at)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink">{s.activity}</p>
                    <span className="mt-1 inline-block px-1.5 py-0.5 rounded-sm text-[11px] font-medium cck-chip-neutral">
                      {t(`sport.playerType.${s.player_type}`)}
                    </span>
                    {s.player_type === 'amateur' && s.coach_en && (
                      <p className="text-xs text-muted mt-0.5">
                        {t('sport.coach')}: {locale === 'ar' ? s.coach_ar : s.coach_en}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-sm bg-canvas text-ink text-xs font-mono">{s.proof_doc}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{s.discount_pct}%</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={toLifecycle(s.status)} />
                  </td>
                  <td className="px-4 py-3 text-end">
                    {s.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => decide(s.id, 'approved')}
                          disabled={busy === s.id + 'approved'}
                          className="btn btn-primary btn-sm text-xs"
                        >
                          {t('sport.approve')}
                        </button>
                        <button
                          onClick={() => setRejectTarget(s)}
                          disabled={busy === s.id + 'rejected'}
                          className="btn btn-danger btn-sm"
                        >
                          {t('sport.reject')}
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

      <RejectReasonDialog
        open={rejectTarget !== null}
        title={t('sport.reject')}
        subject={rejectTarget
          ? `${locale === 'ar' ? rejectTarget.student_name_ar : rejectTarget.student_name_en} · ${rejectTarget.activity}`
          : undefined}
        busy={busy === (rejectTarget?.id ?? '') + 'rejected'}
        onConfirm={confirmReject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}
