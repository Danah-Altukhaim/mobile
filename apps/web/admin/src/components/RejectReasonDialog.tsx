'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';

interface RejectReasonDialogProps {
  open: boolean;
  title?: string;
  subject?: string;
  hint?: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export default function RejectReasonDialog({
  open,
  title,
  subject,
  hint,
  confirmLabel,
  busy = false,
  onConfirm,
  onCancel,
}: RejectReasonDialogProps) {
  const { t, dir } = useI18n();
  const titleId = useId();
  const descId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    setReason('');
    const tm = setTimeout(() => textareaRef.current?.focus(), 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(tm);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;

  const trimmed = reason.trim();
  const disabled = busy || trimmed.length === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir={dir}
    >
      <div className="absolute inset-0 bg-pine-900/50 backdrop-blur-[1px]" onClick={onCancel} aria-hidden />
      <div className="relative cck-card shadow-xl p-6 max-w-md w-full mx-4 overflow-hidden">
        <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-leaf" />
        <h3 id={titleId} className="cck-title text-lg mb-1">
          {title ?? t('rejectDialog.title')}
        </h3>
        {subject && <p className="text-sm text-muted mb-2">{subject}</p>}
        <p id={descId} className="text-sm text-muted mb-3">
          {hint ?? t('rejectDialog.hint')}
        </p>
        <label htmlFor={`${titleId}-reason`} className="cck-label">
          {t('rejectDialog.reasonLabel')}
        </label>
        <textarea
          id={`${titleId}-reason`}
          ref={textareaRef}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder={t('rejectDialog.reasonPlaceholder')}
          className="cck-textarea"
        />
        {trimmed.length === 0 && (
          <p className="mt-1 text-xs text-danger-600">{t('rejectDialog.reasonRequired')}</p>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(trimmed)}
            disabled={disabled}
            className="btn btn-danger"
          >
            {confirmLabel ?? t('rejectDialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
