'use client';

import {
  FOUNDATION_THRESHOLDS,
  DEGREE_THRESHOLDS_BY_CREDITS,
  ATTENDANCE_POLICY_NOTES,
  EXCUSE_SUBMISSION_WINDOW_DAYS,
} from '@masari/shared';
import { useI18n } from '@/lib/i18n';

export default function AttendancePolicyPage() {
  const { t, locale, dir } = useI18n();
  const isAr = locale === 'ar';
  const notes = isAr ? ATTENDANCE_POLICY_NOTES.ar : ATTENDANCE_POLICY_NOTES.en;

  const degreeRows = Object.entries(DEGREE_THRESHOLDS_BY_CREDITS)
    .map(([credits, t]) => ({ credits: Number(credits), ...t }))
    .sort((a, b) => a.credits - b.credits);

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('attendancePolicy.title')}</h1>
      <p className="text-sm text-[#737477] mb-6">{t('attendancePolicy.subtitle')}</p>

      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <header className="px-5 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold">{t('attendancePolicy.foundationTitle')}</h2>
          <p className="text-xs text-[#737477] mt-1">
            {t('attendancePolicy.cumulativeHoursHint')}
          </p>
        </header>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#737477] border-b">
              <th className="px-4 py-3 text-start font-medium">{t('attendancePolicy.foundationCourses')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('attendancePolicy.firstWarning')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('attendancePolicy.secondWarning')}</th>
              <th className="px-4 py-3 text-start font-medium text-danger-700">{t('attendancePolicy.fa')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50 last:border-0">
              <td className="px-4 py-3 font-medium">{t('attendancePolicy.foundationCoursesValue')}</td>
              <td className="px-4 py-3">{FOUNDATION_THRESHOLDS.first_warning_hours} {t('attendancePolicy.hours')}</td>
              <td className="px-4 py-3">{FOUNDATION_THRESHOLDS.second_warning_hours} {t('attendancePolicy.hours')}</td>
              <td className="px-4 py-3 font-semibold text-danger-700">
                {FOUNDATION_THRESHOLDS.fa_hours} {t('attendancePolicy.hours')}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <header className="px-5 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold">{t('attendancePolicy.degreeTitle')}</h2>
          <p className="text-xs text-[#737477] mt-1">{t('attendancePolicy.cumulativeHoursHint')}</p>
        </header>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#737477] border-b">
              <th className="px-4 py-3 text-start font-medium">{t('attendancePolicy.credits')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('attendancePolicy.firstWarning')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('attendancePolicy.secondWarning')}</th>
              <th className="px-4 py-3 text-start font-medium text-danger-700">{t('attendancePolicy.fa')}</th>
            </tr>
          </thead>
          <tbody>
            {degreeRows.map((row) => (
              <tr key={row.credits} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-medium">
                  {row.credits} {t('attendancePolicy.creditsUnit')}
                </td>
                <td className="px-4 py-3">{row.first_warning_hours} {t('attendancePolicy.hours')}</td>
                <td className="px-4 py-3">{row.second_warning_hours} {t('attendancePolicy.hours')}</td>
                <td className="px-4 py-3 font-semibold text-danger-700">
                  {row.fa_hours} {t('attendancePolicy.hours')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold mb-1">{t('attendancePolicy.notesTitle')}</h2>
        <p className="text-xs text-[#737477] mb-4">
          {t('attendancePolicy.windowChip', { days: EXCUSE_SUBMISSION_WINDOW_DAYS })}
        </p>
        <ul className="space-y-2 text-sm text-[#222222]">
          {notes.map((n, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-pair-600 shrink-0" />
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
