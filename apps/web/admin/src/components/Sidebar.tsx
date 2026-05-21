'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import ConfirmDialog from './ConfirmDialog';
import {
  ChartIcon, HomeIcon, InboxIcon, GraduationIcon, HandHeartIcon, GavelIcon,
  AlertIcon, FlagIcon, ChatIcon, TrophyIcon, PhoneIcon, ShieldIcon,
  CreditCardIcon, WalletIcon, BrainIcon, MegaphoneIcon, UsersIcon, GearIcon, ClipboardIcon,
  WrenchIcon, BookIcon, SparklesIcon,
  LogoutIcon, LanguageIcon, CloseIcon, CollapseChevron,
} from './icons';

const nav = [
  { href: '/', labelKey: 'nav.dashboard', section: 'nav.workflows', icon: HomeIcon },
  { href: '/requests', labelKey: 'nav.requests', section: 'nav.workflows', icon: InboxIcon },
  { href: '/admissions', labelKey: 'nav.admissions', section: 'nav.workflows', icon: GraduationIcon },
  { href: '/equivalency', labelKey: 'nav.equivalency', section: 'nav.workflows', icon: ClipboardIcon },
  { href: '/catalog', labelKey: 'nav.catalog', section: 'nav.workflows', icon: BookIcon },
  { href: '/social-allowance', labelKey: 'nav.socialAllowance', section: 'nav.workflows', icon: HandHeartIcon },
  { href: '/appeals', labelKey: 'nav.appeals', section: 'nav.workflows', icon: GavelIcon },
  { href: '/fa-screen', labelKey: 'nav.faScreen', section: 'nav.workflows', icon: AlertIcon },
  { href: '/warnings', labelKey: 'nav.warnings', section: 'nav.workflows', icon: FlagIcon },
  { href: '/attendance-policy', labelKey: 'nav.attendancePolicy', section: 'nav.workflows', icon: ClipboardIcon },
  { href: '/feedback', labelKey: 'nav.complaints', section: 'nav.workflows', icon: ChatIcon },
  { href: '/finance', labelKey: 'nav.finance', section: 'nav.workflows', icon: WalletIcon },
  { href: '/sport', labelKey: 'nav.sport', section: 'nav.workflows', icon: TrophyIcon },
  { href: '/student-life', labelKey: 'nav.studentLife', section: 'nav.workflows', icon: SparklesIcon },
  { href: '/it-helpdesk', labelKey: 'nav.itHelpdesk', section: 'nav.workflows', icon: WrenchIcon },
  { href: '/directory', labelKey: 'nav.directory', section: 'nav.workflows', icon: PhoneIcon },
  { href: '/engagement', labelKey: 'nav.engagement', section: 'nav.analytics', icon: ChartIcon },
  { href: '/retention', labelKey: 'nav.retention', section: 'nav.analytics', icon: ShieldIcon },
  { href: '/payments', labelKey: 'nav.payments', section: 'nav.analytics', icon: CreditCardIcon },
  { href: '/ai-monitoring', labelKey: 'nav.aiAdvisor', section: 'nav.analytics', icon: BrainIcon },
  { href: '/communications', labelKey: 'nav.communications', section: 'nav.management', icon: MegaphoneIcon },
  { href: '/users', labelKey: 'nav.users', section: 'nav.management', icon: UsersIcon },
  { href: '/settings', labelKey: 'nav.settings', section: 'nav.config', icon: GearIcon },
  { href: '/audit-log', labelKey: 'nav.auditLog', section: 'nav.config', icon: ClipboardIcon },
];

const COLLAPSE_KEY = 'cck-admin-sidebar-collapsed';

interface Props {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { t, locale, setLocale, dir, isRTL } = useI18n();
  const { user, logout } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSE_KEY);
    if (stored === '1') setCollapsed(true);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    if (mobileOpen) onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Esc closes mobile drawer
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onMobileClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, onMobileClose]);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      return next;
    });
  };

  const displayName = locale === 'ar' ? user?.name_ar : user?.name_en;
  const toggleLocale = () => setLocale(locale === 'ar' ? 'en' : 'ar');

  const widthClass = collapsed ? 'md:w-16' : 'md:w-64';
  const mobileTransform = mobileOpen
    ? 'translate-x-0'
    : isRTL ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0';

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label={t('common.cancel')}
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}
      <aside
        dir={dir}
        aria-label={t('nav.appName')}
        className={`fixed inset-y-0 start-0 w-64 z-40 bg-[#F6F6F6] border-e border-[#D9D9D9] flex flex-col transition-transform duration-300 md:sticky md:top-0 md:h-screen md:z-auto md:transition-all ${widthClass} ${mobileTransform} shrink-0`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b border-[#D9D9D9] ${
            collapsed ? 'md:flex-col md:items-center md:gap-3 flex items-center justify-between gap-2' : 'flex items-center justify-between gap-2'
          }`}
        >
          {!collapsed ? (
            <div className="min-w-0 flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cck-shield.png" alt="CCK" className="h-9 w-9 shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base font-bold text-[#222222] truncate leading-tight">{t('nav.appName')}</h1>
                <p className="text-[11px] text-[#737477] mt-0.5 truncate">{t('nav.subtitle')}</p>
              </div>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/cck-shield.png" alt="CCK" className="h-8 w-8" />
          )}
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg hover:bg-[#EEEEEE] text-[#737477] hover:text-[#222222] transition-colors shrink-0 md:hidden"
            aria-label={t('common.cancel')}
          >
            <CloseIcon />
          </button>
          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg hover:bg-[#EEEEEE] text-[#737477] hover:text-[#222222] transition-colors shrink-0 hidden md:block"
            title={collapsed ? t('nav.expand') : t('nav.collapse')}
            aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
          >
            <CollapseChevron collapsed={collapsed} isRTL={isRTL} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto" aria-label={t('nav.appName')}>
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
                  <div className="my-2 border-t border-[#D9D9D9] hidden md:block" />
                )}
                <Link
                  href={item.href}
                  title={collapsed ? t(item.labelKey) : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors h-10 ${
                    collapsed ? 'md:justify-center' : ''
                  } ${
                    active
                      ? 'bg-pair-50 text-pair-600 font-medium'
                      : 'text-[#737477] hover:bg-[#EEEEEE] hover:text-[#222222]'
                  }`}
                >
                  <span className="shrink-0"><Icon /></span>
                  <span className={`truncate ${collapsed ? 'md:hidden' : ''}`}>{t(item.labelKey)}</span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-[#D9D9D9] p-2 space-y-1">
          {user && (
            <div className={`px-3 py-2 ${collapsed ? 'md:text-center' : ''}`}>
              {collapsed ? (
                <>
                  <div
                    className="hidden md:flex w-8 h-8 mx-auto rounded-full bg-pair-500 text-white items-center justify-center text-xs font-bold"
                    title={displayName}
                  >
                    {displayName?.charAt(0)}
                  </div>
                  <div className="md:hidden min-w-0">
                    <p className="text-sm font-medium text-[#222222] truncate">{displayName}</p>
                    <p className="text-xs text-[#737477] truncate">{user.role}</p>
                  </div>
                </>
              ) : (
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#222222] truncate">{displayName}</p>
                  <p className="text-xs text-[#737477] truncate">{user.role}</p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={toggleLocale}
            title={t('nav.language')}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[#737477] hover:bg-[#EEEEEE] hover:text-[#222222] transition-colors ${
              collapsed ? 'md:justify-center' : ''
            }`}
          >
            <span className="shrink-0"><LanguageIcon /></span>
            <span className={`truncate ${collapsed ? 'md:hidden' : ''}`}>{t('nav.language')}</span>
          </button>

          <button
            onClick={() => setLogoutOpen(true)}
            title={collapsed ? t('nav.logout') : undefined}
            aria-label={collapsed ? t('nav.logout') : undefined}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[#737477] hover:bg-danger-50 hover:text-danger-600 transition-colors ${
              collapsed ? 'md:justify-center' : ''
            }`}
          >
            <span className="shrink-0"><LogoutIcon /></span>
            <span className={`truncate ${collapsed ? 'md:hidden' : ''}`}>{t('nav.logout')}</span>
          </button>
        </div>

        <ConfirmDialog
          open={logoutOpen}
          title={t('confirm.logout.title')}
          message={t('confirm.logout.message')}
          confirmLabel={t('confirm.logout.confirm')}
          variant="danger"
          onConfirm={() => { setLogoutOpen(false); logout(); }}
          onCancel={() => setLogoutOpen(false)}
        />
      </aside>
    </>
  );
}
