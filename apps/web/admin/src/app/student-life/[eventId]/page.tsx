'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type StudentLifeEventDetail, type EventNotification } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonPage } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import SendNotificationModal from '@/components/SendNotificationModal';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { t, locale, dir } = useI18n();
  const qc = useQueryClient();
  const isAr = locale === 'ar';

  const [busy, setBusy] = useState(false);
  const [showNotify, setShowNotify] = useState(false);

  const detailKey = ['student-life', 'event', eventId] as const;
  const { data: event, isError, refetch } = useQuery<StudentLifeEventDetail>({
    queryKey: detailKey,
    queryFn: () => api.getStudentLifeEvent(eventId) as Promise<StudentLifeEventDetail>,
  });

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(isAr ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const toggleRegistration = async () => {
    if (!event) return;
    setBusy(true);
    try {
      const open = !event.registration_open;
      await api.toggleEventRegistration(event.id, open);
      qc.setQueryData<StudentLifeEventDetail>(detailKey, (prev) =>
        prev ? { ...prev, registration_open: open } : prev);
      qc.invalidateQueries({ queryKey: ['student-life', 'events'] });
    } finally {
      setBusy(false);
    }
  };

  const onSent = (ntf: EventNotification) => {
    qc.setQueryData<StudentLifeEventDetail>(detailKey, (prev) =>
      prev ? { ...prev, notifications: [ntf, ...prev.notifications] } : prev);
    setShowNotify(false);
  };

  if (isError) {
    return <ErrorState title={t('common.error')} description={t('common.errorDescription')}
      onRetry={() => refetch()} retryLabel={t('common.retry')} />;
  }
  if (!event) return <SkeletonPage />;

  const audienceLabel = t(`studentLife.audience.${event.audience}`) +
    (event.audience === 'specific' && event.audience_detail_en
      ? ` - ${isAr ? event.audience_detail_ar : event.audience_detail_en}` : '');

  const infoCard = (title: string, value: string) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-[#737477] mb-1">{title}</p>
      <p className="font-medium">{value}</p>
    </div>
  );

  return (
    <div dir={dir}>
      <Link href="/student-life" className="text-sm text-pair-600 hover:underline mb-4 inline-block">
        {isAr ? '→' : '←'} {t('studentLife.backToList')}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isAr ? event.title_ar : event.title_en}</h1>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              event.scope === 'internal' ? 'bg-pair-50 text-pair-700' : 'bg-gold-50 text-gold-700'
            }`}>
              {t(`studentLife.scope.${event.scope}`)}
            </span>
          </div>
          <p className="text-sm text-[#737477] mt-1">{isAr ? event.title_en : event.title_ar}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded text-xs font-medium ${
            event.registration_open ? 'bg-oasis-50 text-oasis-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {event.registration_open ? t('studentLife.registrationOpen') : t('studentLife.registrationClosed')}
          </span>
          <button onClick={toggleRegistration} disabled={busy}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
            {event.registration_open ? t('studentLife.closeRegistration') : t('studentLife.openRegistration')}
          </button>
          <button onClick={() => setShowNotify(true)}
            className="px-3 py-2 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700">
            {t('studentLife.sendNotification')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {infoCard(t('studentLife.eventDate'), fmtDate(event.date) + (event.time ? ` · ${event.time}` : ''))}
        {infoCard(t('studentLife.location'),
          (isAr ? event.location_ar : event.location_en) || '-')}
        {infoCard(t('studentLife.registrantsTitle'), String(event.registrations))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-3">{t('studentLife.audienceReach')}</h2>
          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-[#222] mb-2">
            {audienceLabel}
          </span>
          <p className="text-sm text-[#737477]">
            {t('studentLife.audienceReachDesc', { value: event.audience_size.toLocaleString() })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-3">{t('studentLife.description')}</h2>
          <p className="text-sm text-[#222]">
            {(isAr ? event.description_ar : event.description_en) || '-'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">{t('studentLife.notificationHistory')}</h2>
        {event.notifications.length === 0 ? (
          <p className="text-sm text-gray-400">{t('studentLife.noNotifications')}</p>
        ) : (
          <div className="space-y-3">
            {event.notifications.map((n) => (
              <div key={n.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-sm">{n.title}</p>
                  <span className="text-xs text-[#737477] shrink-0">
                    {new Date(n.sent_at).toLocaleDateString(isAr ? 'ar-KW' : 'en-GB')}
                  </span>
                </div>
                <p className="text-sm text-[#737477] mt-1">{n.body}</p>
                <p className="text-xs text-[#737477] mt-2">
                  {t('studentLife.sentTo')}: {n.target === 'registered'
                    ? t('studentLife.registrantsTitle')
                    : t('studentLife.audienceReach')} · {t('studentLife.recipientsCount', { value: n.recipients })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h2 className="text-lg font-semibold px-6 py-4 border-b border-gray-100">
          {t('studentLife.registrantsTitle')} ({event.registrants.length})
        </h2>
        {event.registrants.length === 0 ? (
          <div className="p-6">
            <EmptyState title={t('studentLife.noRegistrants')} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#737477] border-b bg-gray-50">
                <th className="px-6 py-3 text-start font-medium">{t('studentLife.registrantName')}</th>
                <th className="px-6 py-3 text-start font-medium">{t('studentLife.registrantMajor')}</th>
                <th className="px-6 py-3 text-start font-medium">{t('studentLife.registrantYear')}</th>
                <th className="px-6 py-3 text-start font-medium">{t('studentLife.registeredOn')}</th>
              </tr>
            </thead>
            <tbody>
              {event.registrants.map((r) => (
                <tr key={r.student_id} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-3">
                    <p className="font-medium">{isAr ? r.name_ar : r.name_en}</p>
                    <p className="text-xs text-[#737477]">{r.student_id}</p>
                  </td>
                  <td className="px-6 py-3 text-[#222]">{isAr ? r.major_ar : r.major_en}</td>
                  <td className="px-6 py-3 text-[#737477]">{t(`studentLife.year.${r.year}`)}</td>
                  <td className="px-6 py-3 text-[#737477]">{fmtDate(r.registered_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showNotify && (
        <SendNotificationModal
          eventId={event.id}
          registrations={event.registrations}
          audienceSize={event.audience_size}
          onClose={() => setShowNotify(false)}
          onSent={onSent}
        />
      )}
    </div>
  );
}
