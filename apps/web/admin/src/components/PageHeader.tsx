'use client';

import type { ReactNode } from 'react';
import { useI18n } from '@/lib/i18n';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Small kicker above the title. Defaults to the institution name. */
  eyebrow?: string | null;
  /** Right-aligned controls (buttons, filters, badges). */
  actions?: ReactNode;
}

/**
 * Standard page header used across the admin. Gives every page the same
 * brand anchor: eyebrow kicker, Gotham title, optional actions, and the
 * signature green-with-red-leading-edge rule.
 */
export default function PageHeader({ title, subtitle, eyebrow, actions }: PageHeaderProps) {
  const { t } = useI18n();
  const kicker = eyebrow === null ? null : (eyebrow ?? t('brand.institution'));
  return (
    <header className="mb-8">
      <div className="cck-rule w-9 mb-3" />
      {kicker && <p className="cck-eyebrow">{kicker}</p>}
      <div className="flex flex-wrap items-end justify-between gap-4 mt-1.5">
        <div className="min-w-0">
          <h1 className="cck-title">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-1.5 max-w-prose">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
