'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type StudentLifeEvent, type ClubJoinRequest } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import CreateEventModal from '@/components/CreateEventModal';

const EVENTS_KEY = ['student-life', 'events'] as const;
const CLUBS_KEY = ['student-life', 'club-requests'] as const;

const REQ_STYLE: Record<ClubJoinRequest['status'], string> = {
  pending: 'bg-gold-50 text-gold-700',
  approved: 'bg-oasis-50 text-oasis-700',
  rejected: 'bg-danger-50 text-danger-700',
};

export default function StudentLifePage() {
  const { t, locale, dir } = useI18n();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'events' | 'clubs'>('events');
  const [busy, setBusy] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

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

  const decideClub = async (id: string, decision: 'approved' | 'rejected') => {
    setBusy(id + decision);
    try {
      await api.decideClubRequest(id, decision);
      qc.setQueryData<ClubJoinRequest[]>(CLUBS_KEY, (prev) =>
        prev?.map((c) => c.id === id ? { ...c, status: decision } : c) ?? prev,
      );
    } finally {
      setBusy(null);
    }
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
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t('studentLife.title')}</h1>
          <p className="text-sm text-[#737477]">{t('studentLife.subtitle')}</p>
        </div>
        {tab === 'events' && (
          <button
            onClick={() => setShowCreate(true)}
            className="shrink-0 px-4 py-2 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700"
          >
            + {t('studentLife.createEvent')}
          </button>
        )}
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-4">
        <button
          onClick={() => setTab('events')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'events' ? 'text-pair-600 border-pair-600' : 'text-[#737477] border-transparent'
          }`}
        >
          {t('studentLife.tabEvents')} ({events?.length ?? 0})
        </button>
        <button
          onClick={() => setTab('clubs')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'clubs' ? 'text-pair-600 border-pair-600' : 'text-[#737477] border-transparent'
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
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-pair-300 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{locale === 'ar' ? e.title_ar : e.title_en}</p>
                    <p className="text-xs text-[#737477] mt-0.5">{fmtDate(e.date)}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    e.scope === 'internal' ? 'bg-pair-50 text-pair-700' : 'bg-gold-50 text-gold-700'
                  }`}>
                    {t(`studentLife.scope.${e.scope}`)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-[#222]">
                    {t('studentLife.audience')}: {t(`studentLife.audience.${e.audience}`)}
                    {e.audience === 'specific' && e.audience_detail_en
                      ? ` - ${locale === 'ar' ? e.audience_detail_ar : e.audience_detail_en}` : ''}
                  </span>
                  <span className="text-xs text-[#737477]">
                    {t('studentLife.registrations', { value: e.registrations })}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    e.registration_open ? 'bg-oasis-50 text-oasis-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {e.registration_open ? t('studentLife.registrationOpen') : t('studentLife.registrationClosed')}
                  </span>
                  <button
                    onClick={(ev) => { ev.preventDefault(); toggleRegistration(e.id, !e.registration_open); }}
                    disabled={busy === e.id}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
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
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#737477] border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium">{t('requests.student')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('studentLife.club')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('studentLife.clubAdvisor')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('common.status')}</th>
                  <th className="px-4 py-3 text-end font-medium"> </th>
                </tr>
              </thead>
              <tbody>
                {clubReqs.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{locale === 'ar' ? c.student_name_ar : c.student_name_en}</p>
                      <p className="text-xs text-[#737477]">{c.student_id} · {fmtDate(c.submitted_at)}</p>
                    </td>
                    <td className="px-4 py-3 text-[#222]">{locale === 'ar' ? c.club_ar : c.club_en}</td>
                    <td className="px-4 py-3 text-[#737477]">{locale === 'ar' ? c.advisor_ar : c.advisor_en}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${REQ_STYLE[c.status]}`}>
                        {c.status === 'pending' ? t('status.pending')
                          : c.status === 'approved' ? t('status.approved')
                          : t('status.rejected')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      {c.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => decideClub(c.id, 'approved')}
                            disabled={busy === c.id + 'approved'}
                            className="px-2.5 py-1 bg-pair-600 text-white rounded text-xs font-medium hover:bg-pair-700 disabled:opacity-50"
                          >
                            {t('studentLife.approveJoin')}
                          </button>
                          <button
                            onClick={() => decideClub(c.id, 'rejected')}
                            disabled={busy === c.id + 'rejected'}
                            className="px-2.5 py-1 border border-danger-200 text-danger-700 rounded text-xs hover:bg-danger-50 disabled:opacity-50"
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
    </div>
  );
}
