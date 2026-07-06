'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { canAccess } from '@/lib/roles';
import ConfirmDialog from './ConfirmDialog';
import {
  ChartIcon, HomeIcon, InboxIcon, GraduationIcon, HandHeartIcon, GavelIcon,
  AlertIcon, FlagIcon, ChatIcon, TrophyIcon, PhoneIcon, ShieldIcon,
  CreditCardIcon, WalletIcon, BrainIcon, MegaphoneIcon, MarketingIcon, UsersIcon, GearIcon, ClipboardIcon,
  WrenchIcon, BookIcon, SparklesIcon, CalendarIcon, BuildingIcon, IdCardIcon,
  LogoutIcon, LanguageIcon, CloseIcon, CollapseChevron,
} from './icons';

const nav = [
  { href: '/', labelKey: 'nav.dashboard', section: 'nav.workflows', icon: HomeIcon },
  { href: '/requests', labelKey: 'nav.requests', section: 'nav.workflows', icon: InboxIcon },
  { href: '/admissions', labelKey: 'nav.admissions', section: 'nav.workflows', icon: GraduationIcon },
  { href: '/students', labelKey: 'nav.students', section: 'nav.workflows', icon: IdCardIcon },
  { href: '/equivalency', labelKey: 'nav.equivalency', section: 'nav.workflows', icon: ClipboardIcon },
  { href: '/catalog', labelKey: 'nav.catalog', section: 'nav.workflows', icon: BookIcon },
  { href: '/social-allowance', labelKey: 'nav.socialAllowance', section: 'nav.workflows', icon: HandHeartIcon },
  { href: '/appeals', labelKey: 'nav.appeals', section: 'nav.workflows', icon: GavelIcon },
  { href: '/fa-screen', labelKey: 'nav.faScreen', section: 'nav.workflows', icon: AlertIcon },
  { href: '/warnings', labelKey: 'nav.warnings', section: 'nav.workflows', icon: FlagIcon },
  { href: '/calendar', labelKey: 'nav.calendar', section: 'nav.workflows', icon: CalendarIcon },
  { href: '/feedback', labelKey: 'nav.complaints', section: 'nav.workflows', icon: ChatIcon },
  { href: '/finance', labelKey: 'nav.finance', section: 'nav.workflows', icon: WalletIcon },
  { href: '/sport', labelKey: 'nav.sport', section: 'nav.workflows', icon: TrophyIcon },
  { href: '/student-life', labelKey: 'nav.studentLife', section: 'nav.workflows', icon: SparklesIcon },
  { href: '/it-helpdesk', labelKey: 'nav.itHelpdesk', section: 'nav.workflows', icon: WrenchIcon },
  { href: '/facilities', labelKey: 'nav.facilities', section: 'nav.workflows', icon: BuildingIcon },
  { href: '/event-requests', labelKey: 'nav.eventRequests', section: 'nav.workflows', icon: CalendarIcon },
  { href: '/directory', labelKey: 'nav.directory', section: 'nav.workflows', icon: PhoneIcon },
  { href: '/engagement', labelKey: 'nav.engagement', section: 'nav.analytics', icon: ChartIcon },
  { href: '/retention', labelKey: 'nav.retention', section: 'nav.analytics', icon: ShieldIcon },
  { href: '/payments', labelKey: 'nav.payments', section: 'nav.analytics', icon: CreditCardIcon },
  { href: '/ai-monitoring', labelKey: 'nav.aiAdvisor', section: 'nav.analytics', icon: BrainIcon },
  { href: '/communications', labelKey: 'nav.communications', section: 'nav.management', icon: MegaphoneIcon },
  { href: '/marketing', labelKey: 'nav.marketing', section: 'nav.management', icon: MarketingIcon },
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
        className={`fixed inset-y-0 start-0 w-64 z-40 bg-pine text-white flex flex-col transition-transform duration-300 md:sticky md:top-0 md:h-screen md:z-auto md:transition-all ${widthClass} ${mobileTransform} shrink-0`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b border-white/10 ${
            collapsed ? 'md:flex-col md:items-center md:gap-3 flex items-center justify-between gap-2' : 'flex items-center justify-between gap-2'
          }`}
        >
          {!collapsed ? (
            <div className="min-w-0 flex items-center gap-2.5">
              <span className="grid place-items-center h-9 w-9 shrink-0 bg-white rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/cck-shield.png" alt="CCK" className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <h1 className="text-[0.9375rem] font-bold text-white truncate leading-tight tracking-tight">{t('nav.appName')}</h1>
                <p className="text-[11px] text-white/50 mt-0.5 truncate">{t('nav.subtitle')}</p>
              </div>
            </div>
          ) : (
            <span className="grid place-items-center h-8 w-8 bg-white rounded-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cck-shield.png" alt="CCK" className="h-6 w-6" />
            </span>
          )}
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-sm hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0 md:hidden"
            aria-label={t('common.cancel')}
          >
            <CloseIcon />
          </button>
          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-sm hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0 hidden md:block"
            title={collapsed ? t('nav.expand') : t('nav.collapse')}
            aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
          >
            <CollapseChevron collapsed={collapsed} isRTL={isRTL} />
          </button>
        </div>

        {/* Navigation - scoped to the signed-in department's workflows */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto" aria-label={t('nav.appName')}>
          {nav.filter((item) => canAccess(user?.role, item.href)).map((item, i, visible) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const showSection = i === 0 || visible[i - 1].section !== item.section;
            const Icon = item.icon;
            return (
              <div key={item.href}>
                {showSection && !collapsed && (
                  <p className={`text-[10px] text-white/40 uppercase tracking-[0.1em] font-semibold px-3 ${i > 0 ? 'mt-5' : ''} mb-1.5`}>
                    {t(item.section)}
                  </p>
                )}
                {showSection && collapsed && i > 0 && (
                  <div className="my-2 border-t border-white/10 hidden md:block" />
                )}
                <Link
                  href={item.href}
                  title={collapsed ? t(item.labelKey) : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors h-10 ${
                    collapsed ? 'md:justify-center' : ''
                  } ${
                    active
                      ? 'bg-white text-pair-700 font-semibold before:absolute before:inset-y-1.5 before:start-0 before:w-[3px] before:bg-leaf'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
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
        <div className="border-t border-white/10 p-2 space-y-1">
          {user && (
            <div className={`px-2 py-2 ${collapsed ? 'md:text-center' : ''}`}>
              {collapsed ? (
                <>
                  <div
                    className="hidden md:flex w-8 h-8 mx-auto rounded-sm bg-white/15 text-white items-center justify-center text-xs font-bold"
                    title={displayName}
                  >
                    {displayName?.charAt(0)}
                  </div>
                  <div className="md:hidden min-w-0 flex items-center gap-2.5">
                    <div className="w-8 h-8 shrink-0 rounded-sm bg-white/15 text-white flex items-center justify-center text-xs font-bold">
                      {displayName?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                      <p className="text-xs text-white/55 truncate">{t(`role.${user.role}`)}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="min-w-0 flex items-center gap-2.5">
                  <div className="w-8 h-8 shrink-0 rounded-sm bg-white/15 text-white flex items-center justify-center text-xs font-bold">
                    {displayName?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                    <p className="text-xs text-white/55 truncate">{t(`role.${user.role}`)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={toggleLocale}
            title={t('nav.language')}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-sm text-sm text-white/75 hover:bg-white/10 hover:text-white transition-colors ${
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
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-sm text-sm text-white/75 hover:bg-danger-600 hover:text-white transition-colors ${
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
