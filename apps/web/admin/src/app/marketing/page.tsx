'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { CloseIcon, ImageIcon } from '@/components/icons';
import { useI18n } from '@/lib/i18n';
import {
  useBanners, usePopups, useAnnouncements, marketingActions,
  contentStatus,
  AUDIENCES, ACCENTS, BANNER_PLACEMENTS, POPUP_FREQUENCIES, ANNOUNCEMENT_TONES,
  type Banner, type Popup, type Announcement,
  type Audience, type Accent, type ContentStatus, type Cta,
  type BannerPlacement, type PopupFrequency, type AnnouncementTone,
} from '@/lib/marketingStore';

type Tab = 'banners' | 'popups' | 'announcements';
const TABS: Tab[] = ['banners', 'popups', 'announcements'];

const STATUS_STYLE: Record<ContentStatus, string> = {
  live: 'cck-chip-positive',
  scheduled: 'cck-chip-neutral',
  expired: 'cck-chip-negative',
  paused: 'cck-chip-neutral',
};

const ACCENT_BAR: Record<Accent, string> = {
  pair: 'bg-pair-600',
  oasis: 'bg-pair-600',
  gold: 'bg-line-strong',
  danger: 'bg-danger-600',
};

const ACCENT_WASH: Record<Accent, string> = {
  pair: 'bg-pair-50',
  oasis: 'bg-pair-50',
  gold: 'bg-canvas',
  danger: 'bg-danger-50',
};

/* Raw hex used by the on-device phone preview (inline styles, not Tailwind). */
const ACCENT_HEX: Record<Accent, string> = {
  pair: '#006341',
  oasis: '#76B82A',
  gold: '#E8941B',
  danger: '#C01620',
};

/* Mirrors the mobile app theme so the preview reads like the real home screen.
   Radii follow the app's sharp scale: cards 4, buttons 2, chips 0. */
const APP = {
  hero: '#003421',
  paper: '#FBFAF6',
  surface: '#FFFFFF',
  border: '#ECEAE2',
  ink: '#1A1F1A',
  muted: '#5C615C',
  secondaryLight: '#A8D968',
};

const TONE_STYLE: Record<AnnouncementTone, string> = {
  info: 'cck-chip-neutral',
  success: 'cck-chip-positive',
  warning: 'cck-chip-negative',
  alert: 'cck-chip-negative',
};

function StatusBadge({ status }: { status: ContentStatus }) {
  const { t } = useI18n();
  return (
    <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${STATUS_STYLE[status]}`}>
      {t(`marketing.status.${status}`)}
    </span>
  );
}

function ScheduleLine({ start, end }: { start: string; end: string }) {
  const { t } = useI18n();
  if (!start && !end) return <span className="text-muted">{t('marketing.schedule.always')}</span>;
  return (
    <span className="text-muted">
      {start || '…'} {'→'} {end || '…'}
    </span>
  );
}

export default function MarketingPage() {
  const { t, dir } = useI18n();
  const [tab, setTab] = useState<Tab>('banners');
  const banners = useBanners();
  const popups = usePopups();
  const announcements = useAnnouncements();

  const all = [...banners, ...popups, ...announcements];
  const liveCount = all.filter((i) => contentStatus(i) === 'live').length;
  const scheduledCount = all.filter((i) => contentStatus(i) === 'scheduled').length;

  return (
    <div dir={dir}>
      <PageHeader title={t('marketing.title')} subtitle={t('marketing.subtitle')} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card title={t('marketing.kpi.live')} value={liveCount} />
        <Card title={t('marketing.kpi.scheduled')} value={scheduledCount} />
        <Card title={t('marketing.kpi.banners')} value={banners.length} />
        <Card title={t('marketing.kpi.popups')} value={popups.length} />
      </div>

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
            {t(`marketing.tab.${tb}`)}
          </button>
        ))}
      </div>

      {tab === 'banners' && <BannersTab />}
      {tab === 'popups' && <PopupsTab />}
      {tab === 'announcements' && <AnnouncementsTab />}
    </div>
  );
}

/* ========================================================================== */
/* Tab 1 - Banners                                                            */
/* ========================================================================== */

function BannersTab() {
  const { t, locale } = useI18n();
  const banners = useBanners();
  const [edit, setEdit] = useState<Banner | 'new' | null>(null);
  const [remove, setRemove] = useState<Banner | null>(null);
  const [preview, setPreview] = useState<Banner | null>(null);

  const sorted = [...banners].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setEdit('new')} className="btn btn-primary">
          + {t('marketing.new.banner')}
        </button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title={t('marketing.empty.banners.title')}
          description={t('marketing.empty.banners.desc')}
          action={{ label: t('marketing.new.banner'), onClick: () => setEdit('new') }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((b) => {
            const title = locale === 'ar' ? b.titleAr : b.title;
            const body = locale === 'ar' ? b.bodyAr : b.body;
            const cta = b.cta ? (locale === 'ar' ? b.cta.labelAr : b.cta.label) : null;
            return (
              <div key={b.id} className="cck-card overflow-hidden">
                {/* Visual preview strip */}
                <div className={`relative p-5 ${ACCENT_WASH[b.accent]}`}>
                  <span className={`absolute inset-y-0 start-0 w-1.5 ${ACCENT_BAR[b.accent]}`} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-ink truncate">{title}</p>
                      <p className="text-sm text-muted mt-1 line-clamp-2">{body}</p>
                    </div>
                    <StatusBadge status={contentStatus(b)} />
                  </div>
                  {cta && (
                    <span className={`inline-block mt-3 px-3 py-1 rounded-sm text-xs font-semibold text-white ${ACCENT_BAR[b.accent]}`}>
                      {cta}
                    </span>
                  )}
                </div>

                {/* Meta + actions */}
                <div className="p-4 border-t border-line text-xs text-muted flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <span>{t(`marketing.placement.${b.placement}`)}</span>
                  <span>·</span>
                  <span>{t(`marketing.audience.${b.audience}`)}</span>
                  <span>·</span>
                  <ScheduleLine start={b.startDate} end={b.endDate} />
                  <span className="font-mono inline-flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 shrink-0" />{b.imageLabel}</span>
                </div>

                <div className="px-4 pb-4 flex items-center gap-2">
                  <button
                    onClick={() => setPreview(b)}
                    className="px-2.5 py-1 rounded-sm border border-line-strong text-xs hover:bg-canvas"
                  >
                    {t('marketing.action.preview')}
                  </button>
                  <button
                    onClick={() => marketingActions.toggleBanner(b.id)}
                    className="px-2.5 py-1 rounded-sm border border-line-strong text-xs hover:bg-canvas"
                  >
                    {b.active ? t('marketing.action.pause') : t('marketing.action.activate')}
                  </button>
                  <button
                    onClick={() => setEdit(b)}
                    className="px-2.5 py-1 rounded-sm border border-line-strong text-xs hover:bg-canvas"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => setRemove(b)}
                    className="px-2.5 py-1 rounded-sm border border-line-strong text-xs text-danger-700 hover:bg-danger-50"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {preview && <BannerPreviewModal banner={preview} onClose={() => setPreview(null)} />}
      {edit && (
        <BannerModal
          banner={edit === 'new' ? null : edit}
          nextOrder={banners.length}
          onClose={() => setEdit(null)}
        />
      )}
      {remove && (
        <ConfirmDialog
          open
          title={t('marketing.delete.banner.title')}
          message={t('marketing.delete.banner.message')}
          confirmLabel={t('common.delete')}
          variant="danger"
          onConfirm={() => { marketingActions.deleteBanner(remove.id); setRemove(null); }}
          onCancel={() => setRemove(null)}
        />
      )}
    </div>
  );
}

function BannerModal({
  banner, nextOrder, onClose,
}: {
  banner: Banner | null;
  nextOrder: number;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [f, setF] = useState<Omit<Banner, 'id'>>(
    banner
      ? { ...banner }
      : {
          title: '', titleAr: '', body: '', bodyAr: '', imageLabel: '',
          accent: 'pair', placement: 'home_top', audience: 'all', cta: null,
          active: true, startDate: '', endDate: '', order: nextOrder,
        },
  );
  const [hasCta, setHasCta] = useState(!!banner?.cta);
  const [showPreview, setShowPreview] = useState(false);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.title.trim() !== '' && f.titleAr.trim() !== '';

  const draft: Banner = { ...f, id: banner?.id ?? 'preview', cta: hasCta ? (f.cta ?? { label: '', labelAr: '', target: '' }) : null };

  const save = () => {
    if (!valid) return;
    const payload = { ...f, cta: hasCta ? (f.cta ?? { label: '', labelAr: '', target: '' }) : null };
    if (banner) marketingActions.updateBanner(banner.id, payload);
    else marketingActions.addBanner(payload);
    onClose();
  };

  return (
    <ModalShell title={banner ? t('common.edit') : t('marketing.new.banner')} onClose={onClose} wide>
      {showPreview && <BannerPreviewModal banner={draft} onClose={() => setShowPreview(false)} />}
      <div className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label={t('marketing.field.titleEn')}>
            <TextInput value={f.title} onChange={(v) => set('title', v)} />
          </Field>
          <Field label={t('marketing.field.titleAr')}>
            <TextInput value={f.titleAr} onChange={(v) => set('titleAr', v)} dir="rtl" />
          </Field>
          <Field label={t('marketing.field.bodyEn')}>
            <TextArea value={f.body} onChange={(v) => set('body', v)} />
          </Field>
          <Field label={t('marketing.field.bodyAr')}>
            <TextArea value={f.bodyAr} onChange={(v) => set('bodyAr', v)} dir="rtl" />
          </Field>
        </div>

        <Field label={t('marketing.field.image')}>
          <TextInput value={f.imageLabel} onChange={(v) => set('imageLabel', v)} placeholder="banner.jpg" mono />
        </Field>

        <div className="grid md:grid-cols-3 gap-4">
          <Field label={t('marketing.field.placement')}>
            <Select value={f.placement} onChange={(v) => set('placement', v as BannerPlacement)}
              options={BANNER_PLACEMENTS.map((p) => ({ value: p, label: t(`marketing.placement.${p}`) }))} />
          </Field>
          <Field label={t('marketing.field.audience')}>
            <Select value={f.audience} onChange={(v) => set('audience', v as Audience)}
              options={AUDIENCES.map((a) => ({ value: a, label: t(`marketing.audience.${a}`) }))} />
          </Field>
          <Field label={t('marketing.field.order')}>
            <NumInput value={f.order} onChange={(v) => set('order', v)} />
          </Field>
        </div>

        <AccentPicker value={f.accent} onChange={(v) => set('accent', v)} />

        <div className="grid md:grid-cols-2 gap-4">
          <Field label={t('marketing.field.startDate')}>
            <DateInput value={f.startDate} onChange={(v) => set('startDate', v)} />
          </Field>
          <Field label={t('marketing.field.endDate')}>
            <DateInput value={f.endDate} onChange={(v) => set('endDate', v)} />
          </Field>
        </div>

        <CtaEditor enabled={hasCta} cta={f.cta} onToggle={setHasCta} onChange={(c) => set('cta', c)} />

        <ToggleRow label={t('marketing.field.active')} checked={f.active} onChange={(v) => set('active', v)} />
      </div>
      <ModalFooter onClose={onClose} onSave={save} valid={valid} isNew={!banner} onPreview={valid ? () => setShowPreview(true) : undefined} />
    </ModalShell>
  );
}

/* --------------------------------------------------------------------------
 * On-device preview - renders the banner the way a student sees it on the
 * app home screen, inside a phone frame. EN/AR toggle so both renderings can
 * be checked before going live. Radii match the app's sharp scale.
 * ------------------------------------------------------------------------ */

function BannerPreviewModal({ banner, onClose }: { banner: Banner; onClose: () => void }) {
  const { t, locale } = useI18n();
  const [lang, setLang] = useState<'en' | 'ar'>(locale === 'ar' ? 'ar' : 'en');
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const accent = ACCENT_HEX[banner.accent];

  const title = (isAr ? banner.titleAr : banner.title) || (isAr ? banner.title : banner.titleAr);
  const body = isAr ? banner.bodyAr : banner.body;
  const cta = banner.cta ? (isAr ? banner.cta.labelAr : banner.cta.label) : null;

  return (
    <ModalShell title={t('marketing.preview.title')} subtitle={t('marketing.preview.subtitle')} onClose={onClose}>
      <div className="p-5">
        {/* Language toggle */}
        <div className="flex justify-center gap-2 mb-5">
          {(['en', 'ar'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 rounded-sm text-sm border ${
                lang === l ? 'bg-pair-600 text-white border-pair-600' : 'border-line-strong text-muted hover:bg-canvas'
              }`}
            >
              {l === 'en' ? 'English' : 'العربية'}
            </button>
          ))}
        </div>

        {/* Phone frame */}
        <div className="mx-auto" style={{ width: 300 }}>
          <div style={{ borderRadius: 36, padding: 10, background: APP.ink, boxShadow: '0 20px 45px rgba(0,0,0,0.28)' }}>
            <div style={{ borderRadius: 26, overflow: 'hidden', background: APP.paper }}>
              {/* Hero band (mimics the app home header) */}
              <div dir={dir} style={{ background: APP.hero, padding: '12px 16px 16px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: 11,
                    marginBottom: 14,
                  }}
                >
                  <span>9:41</span>
                  <span style={{ letterSpacing: 2 }}>●●●</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: isAr ? 'row-reverse' : 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                    <div style={{ color: APP.secondaryLight, fontSize: 10, textTransform: 'uppercase', opacity: 0.9 }}>
                      {isAr ? 'الأحد، ١٥ يونيو' : 'Sunday, 15 June'}
                    </div>
                    <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, marginTop: 2 }}>
                      {isAr ? 'صباح الخير' : 'Good morning'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexDirection: isAr ? 'row-reverse' : 'row' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
                    <div style={{ width: 32, height: 32, borderRadius: 9999, background: 'rgba(255,255,255,0.22)' }} />
                  </div>
                </div>
              </div>

              {/* Paper area with the banner + faded context rows */}
              <div dir={dir} style={{ padding: 14, minHeight: 300 }}>
                <div style={{ background: APP.surface, borderRadius: 4, overflow: 'hidden', border: `1px solid ${APP.border}` }}>
                  <div style={{ height: 4, background: accent }} />
                  {/* Artwork placeholder */}
                  <div
                    style={{
                      height: 92,
                      background: `${accent}1A`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <span style={{ opacity: 0.55 }}><ImageIcon className="w-6 h-6" /></span>
                    <span style={{ fontSize: 10, color: APP.muted, fontFamily: 'var(--font-mono, monospace)' }}>
                      {banner.imageLabel || 'no image'}
                    </span>
                  </div>
                  <div style={{ padding: 14 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        color: APP.ink,
                        fontSize: 15,
                        lineHeight: 1.3,
                        textAlign: isAr ? 'right' : 'left',
                      }}
                    >
                      {title}
                    </div>
                    {body && (
                      <div
                        style={{
                          color: APP.muted,
                          fontSize: 12.5,
                          lineHeight: 1.5,
                          marginTop: 6,
                          textAlign: isAr ? 'right' : 'left',
                        }}
                      >
                        {body}
                      </div>
                    )}
                    {cta && (
                      <div style={{ marginTop: 12, display: 'flex', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                        <span
                          style={{
                            background: accent,
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '8px 16px',
                            borderRadius: 2,
                          }}
                        >
                          {cta}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* faint placeholder rows to suggest the rest of the screen */}
                <div style={{ marginTop: 16, opacity: 0.4 }}>
                  <div style={{ height: 10, width: '45%', background: APP.border, borderRadius: 2 }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ flex: 1, height: 56, background: APP.surface, border: `1px solid ${APP.border}`, borderRadius: 4 }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-4">
          {t('marketing.preview.note')} · {t(`marketing.placement.${banner.placement}`)}
        </p>
      </div>
    </ModalShell>
  );
}

/* ========================================================================== */
/* Tab 2 - Popups                                                             */
/* ========================================================================== */

function PopupsTab() {
  const { t, locale } = useI18n();
  const popups = usePopups();
  const [edit, setEdit] = useState<Popup | 'new' | null>(null);
  const [remove, setRemove] = useState<Popup | null>(null);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setEdit('new')} className="btn btn-primary">
          + {t('marketing.new.popup')}
        </button>
      </div>

      {popups.length === 0 ? (
        <EmptyState
          title={t('marketing.empty.popups.title')}
          description={t('marketing.empty.popups.desc')}
          action={{ label: t('marketing.new.popup'), onClick: () => setEdit('new') }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {popups.map((p) => {
            const title = locale === 'ar' ? p.titleAr : p.title;
            const message = locale === 'ar' ? p.messageAr : p.message;
            const cta = p.cta ? (locale === 'ar' ? p.cta.labelAr : p.cta.label) : null;
            return (
              <div key={p.id} className="cck-card p-5 flex flex-col">
                {/* Phone-style popup mock */}
                <div className="rounded-sm border border-line p-4 bg-canvas">
                  <div className={`h-1 w-10 rounded-sm ${ACCENT_BAR[p.accent]} mb-3`} />
                  <p className="font-bold text-ink">{title}</p>
                  <p className="text-sm text-muted mt-1">{message}</p>
                  {cta && (
                    <div className={`mt-3 text-center text-xs font-semibold text-white rounded-sm py-1.5 ${ACCENT_BAR[p.accent]}`}>
                      {cta}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge status={contentStatus(p)} />
                  <span className="text-xs text-muted">{t(`marketing.frequency.${p.frequency}`)}</span>
                </div>
                <div className="mt-1.5 text-xs text-muted flex flex-wrap gap-x-3 gap-y-1">
                  <span>{t(`marketing.audience.${p.audience}`)}</span>
                  <ScheduleLine start={p.startDate} end={p.endDate} />
                </div>

                <div className="mt-3 pt-3 border-t border-line flex items-center gap-2">
                  <button
                    onClick={() => marketingActions.togglePopup(p.id)}
                    className="px-2.5 py-1 rounded-sm border border-line-strong text-xs hover:bg-canvas"
                  >
                    {p.active ? t('marketing.action.pause') : t('marketing.action.activate')}
                  </button>
                  <button onClick={() => setEdit(p)} className="px-2.5 py-1 rounded-sm border border-line-strong text-xs hover:bg-canvas">
                    {t('common.edit')}
                  </button>
                  <button onClick={() => setRemove(p)} className="px-2.5 py-1 rounded-sm border border-line-strong text-xs text-danger-700 hover:bg-danger-50">
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {edit && <PopupModal popup={edit === 'new' ? null : edit} onClose={() => setEdit(null)} />}
      {remove && (
        <ConfirmDialog
          open
          title={t('marketing.delete.popup.title')}
          message={t('marketing.delete.popup.message')}
          confirmLabel={t('common.delete')}
          variant="danger"
          onConfirm={() => { marketingActions.deletePopup(remove.id); setRemove(null); }}
          onCancel={() => setRemove(null)}
        />
      )}
    </div>
  );
}

function PopupModal({ popup, onClose }: { popup: Popup | null; onClose: () => void }) {
  const { t } = useI18n();
  const [f, setF] = useState<Omit<Popup, 'id'>>(
    popup
      ? { ...popup }
      : {
          title: '', titleAr: '', message: '', messageAr: '',
          accent: 'pair', audience: 'all', frequency: 'once', cta: null,
          active: true, startDate: '', endDate: '',
        },
  );
  const [hasCta, setHasCta] = useState(!!popup?.cta);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.title.trim() !== '' && f.titleAr.trim() !== '';

  const save = () => {
    if (!valid) return;
    const payload = { ...f, cta: hasCta ? (f.cta ?? { label: '', labelAr: '', target: '' }) : null };
    if (popup) marketingActions.updatePopup(popup.id, payload);
    else marketingActions.addPopup(payload);
    onClose();
  };

  return (
    <ModalShell title={popup ? t('common.edit') : t('marketing.new.popup')} onClose={onClose} wide>
      <div className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label={t('marketing.field.titleEn')}>
            <TextInput value={f.title} onChange={(v) => set('title', v)} />
          </Field>
          <Field label={t('marketing.field.titleAr')}>
            <TextInput value={f.titleAr} onChange={(v) => set('titleAr', v)} dir="rtl" />
          </Field>
          <Field label={t('marketing.field.messageEn')}>
            <TextArea value={f.message} onChange={(v) => set('message', v)} />
          </Field>
          <Field label={t('marketing.field.messageAr')}>
            <TextArea value={f.messageAr} onChange={(v) => set('messageAr', v)} dir="rtl" />
          </Field>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Field label={t('marketing.field.audience')}>
            <Select value={f.audience} onChange={(v) => set('audience', v as Audience)}
              options={AUDIENCES.map((a) => ({ value: a, label: t(`marketing.audience.${a}`) }))} />
          </Field>
          <Field label={t('marketing.field.frequency')}>
            <Select value={f.frequency} onChange={(v) => set('frequency', v as PopupFrequency)}
              options={POPUP_FREQUENCIES.map((fr) => ({ value: fr, label: t(`marketing.frequency.${fr}`) }))} />
          </Field>
        </div>

        <AccentPicker value={f.accent} onChange={(v) => set('accent', v)} />

        <div className="grid md:grid-cols-2 gap-4">
          <Field label={t('marketing.field.startDate')}>
            <DateInput value={f.startDate} onChange={(v) => set('startDate', v)} />
          </Field>
          <Field label={t('marketing.field.endDate')}>
            <DateInput value={f.endDate} onChange={(v) => set('endDate', v)} />
          </Field>
        </div>

        <CtaEditor enabled={hasCta} cta={f.cta} onToggle={setHasCta} onChange={(c) => set('cta', c)} />

        <ToggleRow label={t('marketing.field.active')} checked={f.active} onChange={(v) => set('active', v)} />
      </div>
      <ModalFooter onClose={onClose} onSave={save} valid={valid} isNew={!popup} />
    </ModalShell>
  );
}

/* ========================================================================== */
/* Tab 3 - Announcements                                                      */
/* ========================================================================== */

function AnnouncementsTab() {
  const { t, locale } = useI18n();
  const announcements = useAnnouncements();
  const [edit, setEdit] = useState<Announcement | 'new' | null>(null);
  const [remove, setRemove] = useState<Announcement | null>(null);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setEdit('new')} className="btn btn-primary">
          + {t('marketing.new.announcement')}
        </button>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          title={t('marketing.empty.announcements.title')}
          description={t('marketing.empty.announcements.desc')}
          action={{ label: t('marketing.new.announcement'), onClick: () => setEdit('new') }}
        />
      ) : (
        <div className="cck-card divide-y divide-line">
          {announcements.map((a) => {
            const text = locale === 'ar' ? a.textAr : a.text;
            return (
              <div key={a.id} className="p-4 flex items-center gap-3 flex-wrap">
                <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${TONE_STYLE[a.tone]}`}>
                  {t(`marketing.tone.${a.tone}`)}
                </span>
                <p className="text-sm text-ink flex-1 min-w-[12rem]">{text}</p>
                <StatusBadge status={contentStatus(a)} />
                <span className="text-xs text-muted">{t(`marketing.audience.${a.audience}`)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => marketingActions.toggleAnnouncement(a.id)}
                    className="px-2.5 py-1 rounded-sm border border-line-strong text-xs hover:bg-canvas"
                  >
                    {a.active ? t('marketing.action.pause') : t('marketing.action.activate')}
                  </button>
                  <button onClick={() => setEdit(a)} className="px-2.5 py-1 rounded-sm border border-line-strong text-xs hover:bg-canvas">
                    {t('common.edit')}
                  </button>
                  <button onClick={() => setRemove(a)} className="px-2.5 py-1 rounded-sm border border-line-strong text-xs text-danger-700 hover:bg-danger-50">
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {edit && <AnnouncementModal announcement={edit === 'new' ? null : edit} onClose={() => setEdit(null)} />}
      {remove && (
        <ConfirmDialog
          open
          title={t('marketing.delete.announcement.title')}
          message={t('marketing.delete.announcement.message')}
          confirmLabel={t('common.delete')}
          variant="danger"
          onConfirm={() => { marketingActions.deleteAnnouncement(remove.id); setRemove(null); }}
          onCancel={() => setRemove(null)}
        />
      )}
    </div>
  );
}

function AnnouncementModal({ announcement, onClose }: { announcement: Announcement | null; onClose: () => void }) {
  const { t } = useI18n();
  const [f, setF] = useState<Omit<Announcement, 'id'>>(
    announcement
      ? { ...announcement }
      : { text: '', textAr: '', tone: 'info', audience: 'all', active: true, startDate: '', endDate: '' },
  );
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.text.trim() !== '' && f.textAr.trim() !== '';

  const save = () => {
    if (!valid) return;
    if (announcement) marketingActions.updateAnnouncement(announcement.id, f);
    else marketingActions.addAnnouncement(f);
    onClose();
  };

  return (
    <ModalShell title={announcement ? t('common.edit') : t('marketing.new.announcement')} onClose={onClose}>
      <div className="p-5 space-y-4">
        <Field label={t('marketing.field.textEn')}>
          <TextArea value={f.text} onChange={(v) => set('text', v)} />
        </Field>
        <Field label={t('marketing.field.textAr')}>
          <TextArea value={f.textAr} onChange={(v) => set('textAr', v)} dir="rtl" />
        </Field>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label={t('marketing.field.tone')}>
            <Select value={f.tone} onChange={(v) => set('tone', v as AnnouncementTone)}
              options={ANNOUNCEMENT_TONES.map((to) => ({ value: to, label: t(`marketing.tone.${to}`) }))} />
          </Field>
          <Field label={t('marketing.field.audience')}>
            <Select value={f.audience} onChange={(v) => set('audience', v as Audience)}
              options={AUDIENCES.map((a) => ({ value: a, label: t(`marketing.audience.${a}`) }))} />
          </Field>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label={t('marketing.field.startDate')}>
            <DateInput value={f.startDate} onChange={(v) => set('startDate', v)} />
          </Field>
          <Field label={t('marketing.field.endDate')}>
            <DateInput value={f.endDate} onChange={(v) => set('endDate', v)} />
          </Field>
        </div>
        <ToggleRow label={t('marketing.field.active')} checked={f.active} onChange={(v) => set('active', v)} />
      </div>
      <ModalFooter onClose={onClose} onSave={save} valid={valid} isNew={!announcement} />
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
        <div className="flex items-start justify-between gap-4 p-5 border-b border-line sticky top-0 bg-white rounded-t-xl z-10">
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

function ModalFooter({ onClose, onSave, valid, isNew, onPreview }: { onClose: () => void; onSave: () => void; valid: boolean; isNew: boolean; onPreview?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-end gap-2 p-5 border-t border-line sticky bottom-0 bg-white rounded-b-xl">
      {onPreview && (
        <button onClick={onPreview} className="me-auto px-4 py-2 rounded-sm border border-line-strong text-sm hover:bg-canvas">
          {t('marketing.action.preview')}
        </button>
      )}
      <button onClick={onClose} className="px-4 py-2 rounded-sm border border-line-strong text-sm hover:bg-canvas">
        {t('common.cancel')}
      </button>
      <button
        onClick={onSave}
        disabled={!valid}
        className="px-4 py-2 rounded-sm bg-pair-600 text-white text-sm font-semibold hover:bg-pair-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isNew ? t('common.create') : t('marketing.action.save')}
      </button>
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
  value, onChange, placeholder, mono = false, dir,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  dir?: 'rtl' | 'ltr';
}) {
  return (
    <input
      type="text"
      value={value}
      dir={dir}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-sm border border-line-strong px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-400 ${mono ? 'font-mono' : ''}`}
    />
  );
}

function TextArea({ value, onChange, dir }: { value: string; onChange: (v: string) => void; dir?: 'rtl' | 'ltr' }) {
  return (
    <textarea
      value={value}
      dir={dir}
      rows={2}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-sm border border-line-strong px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-400 resize-y"
    />
  );
}

function NumInput({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      onChange={(e) => {
        const n = Number(e.target.value);
        onChange(Number.isFinite(n) ? n : 0);
      }}
      className="w-full rounded-sm border border-line-strong px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-400"
    />
  );
}

function DateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-sm border border-line-strong px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-400"
    />
  );
}

function Select<T extends string>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full rounded-sm border border-line-strong px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pair-400"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function AccentPicker({ value, onChange }: { value: Accent; onChange: (v: Accent) => void }) {
  const { t } = useI18n();
  return (
    <div>
      <span className="text-xs font-semibold text-muted block mb-1.5">{t('marketing.field.accent')}</span>
      <div className="flex flex-wrap gap-2">
        {ACCENTS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => onChange(a)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm border ${
              value === a ? 'border-pair-600 ring-1 ring-pair-600' : 'border-line-strong hover:bg-canvas'
            }`}
          >
            <span className={`w-3.5 h-3.5 rounded-sm ${ACCENT_BAR[a]}`} />
            {t(`marketing.accent.${a}`)}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-sm border border-line-strong px-3 py-2.5 cursor-pointer">
      <span className="text-sm font-medium text-ink">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-pair-600' : 'bg-line-strong'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'start-[1.125rem]' : 'start-0.5'}`} />
      </button>
    </label>
  );
}

function CtaEditor({
  enabled, cta, onToggle, onChange,
}: {
  enabled: boolean;
  cta: Cta | null;
  onToggle: (v: boolean) => void;
  onChange: (c: Cta) => void;
}) {
  const { t } = useI18n();
  const c = cta ?? { label: '', labelAr: '', target: '' };
  const set = (patch: Partial<Cta>) => onChange({ ...c, ...patch });
  return (
    <div className="rounded-sm border border-line-strong p-3 space-y-3">
      <ToggleRow label={t('marketing.field.cta')} checked={enabled} onChange={onToggle} />
      {enabled && (
        <div className="grid md:grid-cols-3 gap-3">
          <Field label={t('marketing.field.ctaLabelEn')}>
            <TextInput value={c.label} onChange={(v) => set({ label: v })} />
          </Field>
          <Field label={t('marketing.field.ctaLabelAr')}>
            <TextInput value={c.labelAr} onChange={(v) => set({ labelAr: v })} dir="rtl" />
          </Field>
          <Field label={t('marketing.field.ctaTarget')}>
            <TextInput value={c.target} onChange={(v) => set({ target: v })} placeholder="/payments" mono />
          </Field>
        </div>
      )}
    </div>
  );
}
