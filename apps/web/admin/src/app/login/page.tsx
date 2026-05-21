'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

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

  const handleDemoLogin = async () => {
    setError(false);
    setLoading(true);
    setEmail('registrar@cck.edu.kw');
    setPassword('admin123');
    const ok = await login('registrar@cck.edu.kw', 'admin123');
    if (ok) {
      router.replace('/');
    } else {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div
      dir={dir}
      className="min-h-screen flex items-center justify-center p-4 bg-[#F6F6F6]"
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 border-t-4 border-t-pair-600">
          <div className="text-center mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cck-logo-wordmark.png"
              alt="Canadian College of Kuwait"
              className="h-14 w-auto mx-auto mb-5"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pair-600">
              {t('brand.tagline')}
            </p>
            <h1 className="text-xl font-bold text-[#222222] mt-3">{t('login.title')}</h1>
            <p className="text-sm text-[#737477] mt-1">{t('login.subtitle')}</p>
          </div>

          {error && (
            <div role="alert" className="bg-danger-50 border border-danger-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-danger-700">{t('login.error')}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">{t('login.email')}</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pair-500 focus:border-pair-500 outline-none"
                placeholder="registrar@cck.edu.kw"
                required
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">{t('login.password')}</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pair-500 focus:border-pair-500 outline-none"
                placeholder="••••••••"
                required
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pair-600 text-white py-2.5 rounded-lg font-medium hover:bg-pair-700 disabled:opacity-50 transition-colors"
            >
              {loading ? t('login.signingIn') : t('login.signIn')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {locale === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="mt-4 w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg py-2.5 text-xs text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            {locale === 'ar' ? 'دخول تجريبي · registrar@cck.edu.kw' : 'Quick demo login · registrar@cck.edu.kw'}
          </button>
        </div>

        <p className="text-center text-xs text-[#737477] mt-6 px-4">
          {t('brand.partnership')}
        </p>
      </div>
    </div>
  );
}
