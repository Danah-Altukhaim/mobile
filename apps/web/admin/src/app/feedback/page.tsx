'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type FeedbackEntry } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import StatusBadge, { type LifecycleStatus } from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';

const FEEDBACK_KEY = ['feedback'] as const;

const toLifecycle = (s: FeedbackEntry['status']): LifecycleStatus =>
  s === 'open' ? 'not_started'
  : s === 'in_progress' ? 'pending'
  : 'completed';

export default function FeedbackPage() {
  const { t, locale, dir } = useI18n();
  const qc = useQueryClient();
  const { data: entries, isError, isLoading, refetch } = useQuery<FeedbackEntry[]>({
    queryKey: FEEDBACK_KEY,
    queryFn: () => api.getFeedback() as Promise<FeedbackEntry[]>,
  });
  const [tab, setTab] = useState<'complaint' | 'suggestion'>('complaint');
  const [busy, setBusy] = useState<string | null>(null);
  const [noteById, setNoteById] = useState<Record<string, string>>({});

  const resolve = async (id: string) => {
    setBusy(id);
    try {
      await api.resolveFeedback(id);
      qc.setQueryData<FeedbackEntry[]>(FEEDBACK_KEY, (prev) =>
        prev?.map((f) => f.id === id ? { ...f, status: 'resolved' } : f) ?? prev,
      );
    } finally {
      setBusy(null);
    }
  };

  const sendToCommittee = async (id: string) => {
    setBusy(id + 'committee');
    try {
      await api.sendComplaintToCommittee(id);
      qc.setQueryData<FeedbackEntry[]>(FEEDBACK_KEY, (prev) =>
        prev?.map((f) => f.id === id
          ? { ...f, committee_stage: 'with_committee', status: 'in_progress' }
          : f) ?? prev,
      );
    } finally {
      setBusy(null);
    }
  };

  const recordDecision = async (id: string) => {
    const note = (noteById[id] ?? '').trim();
    if (!note) return;
    setBusy(id + 'decision');
    try {
      await api.recordCommitteeDecision(id, note);
      qc.setQueryData<FeedbackEntry[]>(FEEDBACK_KEY, (prev) =>
        prev?.map((f) => f.id === id
          ? { ...f, committee_stage: 'decided', committee_decision: note }
          : f) ?? prev,
      );
    } finally {
      setBusy(null);
    }
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;

  const filtered = !entries ? [] : entries.filter((f) => f.type === tab);

  return (
    <div dir={dir}>
      <PageHeader title={t('feedback.title')} subtitle={t('feedback.subtitle')} />

      <div className="flex gap-2 border-b border-line mb-4">
        <button
          onClick={() => setTab('complaint')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'complaint' ? 'text-pair-600 border-pair-600' : 'text-muted border-transparent'
          }`}
        >
          {t('feedback.tabComplaints')} ({entries?.filter((f) => f.type === 'complaint').length ?? 0})
        </button>
        <button
          onClick={() => setTab('suggestion')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'suggestion' ? 'text-pair-600 border-pair-600' : 'text-muted border-transparent'
          }`}
        >
          {t('feedback.tabSuggestions')} ({entries?.filter((f) => f.type === 'suggestion').length ?? 0})
        </button>
      </div>

      {isLoading || !entries ? (
        <SkeletonTable rows={4} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t('common.noData')} />
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <div key={f.id} className="cck-card p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{f.subject}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {locale === 'ar' ? f.student_name_ar : f.student_name_en}
                    {' · '}{f.student_id}
                    {' · '}{fmtDate(f.submitted_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-sm text-xs font-medium bg-canvas text-ink">
                    {t('feedback.routedTo')}: {f.department}
                  </span>
                  <StatusBadge status={toLifecycle(f.status)} />
                </div>
              </div>
              <p className="text-sm text-ink mt-3 mb-3">{f.body}</p>
              {f.attachment && (
                <p className="text-xs mb-3">
                  <span className="text-muted">{t('feedback.attachment')}: </span>
                  <span className="font-mono px-1.5 py-0.5 rounded-sm bg-canvas text-ink">{f.attachment}</span>
                </p>
              )}
              <p className="text-xs text-muted font-mono mb-3">{t('feedback.tracking')}: {f.id}</p>

              {/* Committee decision loop - complaints only (Student Life doc) */}
              {f.type === 'complaint' && (
                <div className="border-t border-line pt-3 mb-3">
                  <p className="cck-section-label text-muted mb-2">
                    {t('feedback.committee')}
                  </p>
                  {(!f.committee_stage || f.committee_stage === 'not_sent') && (
                    <button
                      onClick={() => sendToCommittee(f.id)}
                      disabled={busy === f.id + 'committee' || f.status === 'resolved'}
                      className="px-3 py-1.5 border border-pair-200 text-pair-700 rounded-sm text-xs font-medium hover:bg-pair-50 disabled:opacity-50"
                    >
                      {t('feedback.sendToCommittee')}
                    </button>
                  )}
                  {f.committee_stage === 'with_committee' && (
                    <div className="space-y-2">
                      <p className="text-xs cck-chip-neutral rounded-sm px-2 py-1 w-fit">
                        {t('feedback.awaitingCommittee')}
                      </p>
                      <textarea
                        value={noteById[f.id] ?? ''}
                        onChange={(e) => setNoteById({ ...noteById, [f.id]: e.target.value })}
                        placeholder={t('feedback.committeeDecisionPlaceholder')}
                        rows={2}
                        className="cck-input"
                      />
                      <button
                        onClick={() => recordDecision(f.id)}
                        disabled={busy === f.id + 'decision' || !(noteById[f.id] ?? '').trim()}
                        className="btn btn-primary btn-sm"
                      >
                        {t('feedback.recordCommitteeDecision')}
                      </button>
                    </div>
                  )}
                  {f.committee_stage === 'decided' && f.committee_decision && (
                    <div className="bg-pair-50 border border-pair-200 rounded-sm px-3 py-2">
                      <p className="text-[11px] text-pair-700 font-semibold uppercase tracking-wide">
                        {t('feedback.committeeDecision')}
                      </p>
                      <p className="text-sm text-ink mt-0.5">{f.committee_decision}</p>
                    </div>
                  )}
                </div>
              )}

              {f.status !== 'resolved' && (
                <button
                  onClick={() => resolve(f.id)}
                  disabled={
                    busy === f.id
                    || (f.type === 'complaint' && f.committee_stage !== 'decided')
                  }
                  title={f.type === 'complaint' && f.committee_stage !== 'decided'
                    ? t('feedback.resolveBlocked') : undefined}
                  className="px-3 py-1.5 bg-pair-600 text-white rounded-sm text-xs font-medium hover:bg-pair-700 disabled:opacity-50"
                >
                  {t('feedback.markResolved')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
