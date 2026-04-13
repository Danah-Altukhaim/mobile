'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { dir, locale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [dir, locale]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F6F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pair-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#737477]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex bg-[#F6F6F6] min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
