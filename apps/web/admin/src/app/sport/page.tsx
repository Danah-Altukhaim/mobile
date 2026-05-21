'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type SportApplication } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

const STATUS_STYLE: Record<SportApplication['status'], string> = {
  pending: 'bg-gold-50 text-gold-700',
  approved: 'bg-oasis-50 text-oasis-700',
  rejected: 'bg-danger-50 text-danger-700',
};

const SPORT_KEY = ['sport', 'applications'] as const;

export default function SportPage() {
  const { t, locale, dir } = useI18n();
  const qc = useQueryClient();
  const { data: apps, isError, isLoading, refetch } = useQuery<SportApplication[]>({
    queryKey: SPORT_KEY,
    queryFn: () => api.getSportApplications() as Promise<SportApplication[]>,
  });
  const [busy, setBusy] = useState<string | null>(null);

  const decide = async (id: string, decision: 'approved' | 'rejected') => {
    setBusy(id + decision);
    try {
      await api.decideSport(id, decision);
      qc.setQueryData<SportApplication[]>(SPORT_KEY, (prev) =>
        prev?.map((s) => s.id === id ? { ...s, status: decision } : s) ?? prev,
      );
    } finally {
      setBusy(null);
    }
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', year: '2-digit',
  });

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('sport.title')}</h1>
      <p className="text-sm text-[#737477] mb-6">{t('sport.subtitle')}</p>

      {isLoading || !apps ? (
        <SkeletonTable rows={3} cols={5} />
      ) : apps.length === 0 ? (
        <EmptyState title={t('common.noData')} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#737477] border-b bg-gray-50">
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
                <tr key={s.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{locale === 'ar' ? s.student_name_ar : s.student_name_en}</p>
                    <p className="text-xs text-[#737477]">{s.student_id} · {fmtDate(s.submitted_at)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[#222]">{s.activity}</p>
                    <span className={`mt-1 inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${
                      s.player_type === 'local_club' ? 'bg-pair-50 text-pair-700' : 'bg-gold-50 text-gold-700'
                    }`}>
                      {t(`sport.playerType.${s.player_type}`)}
                    </span>
                    {s.player_type === 'amateur' && s.coach_en && (
                      <p className="text-xs text-[#737477] mt-0.5">
                        {t('sport.coach')}: {locale === 'ar' ? s.coach_ar : s.coach_en}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-[#222] text-xs font-mono">{s.proof_doc}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{s.discount_pct}%</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[s.status]}`}>
                      {s.status === 'pending' ? t('status.pending')
                        : s.status === 'approved' ? t('status.approved')
                        : t('common.error')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    {s.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => decide(s.id, 'approved')}
                          disabled={busy === s.id + 'approved'}
                          className="px-2.5 py-1 bg-pair-600 text-white rounded text-xs font-medium hover:bg-pair-700 disabled:opacity-50"
                        >
                          {t('sport.approve')}
                        </button>
                        <button
                          onClick={() => decide(s.id, 'rejected')}
                          disabled={busy === s.id + 'rejected'}
                          className="px-2.5 py-1 border border-danger-200 text-danger-700 rounded text-xs hover:bg-danger-50 disabled:opacity-50"
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
    </div>
  );
}
