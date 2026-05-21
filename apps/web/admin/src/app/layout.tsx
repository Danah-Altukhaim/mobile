import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { I18nProvider, type Locale } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import QueryProvider from '@/components/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'CCK-Hub Admin · Canadian College of Kuwait',
  description:
    'CCK-Hub - student services, admissions, and academic workflows for the Canadian College of Kuwait.',
  icons: {
    icon: '/favicon.png',
    apple: '/cck-shield.png',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const stored = cookieStore.get('cck-admin-locale')?.value;
  const locale: Locale = stored === 'ar' ? 'ar' : 'en';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen bg-[#F6F6F6]">
        <I18nProvider initialLocale={locale}>
          <QueryProvider>
            <AuthProvider>
              <AppShell>{children}</AppShell>
            </AuthProvider>
          </QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
