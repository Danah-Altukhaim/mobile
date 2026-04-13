'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import ConfirmDialog from '@/components/ConfirmDialog';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

interface FollowUpReminder {
  id: string;
  student_id: string;
  student_name_en: string;
  student_name_ar: string;
  intervention_date: string;
  due_date: string;
  status: 'overdue' | 'upcoming';
  action: string;
}

interface RiskRecalcInfo {
  last_calculated: string;
  next_scheduled: string;
  model_version: string;
}

interface Student {
  id: string;
  name_en: string;
  name_ar: string;
  student_id: string;
  risk_score: number;
  risk_level: string;
  college_en: string;
  college_ar?: string;
  gpa: number;
  contributing_factors: { factor_en: string; factor_ar: string; weight: number }[];
  last_active: string;
}

interface RetentionData {
  overall_retention_rate: number;
  at_risk_students_count: number;
  total_enrolled: number;
  retention_by_college: { college_en: string; college_ar: string; retention_rate: number; enrolled: number }[];
  trend: { month: string; rate: number }[];
}

const PAGE_SIZE = 5;

export default function RetentionPage() {
  const { t, locale } = useI18n();
  const isAr = locale === 'ar';

  const [retention, setRetention] = useState<RetentionData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [reminders, setReminders] = useState<FollowUpReminder[]>([]);
  const [recalcInfo, setRecalcInfo] = useState<RiskRecalcInfo | null>(null);
  const [error, setError] = useState(false);
  const [intervening, setIntervening] = useState<string | null>(null);
  const [interventionActions, setInterventionActions] = useState<Record<string, string>>({});
  const [outcomes, setOutcomes] = useState<Record<string, string>>({});
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // ConfirmDialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingIntervention, setPendingIntervention] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setError(false);
    Promise.all([
      api.getRetention().then((d) => setRetention(d as RetentionData)),
      api.getAtRiskStudents().then((d) => {
        const sorted = (d as Student[]).sort((a, b) => b.risk_score - a.risk_score);
        setStudents(sorted);
      }),
      api.getFollowUpReminders().then((d) => setReminders(d as FollowUpReminder[])),
      api.getRiskRecalcInfo().then((d) => setRecalcInfo(d as RiskRecalcInfo)),
    ]).catch(() => setError(true));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const INTERVENTION_TYPES = useMemo(() => [
    { value: 'send_message', label: t('retention.sendMessage') },
    { value: 'schedule_meeting', label: t('retention.scheduleMeeting') },
    { value: 'refer_counseling', label: t('retention.referCounseling') },
    { value: 'contact_guardian', label: t('retention.contactGuardian') },
    { value: 'custom_note', label: t('retention.customNote') },
  ], [t]);

  const requestIntervene = (id: string) => {
    setPendingIntervention(id);
    setConfirmOpen(true);
  };

  const handleIntervene = async () => {
    if (!pendingIntervention) return;
    const id = pendingIntervention;
    const action = interventionActions[id] || 'schedule_meeting';
    setConfirmOpen(false);
    setPendingIntervention(null);
    setIntervening(id);
    try {
      await api.logIntervention(id, { action });
      const label = INTERVENTION_TYPES.find((x) => x.value === action)?.label || action;
      setSuccessBanner(t('retention.interventionScheduled', { value: label }));
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch {
      // silently fail
    } finally {
      setIntervening(null);
    }
  };

  const handleDismissReminder = async (id: string) => {
    await api.dismissReminder(id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleOutcomeChange = async (id: string, outcome: string) => {
    setOutcomes((prev) => ({ ...prev, [id]: outcome }));
    try {
      await api.updateOutcome(id, outcome);
    } catch {
      // silently fail
    }
  };

  if (error) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={loadData} retryLabel={t('common.retry')} />;
  if (!retention) return <SkeletonPage />;

  const riskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-danger-100 text-danger-700';
      case 'medium': return 'bg-gold-100 text-gold-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const riskLabel = (level: string) => {
    switch (level) {
      case 'high': return t('retention.critical');
      case 'medium': return t('retention.warning');
      default: return t('retention.watch');
    }
  };

  const totalPages = Math.ceil(students.length / PAGE_SIZE);
  const paginatedStudents = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Trend chart helpers
  const trendMax = Math.max(...retention.trend.map((t) => t.rate), 0);
  const trendMin = Math.min(...retention.trend.map((t) => t.rate), 100);
  const trendRange = Math.max(trendMax - trendMin, 1);

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-bold mb-6">{t('retention.title')}</h1>

      {/* Success banner */}
      {successBanner && (
        <div className="mb-4 px-4 py-3 bg-oasis-50 border border-oasis-200 text-oasis-800 text-sm rounded-lg">
          {successBanner}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card title={t('retention.rate')} value={`${retention.overall_retention_rate}%`} />
        <Card title={t('retention.atRisk')} value={retention.at_risk_students_count} />
        <Card title={t('retention.totalEnrolled')} value={retention.total_enrolled.toLocaleString()} />
      </div>

      {/* Risk Recalculation Info */}
      {recalcInfo && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6 flex items-center justify-between flex-wrap gap-2 text-sm">
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700">{t('retention.riskRecalc')}</span>
            <span className="text-gray-500">
              {t('retention.lastCalculated')}: {new Date(recalcInfo.last_calculated).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-gray-500">
              {t('retention.nextScheduled')}: {new Date(recalcInfo.next_scheduled).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <span className="text-xs text-gray-400">{t('retention.modelVersion')} {recalcInfo.model_version} &middot; {t('retention.recalcWeekly')}</span>
        </div>
      )}

      {/* Follow-Up Reminders */}
      {reminders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">{t('retention.followUpReminders')}</h2>
          <div className="space-y-3">
            {reminders.map((r) => (
              <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg border ${r.status === 'overdue' ? 'border-danger-200 bg-danger-50' : 'border-gold-200 bg-gold-50'}`}>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.status === 'overdue' ? 'bg-danger-100 text-danger-700' : 'bg-gold-100 text-gold-700'}`}>
                    {r.status === 'overdue' ? t('retention.reminderOverdue') : t('retention.reminderUpcoming')}
                  </span>
                  <div>
                    <Link href={`/retention/${r.student_id}`} className="text-sm font-medium text-pair-700 hover:underline">
                      {isAr ? r.student_name_ar : r.student_name_en}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {r.action} &middot; {t('retention.interventionOn', { value: new Date(r.intervention_date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {t('retention.dueDate', { value: new Date(r.due_date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') })}
                  </span>
                  <button
                    onClick={() => handleDismissReminder(r.id)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    {t('retention.reminderDismiss')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Retention Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">{t('retention.trend')}</h2>
        <div className="flex items-end gap-2" style={{ height: 160 }}>
          {retention.trend.map((point) => {
            const heightPct = ((point.rate - trendMin) / trendRange) * 80 + 20;
            return (
              <div key={point.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-600 font-medium">{point.rate}%</span>
                <div
                  className="w-full rounded-t bg-pair-500 min-h-[4px]"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[10px] text-gray-400 truncate w-full text-center">{point.month}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{t('retention.month')}</span>
          <span>{t('retention.rate_label')}</span>
        </div>
      </div>

      {/* Retention by College */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">{t('retention.byCollege')}</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className={`${isAr ? 'text-right' : 'text-left'} text-gray-500 border-b`}>
              <th className="pb-2">{t('retention.college')}</th>
              <th className="pb-2">{t('retention.enrolled')}</th>
              <th className="pb-2">{t('retention.retention')}</th>
            </tr>
          </thead>
          <tbody>
            {retention.retention_by_college.map((c) => (
              <tr key={c.college_en} className="border-b border-gray-50">
                <td className="py-3">
                  {isAr ? c.college_ar : c.college_en}
                </td>
                <td className="py-3">{c.enrolled}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.retention_rate >= 95 ? 'bg-oasis-100 text-oasis-700' : c.retention_rate >= 93 ? 'bg-gold-100 text-gold-700' : 'bg-danger-100 text-danger-700'}`}>
                    {c.retention_rate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* At-Risk Students */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">{t('retention.atRiskStudents')}</h2>
        <div className="space-y-4">
          {paginatedStudents.map((s) => (
            <div key={s.id} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Link href={`/retention/${s.id}`} className="font-medium text-pair-700 hover:underline">
                    {isAr ? s.name_ar : s.name_en}
                  </Link>
                  <span className={`text-gray-400 text-xs ${isAr ? 'mr-2' : 'ml-2'}`}>#{s.student_id}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskColor(s.risk_level)}`}>
                    {riskLabel(s.risk_level)} — {Math.round(s.risk_score * 100)}
                  </span>
                  <span className="text-sm text-gray-500">{t('retention.gpa', { value: String(s.gpa) })}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-xs text-gray-500">{isAr && s.college_ar ? s.college_ar : s.college_en}</p>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                {s.contributing_factors.map((f, i) => (
                  <li key={i}>{isAr ? `\u2022 ${f.factor_ar}` : `\u2022 ${f.factor_en}`}</li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {t('retention.lastActive', { value: new Date(s.last_active).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') })}
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={interventionActions[s.id] || 'schedule_meeting'}
                    onChange={(e) =>
                      setInterventionActions((prev) => ({ ...prev, [s.id]: e.target.value }))
                    }
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                  >
                    {INTERVENTION_TYPES.map((it) => (
                      <option key={it.value} value={it.value}>{it.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => requestIntervene(s.id)}
                    disabled={intervening === s.id}
                    className="px-3 py-1.5 bg-pair-600 text-white text-sm rounded-lg hover:bg-pair-700 disabled:opacity-50"
                  >
                    {intervening === s.id ? t('retention.scheduling') : t('retention.intervene')}
                  </button>
                </div>
              </div>
              {/* Outcome Tracking */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{t('retention.outcome')}:</span>
                  <select
                    value={outcomes[s.id] || ''}
                    onChange={(e) => handleOutcomeChange(s.id, e.target.value)}
                    className="border border-gray-200 rounded px-2 py-1 text-xs"
                  >
                    <option value="">{t('status.notSet')}</option>
                    <option value="Resolved">{t('status.resolved')}</option>
                    <option value="Ongoing">{t('status.ongoing')}</option>
                    <option value="Escalated">{t('status.escalated')}</option>
                    <option value="Withdrew">{t('status.withdrew')}</option>
                  </select>
                  {outcomes[s.id] && (
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      outcomes[s.id] === 'Resolved' ? 'bg-oasis-100 text-oasis-700' :
                      outcomes[s.id] === 'Ongoing' ? 'bg-blue-100 text-blue-700' :
                      outcomes[s.id] === 'Escalated' ? 'bg-danger-100 text-danger-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {outcomes[s.id] === 'Resolved' ? t('status.resolved') :
                       outcomes[s.id] === 'Ongoing' ? t('status.ongoing') :
                       outcomes[s.id] === 'Escalated' ? t('status.escalated') :
                       t('status.withdrew')}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{t('retention.followUp')}</span>
              </div>
            </div>
          ))}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={students.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={t('retention.intervene')}
        message={
          pendingIntervention
            ? t('retention.interventionScheduled', {
                value: INTERVENTION_TYPES.find((x) => x.value === (interventionActions[pendingIntervention] || 'schedule_meeting'))?.label || '',
              })
            : ''
        }
        onConfirm={handleIntervene}
        onCancel={() => { setConfirmOpen(false); setPendingIntervention(null); }}
      />
    </div>
  );
}
