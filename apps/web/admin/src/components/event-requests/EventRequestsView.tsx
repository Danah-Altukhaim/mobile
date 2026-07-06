'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import RejectReasonDialog from '@/components/RejectReasonDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import { CloseIcon, PaperclipIcon } from '@/components/icons';
import { useI18n } from '@/lib/i18n';
import { kwd, ModalShell, Field, TextInput, NumInput } from '@/components/facilities/ui';
import {
  useRooms, useInventory, useEventRequests, useBudgets, facilitiesActions,
  isLowStock, lineCost, requestCost, budgetRemaining, approvalBlockers, uid,
  DEPARTMENTS,
  type DepartmentId,
  type EventRequest, type RequestStatus, type RequestLine, type Attachment, type Budget,
} from '@/lib/facilitiesStore';

export type EventRequestsVariant = 'marketing' | 'staff' | 'facilities';

const VARIANTS: EventRequestsVariant[] = ['marketing', 'staff', 'facilities'];

// Briefs are filed by a staff department; Marketing is the fulfiller, not a requester.
const BRIEF_DEPARTMENTS: DepartmentId[] = DEPARTMENTS.filter((d) => d !== 'marketing');

const REQUEST_STATUS_STYLE: Record<RequestStatus, string> = {
  brief: 'cck-chip-neutral',
  pending: 'cck-chip-neutral',
  approved: 'cck-chip-positive',
  fulfilled: 'cck-chip-positive',
  rejected: 'cck-chip-negative',
  sent_back: 'cck-chip-neutral',
};

interface ViewConfig {
  /** Show the per-department budget strip and item prices/costs. */
  money: boolean;
  /** Staff can file new briefs. */
  canCreateBrief: boolean;
  /** Status filter tabs for this view. */
  filters: ('all' | RequestStatus)[];
  /** Hide requests that have not reached this view's stage yet. */
  scope: (r: EventRequest) => boolean;
}

const VIEW_CONFIG: Record<EventRequestsVariant, ViewConfig> = {
  staff: {
    money: false,
    canCreateBrief: true,
    filters: ['all', 'brief', 'pending', 'sent_back', 'approved', 'fulfilled', 'rejected'],
    scope: () => true,
  },
  marketing: {
    money: false,
    canCreateBrief: false,
    filters: ['all', 'brief', 'sent_back', 'pending', 'approved', 'fulfilled', 'rejected'],
    scope: () => true,
  },
  facilities: {
    money: true,
    canCreateBrief: false,
    filters: ['all', 'pending', 'approved', 'sent_back', 'rejected', 'fulfilled'],
    // Briefs aren't Facilities' concern until Marketing has shopped them.
    scope: (r) => r.status !== 'brief',
  },
};

export default function EventRequestsView() {
  const { t, dir } = useI18n();
  const requests = useEventRequests();
  const inventory = useInventory();
  const rooms = useRooms();
  const budgets = useBudgets();
  const [variant, setVariant] = useState<EventRequestsVariant>('marketing');
  const [filter, setFilter] = useState<'all' | RequestStatus>('all');
  const [creating, setCreating] = useState(false);
  const [shopping, setShopping] = useState<EventRequest | null>(null);
  const [rejecting, setRejecting] = useState<EventRequest | null>(null);
  const [sendingBack, setSendingBack] = useState<EventRequest | null>(null);
  const [cancelling, setCancelling] = useState<EventRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const config = VIEW_CONFIG[variant];
  const scoped = requests.filter(config.scope);
  const visible = scoped.filter((r) => filter === 'all' || r.status === filter);

  const switchVariant = (v: EventRequestsVariant) => {
    setVariant(v);
    setFilter('all');
    setError(null);
  };

  const roomLabel = (id: string | null) => {
    if (!id) return t('facilities.req.noRoom');
    const room = rooms.find((r) => r.id === id);
    return room ? `${room.code}${room.name ? ` · ${room.name}` : ''}` : id;
  };

  const approve = (req: EventRequest) => {
    const blockers = facilitiesActions.approveRequest(req.id);
    if (blockers.length > 0) {
      const b = blockers[0];
      if (b.kind === 'budget') {
        setError(t('facilities.req.blockBudget', { need: kwd(b.need), remaining: kwd(b.remaining) }));
      } else {
        const item = inventory.find((i) => i.id === b.itemId);
        setError(t('facilities.req.blockStock', { item: item?.name ?? b.itemId, need: b.need, have: b.have }));
      }
    } else {
      setError(null);
    }
  };

  return (
    <div dir={dir}>
      <PageHeader title={t('eventRequests.title')} subtitle={t(`eventRequests.subtitle.${variant}`)} />

      <div className="inline-flex rounded-sm border border-line-strong bg-white p-0.5 mb-6">
        {VARIANTS.map((v) => (
          <button
            key={v}
            onClick={() => switchVariant(v)}
            aria-pressed={variant === v}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              variant === v
                ? 'bg-pair-600 text-white'
                : 'text-muted hover:text-ink'
            }`}
          >
            {t(`eventRequests.view.${v}`)}
          </button>
        ))}
      </div>

      {config.money && <BudgetStrip budgets={budgets} />}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {config.filters.map((f) => {
          const count = f === 'all' ? scoped.length : scoped.filter((r) => r.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-sm text-sm border ${
                filter === f
                  ? 'bg-pair-600 text-white border-pair-600'
                  : 'bg-white text-muted border-line-strong hover:bg-canvas'
              }`}
            >
              {t(`facilities.req.filter.${f}`)} · {count}
            </button>
          );
        })}
        {config.canCreateBrief && (
          <div className="ms-auto">
            <button onClick={() => setCreating(true)} className="btn btn-primary btn-sm">
              + {t('eventRequests.newBrief')}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-sm bg-danger-50 text-danger-700 text-sm flex items-start justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label={t('common.cancel')}><CloseIcon className="w-4 h-4" /></button>
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState title={t('facilities.req.empty')} />
      ) : (
        <div className="space-y-3">
          {visible.map((req) => {
            const isBrief = req.status === 'brief';
            const cost = requestCost(inventory, req);
            const budget = budgets.find((b) => b.department === req.department);
            const blockers = req.status === 'pending'
              ? approvalBlockers({ inventory, budgets }, req)
              : [];
            return (
              <div key={req.id} className="cck-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{req.title}</p>
                    <p className="text-xs text-muted">
                      {t(`facilities.dept.${req.department}`)} · {req.venue === 'external'
                        ? `${t('facilities.req.venue.external')}: ${req.externalLocation || '-'}`
                        : roomLabel(req.roomId)} · {req.date}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {t('facilities.req.attendees', { n: req.attendees })}
                    </p>
                  </div>
                  <div className="text-end">
                    <span className={`inline-block px-2 py-0.5 rounded-sm text-xs font-medium ${REQUEST_STATUS_STYLE[req.status]}`}>
                      {t(`facilities.req.status.${req.status}`)}
                    </span>
                    {config.money && !isBrief && (
                      <p className="text-sm font-semibold mt-1.5">
                        {req.status === 'approved' || req.status === 'fulfilled'
                          ? kwd(req.chargedCost)
                          : kwd(cost)}
                      </p>
                    )}
                  </div>
                </div>

                {isBrief ? (
                  <BriefBody req={req} />
                ) : (
                  <div className="mt-3 border-t border-line pt-3">
                    <table className="w-full text-sm">
                      <tbody>
                        {req.lines.map((line) => {
                          const item = inventory.find((i) => i.id === line.itemId);
                          const short = item && line.quantity > item.quantity && req.status === 'pending';
                          return (
                            <tr key={line.itemId} className="border-b border-line last:border-0">
                              <td className="py-1.5">
                                {item?.name ?? line.customName ?? line.itemId}
                                {line.customName && (
                                  <span className="ms-2 px-1.5 py-0.5 rounded-sm text-[11px] font-medium cck-chip-neutral">
                                    {t('facilities.req.offList')}
                                  </span>
                                )}
                                {short && (
                                  <span className="ms-2 px-1.5 py-0.5 rounded-sm text-[11px] font-medium bg-danger-50 text-danger-700">
                                    {t('facilities.req.short', { have: item?.quantity ?? 0 })}
                                  </span>
                                )}
                              </td>
                              <td className="py-1.5 text-end text-muted whitespace-nowrap">
                                {config.money ? `${line.quantity} × ${kwd(item?.unitPrice ?? line.estUnitPrice ?? 0)}` : `× ${line.quantity}`}
                              </td>
                              {config.money && (
                                <td className="py-1.5 text-end font-medium whitespace-nowrap ps-4">
                                  {kwd(lineCost(inventory, line))}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {req.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {req.attachments.map((a, idx) => (
                      <span key={idx} title={a.note} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm bg-pair-50 text-pair-700 text-xs font-medium">
                        <PaperclipIcon className="w-3.5 h-3.5 shrink-0" />{a.name}
                      </span>
                    ))}
                  </div>
                )}

                {req.notes && <p className="text-xs text-muted mt-3">{req.notes}</p>}

                {req.status === 'rejected' && req.rejectReason && (
                  <p className="text-xs text-danger-700 mt-3 bg-danger-50 rounded-sm px-3 py-2">
                    {t('facilities.req.rejectedReason', { reason: req.rejectReason })}
                  </p>
                )}

                {req.status === 'sent_back' && req.sentBackReason && (
                  <p className="text-xs text-body mt-3 bg-canvas rounded-sm px-3 py-2">
                    {t('facilities.req.sentBackReason', { reason: req.sentBackReason })}
                  </p>
                )}

                {/* --- Per-view actions --- */}

                {/* Staff: cancel a brief they filed (only while still a brief). */}
                {variant === 'staff' && isBrief && (
                  <div className="mt-4">
                    <button
                      onClick={() => setCancelling(req)}
                      className="px-3 py-1.5 border border-danger-200 text-danger-700 rounded-sm text-sm hover:bg-danger-50"
                    >
                      {t('eventRequests.cancelBrief')}
                    </button>
                  </div>
                )}

                {/* Marketing: shop a brief, or re-shop one sent back. */}
                {variant === 'marketing' && (isBrief || req.status === 'sent_back') && (
                  <div className="mt-4">
                    <button onClick={() => setShopping(req)} className="btn btn-primary btn-sm">
                      {isBrief ? t('eventRequests.shop') : t('eventRequests.reevaluate')}
                    </button>
                  </div>
                )}

                {/* Facilities: approve / send back / reject a pending request. */}
                {variant === 'facilities' && req.status === 'pending' && (
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <button
                      onClick={() => approve(req)}
                      disabled={blockers.length > 0}
                      title={blockers.length > 0 ? t('facilities.req.cannotApprove') : undefined}
                      className="px-3 py-1.5 bg-pair-600 text-white rounded-sm text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
                    >
                      {t('facilities.req.approve')}
                    </button>
                    <button
                      onClick={() => setSendingBack(req)}
                      className="px-3 py-1.5 border border-line-strong text-body rounded-sm text-sm hover:bg-canvas"
                    >
                      {t('facilities.req.sendBack')}
                    </button>
                    <button
                      onClick={() => setRejecting(req)}
                      className="px-3 py-1.5 border border-danger-200 text-danger-700 rounded-sm text-sm hover:bg-danger-50"
                    >
                      {t('facilities.req.reject')}
                    </button>
                    {budget && (
                      <span className="text-xs text-muted ms-1">
                        {t('facilities.req.budgetAfter', {
                          dept: t(`facilities.dept.${req.department}`),
                          remaining: kwd(budgetRemaining(budget) - cost),
                        })}
                      </span>
                    )}
                    {blockers.length > 0 && (
                      <span className="text-xs text-danger-700">{t('facilities.req.cannotApprove')}</span>
                    )}
                  </div>
                )}

                {/* Facilities: hand over an approved request. */}
                {variant === 'facilities' && req.status === 'approved' && (
                  <div className="mt-4">
                    <button
                      onClick={() => facilitiesActions.fulfillRequest(req.id)}
                      className="btn btn-primary btn-sm"
                    >
                      {t('facilities.req.markFulfilled')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {creating && <BriefFormModal onClose={() => setCreating(false)} />}
      {shopping && <ShopModal req={shopping} money={config.money} onClose={() => setShopping(null)} />}

      <RejectReasonDialog
        open={!!rejecting}
        title={t('facilities.req.reject')}
        subject={rejecting?.title}
        onConfirm={(reason) => { if (rejecting) facilitiesActions.rejectRequest(rejecting.id, reason); setRejecting(null); }}
        onCancel={() => setRejecting(null)}
      />
      <RejectReasonDialog
        open={!!sendingBack}
        title={t('facilities.req.sendBack')}
        subject={sendingBack?.title}
        hint={t('facilities.req.sendBackHint')}
        confirmLabel={t('facilities.req.sendBack')}
        onConfirm={(reason) => { if (sendingBack) facilitiesActions.sendBackRequest(sendingBack.id, reason); setSendingBack(null); }}
        onCancel={() => setSendingBack(null)}
      />
      <ConfirmDialog
        open={!!cancelling}
        title={t('eventRequests.cancelBrief')}
        message={t('eventRequests.cancelBriefConfirm', { title: cancelling?.title ?? '' })}
        confirmLabel={t('eventRequests.cancelBrief')}
        variant="danger"
        onConfirm={() => { if (cancelling) facilitiesActions.deleteRequest(cancelling.id); setCancelling(null); }}
        onCancel={() => setCancelling(null)}
      />
    </div>
  );
}

/** Read-only summary of a brief: what / who / extra notes. */
function BriefBody({ req }: { req: EventRequest }) {
  const { t } = useI18n();
  return (
    <div className="mt-3 border-t border-line pt-3 space-y-2 text-sm">
      {req.purpose && (
        <div>
          <p className="cck-section-label text-muted text-muted">{t('eventRequests.brief.purpose')}</p>
          <p>{req.purpose}</p>
        </div>
      )}
      {req.audience && (
        <div>
          <p className="cck-section-label text-muted text-muted">{t('eventRequests.brief.audience')}</p>
          <p>{req.audience}</p>
        </div>
      )}
      <p className="text-xs text-muted italic">{t('eventRequests.brief.noItems')}</p>
    </div>
  );
}

function BudgetStrip({ budgets }: { budgets: Budget[] }) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
      {budgets.map((b) => {
        const remaining = budgetRemaining(b);
        const pct = b.total > 0 ? Math.min(100, Math.round((b.spent / b.total) * 100)) : 0;
        const low = remaining <= b.total * 0.15;
        return (
          <div key={b.department} className="cck-card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium truncate">{t(`facilities.dept.${b.department}`)}</p>
              <p className={`text-xs font-semibold ${low ? 'text-danger-600' : 'text-body'}`}>
                {kwd(remaining)}
              </p>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-canvas overflow-hidden">
              <div
                className={`h-full ${low ? 'bg-danger-500' : 'bg-pair-600'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] text-muted mt-1.5">
              {t('facilities.req.budgetSpent', { spent: kwd(b.spent), total: kwd(b.total) })}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Staff: file an event brief (no inventory).                                 */
/* -------------------------------------------------------------------------- */

function BriefFormModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const rooms = useRooms();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<DepartmentId>('student_life');
  const [venue, setVenue] = useState<'on_campus' | 'external'>('on_campus');
  const [roomId, setRoomId] = useState<string>('');
  const [externalLocation, setExternalLocation] = useState('');
  const [date, setDate] = useState('');
  const [attendees, setAttendees] = useState(0);
  const [purpose, setPurpose] = useState('');
  const [audience, setAudience] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attName, setAttName] = useState('');
  const [attNote, setAttNote] = useState('');

  const addAttachment = () => {
    if (!attName.trim()) return;
    setAttachments((a) => [...a, { name: attName.trim(), note: attNote.trim() || undefined }]);
    setAttName('');
    setAttNote('');
  };

  const valid = title.trim() && date && purpose.trim() && (venue === 'on_campus' || externalLocation.trim());

  const submit = () => {
    if (!valid) return;
    facilitiesActions.createBrief({
      title: title.trim(),
      department,
      venue,
      roomId: venue === 'on_campus' ? (roomId || null) : null,
      externalLocation: venue === 'external' ? externalLocation.trim() : undefined,
      date,
      attendees,
      purpose: purpose.trim(),
      audience: audience.trim() || undefined,
      attachments,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <ModalShell title={t('eventRequests.newBrief')} subtitle={t('eventRequests.newBriefHint')} onClose={onClose} wide>
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label={t('facilities.req.field.title')} className="col-span-2">
            <TextInput value={title} onChange={setTitle} placeholder={t('facilities.req.field.titlePlaceholder')} />
          </Field>
          <Field label={t('facilities.req.field.department')}>
            <select value={department} onChange={(e) => setDepartment(e.target.value as DepartmentId)} className="cck-input">
              {BRIEF_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{t(`facilities.dept.${d}`)}</option>
              ))}
            </select>
          </Field>
          <Field label={t('facilities.req.field.date')}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="cck-input" />
          </Field>
          <Field label={t('facilities.req.field.venue')}>
            <select value={venue} onChange={(e) => setVenue(e.target.value as 'on_campus' | 'external')} className="cck-input">
              <option value="on_campus">{t('facilities.req.venue.onCampus')}</option>
              <option value="external">{t('facilities.req.venue.external')}</option>
            </select>
          </Field>
          {venue === 'on_campus' ? (
            <Field label={t('eventRequests.field.roomPreferred')}>
              <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="cck-input">
                <option value="">{t('facilities.req.noRoom')}</option>
                {rooms.filter((r) => r.status !== 'maintenance').map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code}{r.name ? ` · ${r.name}` : ''} ({t('facilities.req.cap', { n: r.capacity })})
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label={t('facilities.req.field.externalLocation')}>
              <TextInput value={externalLocation} onChange={setExternalLocation} placeholder={t('facilities.req.field.externalLocationPlaceholder')} />
            </Field>
          )}
          <Field label={t('facilities.req.field.attendees')}>
            <NumInput value={attendees} onChange={setAttendees} />
          </Field>
          <Field label={t('eventRequests.field.purpose')} className="col-span-2">
            <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={2} placeholder={t('eventRequests.field.purposePlaceholder')} className="cck-input" />
          </Field>
          <Field label={t('eventRequests.field.audience')} className="col-span-2">
            <TextInput value={audience} onChange={setAudience} placeholder={t('eventRequests.field.audiencePlaceholder')} />
          </Field>
        </div>

        {/* Attachments */}
        <div>
          <h3 className="text-sm font-semibold mb-1">{t('facilities.req.attachments')}</h3>
          <p className="text-xs text-muted mb-2">{t('facilities.req.attachHint')}</p>
          <div className="flex flex-wrap items-end gap-2 mb-2">
            <div className="flex-1 min-w-[160px]">
              <TextInput value={attName} onChange={setAttName} placeholder={t('facilities.req.attachName')} />
            </div>
            <div className="flex-1 min-w-[160px]">
              <TextInput value={attNote} onChange={setAttNote} placeholder={t('facilities.req.attachNote')} />
            </div>
            <button onClick={addAttachment} disabled={!attName.trim()} className="px-3 py-2 rounded-sm border border-line-strong text-sm hover:bg-canvas disabled:opacity-50">
              {t('facilities.req.attach')}
            </button>
          </div>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((a, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm bg-pair-50 text-pair-700 text-xs font-medium">
                  <PaperclipIcon className="w-3.5 h-3.5 shrink-0" />{a.name}
                  <button onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))} aria-label={t('common.delete')}>
                    <CloseIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Field label={t('facilities.req.field.notes')}>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="cck-input" />
        </Field>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
          <button onClick={onClose} className="px-4 py-2 rounded-sm border border-line-strong text-sm hover:bg-canvas">
            {t('common.cancel')}
          </button>
          <button onClick={submit} disabled={!valid} className="btn btn-primary">
            {t('eventRequests.submitBrief')}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Marketing: shop a brief - pick room + items, submit to Facilities.         */
/* -------------------------------------------------------------------------- */

type CartLine = RequestLine;

function ShopModal({ req, money, onClose }: { req: EventRequest; money: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const inventory = useInventory();
  const rooms = useRooms();

  const [venue, setVenue] = useState<'on_campus' | 'external'>(req.venue ?? 'on_campus');
  const [roomId, setRoomId] = useState<string>(req.roomId ?? '');
  const [externalLocation, setExternalLocation] = useState(req.externalLocation ?? '');
  const [notes, setNotes] = useState(req.notes ?? '');
  const [cart, setCart] = useState<CartLine[]>(req.lines.map((l) => ({ ...l })));
  const [attachments, setAttachments] = useState<Attachment[]>(req.attachments.map((a) => ({ ...a })));

  const available = inventory.filter((i) => !cart.some((c) => c.itemId === i.id) && i.quantity > 0);
  const [pickItem, setPickItem] = useState<string>('');
  const [pickQty, setPickQty] = useState(1);
  const [customName, setCustomName] = useState('');
  const [customQty, setCustomQty] = useState(1);
  const [customPrice, setCustomPrice] = useState(0);
  const [attName, setAttName] = useState('');
  const [attNote, setAttNote] = useState('');

  const pickedItem = inventory.find((i) => i.id === pickItem);
  const maxForPick = pickedItem?.quantity ?? 0;
  const cartCost = cart.reduce((sum, l) => sum + lineCost(inventory, l), 0);

  const addToCart = () => {
    if (!pickItem || pickQty < 1) return;
    setCart((c) => [...c, { itemId: pickItem, quantity: Math.min(pickQty, maxForPick) }]);
    setPickItem('');
    setPickQty(1);
  };

  const addCustom = () => {
    const name = customName.trim();
    if (!name || customQty < 1) return;
    setCart((c) => [...c, {
      itemId: uid('custom'),
      quantity: customQty,
      customName: name,
      estUnitPrice: money ? (customPrice || undefined) : undefined,
    }]);
    // Commit any file typed but not yet attached so it's added along with the item.
    if (attName.trim()) addAttachment();
    setCustomName('');
    setCustomQty(1);
    setCustomPrice(0);
  };

  const updateCartQty = (itemId: string, qty: number) => {
    setCart((c) => c.map((l) => {
      if (l.itemId !== itemId) return l;
      const max = l.customName ? Infinity : (inventory.find((i) => i.id === l.itemId)?.quantity ?? 0);
      return { ...l, quantity: Math.max(1, Math.min(qty, max)) };
    }));
  };

  const removeFromCart = (itemId: string) => setCart((c) => c.filter((l) => l.itemId !== itemId));

  const addAttachment = () => {
    if (!attName.trim()) return;
    setAttachments((a) => [...a, { name: attName.trim(), note: attNote.trim() || undefined }]);
    setAttName('');
    setAttNote('');
  };

  const valid = cart.length > 0 && (venue === 'on_campus' || externalLocation.trim());

  const submit = () => {
    if (!valid) return;
    facilitiesActions.submitRequest(req.id, {
      venue,
      roomId: venue === 'on_campus' ? (roomId || null) : null,
      externalLocation: venue === 'external' ? externalLocation.trim() : undefined,
      lines: cart,
      attachments,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <ModalShell title={t('eventRequests.shop')} subtitle={t('eventRequests.shopHint')} onClose={onClose} wide>
      <div className="p-5 space-y-5">
        {/* Brief context - set by staff, not editable here. */}
        <div className="rounded-sm border border-line bg-canvas p-4">
          <p className="cck-section-label text-muted text-muted mb-1">{t('eventRequests.briefContext')}</p>
          <p className="font-semibold">{req.title}</p>
          <p className="text-xs text-muted">
            {t(`facilities.dept.${req.department}`)} · {req.date} · {t('facilities.req.attendees', { n: req.attendees })}
          </p>
          {req.purpose && <p className="text-sm mt-2">{req.purpose}</p>}
          {req.audience && <p className="text-xs text-muted mt-1">{t('eventRequests.brief.audience')}: {req.audience}</p>}
        </div>

        {/* Room */}
        <div className="grid grid-cols-2 gap-4">
          <Field label={t('facilities.req.field.venue')}>
            <select value={venue} onChange={(e) => setVenue(e.target.value as 'on_campus' | 'external')} className="cck-input">
              <option value="on_campus">{t('facilities.req.venue.onCampus')}</option>
              <option value="external">{t('facilities.req.venue.external')}</option>
            </select>
          </Field>
          {venue === 'on_campus' ? (
            <Field label={t('facilities.req.field.room')}>
              <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="cck-input">
                <option value="">{t('facilities.req.noRoom')}</option>
                {rooms.filter((r) => r.status !== 'maintenance').map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code}{r.name ? ` · ${r.name}` : ''} ({t('facilities.req.cap', { n: r.capacity })})
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label={t('facilities.req.field.externalLocation')}>
              <TextInput value={externalLocation} onChange={setExternalLocation} placeholder={t('facilities.req.field.externalLocationPlaceholder')} />
            </Field>
          )}
        </div>

        {/* Cart */}
        <div>
          <h3 className="text-sm font-semibold mb-2">{t('facilities.req.cart')}</h3>
          <div className="flex flex-wrap items-end gap-2 mb-3 bg-canvas rounded-sm p-3">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs text-muted block mb-1">{t('facilities.req.pickItem')}</label>
              <select
                value={pickItem}
                onChange={(e) => { setPickItem(e.target.value); setPickQty(1); }}
                className="w-full rounded-sm border border-line-strong px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pair-400"
              >
                <option value="">{t('facilities.req.selectItem')}</option>
                {available.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({t('facilities.req.inStock', { n: i.quantity })})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="text-xs text-muted block mb-1">{t('facilities.req.qty')}</label>
              <NumInput value={pickQty} onChange={setPickQty} min={1} max={maxForPick || undefined} />
            </div>
            <button onClick={addToCart} disabled={!pickItem} className="btn btn-primary btn-sm">
              {t('facilities.req.add')}
            </button>
          </div>
          {pickedItem && isLowStock(pickedItem) && (
            <p className="text-xs text-danger-700 mb-3">
              {t('facilities.req.lowWarn', { name: pickedItem.name, have: pickedItem.quantity })}
            </p>
          )}

          {/* Off-list: request something not in inventory, with its own attachments. */}
          <div className="bg-canvas rounded-sm p-3 mb-3 space-y-2">
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs text-muted block mb-1">{t('facilities.req.customItem')}</label>
                <TextInput value={customName} onChange={setCustomName} placeholder={t('facilities.req.customPlaceholder')} />
              </div>
              {money && (
                <div className="w-28">
                  <label className="text-xs text-muted block mb-1">{t('facilities.req.estUnitPrice')}</label>
                  <NumInput value={customPrice} onChange={setCustomPrice} min={0} step={0.5} />
                </div>
              )}
              <div className="w-24">
                <label className="text-xs text-muted block mb-1">{t('facilities.req.qty')}</label>
                <NumInput value={customQty} onChange={setCustomQty} min={1} />
              </div>
              <button onClick={addCustom} disabled={!customName.trim()} className="btn btn-primary btn-sm">
                {t('facilities.req.add')}
              </button>
            </div>

            {/* Attachments for the new item - staged here, added with the item. */}
            <div className="flex flex-wrap items-end gap-2 pt-1">
              <div className="flex-1 min-w-[160px]">
                <label className="text-xs text-muted block mb-1">{t('facilities.req.attachName')}</label>
                <TextInput value={attName} onChange={setAttName} placeholder={t('facilities.req.attachName')} />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="text-xs text-muted block mb-1">{t('facilities.req.attachNote')}</label>
                <TextInput value={attNote} onChange={setAttNote} placeholder={t('facilities.req.attachNote')} />
              </div>
              <button onClick={addAttachment} disabled={!attName.trim()} className="px-3 py-2 rounded-sm border border-line-strong text-sm hover:bg-canvas disabled:opacity-50">
                {t('facilities.req.attach')}
              </button>
            </div>
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((a, idx) => (
                  <span key={idx} title={a.note} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm bg-pair-50 text-pair-700 text-xs font-medium">
                    <PaperclipIcon className="w-3.5 h-3.5 shrink-0" />{a.name}
                    <button onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))} aria-label={t('common.delete')}>
                      <CloseIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted">{t('facilities.req.customHint')} {t('facilities.req.attachHint')}</p>
          </div>

          {cart.length === 0 ? (
            <p className="text-sm text-muted">{t('facilities.req.cartEmpty')}</p>
          ) : (
            <div className="rounded-sm border border-line overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {cart.map((line) => {
                    const item = inventory.find((i) => i.id === line.itemId);
                    return (
                      <tr key={line.itemId} className="border-b border-line last:border-0">
                        <td className="p-2.5">
                          <p className="font-medium">
                            {item?.name ?? line.customName}
                            {line.customName && (
                              <span className="ms-2 px-1.5 py-0.5 rounded-sm text-[11px] font-medium cck-chip-neutral">
                                {t('facilities.req.offList')}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted">
                            {item ? t('facilities.req.inStock', { n: item.quantity }) : t('facilities.req.toSource')}
                          </p>
                        </td>
                        {money && (
                          <td className="p-2.5 text-end text-muted whitespace-nowrap">{kwd(lineCost(inventory, line))}</td>
                        )}
                        <td className="p-2.5 w-24">
                          <NumInput value={line.quantity} onChange={(v) => updateCartQty(line.itemId, v)} min={1} max={item?.quantity} />
                        </td>
                        <td className="p-2.5 text-end">
                          <button onClick={() => removeFromCart(line.itemId)} aria-label={t('common.delete')} className="text-danger-600 hover:text-danger-700">
                            <CloseIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {money && cart.length > 0 && (
            <p className="text-sm font-semibold text-end mt-2">{t('facilities.req.total')}: {kwd(cartCost)}</p>
          )}
        </div>

        <Field label={t('facilities.req.field.notes')}>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="cck-input" />
        </Field>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
          <button onClick={onClose} className="px-4 py-2 rounded-sm border border-line-strong text-sm hover:bg-canvas">
            {t('common.cancel')}
          </button>
          <button onClick={submit} disabled={!valid} className="btn btn-primary">
            {t('eventRequests.submitToFacilities')}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
