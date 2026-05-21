'use client';

import { useQuery } from '@tanstack/react-query';
import Card from '@/components/Card';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

interface EngagementData {
  daily_active_users: number;
  monthly_active_users: number;
  avg_session_duration_minutes: number;
  feature_usage_heatmap: Record<string, { usage_count: number; label_en: string; label_ar: string }>;
  engagement_by_cohort: { cohort: string; active_users: number; avg_session_min: number }[];
  engagement_by_major: { major_en: string; major_ar: string; active_users: number; avg_session_min: number }[];
  engagement_by_year: { year: string; year_ar: string; active_users: number; avg_session_min: number }[];
  peak_hours: { hour: number; users: number; label_en: string }[];
  period: { start: string; end: string };
}

interface HeatmapData {
  features: string[];
  features_ar: string[];
  hours: string[];
  hours_ar: string[];
  data: number[][];
}

export default function EngagementPage() {
  const { t, locale, dir } = useI18n();
  const dataQ = useQuery<EngagementData>({
    queryKey: ['engagement', 'overview'],
    queryFn: () => api.getEngagement() as Promise<EngagementData>,
  });
  const heatmapQ = useQuery<HeatmapData>({
    queryKey: ['engagement', 'heatmap'],
    queryFn: () => api.getFeatureHeatmap() as Promise<HeatmapData>,
  });
  const data = dataQ.data;
  const heatmap = heatmapQ.data;
  const isError = dataQ.isError || heatmapQ.isError;

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => { dataQ.refetch(); heatmapQ.refetch(); }} retryLabel={t('common.retry')} />;
  if (!data) return <SkeletonPage />;

  const maxPeakUsers = Math.max(...data.peak_hours.map((p) => p.users));

  // Heatmap helpers
  const heatmapMax = heatmap ? Math.max(...heatmap.data.flat()) : 1;
  const getHeatColor = (value: number) => {
    const intensity = value / heatmapMax;
    if (intensity < 0.2) return 'bg-pair-50 text-gray-500';
    if (intensity < 0.4) return 'bg-pair-100 text-pair-700';
    if (intensity < 0.6) return 'bg-pair-200 text-pair-800';
    if (intensity < 0.8) return 'bg-pair-400 text-white';
    return 'bg-pair-600 text-white';
  };

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-6">{t('engagement.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card title={t('engagement.dau')} value={data.daily_active_users.toLocaleString()} />
        <Card title={t('engagement.mau')} value={data.monthly_active_users.toLocaleString()} />
        <Card
          title={t('engagement.avgSession')}
          value={t('engagement.min', { value: String(data.avg_session_duration_minutes) })}
        />
      </div>

      {/* Feature Usage Heatmap Grid */}
      {heatmap && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{t('engagement.featureHeatmap')}</h2>
            <p className="text-sm text-gray-500">{t('engagement.heatmapDesc')}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-start pb-2 pe-2 w-32 text-gray-500 font-medium" />
                  {heatmap.hours.map((h, i) => (
                    <th key={i} className="pb-2 text-center text-gray-500 font-medium px-0.5">
                      {locale === 'ar' ? heatmap.hours_ar[i] : h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmap.data.map((row, fi) => (
                  <tr key={fi}>
                    <td className="py-1 pe-2 text-sm text-gray-600 whitespace-nowrap">
                      {locale === 'ar' ? heatmap.features_ar[fi] : heatmap.features[fi]}
                    </td>
                    {row.map((val, hi) => (
                      <td key={hi} className="p-0.5">
                        <div
                          className={`rounded h-8 flex items-center justify-center text-[10px] font-medium ${getHeatColor(val)}`}
                          title={`${val} ${t('engagement.sessions')}`}
                        >
                          {val}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 mt-4 text-xs text-gray-500">
            <span>{t('engagement.users')}:</span>
            <span aria-hidden className="text-[11px]">{t('engagement.legendLow')}</span>
            <div className="flex items-center gap-0.5" role="img" aria-label={`${t('engagement.legendLow')} → ${t('engagement.legendHigh')}`}>
              <div className="w-5 h-4 rounded-s bg-pair-50" />
              <div className="w-5 h-4 bg-pair-100" />
              <div className="w-5 h-4 bg-pair-200" />
              <div className="w-5 h-4 bg-pair-400" />
              <div className="w-5 h-4 rounded-e bg-pair-600" />
            </div>
            <span aria-hidden className="text-[11px]">{t('engagement.legendHigh')}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">{t('engagement.byCohort')}</h2>
          <div className="space-y-3">
            {data.engagement_by_cohort.map((c) => (
              <div key={c.cohort} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('engagement.classOf', { value: c.cohort })}</span>
                <div>
                  <span className="font-medium">{c.active_users.toLocaleString()}</span>
                  <span className="text-gray-400 text-xs ms-2">
                    {t('engagement.avgMin', { value: String(c.avg_session_min) })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">{t('engagement.byMajor')}</h2>
          <div className="space-y-3">
            {data.engagement_by_major.map((m) => (
              <div key={m.major_en} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {locale === 'ar' ? m.major_ar : m.major_en}
                </span>
                <div>
                  <span className="font-medium">{m.active_users.toLocaleString()}</span>
                  <span className="text-gray-400 text-xs ms-2">
                    {t('engagement.mSuffix', { value: String(m.avg_session_min) })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">{t('engagement.byYear')}</h2>
          <div className="space-y-3">
            {data.engagement_by_year.map((y) => (
              <div key={y.year} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {locale === 'ar' ? y.year_ar : y.year}
                </span>
                <div>
                  <span className="font-medium">{y.active_users.toLocaleString()}</span>
                  <span className="text-gray-400 text-xs ms-2">
                    {t('engagement.mSuffix', { value: String(y.avg_session_min) })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">{t('engagement.peakHours')}</h2>
        <div className="flex items-end gap-3" style={{ height: 200 }}>
          {data.peak_hours.map((p) => {
            const heightPercent = maxPeakUsers > 0 ? (p.users / maxPeakUsers) * 100 : 0;
            return (
              <div key={p.hour} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-xs font-medium text-pair-700 mb-1">
                  {p.users.toLocaleString()}
                </span>
                <div
                  className="w-full bg-pair-500 rounded-t-md transition-all"
                  style={{ height: `${heightPercent}%`, minHeight: 4 }}
                />
                <span className="text-xs text-gray-500 mt-2">{p.label_en}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4">{t('engagement.trend')}</h2>
        <div className="flex items-end gap-2" style={{ height: 120 }}>
          {data.peak_hours.map((p) => {
            const heightPercent = maxPeakUsers > 0 ? (p.users / maxPeakUsers) * 100 : 0;
            return (
              <div key={`trend-${p.hour}`} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full bg-pair-200 rounded-t-sm"
                  style={{ height: `${heightPercent}%`, minHeight: 2 }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-400">{data.peak_hours[0]?.label_en}</span>
          <span className="text-xs text-gray-400">{data.peak_hours[data.peak_hours.length - 1]?.label_en}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        {t('common.period')}: {data.period.start} - {data.period.end}
      </p>
    </div>
  );
}
