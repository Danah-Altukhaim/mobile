'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

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

  const riskColor = student.risk_level === 'high' ? 'bg-danger-100 text-danger-700' : 'bg-gold-100 text-gold-700';
  const thAlign = isAr ? 'text-right' : 'text-left';

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      <Link href="/retention" className="text-sm text-pair-600 hover:underline mb-4 inline-block">
        &larr; {t('retention.backToDashboard')}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{student.name_en}</h1>
          <p className="text-gray-500">{student.name_ar} &middot; #{student.student_id} &middot; {student.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded text-sm font-medium ${riskColor}`}>
            {t('retention.riskScore', { value: String(Math.round(student.risk_score * 100)) })}
          </span>
          <span className="text-lg font-bold">{t('retention.gpa', { value: String(student.gpa) })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('retention.college')}</p>
          <p className="font-medium">{student.college_en}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('student.major')}</p>
          <p className="font-medium">{student.major_en}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('student.assignedAdvisor')}</p>
          <p className="font-medium">{student.assigned_advisor.name_en}</p>
          <p className="text-xs text-gray-400">{student.assigned_advisor.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Academic History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">{t('student.academicHistory')}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className={`${thAlign} text-gray-500 border-b`}>
                <th className="pb-2">{t('student.semester')}</th>
                <th className="pb-2">{t('retention.gpa', { value: '' }).trim()}</th>
                <th className="pb-2">{t('student.credits')}</th>
                <th className="pb-2">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody>
              {student.academic_history.map((s) => (
                <tr key={s.semester} className="border-b border-gray-50">
                  <td className="py-2">{s.semester}</td>
                  <td className="py-2">{s.gpa}</td>
                  <td className="py-2">{s.credits}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${s.status === 'Good Standing' ? 'bg-oasis-100 text-oasis-700' : s.status === 'Probation' ? 'bg-danger-100 text-danger-700' : 'bg-gold-100 text-gold-700'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">{t('student.attendance')}</h2>
          <div className="space-y-3">
            {student.attendance.map((a) => (
              <div key={a.course}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{a.course}</span>
                  <span className={`text-xs font-medium ${a.rate >= 80 ? 'text-oasis-600' : a.rate >= 60 ? 'text-gold-600' : 'text-danger-600'}`}>
                    {a.attended}/{a.total} ({a.rate}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${a.rate >= 80 ? 'bg-oasis-500' : a.rate >= 60 ? 'bg-gold-500' : 'bg-danger-500'}`}
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">{t('student.paymentStatus')}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className={`${thAlign} text-gray-500 border-b`}>
                <th className="pb-2">{t('student.item')}</th>
                <th className="pb-2">{t('student.amount')}</th>
                <th className="pb-2">{t('student.due')}</th>
                <th className="pb-2">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody>
              {student.payment_status.map((p, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2">{p.item}</td>
                  <td className="py-2">{p.amount.toLocaleString()} KWD</td>
                  <td className="py-2 text-xs text-gray-500">{p.due_date}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${p.status === 'Paid' ? 'bg-oasis-100 text-oasis-700' : p.status === 'Overdue' ? 'bg-danger-100 text-danger-700' : 'bg-gold-100 text-gold-700'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Engagement Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">{t('student.engagementTimeline')}</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {student.engagement_timeline.map((e, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-xs text-gray-400 w-20 shrink-0">{e.date}</span>
                <span className="text-gray-600">{e.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Previous Interventions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">{t('student.previousInterventions')}</h2>
        {student.interventions.length === 0 ? (
          <p className="text-sm text-gray-400">{t('retention.noInterventions')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className={`${thAlign} text-gray-500 border-b`}>
                <th className="pb-2">{t('student.due')}</th>
                <th className="pb-2">{t('student.type')}</th>
                <th className="pb-2">{t('retention.advisor')}</th>
                <th className="pb-2">{t('retention.outcome')}</th>
                <th className="pb-2">{t('student.notes')}</th>
              </tr>
            </thead>
            <tbody>
              {student.interventions.map((inv, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 text-xs text-gray-500">{inv.date}</td>
                  <td className="py-2">{inv.type}</td>
                  <td className="py-2">{inv.advisor}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${inv.outcome === 'Resolved' ? 'bg-oasis-100 text-oasis-700' : inv.outcome === 'Ongoing' ? 'bg-blue-100 text-blue-700' : inv.outcome === 'Escalated' ? 'bg-danger-100 text-danger-700' : 'bg-gray-100 text-gray-700'}`}>
                      {inv.outcome}
                    </span>
                  </td>
                  <td className="py-2 text-xs text-gray-500">{inv.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
