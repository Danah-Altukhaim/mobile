'use client';

import { useEffect, useState } from 'react';
import { api, type EventNotification } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

interface SendNotificationModalProps {
  eventId: string;
  registrations: number;
  audienceSize: number;
  onClose: () => void;
  onSent: (notification: EventNotification) => void;
}

type Target = 'registered' | 'audience';

export default function SendNotificationModal({
  eventId, registrations, audienceSize, onClose, onSent,
}: SendNotificationModalProps) {
  const { t, dir } = useI18n();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<Target>('registered');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const submit = async () => {
    if (!title.trim() || !body.trim()) { setError(true); return; }
    setError(false);
    setSending(true);
    try {
      const ntf = await api.sendEventNotification(eventId, {
        title: title.trim(), body: body.trim(), target,
      }) as EventNotification;
      onSent(ntf);
    } finally {
      setSending(false);
    }
  };

  const field = 'cck-input';
  const label = 'cck-label';
  const targetCount = target === 'registered' ? registrations : audienceSize;

  const radio = (value: Target, text: string) => (
    <label className={`flex items-center gap-2 px-3 py-2 border rounded-sm text-sm cursor-pointer ${
      target === value ? 'border-pair-600 bg-pair-50 text-pair-700' : 'border-line-strong text-body'
    }`}>
      <input type="radio" name="target" value={value} checked={target === value}
        onChange={() => setTarget(value)} className="accent-pair-600" />
      {text}
    </label>
  );

  return (
    <div role="dialog" aria-modal="true" dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-pine-900/50 backdrop-blur-[1px]" onClick={onClose} aria-hidden />
      <div className="relative cck-card shadow-xl w-full max-w-lg mx-4">
        <div className="px-6 py-4 border-b border-line flex items-center gap-3">
          <span aria-hidden className="h-5 w-1 bg-pair-600 rounded-sm" />
          <h3 className="cck-title text-lg">{t('studentLife.sendNotification')}</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className={label}>{t('studentLife.notificationTitle')}</label>
            <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={label}>{t('studentLife.notificationBody')}</label>
            <textarea className={field} rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div>
            <label className={label}>{t('studentLife.notificationTarget')}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {radio('registered', t('studentLife.targetRegistered', { value: registrations }))}
              {radio('audience', t('studentLife.targetAudience', { value: audienceSize }))}
            </div>
          </div>
          {error && (
            <p className="text-sm text-danger-600">{t('studentLife.requiredFields')}</p>
          )}
        </div>
        <div className="px-6 py-4 border-t border-line flex justify-end gap-3">
          <button onClick={onClose} disabled={sending} className="btn btn-outline">
            {t('common.cancel')}
          </button>
          <button onClick={submit} disabled={sending} className="btn btn-primary">
            {sending ? t('studentLife.sending') : `${t('studentLife.send')} · ${targetCount}`}
          </button>
        </div>
      </div>
    </div>
  );
}
