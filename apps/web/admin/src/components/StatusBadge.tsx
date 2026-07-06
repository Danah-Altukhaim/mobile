'use client';

import { useI18n } from '@/lib/i18n';

// The admin site recognizes exactly four lifecycle statuses everywhere a
// status pill is shown (Social Allowance, Requests, Feedback, IT Helpdesk,
// Sport, Student Life clubs, Finance clearance, Retention outcomes). Each
// raw module-specific status (submitted/open/in_progress/resolved/etc.) is
// mapped to one of these four at the call site.
export type LifecycleStatus = 'not_started' | 'pending' | 'completed' | 'rejected';

// Three voices only: neutral (anything in flight), green (done), red (blocked).
const STYLE: Record<LifecycleStatus, string> = {
  not_started: 'bg-canvas text-muted ring-1 ring-inset ring-line-strong',
  pending: 'bg-canvas text-body ring-1 ring-inset ring-line-strong',
  completed: 'bg-pair-50 text-pair-700 ring-1 ring-inset ring-pair-100',
  rejected: 'bg-danger-50 text-danger-700 ring-1 ring-inset ring-danger-100',
};

const LABEL_KEY: Record<LifecycleStatus, string> = {
  not_started: 'status.notStarted',
  pending: 'status.pending',
  completed: 'status.completed',
  rejected: 'status.rejected',
};

interface StatusBadgeProps {
  status: LifecycleStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusBadge({ status, size = 'sm', className = '' }: StatusBadgeProps) {
  const { t } = useI18n();
  const sizeCls = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center rounded-sm font-semibold ${sizeCls} ${STYLE[status]} ${className}`.trim()}>
      {t(LABEL_KEY[status])}
    </span>
  );
}
