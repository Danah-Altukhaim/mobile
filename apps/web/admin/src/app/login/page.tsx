'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/roles';

export default function LoginPage() {
  const { login } = useAuth();
  const { t, locale, setLocale, dir } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const ok = await login(email, password);
    if (ok) {
      router.replace('/');
    } else {
      setError(true);
    }
    setLoading(false);
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError(false);
    setLoading(true);
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    const ok = await login(demoEmail, DEMO_PASSWORD);
    if (ok) {
      router.replace('/');
    } else {
      setError(true);
    }
    setLoading(false);
  };

  const adminDemo = DEMO_ACCOUNTS.find((a) => a.role === 'super_admin');
  const departmentDemos = DEMO_ACCOUNTS.filter((a) => a.role !== 'super_admin');

  return (
    <div
      dir={dir}
      className="relative min-h-screen flex items-center justify-center p-4 bg-pine overflow-hidden"
    >
      {/* Brand chevron motif, anchored bottom-end, used sparingly */}
      <div aria-hidden className="cck-chevrons absolute -bottom-10 -end-10 h-72 w-72 opacity-[0.14] rotate-6 pointer-events-none" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-leaf" />

      <div className="relative w-full max-w-md">
        <div className="cck-card shadow-xl p-8 pt-7">
          <div className="text-center mb-8">
            <span className="inline-grid place-items-center bg-white mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/cck-logo-wordmark.png"
                alt="Canadian College of Kuwait"
                className="h-14 w-auto mx-auto"
              />
            </span>
            <p className="cck-eyebrow">{t('brand.tagline')}</p>
            <h1 className="cck-title text-xl mt-3">{t('login.title')}</h1>
            <p className="text-sm text-muted mt-1">{t('login.subtitle')}</p>
            <div className="cck-rule w-16 mx-auto mt-4" />
          </div>

          {error && (
            <div role="alert" className="bg-danger-50 border border-danger-200 rounded-sm p-3 mb-6">
              <p className="text-sm text-danger-700">{t('login.error')}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="cck-label">{t('login.email')}</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cck-input"
                placeholder="registrar@cck.edu.kw"
                required
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="cck-label">{t('login.password')}</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cck-input"
                placeholder="••••••••"
                required
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block py-2.5"
            >
              {loading ? t('login.signingIn') : t('login.signIn')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="text-sm text-muted hover:text-pair-700 transition-colors"
            >
              {locale === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          {/* Demo logins - one per department, plus Admin with the full spread */}
          <div className="mt-6 pt-5 border-t border-line">
            <p className="cck-eyebrow text-center mb-3">{t('login.demoTitle')}</p>
            {adminDemo && (
              <button
                type="button"
                onClick={() => handleDemoLogin(adminDemo.email)}
                disabled={loading}
                className="btn btn-outline btn-block py-2.5 mb-2 text-xs"
              >
                <span className="font-semibold">{t(adminDemo.labelKey)}</span>
                <span className="text-muted font-normal ms-1.5" dir="ltr">· {adminDemo.email}</span>
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              {departmentDemos.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => handleDemoLogin(a.email)}
                  disabled={loading}
                  title={a.email}
                  className="btn btn-outline py-2 text-xs font-normal text-muted truncate"
                >
                  {t(a.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-white/60 mt-6 px-4">
          {t('brand.partnership')}
        </p>
      </div>
    </div>
  );
}
