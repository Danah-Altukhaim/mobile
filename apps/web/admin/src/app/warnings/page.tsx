'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type AcademicWarning } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

const WARNINGS_KEY = ['warnings'] as const;

export default function WarningsPage() {
  const { t, locale, dir } = useI18n();
  const qc = useQueryClient();
  const { data: warnings, isError, isLoading, refetch } = useQuery<AcademicWarning[]>({
    queryKey: WARNINGS_KEY,
    queryFn: () => api.getWarnings() as Promise<AcademicWarning[]>,
  });
  const [busy, setBusy] = useState<string | null>(null);

  const markSigned = async (id: string) => {
    setBusy(id);
    try {
      await api.markWarningSigned(id);
      qc.setQueryData<AcademicWarning[]>(WARNINGS_KEY, (prev) =>
        prev?.map((w) => w.id === id ? { ...w, signed_at: new Date().toISOString() } : w) ?? prev,
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
      <h1 className="text-2xl font-bold mb-1">{t('warnings.title')}</h1>
      <p className="text-sm text-[#737477] mb-6">{t('warnings.subtitle')}</p>

      {isLoading || !warnings ? (
        <SkeletonTable rows={4} cols={5} />
      ) : warnings.length === 0 ? (
        <EmptyState title={t('common.noData')} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#737477] border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium">{t('requests.student')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('warnings.gpa')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('warnings.semester')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('warnings.notified')}</th>
                <th className="px-4 py-3 text-end font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {warnings.map((w) => (
                <tr key={w.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{locale === 'ar' ? w.name_ar : w.name_en}</p>
                    <p className="text-xs text-[#737477]">{w.student_id}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-danger-600">{w.gpa.toFixed(2)}</td>
                  <td className="px-4 py-3 text-[#737477]">{w.warning_semester}</td>
                  <td className="px-4 py-3 text-xs text-[#737477]">{fmtDate(w.notified_at)}</td>
                  <td className="px-4 py-3 text-end">
                    {w.signed_at ? (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-oasis-50 text-oasis-700">
                        ✓ {t('warnings.signed')} · {fmtDate(w.signed_at)}
                      </span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => markSigned(w.id)}
                          disabled={busy === w.id}
                          className="px-2.5 py-1 bg-pair-600 text-white rounded text-xs font-medium hover:bg-pair-700 disabled:opacity-50"
                        >
                          {t('warnings.markSigned')}
                        </button>
                        <button className="px-2.5 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50">
                          {t('warnings.resendNotification')}
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
