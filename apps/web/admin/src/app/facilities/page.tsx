'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { CloseIcon, LinkIcon } from '@/components/icons';
import { useI18n } from '@/lib/i18n';
import {
  useRooms, useInventory, useRoomBookings, facilitiesActions,
  isLowStock, isOutOfStock,
  toMinutes, bookingsForRoomDay, WEEKDAYS,
  INVENTORY_CATEGORIES,
  type FacilityRoom, type RoomType, type RoomStatus,
  type InventoryItem, type InventoryCategory,
  type RoomBooking, type BookingKind, type Weekday,
} from '@/lib/facilitiesStore';

type Tab = 'facilities' | 'schedule' | 'inventory';
const TABS: Tab[] = ['facilities', 'schedule', 'inventory'];

const kwd = (n: number) =>
  `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KWD`;

export default function FacilitiesPage() {
  const { t, dir } = useI18n();
  const [tab, setTab] = useState<Tab>('facilities');

  return (
    <div dir={dir}>
      <PageHeader title={t('facilities.title')} subtitle={t('facilities.subtitle')} />

      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-3 py-1.5 rounded-sm text-sm border ${
              tab === tb
                ? 'bg-pair-600 text-white border-pair-600'
                : 'bg-white text-muted border-line-strong hover:bg-canvas'
            }`}
          >
            {t(`facilities.tab.${tb}`)}
          </button>
        ))}
      </div>

      {tab === 'facilities' && <FacilitiesTab />}
      {tab === 'schedule' && <ScheduleTab />}
      {tab === 'inventory' && <InventoryTab />}
    </div>
  );
}

/* ========================================================================== */
/* Tab 1 - Facilities (rooms)                                                 */
/* ========================================================================== */

const ROOM_STATUS_STYLE: Record<RoomStatus, string> = {
  available: 'cck-chip-positive',
  in_use: 'cck-chip-neutral',
  maintenance: 'cck-chip-negative',
};

const ROOM_TYPE_FILTERS: ('all' | RoomType)[] = ['all', 'classroom', 'lab', 'hall'];

function FacilitiesTab() {
  const { t, locale } = useI18n();
  const textAlign = locale === 'ar' ? 'text-right' : 'text-left';
  const rooms = useRooms();
  const [typeFilter, setTypeFilter] = useState<'all' | RoomType>('all');
  const [edit, setEdit] = useState<FacilityRoom | null>(null);

  const visible = rooms.filter((r) => typeFilter === 'all' || r.type === typeFilter);
  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const maintenance = rooms.filter((r) => r.status === 'maintenance').length;
  const available = rooms.filter((r) => r.status === 'available').length;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card title={t('facilities.kpi.rooms')} value={rooms.length} />
        <Card title={t('facilities.kpi.capacity')} value={totalCapacity} />
        <Card title={t('facilities.kpi.available')} value={available} />
        <Card title={t('facilities.kpi.maintenance')} value={maintenance} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {ROOM_TYPE_FILTERS.map((f) => {
          const count = f === 'all' ? rooms.length : rooms.filter((r) => r.type === f).length;
          return (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1.5 rounded-sm text-sm border ${
                typeFilter === f
                  ? 'bg-pair-600 text-white border-pair-600'
                  : 'bg-white text-muted border-line-strong hover:bg-canvas'
              }`}
            >
              {t(`facilities.roomType.${f}`)} · {count}
            </button>
          );
        })}
      </div>

      <div className="cck-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`${textAlign} text-muted border-b border-line`}>
              <th className="p-4 font-medium">{t('facilities.col.room')}</th>
              <th className="p-4 font-medium">{t('facilities.col.type')}</th>
              <th className="p-4 font-medium">{t('facilities.col.floor')}</th>
              <th className="p-4 font-medium">{t('facilities.col.building')}</th>
              <th className="p-4 font-medium">{t('facilities.col.capacity')}</th>
              <th className="p-4 font-medium">{t('common.status')}</th>
              <th className="p-4 font-medium">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0 align-top">
                <td className="p-4">
                  <p className="font-mono font-medium">{r.code}</p>
                  {r.name && <p className="text-xs text-muted">{r.name}</p>}
                  {r.note && <p className="text-xs text-danger-600 mt-1">{r.note}</p>}
                </td>
                <td className="p-4">{t(`facilities.roomType.${r.type}`)}</td>
                <td className="p-4">{t(`facilities.floor.${r.floor}`)}</td>
                <td className="p-4">{r.building}</td>
                <td className="p-4">{r.capacity}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${ROOM_STATUS_STYLE[r.status]}`}>
                    {t(`facilities.roomStatus.${r.status}`)}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => setEdit(r)}
                    className="px-2.5 py-1 rounded-sm border border-line-strong text-xs hover:bg-canvas"
                  >
                    {t('facilities.room.setStatus')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && <RoomStatusModal room={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function RoomStatusModal({ room, onClose }: { room: FacilityRoom; onClose: () => void }) {
  const { t } = useI18n();
  const [status, setStatus] = useState<RoomStatus>(room.status);
  const [note, setNote] = useState(room.note ?? '');
  const STATUSES: RoomStatus[] = ['available', 'in_use', 'maintenance'];

  const save = () => {
    facilitiesActions.setRoomStatus(room.id, status, note.trim());
    onClose();
  };

  return (
    <ModalShell title={room.code} subtitle={room.name ?? t(`facilities.roomType.${room.type}`)} onClose={onClose}>
      <div className="p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted block mb-2">{t('common.status')}</label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-sm text-sm border ${
                  status === s ? 'bg-pair-600 text-white border-pair-600' : 'border-line-strong hover:bg-canvas'
                }`}
              >
                {t(`facilities.roomStatus.${s}`)}
              </button>
            ))}
          </div>
        </div>
        <Field label={t('facilities.room.note')}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={t('facilities.room.notePlaceholder')}
            className="cck-input"
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-sm border border-line-strong text-sm hover:bg-canvas">
            {t('common.cancel')}
          </button>
          <button onClick={save} className="btn btn-primary">
            {t('common.save')}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ========================================================================== */
/* Tab 2 - Schedule (room timetable, SIS-linked)                              */
/* ========================================================================== */

// Visible timetable window, 08:00 to 18:00.
const DAY_START = 8 * 60;
const DAY_END = 18 * 60;
const DAY_SPAN = DAY_END - DAY_START;
const SCHEDULE_HOURS = Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, i) => 8 + i);

const pctOf = (min: number) => ((min - DAY_START) / DAY_SPAN) * 100;
const clampPct = (p: number) => Math.max(0, Math.min(100, p));

const BOOKING_KIND_STYLE: Record<BookingKind, string> = {
  class: 'bg-pair-100 text-pair-800 border-pair-300',
  lab: 'bg-pair-50 text-pair-700 border-pair-200',
  exam: 'bg-danger-100 text-danger-700 border-danger-400',
  event: 'bg-canvas text-body border-line-strong',
};

const SCHEDULE_TYPE_FILTERS: ('all' | RoomType)[] = ['all', 'classroom', 'lab', 'hall'];
const BOOKING_KINDS: BookingKind[] = ['class', 'lab', 'exam', 'event'];

function ScheduleTab() {
  const { t, isRTL } = useI18n();
  const rooms = useRooms();
  const bookings = useRoomBookings();

  const [day, setDay] = useState<Weekday>('sun');
  const [typeFilter, setTypeFilter] = useState<'all' | RoomType>('all');
  const [bookedOnly, setBookedOnly] = useState(false);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<RoomBooking | null>(null);

  const dayBookings = bookings.filter((b) => b.day === day);
  const bookedRoomIds = new Set(dayBookings.map((b) => b.roomId));

  const visibleRooms = rooms.filter((r) => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (bookedOnly && !bookedRoomIds.has(r.id)) return false;
    return true;
  });

  const classCount = dayBookings.filter((b) => b.kind === 'class').length;
  const labCount = dayBookings.filter((b) => b.kind === 'lab').length;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card title={t('facilities.sched.kpi.bookings')} value={dayBookings.length} />
        <Card title={t('facilities.sched.kpi.roomsBooked')} value={bookedRoomIds.size} />
        <Card title={t('facilities.sched.kpi.classes')} value={classCount} />
        <Card title={t('facilities.sched.kpi.labs')} value={labCount} />
      </div>

      {/* SIS-link notice */}
      <div className="mb-5 px-4 py-3 rounded-sm bg-pair-50 text-pair-700 text-sm flex items-start gap-2">
        <LinkIcon className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{t('facilities.sched.sisNote')}</span>
      </div>

      {/* Day selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        {WEEKDAYS.map((d) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={`px-3 py-1.5 rounded-sm text-sm border ${
              day === d
                ? 'bg-pair-600 text-white border-pair-600'
                : 'bg-white text-muted border-line-strong hover:bg-canvas'
            }`}
          >
            {t(`facilities.sched.day.${d}`)}
          </button>
        ))}
      </div>

      {/* Type filter + controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {SCHEDULE_TYPE_FILTERS.map((f) => {
          const count = f === 'all' ? rooms.length : rooms.filter((r) => r.type === f).length;
          return (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1.5 rounded-sm text-sm border ${
                typeFilter === f
                  ? 'bg-pair-600 text-white border-pair-600'
                  : 'bg-white text-muted border-line-strong hover:bg-canvas'
              }`}
            >
              {t(`facilities.roomType.${f}`)} · {count}
            </button>
          );
        })}
        <button
          onClick={() => setBookedOnly((v) => !v)}
          className={`px-3 py-1.5 rounded-sm text-sm border ${
            bookedOnly
              ? 'bg-pair-600 text-white border-pair-600'
              : 'bg-white text-muted border-line-strong hover:bg-canvas'
          }`}
        >
          {t('facilities.sched.bookedOnly')}
        </button>
        <div className="ms-auto">
          <button onClick={() => setCreating(true)} className="btn btn-primary btn-sm">
            + {t('facilities.sched.addBooking')}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-muted">
        {BOOKING_KINDS.map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={`inline-block w-3 h-3 rounded-sm border ${BOOKING_KIND_STYLE[k]}`} />
            {t(`facilities.sched.kind.${k}`)}
          </span>
        ))}
      </div>

      {visibleRooms.length === 0 ? (
        <EmptyState title={t('facilities.sched.empty')} />
      ) : (
        <div className="cck-card overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Time axis header */}
            <div className="flex items-stretch border-b border-line">
              <div className="w-36 shrink-0 p-2 text-xs font-medium text-muted">
                {t('facilities.sched.roomCol')}
              </div>
              <div className="relative flex-1 h-7">
                {SCHEDULE_HOURS.map((h) => (
                  <span
                    key={h}
                    className="absolute top-1.5 -translate-x-1/2 rtl:translate-x-1/2 text-[11px] text-muted"
                    style={{ insetInlineStart: `${pctOf(h * 60)}%` }}
                  >
                    {String(h).padStart(2, '0')}:00
                  </span>
                ))}
              </div>
            </div>

            {/* Room rows */}
            {visibleRooms.map((room) => {
              const rowBookings = bookingsForRoomDay(bookings, room.id, day);
              return (
                <div key={room.id} className="flex items-stretch border-b border-line last:border-0">
                  <div className="w-36 shrink-0 p-2 border-e border-line">
                    <p className="font-mono text-xs font-medium truncate">{room.code}</p>
                    <p className="text-[11px] text-muted truncate">
                      {room.name ?? t(`facilities.roomType.${room.type}`)}
                    </p>
                  </div>
                  <div className="relative flex-1 h-14 bg-white">
                    {/* hour gridlines */}
                    {SCHEDULE_HOURS.map((h) => (
                      <div
                        key={h}
                        className="absolute top-0 bottom-0 w-px bg-line"
                        style={{ insetInlineStart: `${pctOf(h * 60)}%` }}
                        aria-hidden
                      />
                    ))}
                    {/* booking blocks */}
                    {rowBookings.map((b) => {
                      const start = clampPct(pctOf(toMinutes(b.start)));
                      const end = clampPct(pctOf(toMinutes(b.end)));
                      return (
                        <button
                          key={b.id}
                          onClick={() => setDetail(b)}
                          title={`${b.title} · ${b.start}-${b.end}`}
                          className={`absolute top-1.5 bottom-1.5 overflow-hidden rounded-md border px-1.5 py-1 text-start ${BOOKING_KIND_STYLE[b.kind]}`}
                          style={{
                            insetInlineStart: `${start}%`,
                            width: `${Math.max(end - start, 4)}%`,
                          }}
                        >
                          <span className="block text-[11px] font-semibold leading-tight truncate">
                            {b.title}
                          </span>
                          <span className="block text-[10px] leading-tight truncate opacity-80">
                            {b.start}{isRTL ? ' - ' : '-'}{b.end}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {creating && <BookingFormModal day={day} onClose={() => setCreating(false)} />}
      {detail && <BookingDetailModal booking={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function BookingDetailModal({ booking, onClose }: { booking: RoomBooking; onClose: () => void }) {
  const { t } = useI18n();
  const rooms = useRooms();
  const room = rooms.find((r) => r.id === booking.roomId);

  const remove = () => {
    facilitiesActions.removeBooking(booking.id);
    onClose();
  };

  return (
    <ModalShell title={booking.title} subtitle={t(`facilities.sched.kind.${booking.kind}`)} onClose={onClose}>
      <div className="p-5 space-y-3">
        <DetailRow label={t('facilities.sched.roomCol')} value={room ? `${room.code}${room.name ? ` · ${room.name}` : ''}` : booking.roomId} />
        <DetailRow label={t('facilities.sched.field.day')} value={t(`facilities.sched.day.${booking.day}`)} />
        <DetailRow label={t('facilities.sched.field.time')} value={`${booking.start} - ${booking.end}`} />
        {booking.instructor && <DetailRow label={t('facilities.sched.field.instructor')} value={booking.instructor} />}
        <DetailRow
          label={t('facilities.sched.field.sisRef')}
          value={booking.sisRef ?? t('facilities.sched.notSynced')}
        />
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-sm border border-line-strong text-sm hover:bg-canvas">
            {t('common.cancel')}
          </button>
          <button onClick={remove} className="btn btn-danger">
            {t('facilities.sched.removeBooking')}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-end">{value}</span>
    </div>
  );
}

function BookingFormModal({ day, onClose }: { day: Weekday; onClose: () => void }) {
  const { t } = useI18n();
  const rooms = useRooms();

  const [roomId, setRoomId] = useState(rooms[0]?.id ?? '');
  const [bookingDay, setBookingDay] = useState<Weekday>(day);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<BookingKind>('class');
  const [start, setStart] = useState('08:00');
  const [end, setEnd] = useState('09:15');
  const [instructor, setInstructor] = useState('');
  const [error, setError] = useState<string | null>(null);

  const timeValid = toMinutes(end) > toMinutes(start);
  const valid = roomId && title.trim() && timeValid;

  const save = () => {
    if (!valid) return;
    const conflicts = facilitiesActions.addBooking({
      roomId,
      day: bookingDay,
      title: title.trim(),
      kind,
      start,
      end,
      instructor: instructor.trim() || undefined,
    });
    if (conflicts.length > 0) {
      const c = conflicts[0];
      setError(t('facilities.sched.conflict', { title: c.title, start: c.start, end: c.end }));
      return;
    }
    onClose();
  };

  return (
    <ModalShell title={t('facilities.sched.addBooking')} subtitle={t('facilities.sched.addHint')} onClose={onClose}>
      <div className="p-5 space-y-4">
        {error && (
          <div className="px-3 py-2 rounded-sm bg-danger-50 text-danger-700 text-sm">{error}</div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label={t('facilities.sched.field.title')} className="col-span-2">
            <TextInput value={title} onChange={setTitle} placeholder={t('facilities.sched.field.titlePlaceholder')} />
          </Field>
          <Field label={t('facilities.sched.roomCol')}>
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="cck-input">
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code}{r.name ? ` · ${r.name}` : ''}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('facilities.sched.field.kind')}>
            <select value={kind} onChange={(e) => setKind(e.target.value as BookingKind)} className="cck-input">
              {BOOKING_KINDS.map((k) => (
                <option key={k} value={k}>{t(`facilities.sched.kind.${k}`)}</option>
              ))}
            </select>
          </Field>
          <Field label={t('facilities.sched.field.day')}>
            <select value={bookingDay} onChange={(e) => setBookingDay(e.target.value as Weekday)} className="cck-input">
              {WEEKDAYS.map((d) => (
                <option key={d} value={d}>{t(`facilities.sched.day.${d}`)}</option>
              ))}
            </select>
          </Field>
          <Field label={t('facilities.sched.field.instructor')}>
            <TextInput value={instructor} onChange={setInstructor} placeholder={t('facilities.sched.field.instructorPlaceholder')} />
          </Field>
          <Field label={t('facilities.sched.field.start')}>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="cck-input" />
          </Field>
          <Field label={t('facilities.sched.field.end')}>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="cck-input" />
          </Field>
        </div>
        {!timeValid && (
          <p className="text-xs text-danger-700">{t('facilities.sched.timeInvalid')}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-sm border border-line-strong text-sm hover:bg-canvas">
            {t('common.cancel')}
          </button>
          <button onClick={save} disabled={!valid} className="btn btn-primary">
            {t('common.save')}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ========================================================================== */
/* Tab 3 - Inventory                                                          */
/* ========================================================================== */

function InventoryTab() {
  const { t, locale } = useI18n();
  const textAlign = locale === 'ar' ? 'text-right' : 'text-left';
  const inventory = useInventory();
  const [catFilter, setCatFilter] = useState<'all' | InventoryCategory>('all');
  const [lowOnly, setLowOnly] = useState(false);
  const [edit, setEdit] = useState<InventoryItem | 'new' | null>(null);
  const [restock, setRestock] = useState<InventoryItem | null>(null);
  const [del, setDel] = useState<InventoryItem | null>(null);

  const visible = inventory.filter((i) => {
    if (catFilter !== 'all' && i.category !== catFilter) return false;
    if (lowOnly && !isLowStock(i) && !isOutOfStock(i)) return false;
    return true;
  });

  const stockValue = inventory.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const lowCount = inventory.filter(isLowStock).length;
  const outCount = inventory.filter(isOutOfStock).length;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card title={t('facilities.inv.kpi.items')} value={inventory.length} />
        <Card title={t('facilities.inv.kpi.value')} value={kwd(stockValue)} />
        <Card
          title={t('facilities.inv.kpi.low')}
          value={lowCount}
          onClick={() => setLowOnly(true)}
          active={lowOnly}
        />
        <Card title={t('facilities.inv.kpi.out')} value={outCount} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => { setCatFilter('all'); setLowOnly(false); }}
          className={`px-3 py-1.5 rounded-sm text-sm border ${
            catFilter === 'all' && !lowOnly
              ? 'bg-pair-600 text-white border-pair-600'
              : 'bg-white text-muted border-line-strong hover:bg-canvas'
          }`}
        >
          {t('facilities.inv.cat.all')} · {inventory.length}
        </button>
        {INVENTORY_CATEGORIES.map((c) => {
          const count = inventory.filter((i) => i.category === c).length;
          if (count === 0) return null;
          return (
            <button
              key={c}
              onClick={() => { setCatFilter(c); setLowOnly(false); }}
              className={`px-3 py-1.5 rounded-sm text-sm border ${
                catFilter === c && !lowOnly
                  ? 'bg-pair-600 text-white border-pair-600'
                  : 'bg-white text-muted border-line-strong hover:bg-canvas'
              }`}
            >
              {t(`facilities.inv.cat.${c}`)} · {count}
            </button>
          );
        })}
        <div className="ms-auto">
          <button
            onClick={() => setEdit('new')}
            className="btn btn-primary btn-sm"
          >
            + {t('facilities.inv.addItem')}
          </button>
        </div>
      </div>

      {lowOnly && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="px-2 py-0.5 rounded-sm bg-danger-50 text-danger-700 font-medium">
            {t('facilities.inv.lowOnlyOn')}
          </span>
          <button onClick={() => setLowOnly(false)} className="text-pair-700 hover:underline">
            {t('facilities.inv.showAll')}
          </button>
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState title={t('facilities.inv.empty')} />
      ) : (
        <div className="cck-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`${textAlign} text-muted border-b border-line`}>
                <th className="p-4 font-medium">{t('facilities.inv.col.item')}</th>
                <th className="p-4 font-medium">{t('facilities.inv.col.category')}</th>
                <th className="p-4 font-medium">{t('facilities.inv.col.onHand')}</th>
                <th className="p-4 font-medium">{t('facilities.inv.col.price')}</th>
                <th className="p-4 font-medium">{t('facilities.inv.col.reorder')}</th>
                <th className="p-4 font-medium">{t('facilities.inv.col.lead')}</th>
                <th className="p-4 font-medium">{t('facilities.inv.col.supplier')}</th>
                <th className="p-4 font-medium">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((i) => (
                <tr key={i.id} className="border-b border-line last:border-0 align-top">
                  <td className="p-4">
                    <p className="font-medium">{i.name}</p>
                    <p className="text-xs text-muted font-mono">{i.sku} · {i.location}</p>
                  </td>
                  <td className="p-4">{t(`facilities.inv.cat.${i.category}`)}</td>
                  <td className="p-4">
                    <span className="font-medium">{i.quantity}</span>
                    <span className="text-xs text-muted"> {t(`facilities.inv.unit.${i.unit}`)}</span>
                    <div className="mt-1">
                      {isOutOfStock(i) ? (
                        <span className="px-1.5 py-0.5 rounded-sm text-[11px] font-medium bg-danger-50 text-danger-700">
                          {t('facilities.inv.outOfStock')}
                        </span>
                      ) : isLowStock(i) ? (
                        <span className="px-1.5 py-0.5 rounded-sm text-[11px] font-medium cck-chip-negative">
                          {t('facilities.inv.lowStock')}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">{kwd(i.unitPrice)}</td>
                  <td className="p-4">{i.reorderLevel}</td>
                  <td className="p-4 whitespace-nowrap">{t('facilities.inv.days', { n: i.restockLeadDays })}</td>
                  <td className="p-4">{i.supplier}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => setRestock(i)} className="px-2 py-1 rounded-sm border border-line-strong text-xs hover:bg-canvas">
                        {t('facilities.inv.restock')}
                      </button>
                      <button onClick={() => setEdit(i)} className="px-2 py-1 rounded-sm border border-line-strong text-xs hover:bg-canvas">
                        {t('common.edit')}
                      </button>
                      <button onClick={() => setDel(i)} className="px-2 py-1 rounded-sm border border-danger-200 text-danger-700 text-xs hover:bg-danger-50">
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {edit && (
        <ItemFormModal
          item={edit === 'new' ? null : edit}
          onClose={() => setEdit(null)}
        />
      )}
      {restock && <RestockModal item={restock} onClose={() => setRestock(null)} />}
      <ConfirmDialog
        open={!!del}
        title={t('facilities.inv.deleteTitle')}
        message={t('facilities.inv.deleteMessage', { name: del?.name ?? '' })}
        confirmLabel={t('common.delete')}
        variant="danger"
        onConfirm={() => { if (del) facilitiesActions.deleteItem(del.id); setDel(null); }}
        onCancel={() => setDel(null)}
      />
    </div>
  );
}

function ItemFormModal({ item, onClose }: { item: InventoryItem | null; onClose: () => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: item?.name ?? '',
    sku: item?.sku ?? '',
    category: item?.category ?? ('other' as InventoryCategory),
    quantity: item?.quantity ?? 0,
    unit: item?.unit ?? 'unit',
    unitPrice: item?.unitPrice ?? 0,
    reorderLevel: item?.reorderLevel ?? 0,
    restockLeadDays: item?.restockLeadDays ?? 7,
    supplier: item?.supplier ?? '',
    location: item?.location ?? '',
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const valid = form.name.trim() && form.sku.trim();

  const save = () => {
    if (!valid) return;
    if (item) facilitiesActions.updateItem(item.id, form);
    else facilitiesActions.addItem(form);
    onClose();
  };

  return (
    <ModalShell
      title={item ? t('facilities.inv.editItem') : t('facilities.inv.addItem')}
      subtitle={item?.name}
      onClose={onClose}
    >
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label={t('facilities.inv.col.item')} className="col-span-2">
            <TextInput value={form.name} onChange={(v) => set('name', v)} />
          </Field>
          <Field label="SKU">
            <TextInput value={form.sku} onChange={(v) => set('sku', v)} mono />
          </Field>
          <Field label={t('facilities.inv.col.category')}>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value as InventoryCategory)}
              className="cck-input"
            >
              {INVENTORY_CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(`facilities.inv.cat.${c}`)}</option>
              ))}
            </select>
          </Field>
          <Field label={t('facilities.inv.col.onHand')}>
            <NumInput value={form.quantity} onChange={(v) => set('quantity', v)} />
          </Field>
          <Field label={t('facilities.inv.field.unit')}>
            <select
              value={form.unit}
              onChange={(e) => set('unit', e.target.value)}
              className="cck-input"
            >
              {['unit', 'box', 'pack'].map((u) => (
                <option key={u} value={u}>{t(`facilities.inv.unit.${u}`)}</option>
              ))}
            </select>
          </Field>
          <Field label={t('facilities.inv.field.price')}>
            <NumInput value={form.unitPrice} onChange={(v) => set('unitPrice', v)} step={0.05} />
          </Field>
          <Field label={t('facilities.inv.field.reorder')}>
            <NumInput value={form.reorderLevel} onChange={(v) => set('reorderLevel', v)} />
          </Field>
          <Field label={t('facilities.inv.field.lead')}>
            <NumInput value={form.restockLeadDays} onChange={(v) => set('restockLeadDays', v)} />
          </Field>
          <Field label={t('facilities.inv.col.supplier')}>
            <TextInput value={form.supplier} onChange={(v) => set('supplier', v)} />
          </Field>
          <Field label={t('facilities.inv.field.location')}>
            <TextInput value={form.location} onChange={(v) => set('location', v)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-sm border border-line-strong text-sm hover:bg-canvas">
            {t('common.cancel')}
          </button>
          <button
            onClick={save}
            disabled={!valid}
            className="btn btn-primary"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function RestockModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const { t } = useI18n();
  const [qty, setQty] = useState(Math.max(item.reorderLevel * 2 - item.quantity, 1));

  const save = () => {
    facilitiesActions.restockItem(item.id, qty);
    onClose();
  };

  return (
    <ModalShell title={t('facilities.inv.restock')} subtitle={item.name} onClose={onClose}>
      <div className="p-5 space-y-4">
        <p className="text-sm text-muted">
          {t('facilities.inv.restockHint', { qty: item.quantity, lead: item.restockLeadDays })}
        </p>
        <Field label={t('facilities.inv.restockQty')}>
          <NumInput value={qty} onChange={setQty} min={1} />
        </Field>
        <p className="text-sm">
          {t('facilities.inv.restockResult', { total: item.quantity + qty })}
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-sm border border-line-strong text-sm hover:bg-canvas">
            {t('common.cancel')}
          </button>
          <button onClick={save} className="btn btn-primary">
            {t('facilities.inv.receive')}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ========================================================================== */
/* Shared bits                                                                */
/* ========================================================================== */

function ModalShell({
  title, subtitle, onClose, children, wide = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const { dir } = useI18n();
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div dir={dir} role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className={`relative bg-white rounded-sm shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} my-8`}>
        <div className="flex items-start justify-between gap-4 p-5 border-b border-line sticky top-0 bg-white rounded-t-xl">
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate">{title}</h2>
            {subtitle && <p className="text-xs text-muted truncate">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-8 h-8 rounded-sm border border-line-strong text-muted hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-pair-500 shrink-0"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-muted block mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function TextInput({
  value, onChange, placeholder, mono = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-sm border border-line-strong px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-400 ${mono ? 'font-mono' : ''}`}
    />
  );
}

function NumInput({
  value, onChange, min = 0, max, step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => {
        const n = Number(e.target.value);
        onChange(Number.isFinite(n) ? n : 0);
      }}
      className="cck-input"
    />
  );
}
