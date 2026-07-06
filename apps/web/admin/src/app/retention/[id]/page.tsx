'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import StatusBadge, { type LifecycleStatus } from '@/components/StatusBadge';

// Older intervention records may still carry legacy outcome labels.
const normalizeOutcome = (raw: string): LifecycleStatus | null => {
  if (!raw) return null;
  if (raw === 'pending' || raw === 'completed' || raw === 'rejected' || raw === 'not_started') {
    return raw;
  }
  if (raw === 'Resolved') return 'completed';
  if (raw === 'Ongoing') return 'pending';
  if (raw === 'Escalated' || raw === 'Withdrew') return 'rejected';
  return null;
};

interface StudentProfile {
  id: string;
  name_en: string;
  name_ar: string;
  student_id: string;
  email: string;
  risk_score: number;
  risk_level: string;
  college_en: string;
  major_en: string;
  year: string;
  gpa: number;
  assigned_advisor: { name_en: string; email: string };
  contributing_factors: { factor_en: string; weight: number }[];
  academic_history: { semester: string; gpa: number; credits: number; status: string }[];
  attendance: { course: string; attended: number; total: number; rate: number }[];
  payment_status: { item: string; amount: number; status: string; due_date: string }[];
  engagement_timeline: { date: string; action: string }[];
  interventions: { date: string; type: string; advisor: string; outcome: string; notes: string }[];
}

export default function StudentProfilePage() {
  const params = useParams();
  const { t, locale } = useI18n();
  const isAr = locale === 'ar';

  const studentId = params.id as string;
  const { data: student, isError, refetch } = useQuery<StudentProfile>({
    queryKey: ['retention', 'profile', studentId],
    queryFn: () => api.getStudentProfile(studentId) as Promise<StudentProfile>,
  });

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;
  if (!student) return <SkeletonPage />;

  const riskColor = student.risk_level === 'high' ? 'cck-chip-negative' : 'cck-chip-neutral';
  const thAlign = isAr ? 'text-right' : 'text-left';

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      <Link href="/retention" className="text-sm text-pair-600 hover:underline mb-4 inline-block">
        &larr; {t('retention.backToDashboard')}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="cck-title">{student.name_en}</h1>
          <p className="text-muted">{student.name_ar} &middot; #{student.student_id} &middot; {student.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-sm text-sm font-medium ${riskColor}`}>
            {t('retention.riskScore', { value: String(Math.round(student.risk_score * 100)) })}
          </span>
          <span className="text-lg font-bold">{t('retention.gpa', { value: String(student.gpa) })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="cck-card p-4">
          <p className="text-sm text-muted">{t('retention.college')}</p>
          <p className="font-medium">{student.college_en}</p>
        </div>
        <div className="cck-card p-4">
          <p className="text-sm text-muted">{t('student.major')}</p>
          <p className="font-medium">{student.major_en}</p>
        </div>
        <div className="cck-card p-4">
          <p className="text-sm text-muted">{t('student.assignedAdvisor')}</p>
          <p className="font-medium">{student.assigned_advisor.name_en}</p>
          <p className="text-xs text-muted">{student.assigned_advisor.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Academic History */}
        <div className="cck-card p-6">
          <h2 className="text-lg font-semibold mb-4">{t('student.academicHistory')}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className={`${thAlign} text-muted border-b`}>
                <th className="pb-2">{t('student.semester')}</th>
                <th className="pb-2">{t('retention.gpa', { value: '' }).trim()}</th>
                <th className="pb-2">{t('student.credits')}</th>
                <th className="pb-2">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody>
              {student.academic_history.map((s) => (
                <tr key={s.semester} className="border-b border-line">
                  <td className="py-2">{s.semester}</td>
                  <td className="py-2">{s.gpa}</td>
                  <td className="py-2">{s.credits}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-sm text-xs ${s.status === 'Good Standing' ? 'cck-chip-positive' : s.status === 'Probation' ? 'cck-chip-negative' : 'cck-chip-neutral'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Attendance */}
        <div className="cck-card p-6">
          <h2 className="text-lg font-semibold mb-4">{t('student.attendance')}</h2>
          <div className="space-y-3">
            {student.attendance.map((a) => (
              <div key={a.course}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-body">{a.course}</span>
                  <span className={`text-xs font-medium ${a.rate < 60 ? 'text-danger-600' : 'text-body'}`}>
                    {a.attended}/{a.total} ({a.rate}%)
                  </span>
                </div>
                <div className="w-full bg-canvas rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${a.rate >= 80 ? 'bg-pair-600' : a.rate >= 60 ? 'bg-line-strong' : 'bg-danger-500'}`}
                    style={{ width: `${a.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Payment Status */}
        <div className="cck-card p-6">
          <h2 className="text-lg font-semibold mb-4">{t('student.paymentStatus')}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className={`${thAlign} text-muted border-b`}>
                <th className="pb-2">{t('student.item')}</th>
                <th className="pb-2">{t('student.amount')}</th>
                <th className="pb-2">{t('student.due')}</th>
                <th className="pb-2">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody>
              {student.payment_status.map((p, i) => (
                <tr key={i} className="border-b border-line">
                  <td className="py-2">{p.item}</td>
                  <td className="py-2">{p.amount.toLocaleString()} KWD</td>
                  <td className="py-2 text-xs text-muted">{p.due_date}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-sm text-xs ${p.status === 'Paid' ? 'cck-chip-positive' : p.status === 'Overdue' ? 'cck-chip-negative' : 'cck-chip-neutral'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Engagement Timeline */}
        <div className="cck-card p-6">
          <h2 className="text-lg font-semibold mb-4">{t('student.engagementTimeline')}</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {student.engagement_timeline.map((e, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-xs text-muted w-20 shrink-0">{e.date}</span>
                <span className="text-body">{e.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Previous Interventions */}
      <div className="cck-card p-6">
        <h2 className="text-lg font-semibold mb-4">{t('student.previousInterventions')}</h2>
        {student.interventions.length === 0 ? (
          <p className="text-sm text-muted">{t('retention.noInterventions')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className={`${thAlign} text-muted border-b`}>
                <th className="pb-2">{t('student.due')}</th>
                <th className="pb-2">{t('student.type')}</th>
                <th className="pb-2">{t('retention.advisor')}</th>
                <th className="pb-2">{t('retention.outcome')}</th>
                <th className="pb-2">{t('student.notes')}</th>
              </tr>
            </thead>
            <tbody>
              {student.interventions.map((inv, i) => (
                <tr key={i} className="border-b border-line">
                  <td className="py-2 text-xs text-muted">{inv.date}</td>
                  <td className="py-2">{inv.type}</td>
                  <td className="py-2">{inv.advisor}</td>
                  <td className="py-2">
                    {(() => {
                      const norm = normalizeOutcome(inv.outcome);
                      return norm
                        ? <StatusBadge status={norm} />
                        : <StatusBadge status="not_started" />;
                    })()}
                  </td>
                  <td className="py-2 text-xs text-muted">{inv.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
