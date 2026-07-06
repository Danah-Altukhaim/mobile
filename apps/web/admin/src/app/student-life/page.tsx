'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type StudentLifeEvent, type ClubJoinRequest } from '@/lib/api';
import { audienceChips } from '@/lib/audience';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import CreateEventModal from '@/components/CreateEventModal';
import RejectReasonDialog from '@/components/RejectReasonDialog';
import StatusBadge, { type LifecycleStatus } from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';

const EVENTS_KEY = ['student-life', 'events'] as const;
const CLUBS_KEY = ['student-life', 'club-requests'] as const;

const toLifecycle = (s: ClubJoinRequest['status']): LifecycleStatus =>
  s === 'pending' ? 'not_started'
  : s === 'approved' ? 'completed'
  : 'rejected';

export default function StudentLifePage() {
  const { t, locale, dir } = useI18n();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'events' | 'clubs'>('events');
  const [busy, setBusy] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<ClubJoinRequest | null>(null);

  const { data: events, isError: evError, isLoading: evLoading, refetch: evRefetch } =
    useQuery<StudentLifeEvent[]>({
      queryKey: EVENTS_KEY,
      queryFn: () => api.getStudentLifeEvents() as Promise<StudentLifeEvent[]>,
    });
  const { data: clubReqs, isError: clError, isLoading: clLoading, refetch: clRefetch } =
    useQuery<ClubJoinRequest[]>({
      queryKey: CLUBS_KEY,
      queryFn: () => api.getClubJoinRequests() as Promise<ClubJoinRequest[]>,
    });

  const toggleRegistration = async (id: string, open: boolean) => {
    setBusy(id);
    try {
      await api.toggleEventRegistration(id, open);
      qc.setQueryData<StudentLifeEvent[]>(EVENTS_KEY, (prev) =>
        prev?.map((e) => e.id === id ? { ...e, registration_open: open } : e) ?? prev,
      );
    } finally {
      setBusy(null);
    }
  };

  const decideClub = async (id: string, decision: 'approved' | 'rejected', reason?: string) => {
    setBusy(id + decision);
    try {
      await api.decideClubRequest(id, decision, reason);
      qc.setQueryData<ClubJoinRequest[]>(CLUBS_KEY, (prev) =>
        prev?.map((c) => c.id === id ? { ...c, status: decision } : c) ?? prev,
      );
    } finally {
      setBusy(null);
    }
  };

  const confirmRejectClub = async (reason: string) => {
    if (!rejectTarget) return;
    await decideClub(rejectTarget.id, 'rejected', reason);
    setRejectTarget(null);
  };

  const onCreated = (ev: StudentLifeEvent) => {
    qc.setQueryData<StudentLifeEvent[]>(EVENTS_KEY, (prev) => prev ? [...prev, ev] : [ev]);
    setShowCreate(false);
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', year: '2-digit',
  });

  if (evError || clError) {
    return <ErrorState title={t('common.error')} description={t('common.errorDescription')}
      onRetry={() => { evRefetch(); clRefetch(); }} retryLabel={t('common.retry')} />;
  }

  const pendingClubs = clubReqs?.filter((c) => c.status === 'pending').length ?? 0;

  return (
    <div dir={dir}>
      <PageHeader
        title={t('studentLife.title')}
        subtitle={t('studentLife.subtitle')}
        actions={tab === 'events' ? (
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary"
          >
            + {t('studentLife.createEvent')}
          </button>
        ) : undefined}
      />

      <div className="flex gap-2 border-b border-line mb-4">
        <button
          onClick={() => setTab('events')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'events' ? 'text-pair-600 border-pair-600' : 'text-muted border-transparent'
          }`}
        >
          {t('studentLife.tabEvents')} ({events?.length ?? 0})
        </button>
        <button
          onClick={() => setTab('clubs')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'clubs' ? 'text-pair-600 border-pair-600' : 'text-muted border-transparent'
          }`}
        >
          {t('studentLife.tabClubs')}{pendingClubs > 0 ? ` · ${pendingClubs}` : ''}
        </button>
      </div>

      {tab === 'events' && (
        evLoading || !events ? (
          <SkeletonTable rows={4} cols={4} />
        ) : events.length === 0 ? (
          <EmptyState title={t('common.noData')} />
        ) : (
          <div className="space-y-3">
            {events.map((e) => (
              <Link
                key={e.id}
                href={`/student-life/${e.id}`}
                className="block cck-card p-5 hover:border-pair-300 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{locale === 'ar' ? e.title_ar : e.title_en}</p>
                    <p className="text-xs text-muted mt-0.5">{fmtDate(e.date)}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-sm text-xs font-medium cck-chip-neutral">
                    {t(`studentLife.scope.${e.scope}`)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-xs font-medium text-muted">{t('studentLife.audience')}:</span>
                  {audienceChips(e, t, locale === 'ar').map((labelText, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-sm text-xs font-medium bg-canvas text-ink">
                      {labelText}
                    </span>
                  ))}
                  <span className="text-xs text-muted">
                    {t('studentLife.registrations', { value: e.registrations })}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${
                    e.registration_open ? 'cck-chip-positive' : 'cck-chip-neutral'
                  }`}>
                    {e.registration_open ? t('studentLife.registrationOpen') : t('studentLife.registrationClosed')}
                  </span>
                  <button
                    onClick={(ev) => { ev.preventDefault(); toggleRegistration(e.id, !e.registration_open); }}
                    disabled={busy === e.id}
                    className="btn btn-outline btn-sm"
                  >
                    {e.registration_open ? t('studentLife.closeRegistration') : t('studentLife.openRegistration')}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {tab === 'clubs' && (
        clLoading || !clubReqs ? (
          <SkeletonTable rows={4} cols={4} />
        ) : clubReqs.length === 0 ? (
          <EmptyState title={t('common.noData')} />
        ) : (
          <div className="cck-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted border-b bg-canvas">
                  <th className="px-4 py-3 text-start font-medium">{t('requests.student')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('studentLife.club')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('studentLife.clubAdvisor')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('common.status')}</th>
                  <th className="px-4 py-3 text-end font-medium"> </th>
                </tr>
              </thead>
              <tbody>
                {clubReqs.map((c) => (
                  <tr key={c.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{locale === 'ar' ? c.student_name_ar : c.student_name_en}</p>
                      <p className="text-xs text-muted">{c.student_id} · {fmtDate(c.submitted_at)}</p>
                    </td>
                    <td className="px-4 py-3 text-ink">{locale === 'ar' ? c.club_ar : c.club_en}</td>
                    <td className="px-4 py-3 text-muted">{locale === 'ar' ? c.advisor_ar : c.advisor_en}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={toLifecycle(c.status)} />
                    </td>
                    <td className="px-4 py-3 text-end">
                      {c.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => decideClub(c.id, 'approved')}
                            disabled={busy === c.id + 'approved'}
                            className="btn btn-primary btn-sm text-xs"
                          >
                            {t('studentLife.approveJoin')}
                          </button>
                          <button
                            onClick={() => setRejectTarget(c)}
                            disabled={busy === c.id + 'rejected'}
                            className="btn btn-danger btn-sm"
                          >
                            {t('studentLife.rejectJoin')}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {showCreate && (
        <CreateEventModal onClose={() => setShowCreate(false)} onCreated={onCreated} />
      )}

      <RejectReasonDialog
        open={rejectTarget !== null}
        title={t('studentLife.rejectJoin')}
        subject={rejectTarget
          ? `${locale === 'ar' ? rejectTarget.student_name_ar : rejectTarget.student_name_en} · ${locale === 'ar' ? rejectTarget.club_ar : rejectTarget.club_en}`
          : undefined}
        busy={busy === (rejectTarget?.id ?? '') + 'rejected'}
        onConfirm={confirmRejectClub}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}
