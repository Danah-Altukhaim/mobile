'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type AdvisingAppointment, type AdvisingMeetingKey, type AppointmentStatus } from '@/lib/api';
import { ADVISING_MEETING_TYPES } from '@/lib/cckPolicies';
import { useI18n } from '@/lib/i18n';
import { SkeletonPage } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import { ClockIcon } from '@/components/icons';

const APPTS_KEY = ['advising-appointments'] as const;

const typeStyle: Record<AdvisingMeetingKey, { chip: string; dot: string }> = {
  gpa_warning: { chip: 'bg-pair-50 text-pair-700 border-pair-200', dot: 'bg-pair-500' },
  absence_2nd_warning: { chip: 'bg-danger-50 text-danger-700 border-danger-200', dot: 'bg-danger-500' },
};

const statusStyle: Record<AppointmentStatus, string> = {
  proposed: 'cck-chip-neutral',
  accepted: 'bg-pair-50 text-pair-700',
  completed: 'cck-chip-positive',
  cancelled: 'bg-canvas text-muted',
};

const pad = (n: number) => String(n).padStart(2, '0');
const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dateKeyFromIso = (iso: string) => dateKey(new Date(iso));

function toLocalInput(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CalendarPage() {
  const { t, locale, dir, isRTL } = useI18n();
  const qc = useQueryClient();
  const { data: appts, isError, isLoading, refetch } = useQuery<AdvisingAppointment[]>({
    queryKey: APPTS_KEY,
    queryFn: () => api.getAdvisingAppointments() as Promise<AdvisingAppointment[]>,
  });

  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState(() => dateKey(today));
  const [typeFilter, setTypeFilter] = useState<'all' | AdvisingMeetingKey>('all');
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState<AdvisingAppointment | null>(null);
  const [slotInput, setSlotInput] = useState('');

  const emptyForm = {
    student_name: '', student_id: '', type: 'gpa_warning' as AdvisingMeetingKey,
    slot: '', advisor: '', location: '', duration: '30', notes: '',
  };
  const [scheduling, setScheduling] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const submitSchedule = async () => {
    if (!form.student_name.trim() || !form.slot) return;
    setSaving(true);
    try {
      const iso = new Date(form.slot).toISOString();
      const appt = await api.createAdvisingAppointment({
        type: form.type,
        student_id: form.student_id.trim() || `S-${Date.now()}`,
        student_name_en: form.student_name.trim(),
        student_name_ar: form.student_name.trim(),
        advisor_en: form.advisor.trim(),
        advisor_ar: form.advisor.trim(),
        scheduled_at: iso,
        duration_min: Number(form.duration) || 30,
        location_en: form.location.trim(),
        location_ar: form.location.trim(),
        notes: form.notes.trim() || undefined,
      });
      qc.setQueryData<AdvisingAppointment[]>(APPTS_KEY, (prev) => [appt, ...(prev ?? [])]);
      setScheduling(false);
      const name = form.student_name.trim();
      setForm(emptyForm);
      setSelectedKey(dateKeyFromIso(iso));
      setCursor(new Date(new Date(iso).getFullYear(), new Date(iso).getMonth(), 1));
      showToast(t('calendar.scheduled', { name }));
    } finally {
      setSaving(false);
    }
  };

  const localeTag = locale === 'ar' ? 'ar-KW' : 'en-GB';

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const patch = (id: string, next: Partial<AdvisingAppointment>) => {
    qc.setQueryData<AdvisingAppointment[]>(APPTS_KEY, (prev) =>
      prev?.map((a) => (a.id === id ? { ...a, ...next } : a)) ?? prev,
    );
  };

  const run = async (id: string, fn: () => Promise<unknown>, next: Partial<AdvisingAppointment>, msg: string) => {
    setBusy(id);
    try {
      await fn();
      patch(id, next);
      showToast(msg);
    } finally {
      setBusy(null);
    }
  };

  const filtered = useMemo(
    () => (appts ?? []).filter((a) => typeFilter === 'all' || a.type === typeFilter),
    [appts, typeFilter],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, AdvisingAppointment[]>();
    for (const a of filtered) {
      const k = dateKeyFromIso(a.scheduled_at);
      const arr = map.get(k) ?? [];
      arr.push(a);
      map.set(k, arr);
    }
    for (const arr of map.values()) arr.sort((x, y) => x.scheduled_at.localeCompare(y.scheduled_at));
    return map;
  }, [filtered]);

  const stats = useMemo(() => {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    let proposed = 0, accepted = 0, completed = 0, thisWeek = 0;
    for (const a of filtered) {
      if (a.status === 'proposed') proposed++;
      else if (a.status === 'accepted') accepted++;
      else if (a.status === 'completed') completed++;
      const d = new Date(a.scheduled_at);
      if (d >= startOfWeek && d < endOfWeek && a.status !== 'cancelled') thisWeek++;
    }
    return { proposed, accepted, completed, thisWeek };
  }, [filtered, today]);

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;
  if (isLoading || !appts) return <SkeletonPage stats={4} chart />;

  // Build month grid (Sunday-first to match the Kuwait week).
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const leading = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weekdays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 1, 1 + i); // 2026-02-01 is a Sunday
    return new Intl.DateTimeFormat(localeTag, { weekday: 'short' }).format(d);
  });

  const monthLabel = new Intl.DateTimeFormat(localeTag, { month: 'long', year: 'numeric' }).format(cursor);
  const todayKey = dateKey(today);
  const selectedDate = new Date(`${selectedKey}T00:00:00`);
  const selectedAppts = byDay.get(selectedKey) ?? [];

  const moveMonth = (delta: number) => setCursor(new Date(year, month + delta, 1));
  const goToday = () => { setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedKey(todayKey); };

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit' });
  const fmtDayLong = (d: Date) => new Intl.DateTimeFormat(localeTag, { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  const typeLabel = (k: AdvisingMeetingKey) => t(`calendar.type.${k}`);

  return (
    <div dir={dir}>
      <PageHeader title={t('calendar.title')} subtitle={t('calendar.subtitle')} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card title={t('calendar.statProposed')} value={stats.proposed} />
        <Card title={t('calendar.statAccepted')} value={stats.accepted} />
        <Card title={t('calendar.statThisWeek')} value={stats.thisWeek} />
        <Card title={t('calendar.statCompleted')} value={stats.completed} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => moveMonth(-1)}
            className="px-2.5 py-1.5 border border-line-strong rounded-sm text-sm hover:bg-canvas"
            aria-label={t('calendar.viewMonth')}
          >
            {isRTL ? '›' : '‹'}
          </button>
          <h2 className="text-lg font-semibold min-w-[10rem] text-center">{monthLabel}</h2>
          <button
            onClick={() => moveMonth(1)}
            className="px-2.5 py-1.5 border border-line-strong rounded-sm text-sm hover:bg-canvas"
            aria-label={t('calendar.viewMonth')}
          >
            {isRTL ? '‹' : '›'}
          </button>
          <button onClick={goToday} className="ms-1 btn btn-outline btn-sm">
            {t('calendar.today')}
          </button>
          <button
            onClick={() => { setForm(emptyForm); setScheduling(true); }}
            className="ms-1 btn btn-primary btn-sm"
          >
            + {t('calendar.schedule')}
          </button>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted">
            {ADVISING_MEETING_TYPES.map((m) => (
              <span key={m.key} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${typeStyle[m.key as AdvisingMeetingKey].dot}`} />
                {typeLabel(m.key as AdvisingMeetingKey)}
              </span>
            ))}
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | AdvisingMeetingKey)}
            className="border border-line-strong rounded-sm px-3 py-2 text-sm"
            aria-label={t('calendar.filterType')}
          >
            <option value="all">{t('calendar.filterAll')}</option>
            {ADVISING_MEETING_TYPES.map((m) => (
              <option key={m.key} value={m.key}>{typeLabel(m.key as AdvisingMeetingKey)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month grid */}
        <div className="lg:col-span-2 cck-card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-line bg-canvas">
            {weekdays.map((w, i) => (
              <div key={i} className="px-2 py-2 text-center text-xs font-semibold text-muted">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              if (!d) return <div key={i} className="min-h-[5.5rem] border-b border-e border-line bg-canvas/40" />;
              const k = dateKey(d);
              const dayAppts = byDay.get(k) ?? [];
              const isToday = k === todayKey;
              const isSelected = k === selectedKey;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedKey(k)}
                  className={`min-h-[5.5rem] border-b border-e border-line p-1.5 text-start align-top transition-colors ${
                    isSelected ? 'bg-pair-50/70 ring-1 ring-inset ring-pair-300' : 'hover:bg-canvas'
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full mb-1 ${
                      isToday ? 'bg-pair-600 text-white font-semibold' : 'text-ink'
                    }`}
                  >
                    {d.getDate()}
                  </span>
                  <div className="space-y-1">
                    {dayAppts.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        className={`truncate text-[11px] px-1.5 py-0.5 rounded-sm border ${typeStyle[a.type].chip} ${a.status === 'cancelled' ? 'opacity-50 line-through' : ''}`}
                      >
                        <span dir="ltr">{fmtTime(a.scheduled_at)}</span> · {locale === 'ar' ? a.student_name_ar : a.student_name_en}
                      </div>
                    ))}
                    {dayAppts.length > 2 && (
                      <div className="text-[11px] text-muted px-1.5">{t('calendar.more', { count: dayAppts.length - 2 })}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Agenda for selected day */}
        <div className="cck-card p-5">
          <h3 className="text-sm font-semibold text-ink mb-4">
            {t('calendar.dayAppointments', { date: fmtDayLong(selectedDate) })}
          </h3>
          {selectedAppts.length === 0 ? (
            <EmptyState title={t('calendar.noDay')} />
          ) : (
            <div className="space-y-3">
              {selectedAppts.map((a) => (
                <div key={a.id} className="rounded-sm border border-line p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{locale === 'ar' ? a.student_name_ar : a.student_name_en}</p>
                      <p className="text-xs text-muted">{a.student_id}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-sm text-[11px] font-medium ${statusStyle[a.status]}`}>
                      {t(`calendar.status.${a.status}`)}
                    </span>
                  </div>
                  <span className={`inline-block text-[11px] px-2 py-0.5 rounded-sm border mb-2 ${typeStyle[a.type].chip}`}>
                    {typeLabel(a.type)}
                  </span>
                  <dl className="text-xs space-y-1 text-[#444]">
                    <div className="flex items-center gap-1.5">
                      <dt className="text-muted flex items-center"><ClockIcon className="w-3.5 h-3.5 shrink-0" /></dt>
                      <dd dir="ltr">{fmtTime(a.scheduled_at)} · {a.duration_min} min</dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="text-muted shrink-0">{t('calendar.advisor')}:</dt>
                      <dd>{locale === 'ar' ? a.advisor_ar : a.advisor_en}</dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="text-muted shrink-0">{t('calendar.location')}:</dt>
                      <dd>{locale === 'ar' ? a.location_ar : a.location_en}</dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="text-muted shrink-0">{t('calendar.trigger')}:</dt>
                      <dd>{locale === 'ar' ? a.source_ar : a.source_en}</dd>
                    </div>
                  </dl>

                  {(a.status === 'proposed' || a.status === 'accepted') && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {a.status === 'proposed' && (
                        <button
                          disabled={busy === a.id}
                          onClick={() => run(a.id, () => api.acceptAppointment(a.id), { status: 'accepted' }, t('calendar.accepted'))}
                          className="btn btn-primary btn-sm text-xs"
                        >
                          {t('calendar.accept')}
                        </button>
                      )}
                      {a.status === 'accepted' && (
                        <button
                          disabled={busy === a.id}
                          onClick={() => run(a.id, () => api.completeAppointment(a.id), { status: 'completed' }, t('calendar.completedToast'))}
                          className="px-2.5 py-1 bg-pair-600 text-white rounded-sm text-xs font-medium hover:bg-pair-700 disabled:opacity-50"
                        >
                          {t('calendar.complete')}
                        </button>
                      )}
                      <button
                        disabled={busy === a.id}
                        onClick={() => { setRescheduling(a); setSlotInput(toLocalInput(a.scheduled_at)); }}
                        className="px-2.5 py-1 border border-line-strong rounded-sm text-xs hover:bg-canvas disabled:opacity-50"
                      >
                        {t('calendar.reschedule')}
                      </button>
                      <button
                        disabled={busy === a.id}
                        onClick={() => run(a.id, () => api.cancelAppointment(a.id), { status: 'cancelled' }, t('calendar.cancelledToast'))}
                        className="px-2.5 py-1 border border-line-strong rounded-sm text-xs text-danger-600 hover:bg-danger-50 disabled:opacity-50"
                      >
                        {t('calendar.cancel')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reschedule modal */}
      {rescheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setRescheduling(null)}>
          <div dir={dir} className="cck-card w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-1">{t('calendar.rescheduleTitle')}</h3>
            <p className="text-xs text-muted mb-4">{t('calendar.rescheduleHint')}</p>
            <label className="block text-xs font-medium text-muted mb-1">{t('calendar.newSlot')}</label>
            <input
              type="datetime-local"
              value={slotInput}
              onChange={(e) => setSlotInput(e.target.value)}
              dir="ltr"
              className="w-full border border-line-strong rounded-sm px-3 py-2 text-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRescheduling(null)} className="btn btn-outline btn-sm">
                {t('common.cancel')}
              </button>
              <button
                disabled={!slotInput || busy === rescheduling.id}
                onClick={async () => {
                  const iso = new Date(slotInput).toISOString();
                  const id = rescheduling.id;
                  setRescheduling(null);
                  await run(id, () => api.rescheduleAppointment(id, iso), { scheduled_at: iso, status: 'accepted' }, t('calendar.rescheduled'));
                  setSelectedKey(dateKeyFromIso(iso));
                  setCursor(new Date(new Date(iso).getFullYear(), new Date(iso).getMonth(), 1));
                }}
                className="btn btn-primary btn-sm"
              >
                {t('calendar.saveSlot')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule new meeting modal */}
      {scheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setScheduling(false)}>
          <div dir={dir} className="cck-card w-full max-w-md p-5 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-1">{t('calendar.scheduleTitle')}</h3>
            <p className="text-xs text-muted mb-4">{t('calendar.scheduleHint')}</p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">{t('calendar.studentName')}</label>
                  <input
                    value={form.student_name}
                    onChange={(e) => setForm((f) => ({ ...f, student_name: e.target.value }))}
                    className="cck-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">{t('calendar.studentId')}</label>
                  <input
                    value={form.student_id}
                    onChange={(e) => setForm((f) => ({ ...f, student_id: e.target.value }))}
                    dir="ltr"
                    className="cck-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">{t('calendar.filterType')}</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AdvisingMeetingKey }))}
                  className="cck-input"
                >
                  {ADVISING_MEETING_TYPES.map((m) => (
                    <option key={m.key} value={m.key}>{typeLabel(m.key as AdvisingMeetingKey)}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">{t('calendar.newSlot')}</label>
                  <input
                    type="datetime-local"
                    value={form.slot}
                    onChange={(e) => setForm((f) => ({ ...f, slot: e.target.value }))}
                    dir="ltr"
                    className="cck-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">{t('calendar.duration')}</label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                    dir="ltr"
                    className="cck-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">{t('calendar.advisor')}</label>
                <input
                  value={form.advisor}
                  onChange={(e) => setForm((f) => ({ ...f, advisor: e.target.value }))}
                  className="cck-input"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">{t('calendar.location')}</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="cck-input"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">{t('calendar.notes')}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="cck-input"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setScheduling(false)} className="btn btn-outline btn-sm">
                {t('common.cancel')}
              </button>
              <button
                disabled={!form.student_name.trim() || !form.slot || saving}
                onClick={submitSchedule}
                className="btn btn-primary btn-sm"
              >
                {saving ? t('common.saving') : t('calendar.scheduleConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-6 end-6 z-50 bg-ink text-white px-4 py-2.5 rounded-sm text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
