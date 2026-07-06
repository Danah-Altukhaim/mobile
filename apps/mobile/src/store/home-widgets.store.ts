import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type WidgetId = 'stats' | 'quickActions' | 'todayClasses' | 'deadlines';

export interface Widget {
  id: WidgetId;
  enabled: boolean;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: 'stats', enabled: true },
  { id: 'quickActions', enabled: true },
  { id: 'todayClasses', enabled: true },
  { id: 'deadlines', enabled: true },
];

const STORAGE_KEY = 'home_widgets_v1';

interface PersistShape {
  widgets: Widget[];
  showGpa: boolean;
  showBalance: boolean;
}

interface HomeWidgetsState extends PersistShape {
  hydrated: boolean;
  toggle: (id: WidgetId) => void;
  toggleSub: (key: 'showGpa' | 'showBalance') => void;
  move: (id: WidgetId, dir: 'up' | 'down') => void;
  reset: () => void;
  hydrate: () => Promise<void>;
}

function persist(state: PersistShape) {
  const payload: PersistShape = {
    widgets: state.widgets,
    showGpa: state.showGpa,
    showBalance: state.showBalance,
  };
  SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
}

function sanitize(raw: unknown): PersistShape | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<PersistShape>;
  if (!Array.isArray(r.widgets)) return null;
  const known = new Set<WidgetId>(DEFAULT_WIDGETS.map((w) => w.id));
  const seen = new Set<WidgetId>();
  const widgets: Widget[] = [];
  for (const w of r.widgets) {
    if (!w || typeof w !== 'object') continue;
    const id = (w as Widget).id;
    if (!known.has(id) || seen.has(id)) continue;
    seen.add(id);
    widgets.push({ id, enabled: !!(w as Widget).enabled });
  }
  for (const def of DEFAULT_WIDGETS) {
    if (!seen.has(def.id)) widgets.push(def);
  }
  return {
    widgets,
    showGpa: r.showGpa !== false,
    showBalance: r.showBalance !== false,
  };
}

export const useHomeWidgets = create<HomeWidgetsState>((set, get) => ({
  widgets: DEFAULT_WIDGETS,
  showGpa: true,
  showBalance: true,
  hydrated: false,

  toggle: (id) => {
    const widgets = get().widgets.map((w) =>
      w.id === id ? { ...w, enabled: !w.enabled } : w,
    );
    set({ widgets });
    persist({ ...get(), widgets });
  },

  toggleSub: (key) => {
    const next = !get()[key];
    set({ [key]: next } as Pick<HomeWidgetsState, 'showGpa' | 'showBalance'>);
    persist({ ...get(), [key]: next });
  },

  move: (id, dir) => {
    const widgets = [...get().widgets];
    const i = widgets.findIndex((w) => w.id === id);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= widgets.length) return;
    [widgets[i], widgets[j]] = [widgets[j], widgets[i]];
    set({ widgets });
    persist({ ...get(), widgets });
  },

  reset: () => {
    const next: PersistShape = {
      widgets: DEFAULT_WIDGETS,
      showGpa: true,
      showBalance: true,
    };
    set(next);
    persist(next);
  },

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        const parsed = sanitize(JSON.parse(raw));
        if (parsed) set({ ...parsed, hydrated: true });
        else set({ hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
}));
