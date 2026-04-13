'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';

interface SentMessage {
  message_id: string;
  subject_en: string;
  subject_ar: string;
  target_audience: string;
  recipients_count: number;
  sent_at: string;
  channels: string[];
}

const AUDIENCE_KEY: Record<string, string> = {
  all_students: 'comms.allStudents',
  at_risk: 'comms.atRisk',
  freshmen: 'comms.freshmen',
  graduating: 'comms.graduating',
};

const AUDIENCE_ESTIMATE: Record<string, number> = {
  all_students: 4200,
  at_risk: 47,
  freshmen: 1100,
  graduating: 650,
};

export default function CommunicationsPage() {
  const { t, locale, isRTL } = useI18n();

  const [form, setForm] = useState({
    subject_ar: '',
    subject_en: '',
    body_ar: '',
    body_en: '',
    target_audience: 'all_students',
    target_majors: [] as string[],
    target_years: [] as string[],
    channels: ['push', 'email'],
    scheduled_at: '',
  });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [result, setResult] = useState<{ message_id: string; recipients_count: number } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sent messages history
  const [sentMessages, setSentMessages] = useState<SentMessage[] | null>(null);
  const [sentError, setSentError] = useState(false);

  const loadSent = useCallback(() => {
    setSentError(false);
    api.getSentCommunications()
      .then((d) => setSentMessages(d as SentMessage[]))
      .catch(() => setSentError(true));
  }, []);

  useEffect(() => { loadSent(); }, [loadSent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const doSend = async () => {
    setShowConfirm(false);
    setSending(true);
    setSendError(null);
    setResult(null);
    try {
      const data = (await api.sendCommunication(form)) as { message_id: string; recipients_count: number };
      setResult(data);
      // Prepend the new message to the top of sent history
      const newEntry: SentMessage = {
        message_id: data.message_id,
        subject_en: form.subject_en,
        subject_ar: form.subject_ar,
        target_audience: form.target_audience,
        recipients_count: data.recipients_count,
        sent_at: new Date().toISOString(),
        channels: form.channels,
      };
      setSentMessages((prev) => (prev ? [newEntry, ...prev] : [newEntry]));
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSending(false);
    }
  };

  const toggleChannel = (ch: string) => {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter((c) => c !== ch)
        : [...prev.channels, ch],
    }));
  };

  const audienceLabel = (key: string) => {
    const tKey = AUDIENCE_KEY[key];
    return tKey ? t(tKey) : key;
  };

  const estimatedRecipients = AUDIENCE_ESTIMATE[form.target_audience] ?? 0;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-bold mb-6">{t('comms.title')}</h1>

      {result && (
        <div className="bg-oasis-50 border border-oasis-200 rounded-lg p-4 mb-6">
          <p className="text-oasis-700 font-medium">{t('comms.messageQueued')}</p>
          <p className="text-sm text-oasis-600">
            {t('comms.messageId', { value: result.message_id })} — {t('comms.recipients', { value: result.recipients_count })}
          </p>
        </div>
      )}

      {sendError && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-6">
          <p className="text-danger-700 font-medium">{t('common.error')}</p>
          <p className="text-sm text-danger-600">{sendError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('comms.subjectEn')}</label>
            <input
              type="text"
              dir="ltr"
              value={form.subject_en}
              onChange={(e) => setForm({ ...form, subject_en: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('comms.subjectAr')}</label>
            <input
              type="text"
              dir="rtl"
              value={form.subject_ar}
              onChange={(e) => setForm({ ...form, subject_ar: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('comms.bodyEn')}</label>
            <textarea
              rows={4}
              dir="ltr"
              value={form.body_en}
              onChange={(e) => setForm({ ...form, body_en: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('comms.bodyAr')}</label>
            <textarea
              rows={4}
              dir="rtl"
              value={form.body_ar}
              onChange={(e) => setForm({ ...form, body_ar: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <label className="block text-sm font-medium text-gray-700">{t('comms.targetAudience')}</label>
            <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
              {t('comms.recipients', { value: estimatedRecipients.toLocaleString() })}
            </span>
          </div>
          <select
            value={form.target_audience}
            onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all_students">{t('comms.allStudents')}</option>
            <option value="at_risk">{t('comms.atRisk')}</option>
            <option value="freshmen">{t('comms.freshmen')}</option>
            <option value="graduating">{t('comms.graduating')}</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('comms.filterByMajor')}</label>
            <div className="flex flex-wrap gap-2">
              {['Computer Science', 'Engineering', 'Business', 'Science', 'Arts'].map((major) => (
                <button
                  key={major}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      target_majors: prev.target_majors.includes(major)
                        ? prev.target_majors.filter((m) => m !== major)
                        : [...prev.target_majors, major],
                    }))
                  }
                  className={`px-3 py-1 rounded-lg text-xs border ${
                    form.target_majors.includes(major)
                      ? 'bg-pair-600 text-white border-pair-600'
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {major}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('comms.filterByYear')}</label>
            <div className="flex flex-wrap gap-2">
              {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'].map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      target_years: prev.target_years.includes(year)
                        ? prev.target_years.filter((y) => y !== year)
                        : [...prev.target_years, year],
                    }))
                  }
                  className={`px-3 py-1 rounded-lg text-xs border ${
                    form.target_years.includes(year)
                      ? 'bg-pair-600 text-white border-pair-600'
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('comms.scheduleSend')}</label>
          <div className="flex items-center gap-4">
            <input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            {form.scheduled_at && (
              <button
                type="button"
                onClick={() => setForm({ ...form, scheduled_at: '' })}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {t('comms.clearSendNow')}
              </button>
            )}
            {!form.scheduled_at && (
              <span className="text-sm text-gray-400">{t('comms.sendImmediately')}</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('comms.channels')}</label>
          <div className="flex gap-3">
            {['push', 'email', 'sms', 'whatsapp'].map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => toggleChannel(ch)}
                className={`px-4 py-1.5 rounded-lg text-sm border ${
                  form.channels.includes(ch)
                    ? 'bg-pair-600 text-white border-pair-600'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                {ch.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={sending}
          className="px-6 py-2.5 bg-pair-600 text-white rounded-lg font-medium hover:bg-pair-700 disabled:opacity-50"
        >
          {sending ? t('comms.sending') : t('comms.send')}
        </button>
      </form>

      {/* Sent Messages History */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">{t('comms.sentMessages')}</h2>
        {sentError ? (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
            <p className="text-danger-700 font-medium">{t('common.error')}</p>
          </div>
        ) : !sentMessages ? (
          <SkeletonTable rows={3} cols={5} />
        ) : sentMessages.length === 0 ? (
          <EmptyState title={t('comms.noSent')} />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b bg-gray-50">
                  <th className="px-6 py-3 text-start">{locale === 'ar' ? t('comms.subjectAr') : t('comms.subjectEn')}</th>
                  <th className="px-6 py-3 text-start">{t('comms.targetAudience')}</th>
                  <th className="px-6 py-3 text-start">{t('comms.recipients', { value: '#' }).replace('#', '').trim()}</th>
                  <th className="px-6 py-3 text-start">{t('comms.channels')}</th>
                  <th className="px-6 py-3 text-start">{t('common.date')}</th>
                </tr>
              </thead>
              <tbody>
                {sentMessages.map((msg) => (
                  <tr key={msg.message_id} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 font-medium">
                      {locale === 'ar' ? msg.subject_ar : msg.subject_en}
                      <span className="block text-xs text-gray-400">
                        {locale === 'ar' ? msg.subject_en : msg.subject_ar}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{audienceLabel(msg.target_audience)}</td>
                    <td className="px-6 py-4 text-gray-600">{msg.recipients_count.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {msg.channels.map((ch) => (
                          <span key={ch} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {ch.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(msg.sent_at).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        title={t('comms.confirmTitle')}
        message={t('comms.confirmMessage')}
        onConfirm={doSend}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
