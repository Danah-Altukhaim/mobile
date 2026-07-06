'use client';

interface TabDef<K extends string> {
  key: K;
  label: string;
  count?: number;
}

interface TabsProps<K extends string> {
  tabs: ReadonlyArray<TabDef<K>>;
  active: K;
  onChange: (key: K) => void;
  className?: string;
}

/** Polished underline tab bar in the brand style. */
export default function Tabs<K extends string>({ tabs, active, onChange, className = '' }: TabsProps<K>) {
  return (
    <div className={`flex items-center gap-1 border-b border-line ${className}`} role="tablist">
      {tabs.map(({ key, label, count }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={`relative px-3.5 py-2.5 -mb-px text-sm font-semibold border-b-2 transition-colors ${
              isActive
                ? 'border-pair-600 text-pair-700'
                : 'border-transparent text-muted hover:text-ink hover:border-line'
            }`}
          >
            {label}
            {count != null && (
              <span
                className={`ms-2 inline-flex items-center justify-center min-w-5 px-1.5 h-5 rounded-sm text-[11px] font-semibold tabular-nums ${
                  isActive ? 'bg-pair-600 text-white' : 'bg-canvas text-muted ring-1 ring-inset ring-line'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
