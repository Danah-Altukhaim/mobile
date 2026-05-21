'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Appeal } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

const APPEALS_KEY = ['appeals'] as const;
const APPEALS_RELEASE_KEY = ['appeals', 'release'] as const;

export default function AppealsPage() {
  const { t, locale, dir } = useI18n();
  const qc = useQueryClient();
  const appealsQ = useQuery<Appeal[]>({
    queryKey: APPEALS_KEY,
    queryFn: () => api.getAppeals() as Promise<Appeal[]>,
  });
  const releaseQ = useQuery<boolean>({
    queryKey: APPEALS_RELEASE_KEY,
    queryFn: async () => ((await api.getAppealsReleaseStatus()) as { released: boolean }).released,
  });
  const appeals = appealsQ.data;
  const released = releaseQ.data ?? null;
  const isError = appealsQ.isError || releaseQ.isError;

  const toggle = async () => {
    const next = await api.toggleAppealsRelease();
    qc.setQueryData<boolean>(APPEALS_RELEASE_KEY, (next as { released: boolean }).released);
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => { appealsQ.refetch(); releaseQ.refetch(); }} retryLabel={t('common.retry')} />;

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('appeals.title')}</h1>
      <p className="text-sm text-[#737477] mb-6">{t('appeals.subtitle')}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[#737477] uppercase tracking-wider">{t('appeals.releaseStatus')}</p>
          <p className={`text-sm font-medium mt-1 ${released ? 'text-oasis-700' : 'text-[#737477]'}`}>
            {released === null ? t('common.loading')
              : released ? t('appeals.released') : t('appeals.notReleased')}
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={released === null}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {t('appeals.toggleRelease')}
        </button>
      </div>

      {!appeals ? (
        <SkeletonTable rows={3} cols={6} />
      ) : appeals.length === 0 ? (
        <EmptyState title={t('common.noData')} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#737477] border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium">{t('requests.id')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('requests.student')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('appeals.course')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('appeals.currentGrade')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('appeals.assignedFaculty')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('requests.submittedAt')}</th>
              </tr>
            </thead>
            <tbody>
              {appeals.map((a) => (
                <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{a.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{locale === 'ar' ? a.student_name_ar : a.student_name_en}</p>
                    <p className="text-xs text-[#737477]">{a.student_id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{a.course_code}</p>
                    <p className="text-xs text-[#737477]">{a.course_name}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{a.current_grade}</td>
                  <td className="px-4 py-3 text-[#737477]">{locale === 'ar' ? a.faculty_assigned_ar : a.faculty_assigned_en}</td>
                  <td className="px-4 py-3 text-xs text-[#737477]">{fmtDate(a.submitted_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
