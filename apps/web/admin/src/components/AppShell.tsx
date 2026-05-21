'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import { MenuIcon } from './icons';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
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
      <div className="flex items-center justify-center min-h-screen bg-[#F6F6F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pair-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#737477]">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex bg-[#F6F6F6] min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-20 bg-[#F6F6F6] border-b border-[#D9D9D9] flex items-center justify-between px-3 py-2 gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-[#EEEEEE] text-[#737477] hover:text-[#222222]"
            aria-label={t('nav.expand')}
          >
            <MenuIcon />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cck-shield.png" alt="" aria-hidden className="h-7 w-7" />
          <button
            onClick={() => setPaletteOpen(true)}
            className="ms-auto px-3 py-1.5 text-xs text-[#737477] border border-[#D9D9D9] rounded-lg hover:bg-[#EEEEEE]"
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
