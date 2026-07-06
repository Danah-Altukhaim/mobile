'use client';

import { useEffect } from 'react';
import { CloseIcon } from '@/components/icons';
import { useI18n } from '@/lib/i18n';

export const kwd = (n: number) =>
  `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KWD`;

export function ModalShell({
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

export function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-muted block mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({
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

export function NumInput({
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
