'use client';

import { useQuery } from '@tanstack/react-query';
import { api, type DirectoryEntry } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import PageHeader from '@/components/PageHeader';

export default function DirectoryPage() {
  const { t, locale, dir } = useI18n();
  const { data: entries, isError, refetch } = useQuery<DirectoryEntry[]>({
    queryKey: ['directory'],
    queryFn: () => api.getDirectory() as Promise<DirectoryEntry[]>,
  });

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;

  return (
    <div dir={dir}>
      <PageHeader title={t('directory.title')} subtitle={t('directory.subtitle')} />

      {!entries ? (
        <SkeletonTable rows={5} cols={4} />
      ) : entries.length === 0 ? (
        <EmptyState title={t('common.noData')} />
      ) : (
        <div className="cck-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted border-b bg-canvas">
                <th className="px-4 py-3 text-start font-medium">{t('directory.entryName')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('directory.dept')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('directory.entryEmail')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('directory.entryPhone')}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{locale === 'ar' ? e.name_ar : e.name_en}</p>
                    <p className="text-xs text-muted">{locale === 'ar' ? e.name_en : e.name_ar}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{locale === 'ar' ? e.department_ar : e.department_en}</td>
                  <td className="px-4 py-3" dir="ltr">
                    <a href={`mailto:${e.email}`} className="text-pair-600 hover:text-pair-700">{e.email}</a>
                  </td>
                  <td className="px-4 py-3" dir="ltr">{e.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
