'use client';

import { useQuery } from '@tanstack/react-query';
import Card from '@/components/Card';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import PageHeader from '@/components/PageHeader';

interface AIData {
  total_conversations: number;
  avg_satisfaction: number;
  escalation_rate: number;
  avg_response_time_sec: number;
  conversations_today: number;
  topic_distribution: { topic: string; count: number; percentage: number }[];
  escalation_reasons: { reason: string; count: number; percentage: number }[];
  satisfaction_breakdown: { rating: number; count: number; percentage: number }[];
  recent_escalations: { id: string; student: string; topic: string; timestamp: string; status: string }[];
}

export default function AIMonitoringPage() {
  const { t, dir } = useI18n();
  const { data, isError, refetch } = useQuery<AIData>({
    queryKey: ['ai-monitoring'],
    queryFn: () => api.getAIMonitoring() as Promise<AIData>,
  });

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;
  if (!data) return <SkeletonPage />;

  return (
    <div dir={dir}>
      <PageHeader title={t('ai.title')} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card title={t('ai.totalConversations')} value={data.total_conversations.toLocaleString()} />
        <Card title={t('ai.today')} value={data.conversations_today} />
        <Card title={t('ai.avgSatisfaction')} value={`${data.avg_satisfaction}/5`} />
        <Card title={t('ai.escalationRate')} value={`${data.escalation_rate}%`} />
        <Card title={t('ai.avgResponse')} value={`${data.avg_response_time_sec}s`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="cck-card p-6">
          <h2 className="text-lg font-semibold mb-4">{t('ai.topicDistribution')}</h2>
          <div className="space-y-3">
            {data.topic_distribution.map((tp) => (
              <div key={tp.topic}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-body">{tp.topic}</span>
                  <span className="text-muted">{tp.count.toLocaleString()} ({tp.percentage}%)</span>
                </div>
                <div className="w-full bg-canvas rounded-full h-2">
                  <div className="bg-pair-500 h-2 rounded-full" style={{ width: `${tp.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cck-card p-6">
          <h2 className="text-lg font-semibold mb-4">{t('ai.satisfactionBreakdown')}</h2>
          <div className="space-y-3">
            {data.satisfaction_breakdown.map((s) => (
              <div key={s.rating} className="flex items-center gap-3">
                <span className="w-8 text-sm font-medium text-body">{s.rating}/5</span>
                <div className="flex-1 bg-canvas rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.rating >= 4 ? 'bg-pair-600' : s.rating === 3 ? 'bg-line-strong' : 'bg-danger-500'}`}
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted w-20 text-end">{s.count.toLocaleString()} ({s.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="cck-card p-6">
          <h2 className="text-lg font-semibold mb-4">{t('ai.escalationReasons')}</h2>
          <div className="space-y-3">
            {data.escalation_reasons.map((r) => (
              <div key={r.reason} className="flex items-center justify-between text-sm">
                <span className="text-body">{r.reason}</span>
                <div>
                  <span className="font-medium">{r.count}</span>
                  <span className="text-muted text-xs ms-2">({r.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cck-card p-6">
          <h2 className="text-lg font-semibold mb-4">{t('ai.recentEscalations')}</h2>
          <div className="space-y-3">
            {data.recent_escalations.map((e) => (
              <div key={e.id} className="border border-line rounded-sm p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{e.student}</span>
                  <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${
                    e.status === 'resolved' ? 'cck-chip-positive' : 'cck-chip-neutral'
                  }`}>{e.status}</span>
                </div>
                <p className="text-sm text-body">{e.topic}</p>
                <p className="text-xs text-muted mt-1">{new Date(e.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
