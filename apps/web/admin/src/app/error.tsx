'use client';

import { useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t, dir } = useI18n();

  useEffect(() => {
    console.error('Admin app error:', error);
  }, [error]);

  return (
    <div dir={dir} role="alert" className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-danger-500" aria-hidden fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h1 className="text-lg font-semibold text-[#222]">{t('common.error')}</h1>
      <p className="text-sm text-[#737477] mt-1 max-w-sm">{t('common.errorDescription')}</p>
      {error.digest && (
        <p className="text-xs text-gray-400 font-mono mt-3">ref: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-5 px-4 py-2 text-sm bg-pair-600 text-white rounded-lg hover:bg-pair-700"
      >
        {t('common.retry')}
      </button>
    </div>
  );
}
