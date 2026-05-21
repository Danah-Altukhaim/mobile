'use client';

import { useEffect, useState } from 'react';
import { api, type StudentLifeEvent } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

interface CreateEventModalProps {
  onClose: () => void;
  onCreated: (event: StudentLifeEvent) => void;
}

type Scope = StudentLifeEvent['scope'];
type Audience = StudentLifeEvent['audience'];

const AUDIENCE_SIZE: Record<Audience, number> = {
  all: 4200,
  freshmen: 950,
  graduating: 620,
  specific: 100,
};

export default function CreateEventModal({ onClose, onCreated }: CreateEventModalProps) {
  const { t, dir } = useI18n();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [locationEn, setLocationEn] = useState('');
  const [locationAr, setLocationAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [scope, setScope] = useState<Scope>('internal');
  const [audience, setAudience] = useState<Audience>('all');
  const [groupEn, setGroupEn] = useState('');
  const [groupAr, setGroupAr] = useState('');

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
    const valid = titleEn.trim() && titleAr.trim() && date &&
      (audience !== 'specific' || (groupEn.trim() && groupAr.trim()));
    if (!valid) { setError(true); return; }
    setError(false);
    setSaving(true);
    try {
      const created = await api.createStudentLifeEvent({
        title_en: titleEn.trim(),
        title_ar: titleAr.trim(),
        date,
        time: time.trim() || undefined,
        location_en: locationEn.trim() || undefined,
        location_ar: locationAr.trim() || undefined,
        description_en: descEn.trim() || undefined,
        description_ar: descAr.trim() || undefined,
        scope,
        audience,
        audience_detail_en: audience === 'specific' ? groupEn.trim() : undefined,
        audience_detail_ar: audience === 'specific' ? groupAr.trim() : undefined,
        audience_size: AUDIENCE_SIZE[audience],
        registration_open: true,
      }) as StudentLifeEvent;
      onCreated(created);
    } finally {
      setSaving(false);
    }
  };

  const field = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-500';
  const label = 'block text-xs font-medium text-[#737477] mb-1';

  return (
    <div role="dialog" aria-modal="true" dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{t('studentLife.newEvent')}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={label}>{t('studentLife.eventTitleEn')}</label>
            <input className={field} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className={label}>{t('studentLife.eventTitleAr')}</label>
            <input className={field} value={titleAr} onChange={(e) => setTitleAr(e.target.value)} dir="rtl" />
          </div>
          <div>
            <label className={label}>{t('studentLife.eventDate')}</label>
            <input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className={label}>{t('studentLife.eventTime')}</label>
            <input className={field} value={time} onChange={(e) => setTime(e.target.value)}
              placeholder="09:30 - 14:00" dir="ltr" />
          </div>
          <div>
            <label className={label}>{t('studentLife.eventLocationEn')}</label>
            <input className={field} value={locationEn} onChange={(e) => setLocationEn(e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className={label}>{t('studentLife.eventLocationAr')}</label>
            <input className={field} value={locationAr} onChange={(e) => setLocationAr(e.target.value)} dir="rtl" />
          </div>
          <div>
            <label className={label}>{t('studentLife.eventScope')}</label>
            <select className={field} value={scope} onChange={(e) => setScope(e.target.value as Scope)}>
              <option value="internal">{t('studentLife.scope.internal')}</option>
              <option value="external">{t('studentLife.scope.external')}</option>
            </select>
          </div>
          <div>
            <label className={label}>{t('studentLife.eventAudience')}</label>
            <select className={field} value={audience} onChange={(e) => setAudience(e.target.value as Audience)}>
              <option value="all">{t('studentLife.audience.all')}</option>
              <option value="freshmen">{t('studentLife.audience.freshmen')}</option>
              <option value="graduating">{t('studentLife.audience.graduating')}</option>
              <option value="specific">{t('studentLife.audience.specific')}</option>
            </select>
          </div>
          {audience === 'specific' && (
            <>
              <div>
                <label className={label}>{t('studentLife.audienceGroupEn')}</label>
                <input className={field} value={groupEn} onChange={(e) => setGroupEn(e.target.value)} dir="ltr" />
              </div>
              <div>
                <label className={label}>{t('studentLife.audienceGroupAr')}</label>
                <input className={field} value={groupAr} onChange={(e) => setGroupAr(e.target.value)} dir="rtl" />
              </div>
            </>
          )}
          <div className="md:col-span-2">
            <label className={label}>{t('studentLife.eventDescEn')}</label>
            <textarea className={field} rows={2} value={descEn} onChange={(e) => setDescEn(e.target.value)} dir="ltr" />
          </div>
          <div className="md:col-span-2">
            <label className={label}>{t('studentLife.eventDescAr')}</label>
            <textarea className={field} rows={2} value={descAr} onChange={(e) => setDescAr(e.target.value)} dir="rtl" />
          </div>
        </div>
        {error && (
          <p className="px-6 text-sm text-danger-600">{t('studentLife.requiredFields')}</p>
        )}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 mt-2">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            {t('common.cancel')}
          </button>
          <button onClick={submit} disabled={saving}
            className="px-4 py-2 text-sm bg-pair-600 text-white rounded-lg hover:bg-pair-700 disabled:opacity-50">
            {saving ? t('studentLife.creating') : t('studentLife.create')}
          </button>
        </div>
      </div>
    </div>
  );
}
