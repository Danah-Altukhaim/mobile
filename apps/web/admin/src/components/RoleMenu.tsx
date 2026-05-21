'use client';

import { useEffect, useRef, useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  options: Option[];
  badgeClass: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}

export default function RoleMenu({ value, options, badgeClass, onChange, ariaLabel }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badgeClass} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pair-500`}
      >
        <span>{current?.label ?? value}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="opacity-60">
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 min-w-[10rem] bg-white border border-gray-200 rounded-lg shadow-lg py-1 start-0"
        >
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => { setOpen(false); if (!selected) onChange(opt.value); }}
                  className={`w-full text-start px-3 py-1.5 text-sm hover:bg-gray-50 ${selected ? 'text-pair-700 font-medium' : 'text-[#222]'}`}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
