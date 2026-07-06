'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { canAccess } from '@/lib/roles';
import { SearchIcon } from './icons';

const ROUTES: { href: string; labelKey: string; sectionKey: string }[] = [
  { href: '/', labelKey: 'nav.dashboard', sectionKey: 'nav.workflows' },
  { href: '/requests', labelKey: 'nav.requests', sectionKey: 'nav.workflows' },
  { href: '/admissions', labelKey: 'nav.admissions', sectionKey: 'nav.workflows' },
  { href: '/social-allowance', labelKey: 'nav.socialAllowance', sectionKey: 'nav.workflows' },
  { href: '/appeals', labelKey: 'nav.appeals', sectionKey: 'nav.workflows' },
  { href: '/fa-screen', labelKey: 'nav.faScreen', sectionKey: 'nav.workflows' },
  { href: '/warnings', labelKey: 'nav.warnings', sectionKey: 'nav.workflows' },
  { href: '/feedback', labelKey: 'nav.complaints', sectionKey: 'nav.workflows' },
  { href: '/sport', labelKey: 'nav.sport', sectionKey: 'nav.workflows' },
  { href: '/directory', labelKey: 'nav.directory', sectionKey: 'nav.workflows' },
  { href: '/engagement', labelKey: 'nav.engagement', sectionKey: 'nav.analytics' },
  { href: '/retention', labelKey: 'nav.retention', sectionKey: 'nav.analytics' },
  { href: '/payments', labelKey: 'nav.payments', sectionKey: 'nav.analytics' },
  { href: '/ai-monitoring', labelKey: 'nav.aiAdvisor', sectionKey: 'nav.analytics' },
  { href: '/communications', labelKey: 'nav.communications', sectionKey: 'nav.management' },
  { href: '/users', labelKey: 'nav.users', sectionKey: 'nav.management' },
  { href: '/settings', labelKey: 'nav.settings', sectionKey: 'nav.config' },
  { href: '/audit-log', labelKey: 'nav.auditLog', sectionKey: 'nav.config' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const enriched = ROUTES.filter((r) => canAccess(user?.role, r.href)).map((r) => ({
      ...r,
      label: t(r.labelKey),
      section: t(r.sectionKey),
    }));
    if (!q) return enriched;
    return enriched.filter((r) =>
      r.label.toLowerCase().includes(q) || r.section.toLowerCase().includes(q) || r.href.includes(q),
    );
  }, [query, t, user]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIdx(0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        const target = items[activeIdx];
        if (target) {
          e.preventDefault();
          onClose();
          router.push(target.href);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, items, activeIdx, onClose, router]);

  // Keep activeIdx in range when items change
  useEffect(() => {
    if (activeIdx >= items.length) setActiveIdx(Math.max(0, items.length - 1));
  }, [items.length, activeIdx]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('palette.label')}
      dir={dir}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
    >
      <div className="absolute inset-0 bg-pine-900/50 backdrop-blur-[1px]" onClick={onClose} aria-hidden />
      <div className="relative cck-card shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
          <SearchIcon className="text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('palette.placeholder')}
            className="flex-1 outline-none text-sm bg-transparent text-ink"
            aria-label={t('palette.placeholder')}
          />
          <kbd className="text-[10px] text-muted border border-line-strong rounded-sm px-1.5 py-0.5">esc</kbd>
        </div>
        <ul role="listbox" aria-label={t('palette.label')} className="max-h-80 overflow-y-auto py-2">
          {items.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-muted">{t('palette.empty')}</li>
          ) : (
            items.map((item, i) => {
              const isActive = i === activeIdx;
              return (
                <li key={item.href} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => { onClose(); router.push(item.href); }}
                    className={`relative w-full flex items-center justify-between gap-3 px-4 py-2 text-sm text-start transition-colors ${
                      isActive ? 'bg-pair-50 text-pair-700 before:absolute before:inset-y-1 before:start-0 before:w-[3px] before:bg-pair-600' : 'hover:bg-canvas text-ink'
                    }`}
                  >
                    <span className="font-semibold truncate">{item.label}</span>
                    <span className="text-xs text-muted truncate">{item.section}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
        <div className="px-4 py-2 border-t border-line flex items-center gap-3 text-[11px] text-muted">
          <span><kbd className="border border-line-strong rounded-sm px-1">↑↓</kbd> {t('palette.hintNav')}</span>
          <span><kbd className="border border-line-strong rounded-sm px-1">↵</kbd> {t('palette.hintEnter')}</span>
        </div>
      </div>
    </div>
  );
}
