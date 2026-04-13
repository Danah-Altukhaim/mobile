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
    setEmail('dean@pu.edu.kw');
    setPassword('admin123');
    const ok = await login('dean@pu.edu.kw', 'admin123');
    if (ok) {
      router.replace('/');
    } else {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div dir={dir} className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-pair-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">م</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('login.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('login.subtitle')}</p>
          </div>

          {error && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-danger-700">{t('login.error')}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pair-500 focus:border-pair-500 outline-none"
                placeholder="dean@pu.edu.kw"
                required
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.password')}</label>
              <input
                type="password"
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
            {locale === 'ar' ? 'دخول تجريبي سريع · dean@pu.edu.kw' : 'Quick demo login · dean@pu.edu.kw'}
          </button>
        </div>
      </div>
    </div>
  );
}
