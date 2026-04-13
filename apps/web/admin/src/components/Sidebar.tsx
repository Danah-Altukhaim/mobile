'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

/* ── Inline SVG Icon Components (20×20) ── */

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17V9" /><path d="M7 17V5" /><path d="M11 17V10" /><path d="M15 17V3" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2L3 5.5V10c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V5.5L10 2z" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="16" height="12" rx="2" /><path d="M2 8h16" />
  </svg>
);

const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2C7.5 2 5 4 5 7c0 1.5.5 3 2 4v5h6v-5c1.5-1 2-2.5 2-4 0-3-2.5-5-5-5z" />
    <path d="M8 18h4" /><path d="M7 11h6" />
  </svg>
);

const MegaphoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3L6 7H3v4h3l10 4V3z" /><path d="M6 11v3.5a1.5 1.5 0 003 0V13" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7" r="3" /><path d="M2 17c0-3 2.5-5 5-5s5 2 5 5" />
    <circle cx="14" cy="6" r="2" /><path d="M14 11c2.5 0 4 1.5 4 4" />
  </svg>
);

const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="12" height="15" rx="1.5" /><path d="M7 1h6v3a1 1 0 01-1 1H8a1 1 0 01-1-1V1z" />
    <path d="M7 9h6" /><path d="M7 12h4" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3" /><path d="M13 14l4-4-4-4" /><path d="M17 10H7" />
  </svg>
);

const LanguageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="8" /><path d="M2 10h16" /><path d="M10 2a12 12 0 014 8 12 12 0 01-4 8 12 12 0 01-4-8 12 12 0 014-8z" />
  </svg>
);

const CollapseIcon = ({ collapsed, isRTL }: { collapsed: boolean; isRTL: boolean }) => {
  const showExpand = collapsed !== isRTL;
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {showExpand ? (
        <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      ) : (
        <path d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
      )}
    </svg>
  );
};

/* ── Nav Items ── */

const nav = [
  { href: '/', labelKey: 'nav.engagement', section: 'nav.analytics', icon: ChartIcon },
  { href: '/retention', labelKey: 'nav.retention', section: 'nav.analytics', icon: ShieldIcon },
  { href: '/payments', labelKey: 'nav.payments', section: 'nav.analytics', icon: CreditCardIcon },
  { href: '/ai-monitoring', labelKey: 'nav.aiAdvisor', section: 'nav.analytics', icon: BrainIcon },
  { href: '/communications', labelKey: 'nav.communications', section: 'nav.management', icon: MegaphoneIcon },
  { href: '/users', labelKey: 'nav.users', section: 'nav.management', icon: UsersIcon },
  { href: '/settings', labelKey: 'nav.settings', section: 'nav.config', icon: GearIcon },
  { href: '/audit-log', labelKey: 'nav.auditLog', section: 'nav.config', icon: ClipboardIcon },
];

/* ── Sidebar Component ── */

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { t, locale, setLocale, dir, isRTL } = useI18n();
  const { user, logout } = useAuth();

  const displayName = locale === 'ar' ? user?.name_ar : user?.name_en;

  const toggleLocale = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  };

  return (
    <aside
      dir={dir}
      className={`${collapsed ? 'w-16' : 'w-64'} bg-[#F6F6F6] border-e border-[#D9D9D9] h-screen sticky top-0 flex flex-col transition-all duration-300 shrink-0`}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#D9D9D9] flex items-center justify-between gap-2">
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#222222] truncate">{t('nav.appName')}</h1>
            <p className="text-xs text-[#737477] mt-0.5 truncate">{t('nav.subtitle')}</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-[#EEEEEE] text-[#737477] hover:text-[#222222] transition-colors shrink-0"
          title={collapsed ? t('nav.expand') : t('nav.collapse')}
        >
          <CollapseIcon collapsed={collapsed} isRTL={isRTL} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {nav.map((item, i) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const showSection = i === 0 || nav[i - 1].section !== item.section;
          const Icon = item.icon;

          return (
            <div key={item.href}>
              {showSection && !collapsed && (
                <p className={`text-[11px] text-[#737477] uppercase tracking-wider font-semibold px-3 ${i > 0 ? 'mt-4' : ''} mb-1.5`}>
                  {t(item.section)}
                </p>
              )}
              {showSection && collapsed && i > 0 && (
                <div className="my-2 border-t border-[#D9D9D9]" />
              )}
              <Link
                href={item.href}
                title={collapsed ? t(item.labelKey) : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors h-10 ${
                  collapsed ? 'justify-center' : ''
                } ${
                  active
                    ? 'bg-pair-50 text-pair-600 font-medium'
                    : 'text-[#737477] hover:bg-[#EEEEEE] hover:text-[#222222]'
                }`}
              >
                <span className="shrink-0">
                  <Icon />
                </span>
                {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[#D9D9D9] p-2 space-y-1">
        {/* User info */}
        {user && (
          <div className={`px-3 py-2 ${collapsed ? 'text-center' : ''}`}>
            {collapsed ? (
              <div
                className="w-8 h-8 mx-auto rounded-full bg-pair-500 text-white flex items-center justify-center text-xs font-bold"
                title={displayName}
              >
                {displayName?.charAt(0)}
              </div>
            ) : (
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#222222] truncate">{displayName}</p>
                <p className="text-xs text-[#737477] truncate">{user.role}</p>
              </div>
            )}
          </div>
        )}

        {/* Language toggle */}
        <button
          onClick={toggleLocale}
          title={t('nav.language')}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[#737477] hover:bg-[#EEEEEE] hover:text-[#222222] transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className="shrink-0">
            <LanguageIcon />
          </span>
          {!collapsed && <span className="truncate">{t('nav.language')}</span>}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          title={collapsed ? t('nav.logout') : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[#737477] hover:bg-danger-50 hover:text-danger-600 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className="shrink-0">
            <LogoutIcon />
          </span>
          {!collapsed && <span className="truncate">{t('nav.logout')}</span>}
        </button>
      </div>
    </aside>
  );
}
