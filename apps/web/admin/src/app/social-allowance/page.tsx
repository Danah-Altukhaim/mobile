'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type SocialApplication, type SocialCategory } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

const STATUS_STYLE: Record<SocialApplication['status'], string> = {
  pending: 'bg-gold-50 text-gold-700',
  in_progress: 'bg-pair-50 text-pair-700',
  rejected: 'bg-danger-50 text-danger-700',
  completed: 'bg-oasis-50 text-oasis-700',
};

const CATEGORIES: SocialCategory[] = ['kuwaiti', 'kuwaiti_mother', 'disabled', 'married', 'bank_change'];
const SOCIAL_KEY = ['social', 'applications'] as const;

export default function SocialAllowancePage() {
  const { t, locale, dir } = useI18n();
  const qc = useQueryClient();
  const { data: apps, isError, isLoading, refetch } = useQuery<SocialApplication[]>({
    queryKey: SOCIAL_KEY,
    queryFn: () => api.getSocialApplications() as Promise<SocialApplication[]>,
  });
  const [filter, setFilter] = useState<SocialCategory | 'all'>('all');
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const setStatus = async (id: string, status: SocialApplication['status']) => {
    setBusy(id + status);
    try {
      await api.updateSocialStatus(id, status);
      qc.setQueryData<SocialApplication[]>(SOCIAL_KEY, (prev) =>
        prev?.map((a) => a.id === id ? { ...a, status } : a) ?? prev,
      );
    } finally {
      setBusy(null);
    }
  };

  const markPuc = async (id: string) => {
    setBusy(id + 'puc');
    try {
      await api.markSocialSentToPuc(id);
      qc.setQueryData<SocialApplication[]>(SOCIAL_KEY, (prev) =>
        prev?.map((a) => a.id === id ? { ...a, sent_to_puc: true } : a) ?? prev,
      );
      showToast(t('social.sentToPuc'));
    } finally {
      setBusy(null);
    }
  };

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;

  const filtered = !apps ? [] : apps.filter((a) => filter === 'all' || a.category === filter);

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('social.title')}</h1>
      <p className="text-sm text-[#737477] mb-6">{t('social.subtitle')}</p>

      {toast && (
        <div role="status" aria-live="polite" className="mb-4 bg-pair-50 border border-pair-200 rounded-lg px-4 py-2 text-sm text-pair-700">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm border ${
            filter === 'all' ? 'bg-pair-600 text-white border-pair-600' : 'bg-white text-[#737477] border-gray-300'
          }`}
        >
          {t('common.actions')} · {apps?.length ?? 0}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              filter === c ? 'bg-pair-600 text-white border-pair-600' : 'bg-white text-[#737477] border-gray-300'
            }`}
          >
            {t(`social.cat.${c}`)} · {apps?.filter((a) => a.category === c).length ?? 0}
          </button>
        ))}
      </div>

      {isLoading || !apps ? (
        <SkeletonTable rows={5} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t('common.noData')} />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const issues = app.documents.filter((d) => d.quality === 'issue').length;
            return (
              <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-mono text-[#737477]">{app.application_no}</p>
                    <p className="font-semibold mt-1">{locale === 'ar' ? app.student_name_ar : app.student_name_en}</p>
                    <p className="text-xs text-[#737477]">{app.student_id} · {t(`social.cat.${app.category}`)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[app.status]}`}>
                      {app.status === 'pending' ? t('status.pending')
                        : app.status === 'in_progress' ? t('status.ongoing')
                        : app.status === 'rejected' ? t('common.error')
                        : t('status.resolved')}
                    </span>
                    {app.sent_to_puc && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-pair-50 text-pair-700">
                        {t('social.sentToPuc')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 mb-4">
                  {app.documents.map((d) => (
                    <div key={d.key} className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          d.quality === 'ok' ? 'bg-oasis-500' : 'bg-danger-500'
                        }`} />
                        <span className="truncate">{t(`social.docs.${d.key}`)}</span>
                      </span>
                      <span className="text-xs text-[#737477] shrink-0">
                        {d.quality === 'ok' ? t('social.qualityOk') : t('social.qualityIssue')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {app.status === 'pending' && (
                    <button
                      onClick={() => setStatus(app.id, 'in_progress')}
                      disabled={busy === app.id + 'in_progress' || issues > 0}
                      className="px-3 py-1.5 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
                    >
                      {t('requests.markInProgress')}
                    </button>
                  )}
                  {app.status === 'in_progress' && (
                    <button
                      onClick={() => setStatus(app.id, 'completed')}
                      disabled={busy === app.id + 'completed'}
                      className="px-3 py-1.5 bg-oasis-500 text-white rounded-lg text-sm font-medium hover:bg-oasis-600 disabled:opacity-50"
                    >
                      {t('requests.markCompleted')}
                    </button>
                  )}
                  {!app.sent_to_puc && app.status !== 'rejected' && (
                    <button
                      onClick={() => markPuc(app.id)}
                      disabled={busy === app.id + 'puc'}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      {t('social.markSentToPuc')}
                    </button>
                  )}
                  {app.status !== 'completed' && app.status !== 'rejected' && (
                    <button
                      onClick={() => setStatus(app.id, 'rejected')}
                      disabled={busy === app.id + 'rejected'}
                      className="px-3 py-1.5 border border-danger-200 text-danger-700 rounded-lg text-sm hover:bg-danger-50 disabled:opacity-50"
                    >
                      {t('admissions.reject')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
