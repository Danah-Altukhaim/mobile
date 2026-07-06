'use client';

// Client-side store for the Marketing workspace.
//
// There is no marketing/content backend yet, so the app content that the CCK
// Hub mobile app surfaces - home banners, launch popups, and the announcement
// strip - lives here, persisted to localStorage. Each item carries bilingual
// (EN/AR) copy, an audience, and an optional schedule window; its display
// status (live / scheduled / expired / paused) is derived from `active` plus
// that window against "today". "reset()" reverts to the seed.

import { useSyncExternalStore } from 'react';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type Audience = 'all' | 'new_students' | 'returning' | 'graduating' | 'staff';
export type Accent = 'pair' | 'oasis' | 'gold' | 'danger';
export type ContentStatus = 'live' | 'scheduled' | 'expired' | 'paused';

export const AUDIENCES: Audience[] = ['all', 'new_students', 'returning', 'graduating', 'staff'];
export const ACCENTS: Accent[] = ['pair', 'oasis', 'gold', 'danger'];

/** A call-to-action button. `target` is an in-app route or external URL. */
export interface Cta {
  label: string;
  labelAr: string;
  target: string;
}

export type BannerPlacement = 'home_top' | 'home_carousel' | 'services';
export const BANNER_PLACEMENTS: BannerPlacement[] = ['home_top', 'home_carousel', 'services'];

export interface Banner {
  id: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  /** Stand-in for the uploaded artwork (filename / asset key). */
  imageLabel: string;
  accent: Accent;
  placement: BannerPlacement;
  audience: Audience;
  cta: Cta | null;
  active: boolean;
  /** ISO "YYYY-MM-DD". Empty string = no bound. */
  startDate: string;
  endDate: string;
  /** Lower sorts first within a placement. */
  order: number;
}

export type PopupFrequency = 'once' | 'every_session' | 'daily';
export const POPUP_FREQUENCIES: PopupFrequency[] = ['once', 'every_session', 'daily'];

export interface Popup {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  accent: Accent;
  audience: Audience;
  frequency: PopupFrequency;
  cta: Cta | null;
  active: boolean;
  startDate: string;
  endDate: string;
}

export type AnnouncementTone = 'info' | 'success' | 'warning' | 'alert';
export const ANNOUNCEMENT_TONES: AnnouncementTone[] = ['info', 'success', 'warning', 'alert'];

export interface Announcement {
  id: string;
  text: string;
  textAr: string;
  tone: AnnouncementTone;
  audience: Audience;
  active: boolean;
  startDate: string;
  endDate: string;
}

interface State {
  banners: Banner[];
  popups: Popup[];
  announcements: Announcement[];
}

/* -------------------------------------------------------------------------- */
/* Seed data                                                                  */
/* -------------------------------------------------------------------------- */

const SEED_BANNERS: Banner[] = [
  {
    id: 'ban-welcome',
    title: 'Welcome to Fall 2026',
    titleAr: 'أهلاً بكم في خريف ٢٠٢٦',
    body: 'Registration is open. Build your schedule before classes fill up.',
    bodyAr: 'التسجيل مفتوح. جهّز جدولك قبل اكتمال الشُعب.',
    imageLabel: 'fall-2026-welcome.jpg',
    accent: 'pair',
    placement: 'home_top',
    audience: 'all',
    cta: { label: 'Register now', labelAr: 'سجّل الآن', target: '/academics/registration' },
    active: true,
    startDate: '2026-06-01',
    endDate: '2026-09-15',
    order: 0,
  },
  {
    id: 'ban-library',
    title: 'Extended Library Hours',
    titleAr: 'تمديد ساعات المكتبة',
    body: 'The library is now open until midnight during finals.',
    bodyAr: 'المكتبة مفتوحة حتى منتصف الليل خلال فترة الاختبارات.',
    imageLabel: 'library-hours.jpg',
    accent: 'oasis',
    placement: 'home_carousel',
    audience: 'all',
    cta: null,
    active: true,
    startDate: '',
    endDate: '',
    order: 1,
  },
  {
    id: 'ban-grad',
    title: 'Graduation Clearance',
    titleAr: 'إخلاء طرف التخرج',
    body: 'Graduating this term? Complete your clearance checklist.',
    bodyAr: 'هل تتخرج هذا الفصل؟ أكمل قائمة إخلاء الطرف.',
    imageLabel: 'graduation-clearance.jpg',
    accent: 'gold',
    placement: 'home_carousel',
    audience: 'graduating',
    cta: { label: 'View checklist', labelAr: 'عرض القائمة', target: '/services' },
    active: false,
    startDate: '2026-04-01',
    endDate: '2026-05-30',
    order: 2,
  },
];

const SEED_POPUPS: Popup[] = [
  {
    id: 'pop-tuition',
    title: 'Tuition Deadline Approaching',
    titleAr: 'اقتراب موعد سداد الرسوم',
    message: 'Settle your balance by June 30 to avoid a late fee.',
    messageAr: 'سدّد رصيدك قبل ٣٠ يونيو لتجنّب رسوم التأخير.',
    accent: 'danger',
    audience: 'all',
    frequency: 'daily',
    cta: { label: 'Pay now', labelAr: 'ادفع الآن', target: '/payments' },
    active: true,
    startDate: '2026-06-15',
    endDate: '2026-06-30',
  },
  {
    id: 'pop-survey',
    title: 'Tell us how we are doing',
    titleAr: 'شاركنا رأيك',
    message: 'Take the 2-minute student experience survey.',
    messageAr: 'شارك في استبيان تجربة الطالب الذي يستغرق دقيقتين.',
    accent: 'pair',
    audience: 'returning',
    frequency: 'once',
    cta: { label: 'Start survey', labelAr: 'ابدأ الاستبيان', target: '/services/feedback' },
    active: false,
    startDate: '',
    endDate: '',
  },
];

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-maintenance',
    text: 'Scheduled maintenance Friday 2-4 AM. Some services may be unavailable.',
    textAr: 'صيانة مجدولة يوم الجمعة من ٢ إلى ٤ صباحاً. قد تتعذّر بعض الخدمات.',
    tone: 'warning',
    audience: 'all',
    active: true,
    startDate: '',
    endDate: '',
  },
  {
    id: 'ann-results',
    text: 'Spring grades are now published in the Academics tab.',
    textAr: 'تم نشر درجات الفصل الربيعي في قسم الأكاديميات.',
    tone: 'success',
    audience: 'all',
    active: false,
    startDate: '',
    endDate: '',
  },
];

const SEED: State = {
  banners: SEED_BANNERS,
  popups: SEED_POPUPS,
  announcements: SEED_ANNOUNCEMENTS,
};

/* -------------------------------------------------------------------------- */
/* Store plumbing                                                             */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = 'cck-marketing-v1';

let state: State = SEED;
let hydrated = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function load(): State {
  if (typeof window === 'undefined') return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      banners: parsed.banners ?? SEED.banners,
      popups: parsed.popups ?? SEED.popups,
      announcements: parsed.announcements ?? SEED.announcements,
    };
  } catch {
    return SEED;
  }
}

function persist() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full / unavailable - keep in-memory state */
  }
}

function commit(next: State) {
  state = next;
  persist();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!hydrated && typeof window !== 'undefined') {
    hydrated = true;
    state = load();
    emit();
  }
  return () => {
    listeners.delete(listener);
  };
}

/* -------------------------------------------------------------------------- */
/* Derived helpers                                                            */
/* -------------------------------------------------------------------------- */

/** Today as "YYYY-MM-DD" in local time. */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Display status of any scheduled, toggleable item. */
export function contentStatus(
  item: { active: boolean; startDate: string; endDate: string },
  now: string = today(),
): ContentStatus {
  if (!item.active) return 'paused';
  if (item.startDate && item.startDate > now) return 'scheduled';
  if (item.endDate && item.endDate < now) return 'expired';
  return 'live';
}

export const isLive = (item: { active: boolean; startDate: string; endDate: string }) =>
  contentStatus(item) === 'live';

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;

export const marketingActions = {
  /* --- Banners --- */
  addBanner(payload: Omit<Banner, 'id'>) {
    const banner: Banner = { ...payload, id: uid('ban') };
    commit({ ...state, banners: [...clone(state.banners), banner] });
  },

  updateBanner(id: string, patch: Partial<Omit<Banner, 'id'>>) {
    const banners = state.banners.map((b) => (b.id === id ? { ...b, ...patch } : b));
    commit({ ...state, banners });
  },

  deleteBanner(id: string) {
    commit({ ...state, banners: state.banners.filter((b) => b.id !== id) });
  },

  toggleBanner(id: string) {
    const banners = state.banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
    commit({ ...state, banners });
  },

  /* --- Popups --- */
  addPopup(payload: Omit<Popup, 'id'>) {
    const popup: Popup = { ...payload, id: uid('pop') };
    commit({ ...state, popups: [...clone(state.popups), popup] });
  },

  updatePopup(id: string, patch: Partial<Omit<Popup, 'id'>>) {
    const popups = state.popups.map((p) => (p.id === id ? { ...p, ...patch } : p));
    commit({ ...state, popups });
  },

  deletePopup(id: string) {
    commit({ ...state, popups: state.popups.filter((p) => p.id !== id) });
  },

  togglePopup(id: string) {
    const popups = state.popups.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    commit({ ...state, popups });
  },

  /* --- Announcements --- */
  addAnnouncement(payload: Omit<Announcement, 'id'>) {
    const announcement: Announcement = { ...payload, id: uid('ann') };
    commit({ ...state, announcements: [...clone(state.announcements), announcement] });
  },

  updateAnnouncement(id: string, patch: Partial<Omit<Announcement, 'id'>>) {
    const announcements = state.announcements.map((a) => (a.id === id ? { ...a, ...patch } : a));
    commit({ ...state, announcements });
  },

  deleteAnnouncement(id: string) {
    commit({ ...state, announcements: state.announcements.filter((a) => a.id !== id) });
  },

  toggleAnnouncement(id: string) {
    const announcements = state.announcements.map((a) =>
      a.id === id ? { ...a, active: !a.active } : a,
    );
    commit({ ...state, announcements });
  },

  reset() {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
    commit(SEED);
  },
};

/* -------------------------------------------------------------------------- */
/* Hooks                                                                      */
/* -------------------------------------------------------------------------- */

export function useBanners(): Banner[] {
  return useSyncExternalStore(subscribe, () => state.banners, () => SEED.banners);
}

export function usePopups(): Popup[] {
  return useSyncExternalStore(subscribe, () => state.popups, () => SEED.popups);
}

export function useAnnouncements(): Announcement[] {
  return useSyncExternalStore(subscribe, () => state.announcements, () => SEED.announcements);
}
