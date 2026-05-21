'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '@/components/Card';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';

interface PaymentData {
  total_billed: number;
  total_collected: number;
  collection_rate: number;
  outstanding_balance: number;
  by_cohort: { cohort: string; billed: number; collected: number; rate: number }[];
  by_method: { method: string; count: number; amount: number; percentage: number }[];
  overdue_by_college: { college: string; students: number; amount: number }[];
}

type OverdueSortKey = 'students' | 'amount';
type SortDir = 'asc' | 'desc';

export default function PaymentsPage() {
  const { t, locale } = useI18n();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const { data, isError, refetch } = useQuery<PaymentData>({
    queryKey: ['payments', 'analytics'],
    queryFn: () => api.getPaymentAnalytics() as Promise<PaymentData>,
  });
  const [overdueSortKey, setOverdueSortKey] = useState<OverdueSortKey>('amount');
  const [overdueSortDir, setOverdueSortDir] = useState<SortDir>('desc');

  const toggleOverdueSort = (key: OverdueSortKey) => {
    if (overdueSortKey === key) {
      setOverdueSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOverdueSortKey(key);
      setOverdueSortDir('desc');
    }
  };

  const sortedOverdue = useMemo(() => {
    if (!data) return [];
    return [...data.overdue_by_college].sort((a, b) => {
      const mul = overdueSortDir === 'asc' ? 1 : -1;
      return (a[overdueSortKey] - b[overdueSortKey]) * mul;
    });
  }, [data, overdueSortKey, overdueSortDir]);

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;
  if (!data) return <SkeletonPage />;

  const fmt = (n: number) => (n / 1000000).toFixed(1) + 'M KWD';

  const sortArrow = (key: OverdueSortKey) => {
    if (overdueSortKey !== key) return ' \u2195';
    return overdueSortDir === 'asc' ? ' \u2191' : ' \u2193';
  };

  const textAlign = locale === 'ar' ? 'text-right' : 'text-left';

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-6">{t('payments.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card title={t('payments.totalBilled')} value={fmt(data.total_billed)} />
        <Card title={t('payments.totalCollected')} value={fmt(data.total_collected)} />
        <Card title={t('payments.collectionRate')} value={`${data.collection_rate}%`} />
        <Card title={t('payments.outstanding')} value={fmt(data.outstanding_balance)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">{t('payments.byCohort')}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className={`${textAlign} text-gray-500 border-b`}>
                <th className="pb-2">{t('payments.cohort')}</th>
                <th className="pb-2">{t('payments.billed')}</th>
                <th className="pb-2">{t('payments.collected')}</th>
                <th className="pb-2">{t('payments.rate')}</th>
              </tr>
            </thead>
            <tbody>
              {data.by_cohort.map((c) => (
                <tr key={c.cohort} className="border-b border-gray-50">
                  <td className="py-3">{t('engagement.classOf', { value: c.cohort })}</td>
                  <td className="py-3">{fmt(c.billed)}</td>
                  <td className="py-3">{fmt(c.collected)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.rate >= 90 ? 'bg-oasis-100 text-oasis-700' : c.rate >= 80 ? 'bg-gold-100 text-gold-700' : 'bg-danger-100 text-danger-700'}`}>
                      {c.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">{t('payments.methods')}</h2>
          <div className="space-y-4">
            {data.by_method.map((m) => (
              <div key={m.method}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{t(m.method)}</span>
                  <span className="text-gray-500">{m.count.toLocaleString()} {t('payments.transactions')} &middot; {(m.amount / 1000000).toFixed(1)}M KWD</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-pair-500 h-3 rounded-full" style={{ width: `${m.percentage}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{m.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">{t('payments.overdueByCollege')}</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className={`${textAlign} text-gray-500 border-b`}>
              <th className="pb-2">{t('payments.college')}</th>
              <th className="pb-2 cursor-pointer select-none hover:text-gray-700" onClick={() => toggleOverdueSort('students')}>
                {t('payments.students')}{sortArrow('students')}
              </th>
              <th className="pb-2 cursor-pointer select-none hover:text-gray-700" onClick={() => toggleOverdueSort('amount')}>
                {t('payments.outstandingAmount')}{sortArrow('amount')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedOverdue.map((c) => (
              <tr key={c.college} className="border-b border-gray-50">
                <td className="py-3">{t(c.college)}</td>
                <td className="py-3">{c.students}</td>
                <td className="py-3 font-medium text-danger-600">{(c.amount / 1000).toFixed(0)}K KWD</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
