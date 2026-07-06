'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getRequestStageInfo, type StudentRequest, type RequestStatus, type RequestType, type RequestStageStatus, type BankChangeWindow } from '@/lib/api';
import { isRequestOnFinanceHold } from '@/lib/cckPolicies';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import StatusBadge, { type LifecycleStatus } from '@/components/StatusBadge';
import AcademicRequestModal from '@/components/AcademicRequestModal';
import PageHeader from '@/components/PageHeader';

const REQUEST_TYPES: RequestType[] = [
  'twimc', 'twimc_balance', 'transcript', 'semester_withdrawal', 'college_withdrawal',
  'absence_excuse', 'expected_grad', 'puc_letter', 'puc_no_aid', 'industrial_cert',
  'lost_id', 'update_id_photo', 'bank_change', 'change_of_grade', 'incomplete_grade',
];

const toLifecycle = (s: RequestStatus): LifecycleStatus =>
  s === 'submitted' ? 'not_started'
  : s === 'in_progress' ? 'pending'
  : s === 'completed' ? 'completed'
  : 'rejected'; // both rejected and cancelled collapse here

// The status filter operates on the canonical 4 lifecycle values; 'rejected'
// matches both raw `rejected` and raw `cancelled` rows.
type StatusFilter = LifecycleStatus | 'all';
const statusFilterMatches = (filter: StatusFilter, raw: RequestStatus): boolean =>
  filter === 'all' || toLifecycle(raw) === filter;

const STAGE_PILL_STYLE: Record<RequestStageStatus, string> = {
  on_track: 'cck-chip-positive',
  due_soon: 'cck-chip-neutral',
  due_today: 'cck-chip-neutral',
  overdue: 'cck-chip-negative',
};

export default function RequestsPage() {
  const { t, locale, dir } = useI18n();
  const qc = useQueryClient();
  const { data: requests, isError, isLoading, refetch } = useQuery<StudentRequest[]>({
    queryKey: ['requests'],
    queryFn: () => api.getRequests() as Promise<StudentRequest[]>,
  });
  const [academicOpen, setAcademicOpen] = useState(false);
  const { data: bankWindow } = useQuery<BankChangeWindow>({
    queryKey: ['bank-change-window'],
    queryFn: () => api.getBankChangeWindow() as Promise<BankChangeWindow>,
  });
  const [typeFilter, setTypeFilter] = useState<RequestType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  // Finance-hold requests can't be actioned until the student clears their
  // balance, so they're hidden by default to avoid cluttering the queue. The
  // student is told in the app it won't be processed until the balance is paid.
  const [showFinanceHolds, setShowFinanceHolds] = useState(false);

  // Rows matching the current type/status/search filters, ignoring the
  // finance-hold visibility toggle.
  const matched = useMemo(() => {
    if (!requests) return [];
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (!statusFilterMatches(statusFilter, r.status)) return false;
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.student_id.toLowerCase().includes(q) ||
        r.student_name_en.toLowerCase().includes(q) ||
        r.student_name_ar.includes(q)
      );
    });
  }, [requests, typeFilter, statusFilter, search]);

  const financeHoldHiddenCount = useMemo(
    () => matched.filter((r) => isRequestOnFinanceHold(r)).length,
    [matched],
  );

  const filtered = useMemo(
    () => (showFinanceHolds ? matched : matched.filter((r) => !isRequestOnFinanceHold(r))),
    [matched, showFinanceHolds],
  );

  const fmtDate = (iso: string) => new Date(iso).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  const stageDeptLabel = (r: StudentRequest, stage: ReturnType<typeof getRequestStageInfo>): string => {
    if (!stage) return '';
    if (stage.department) return t(`dept.${stage.department}`);
    return locale === 'ar' ? stage.step.label_ar : stage.step.label_en;
  };

  const stageDueLabel = (stage: NonNullable<ReturnType<typeof getRequestStageInfo>>): string => {
    if (stage.status === 'overdue') return t('requests.overdueDays', { value: stage.daysOverdue });
    if (stage.status === 'due_today') return t('requests.dueToday');
    return t('requests.dueInDays', { value: stage.daysUntilDue });
  };

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;

  const fmtDay = (iso: string) => new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div dir={dir}>
      <PageHeader
        title={t('requests.title')}
        subtitle={t('requests.subtitle')}
        actions={
          <button onClick={() => setAcademicOpen(true)} className="btn btn-primary">
            + {t('requests.newAcademicRequest')}
          </button>
        }
      />

      {/* Bank-change window - feedback: bank-detail changes only inside the
          college-defined window. */}
      {bankWindow && (
        <div className={`mb-4 rounded-sm border px-4 py-3 ${
          bankWindow.is_open ? 'bg-pair-50 border-pair-200' : 'bg-canvas border-line'
        }`}>
          <p className={`text-sm font-semibold ${bankWindow.is_open ? 'text-pair-700' : 'text-body'}`}>
            {t(`requestType.bank_change`)}
          </p>
          <p className={`text-xs mt-1 ${bankWindow.is_open ? 'text-pair-700' : 'text-muted'}`}>
            {bankWindow.is_open
              ? t('social.bankWindow', { value: locale === 'ar' ? bankWindow.label_ar : bankWindow.label_en })
              : t('social.bankWindowClosed', { value: fmtDay(bankWindow.next_opens_at) })}
          </p>
        </div>
      )}

      <div className="cck-card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder={t('requests.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] border border-line-strong rounded-sm px-3 py-2 text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as RequestType | 'all')}
          className="border border-line-strong rounded-sm px-3 py-2 text-sm"
        >
          <option value="all">{t('requests.allTypes')}</option>
          {REQUEST_TYPES.map((rt) => (
            <option key={rt} value={rt}>{t(`requestType.${rt}`)}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="border border-line-strong rounded-sm px-3 py-2 text-sm"
        >
          <option value="all">{t('requests.allStatuses')}</option>
          <option value="not_started">{t('status.notStarted')}</option>
          <option value="pending">{t('status.pending')}</option>
          <option value="completed">{t('status.completed')}</option>
          <option value="rejected">{t('status.rejected')}</option>
        </select>
      </div>

      {financeHoldHiddenCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-sm border border-line bg-canvas px-4 py-2.5">
          <p className="text-xs text-muted">
            {t('requests.financeHoldHidden', { value: financeHoldHiddenCount })}
          </p>
          <button
            type="button"
            onClick={() => setShowFinanceHolds((v) => !v)}
            className="text-xs font-medium text-pair-600 hover:text-pair-700"
          >
            {showFinanceHolds ? t('requests.financeHoldHide') : t('requests.financeHoldShow')}
          </button>
        </div>
      )}

      {isLoading || !requests ? (
        <SkeletonTable rows={6} cols={7} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t('requests.noResults')} />
      ) : (
        <div className="cck-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted border-b bg-canvas">
                <th className="px-4 py-3 text-start font-medium">{t('requests.id')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('requests.student')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('requests.type')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('common.status')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('requests.pendingWith')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('requests.assignedTo')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('requests.submittedAt')}</th>
                <th className="px-4 py-3 text-end font-medium"><span className="sr-only">{t('common.actions')}</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0 hover:bg-canvas">
                  <td className="px-4 py-3 font-mono text-xs text-ink">{r.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{locale === 'ar' ? r.student_name_ar : r.student_name_en}</p>
                    <p className="text-xs text-muted">{r.student_id}</p>
                  </td>
                  <td className="px-4 py-3 text-ink">
                    <span>{t(`requestType.${r.type}`)}</span>
                    {isRequestOnFinanceHold(r) && (
                      <span className="ms-2 inline-flex items-center px-1.5 py-0.5 rounded-sm text-[11px] font-medium bg-danger-50 text-danger-700 ring-1 ring-danger-500/30">
                        {t('requests.financeHoldList', { value: (r.outstanding_balance_kwd ?? 0).toLocaleString() })}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={toLifecycle(r.status)} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {(() => {
                      const stage = getRequestStageInfo(r);
                      if (!stage) return <span className="text-muted">-</span>;
                      const isPuc = stage.department === 'puc';
                      return (
                        <div className="space-y-1">
                          <p className="text-ink">{stageDeptLabel(r, stage)}</p>
                          {isPuc ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-canvas text-muted">
                              {t('status.pending')}
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium ${STAGE_PILL_STYLE[stage.status]}`}>
                              <span>{t('requests.daysAtStage', { value: stage.daysAtStage })}</span>
                              <span aria-hidden>·</span>
                              <span>{stageDueLabel(stage)}</span>
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-muted text-sm">
                    {r.assigned_to_en
                      ? (locale === 'ar' ? r.assigned_to_ar : r.assigned_to_en)
                      : <span className="italic">{t('requests.unassigned')}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{fmtDate(r.submitted_at)}</td>
                  <td className="px-4 py-3 text-end">
                    <Link
                      href={`/requests/${r.id}`}
                      className="text-pair-600 hover:text-pair-700 text-sm font-medium"
                    >
                      {t('requests.openDetail')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {academicOpen && (
        <AcademicRequestModal
          onClose={() => setAcademicOpen(false)}
          onCreated={(req) => {
            qc.setQueryData<StudentRequest[]>(['requests'], (prev) => [req, ...(prev ?? [])]);
            setAcademicOpen(false);
          }}
        />
      )}
    </div>
  );
}
