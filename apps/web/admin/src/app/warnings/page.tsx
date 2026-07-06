'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type AcademicWarning } from '@/lib/api';
import {
  CRITICAL_CASES_CONDITIONS,
  ACADEMIC_WARNING_THRESHOLDS,
  ACADEMIC_PROGRESSION_FLOW,
  ADVISING_MEETING_TYPES,
} from '@/lib/cckPolicies';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import PageHeader from '@/components/PageHeader';
import { CheckIcon, ChevronIcon } from '@/components/icons';

const WARNINGS_KEY = ['warnings'] as const;

export default function WarningsPage() {
  const { t, locale, dir, isRTL } = useI18n();
  const qc = useQueryClient();
  const { data: warnings, isError, isLoading, refetch } = useQuery<AcademicWarning[]>({
    queryKey: WARNINGS_KEY,
    queryFn: () => api.getWarnings() as Promise<AcademicWarning[]>,
  });
  const [busy, setBusy] = useState<string | null>(null);

  const markSigned = async (id: string) => {
    setBusy(id);
    try {
      await api.markWarningSigned(id);
      qc.setQueryData<AcademicWarning[]>(WARNINGS_KEY, (prev) =>
        prev?.map((w) => w.id === id ? { ...w, signed_at: new Date().toISOString() } : w) ?? prev,
      );
    } finally {
      setBusy(null);
    }
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', year: '2-digit',
  });

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;

  const progressionTone: Record<string, string> = {
    good_standing: 'bg-pair-50 text-pair-700 border-pair-200',
    first_warning: 'bg-danger-50 text-danger-700 border-danger-200',
    second_warning: 'bg-danger-50 text-danger-700 border-danger-200',
    probation: 'bg-danger-50 text-danger-700 border-danger-200',
    final_probation: 'bg-danger-50 text-danger-700 border-danger-200',
    suspension: 'bg-danger-50 text-danger-700 border-danger-300',
    dismissal: 'bg-danger-500 text-white border-danger-600',
  };

  return (
    <div dir={dir}>
      <PageHeader title={t('warnings.title')} subtitle={t('warnings.subtitle')} />

      {/* Critical cases - CCK Hub Feedback v3 */}
      <section className="mb-6 rounded-sm border border-danger-200 bg-danger-50/40 p-5">
        <h2 className="cck-section-label text-danger-700">
          {t('warnings.criticalCasesTitle')}
        </h2>
        <p className="text-xs text-danger-700 mt-1 mb-3">{t('warnings.criticalCasesDesc')}</p>
        <ul className="space-y-2">
          {CRITICAL_CASES_CONDITIONS.map((c) => (
            <li key={c.key} className="flex items-start gap-2 text-sm text-ink">
              <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-danger-500 shrink-0" />
              <span>{locale === 'ar' ? c.text_ar : c.text_en}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Warning policy threshold table */}
      <section className="mb-6 rounded-sm border border-line bg-white p-5">
        <h2 className="cck-section-label text-ink mb-3">
          {t('warnings.policyTableTitle')}
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted border-b">
              <th className="px-3 py-2 text-start font-medium">{t('warnings.policyMinGpa')}</th>
              <th className="px-3 py-2 text-start font-medium">{t('warnings.policyDiplomaCredits')}</th>
              <th className="px-3 py-2 text-start font-medium">{t('warnings.policyBachelorCredits')}</th>
            </tr>
          </thead>
          <tbody>
            {ACADEMIC_WARNING_THRESHOLDS.map((row) => (
              <tr key={row.minGpa} className="border-b border-line last:border-0">
                <td className="px-3 py-2 font-semibold tabular-nums" dir="ltr">{row.minGpa.toFixed(2)}</td>
                <td className="px-3 py-2 tabular-nums" dir="ltr">{row.diplomaCredits}</td>
                <td className="px-3 py-2 tabular-nums" dir="ltr">{row.bachelorCredits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Academic Progression Policy flow - flow chart */}
      <section className="mb-6 rounded-sm border border-line bg-white p-5">
        <h2 className="cck-section-label text-ink">
          {t('warnings.progressionTitle')}
        </h2>
        <p className="text-xs text-muted mt-1 mb-3">{t('warnings.progressionDesc')}</p>
        <ol className="flex flex-wrap items-center gap-2">
          {ACADEMIC_PROGRESSION_FLOW.map((state, i) => (
            <li key={state.status} className="flex items-center gap-2">
              <span
                title={locale === 'ar' ? state.description_ar : state.description_en}
                className={`px-3 py-1.5 text-xs font-medium border rounded-sm ${progressionTone[state.status]}`}
              >
                {locale === 'ar' ? state.label_ar : state.label_en}
              </span>
              {i < ACADEMIC_PROGRESSION_FLOW.length - 1 && (
                <span className="text-muted" aria-hidden>{isRTL ? '←' : '→'}</span>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Advising meeting types (Calendar) */}
      <section className="mb-6 rounded-sm border border-line bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="cck-section-label text-ink">
              {t('warnings.meetingTypesTitle')}
            </h2>
            <p className="text-xs text-muted mt-1 mb-3">{t('warnings.meetingTypesDesc')}</p>
          </div>
          <Link href="/calendar" className="shrink-0 text-xs font-medium text-pair-600 hover:text-pair-700 whitespace-nowrap inline-flex items-center gap-1">
            {t('nav.calendar')} <ChevronIcon dir="end" className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ADVISING_MEETING_TYPES.map((m) => (
            <li key={m.key} className="rounded-sm border border-line p-3">
              <p className="text-sm font-semibold">{locale === 'ar' ? m.label_ar : m.label_en}</p>
              <p className="text-xs text-muted mt-1">
                {locale === 'ar' ? m.triggered_by_ar : m.triggered_by_en}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {isLoading || !warnings ? (
        <SkeletonTable rows={4} cols={5} />
      ) : warnings.length === 0 ? (
        <EmptyState title={t('common.noData')} />
      ) : (
        <div className="cck-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted border-b bg-canvas">
                <th className="px-4 py-3 text-start font-medium">{t('requests.student')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('warnings.gpa')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('warnings.semester')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('warnings.notified')}</th>
                <th className="px-4 py-3 text-end font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {warnings.map((w) => (
                <tr key={w.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{locale === 'ar' ? w.name_ar : w.name_en}</p>
                    <p className="text-xs text-muted">{w.student_id}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-danger-600">{w.gpa.toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted">{w.warning_semester}</td>
                  <td className="px-4 py-3 text-xs text-muted">{fmtDate(w.notified_at)}</td>
                  <td className="px-4 py-3 text-end">
                    {w.signed_at ? (
                      <span className="px-2 py-0.5 rounded-sm text-xs font-medium cck-chip-positive inline-flex items-center gap-1.5">
                        <CheckIcon className="w-3.5 h-3.5 shrink-0" />{t('warnings.signed')} · {fmtDate(w.signed_at)}
                      </span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => markSigned(w.id)}
                          disabled={busy === w.id}
                          className="btn btn-primary btn-sm text-xs"
                        >
                          {t('warnings.markSigned')}
                        </button>
                        <button className="btn btn-outline btn-sm">
                          {t('warnings.resendNotification')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
