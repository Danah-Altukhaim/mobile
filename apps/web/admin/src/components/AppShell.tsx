'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { canAccess } from '@/lib/roles';
import { useI18n } from '@/lib/i18n';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import { MenuIcon } from './icons';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, dir, locale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [dir, locale]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Department-scoped access: bounce users off modules outside their role
  useEffect(() => {
    if (!isLoading && user && pathname !== '/login' && !canAccess(user.role, pathname)) {
      router.replace('/');
    }
  }, [isLoading, user, pathname, router]);

  // Cmd/Ctrl + K opens palette
  useEffect(() => {
    if (!isAuthenticated) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isAuthenticated]);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-pair-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (user && !canAccess(user.role, pathname)) return null;

  return (
    <div className="flex bg-canvas min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-20 bg-pine text-white flex items-center justify-between px-3 py-2 gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-sm hover:bg-white/10 text-white/80 hover:text-white"
            aria-label={t('nav.expand')}
          >
            <MenuIcon />
          </button>
          <span className="grid place-items-center h-7 w-7 bg-white rounded-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cck-shield.png" alt="" aria-hidden className="h-5 w-5" />
          </span>
          <button
            onClick={() => setPaletteOpen(true)}
            className="ms-auto px-3 py-1.5 text-xs text-white/80 border border-white/25 rounded-sm hover:bg-white/10"
            aria-label={t('palette.open')}
          >
            ⌘K
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
