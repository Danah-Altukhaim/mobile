'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getRequestStageInfo, type StudentRequest, type RequestStatus, type RequestStageStatus, type AssignableStaff } from '@/lib/api';
import { withdrawalFineRate, calcWithdrawalFine } from '@masari/shared';
import { useI18n } from '@/lib/i18n';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useAuth } from '@/lib/auth';

const STATUS_STYLE: Record<RequestStatus, string> = {
  submitted: 'bg-gold-50 text-gold-700',
  in_progress: 'bg-pair-50 text-pair-700',
  completed: 'bg-oasis-50 text-oasis-700',
  rejected: 'bg-danger-50 text-danger-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

const STAGE_PILL_STYLE: Record<RequestStageStatus, string> = {
  on_track: 'bg-oasis-50 text-oasis-700 border-oasis-200',
  due_soon: 'bg-gold-50 text-gold-700 border-gold-200',
  due_today: 'bg-gold-100 text-gold-700 border-gold-500/40',
  overdue: 'bg-danger-50 text-danger-700 border-danger-200',
};

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { t, locale, dir, isRTL } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const requestKey = ['requests', id] as const;
  const { data: request, isError, refetch } = useQuery<StudentRequest>({
    queryKey: requestKey,
    queryFn: async () => {
      const d = await api.getRequest(id);
      if (!d) throw new Error('not_found');
      return d as StudentRequest;
    },
  });
  const { data: staffList } = useQuery<AssignableStaff[]>({
    queryKey: ['assignable-staff'],
    queryFn: () => api.getAssignableStaff() as Promise<AssignableStaff[]>,
  });
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const staffGroups = useMemo(() => {
    const groups = new Map<string, AssignableStaff[]>();
    for (const s of staffList ?? []) {
      const label = locale === 'ar' ? s.dept_ar : s.dept_en;
      const list = groups.get(label) ?? [];
      list.push(s);
      groups.set(label, list);
    }
    return Array.from(groups.entries());
  }, [staffList, locale]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const setStatus = async (status: RequestStatus) => {
    if (!request) return;
    setBusy(status);
    try {
      await api.updateRequestStatus(request.id, status);
      const updated: StudentRequest = {
        ...request,
        status,
        workflow: request.workflow.map((s, i) => {
          if (status === 'in_progress' && s.key === 'in_progress') return { ...s, status: 'current' };
          if (status === 'completed' && i === request.workflow.length - 1) return { ...s, status: 'completed', completed_at: new Date().toISOString() };
          if (status === 'completed' && s.status === 'current') return { ...s, status: 'completed', completed_at: new Date().toISOString() };
          return s;
        }),
      };
      qc.setQueryData<StudentRequest>(requestKey, updated);
      showToast(t('requests.statusUpdated', {
        value: status === 'in_progress' ? t('status.ongoing') : status === 'completed' ? t('status.resolved') : status,
      }));
    } finally {
      setBusy(null);
    }
  };

  // Assigning a request implies it is being worked on: a submitted request
  // auto-advances to in-progress so there is no separate "Mark In Progress" step.
  const applyAssignment = async (en: string, ar: string) => {
    if (!request) return;
    await api.assignRequest(request.id, { en, ar });
    const toInProgress = request.status === 'submitted';
    if (toInProgress) await api.updateRequestStatus(request.id, 'in_progress');
    qc.setQueryData<StudentRequest>(requestKey, {
      ...request,
      assigned_to_en: en,
      assigned_to_ar: ar,
      ...(toInProgress
        ? {
            status: 'in_progress',
            workflow: request.workflow.map((s) =>
              s.key === 'in_progress' ? { ...s, status: 'current' } : s,
            ),
          }
        : {}),
    });
  };

  const assignToMe = async () => {
    if (!request || !user) return;
    setBusy('assign');
    try {
      await applyAssignment(user.name_en, user.name_ar);
      showToast(t('requests.assignedToStaff', { value: locale === 'ar' ? user.name_ar : user.name_en }));
    } finally {
      setBusy(null);
    }
  };

  const assignToStaff = async (staffId: string) => {
    const staff = staffList?.find((s) => s.id === staffId);
    if (!request || !staff) return;
    setBusy('assign');
    try {
      await applyAssignment(staff.name_en, staff.name_ar);
      showToast(t('requests.assignedToStaff', { value: locale === 'ar' ? staff.name_ar : staff.name_en }));
    } finally {
      setBusy(null);
    }
  };

  const postComment = async () => {
    if (!request || !comment.trim() || !user) return;
    setBusy('comment');
    try {
      await api.addRequestComment(request.id, comment);
      const newComment = {
        id: `c_${Date.now()}`,
        author_en: user.name_en,
        author_ar: user.name_ar,
        body: comment,
        created_at: new Date().toISOString(),
        internal: true,
      };
      qc.setQueryData<StudentRequest>(requestKey, { ...request, comments: [...request.comments, newComment] });
      setComment('');
      showToast(t('requests.commentAdded'));
    } finally {
      setBusy(null);
    }
  };

  const notifyStudent = async () => {
    if (!request) return;
    setBusy('notify');
    try {
      await api.notifyRequestStudent(request.id);
      showToast(t('requests.notifySent'));
    } finally {
      setBusy(null);
    }
  };

  const rejectRequest = async () => {
    if (!request || !rejectReason.trim()) return;
    setBusy('reject');
    try {
      await api.rejectRequest(request.id, rejectReason.trim());
      qc.setQueryData<StudentRequest>(requestKey, {
        ...request,
        status: 'rejected',
        rejection_reason: rejectReason.trim(),
      });
      setRejectOpen(false);
      setRejectReason('');
      showToast(t('requests.rejectedWithEmail'));
    } finally {
      setBusy(null);
    }
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;
  if (!request) return <SkeletonPage />;

  const stage = getRequestStageInfo(request);
  const stageDueLabel = stage
    ? stage.status === 'overdue'
      ? t('requests.overdueDays', { value: stage.daysOverdue })
      : stage.status === 'due_today'
        ? t('requests.dueToday')
        : t('requests.dueInDays', { value: stage.daysUntilDue })
    : null;

  return (
    <div dir={dir}>
      <Link href="/requests" className="text-sm text-pair-600 hover:text-pair-700 mb-4 inline-flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {isRTL ? <path d="M3 8h10M9 4l4 4-4 4" /> : <path d="M13 8H3M7 4L3 8l4 4" />}
        </svg>
        {t('common.back')}
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-mono text-[#737477]">{request.id}</p>
          <h1 className="text-2xl font-bold mt-1">{t(`requestType.${request.type}`)}</h1>
          <p className="text-sm text-[#737477] mt-1">
            {locale === 'ar' ? request.student_name_ar : request.student_name_en}
            {' · '}
            {request.student_id}
            {' · '}
            {fmtDate(request.submitted_at)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded text-sm font-medium ${STATUS_STYLE[request.status]}`}>
          {request.status === 'submitted' ? t('status.pending')
            : request.status === 'in_progress' ? t('status.ongoing')
            : request.status === 'completed' ? t('status.resolved')
            : request.status === 'rejected' ? t('status.rejected')
            : t('status.cancelled')}
        </span>
      </div>

      {toast && (
        <div role="status" aria-live="polite" className="mb-4 bg-oasis-50 border border-oasis-200 rounded-lg px-4 py-2 text-sm text-oasis-700">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {request.status === 'rejected' && request.rejection_reason && (
            <section className="bg-danger-50 border border-danger-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-danger-700 uppercase tracking-wider mb-2">
                {t('requests.rejectionReason')}
              </h2>
              <p className="text-sm text-[#222]">{request.rejection_reason}</p>
              <p className="text-xs text-danger-700 mt-2">✉ {t('requests.rejectionEmailed')}</p>
            </section>
          )}

          {/* Workflow */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">{t('requests.workflow')}</h2>

            {stage && (
              <div className={`mb-4 rounded-lg border px-4 py-3 ${STAGE_PILL_STYLE[stage.status]}`}>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  {t('requests.currentStage')}
                </p>
                <p className="text-sm font-medium mt-1">
                  {stage.department ? t(`dept.${stage.department}`) : (locale === 'ar' ? stage.step.label_ar : stage.step.label_en)}
                  {' · '}
                  {locale === 'ar' ? stage.step.label_ar : stage.step.label_en}
                </p>
                <p className="text-xs mt-1">
                  {t('requests.daysAtStage', { value: stage.daysAtStage })}
                  {' · '}
                  {t('requests.deadlineDays', { value: stage.slaDays })}
                  {' · '}
                  {stageDueLabel}
                </p>
              </div>
            )}

            <ol className="space-y-4">
              {request.workflow.map((step, i) => {
                const isCurrent = step.status === 'current';
                const slaDays = step.sla_days;
                return (
                  <li key={step.key} className="flex items-start gap-3">
                    <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.status === 'completed' ? 'bg-oasis-500 text-white'
                      : isCurrent ? 'bg-pair-500 text-white'
                      : 'bg-gray-100 text-[#737477]'
                    }`}>
                      {step.status === 'completed' ? '✓' : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-sm font-medium ${
                          step.status === 'pending' ? 'text-[#737477]' : 'text-[#222]'
                        }`}>
                          {locale === 'ar' ? step.label_ar : step.label_en}
                        </p>
                        {slaDays !== undefined && slaDays > 0 && step.status !== 'completed' && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-[#737477] font-medium">
                            {t('requests.deadlineDays', { value: slaDays })}
                          </span>
                        )}
                        {isCurrent && stage && stageDueLabel && (
                          <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium border ${STAGE_PILL_STYLE[stage.status]}`}>
                            {t('requests.daysAtStage', { value: stage.daysAtStage })} · {stageDueLabel}
                          </span>
                        )}
                      </div>
                      {step.completed_at && (
                        <p className="text-xs text-[#737477] mt-0.5">{fmtDate(step.completed_at)}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Attachments */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">{t('requests.attachments')}</h2>
            {request.attachments.length === 0 ? (
              <p className="text-sm text-[#737477]">{t('common.noData')}</p>
            ) : (
              <ul className="space-y-2">
                {request.attachments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-gray-50 rounded">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.name}</p>
                      <p className="text-xs text-[#737477]">
                        {a.size_kb} KB · {t('requests.uploadedBy')} {locale === 'ar' ? a.uploaded_by_ar : a.uploaded_by_en}
                      </p>
                    </div>
                    <button className="text-pair-600 hover:text-pair-700 text-xs font-medium shrink-0">
                      {t('requests.openFile')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Comments */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">{t('requests.comments')}</h2>
            <ul className="space-y-3 mb-4">
              {request.comments.map((c) => (
                <li key={c.id} className="bg-gray-50 rounded p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium">{locale === 'ar' ? c.author_ar : c.author_en}</p>
                    <span className="text-xs text-[#737477]">{fmtDate(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-[#222]">{c.body}</p>
                </li>
              ))}
              {request.comments.length === 0 && (
                <p className="text-sm text-[#737477]">{t('common.noData')}</p>
              )}
            </ul>
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('requests.commentPlaceholder')}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={postComment}
                disabled={busy === 'comment' || !comment.trim()}
                className="mt-2 px-4 py-2 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
              >
                {t('requests.postComment')}
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-[#737477] uppercase tracking-wider mb-3">
              {t('requests.assignedTo')}
            </h3>
            {request.assigned_to_en ? (
              <p className="text-sm font-medium">{locale === 'ar' ? request.assigned_to_ar : request.assigned_to_en}</p>
            ) : (
              <p className="text-sm italic text-[#737477]">{t('requests.unassigned')}</p>
            )}
            {!(user && request.assigned_to_en === user.name_en) && (
              <button
                onClick={assignToMe}
                disabled={busy === 'assign'}
                className="mt-3 w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {t('requests.assignToMe')}
              </button>
            )}
            <div className="mt-3">
              <label className="block text-xs font-medium text-[#737477] mb-1">
                {t('requests.assignToOther')}
              </label>
              <select
                value=""
                onChange={(e) => { if (e.target.value) assignToStaff(e.target.value); }}
                disabled={busy === 'assign'}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <option value="">{t('requests.selectStaff')}</option>
                {staffGroups.map(([dept, members]) => (
                  <optgroup key={dept} label={dept}>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {locale === 'ar' ? m.name_ar : m.name_en}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-[#737477] uppercase tracking-wider mb-3">
              {t('requests.paymentStatus')}
            </h3>
            <p className="text-sm font-medium">
              {request.payment_status === 'paid' ? t('requests.paymentPaid')
                : request.payment_status === 'pending' ? t('requests.paymentPending')
                : t('requests.paymentNotRequired')}
            </p>
          </section>

          {request.withdrawal_study_week != null && (() => {
            const week = request.withdrawal_study_week;
            const rate = withdrawalFineRate(week);
            return (
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-[#737477] uppercase tracking-wider mb-3">
                  {t('requests.withdrawalFine')}
                </h3>
                <p className="text-sm text-[#737477]">
                  {t('requests.filedInWeek')}: <span className="font-medium text-[#222222]">{week}</span>
                </p>
                <p className={`text-2xl font-bold mt-1 ${rate > 0 ? 'text-danger-600' : 'text-oasis-600'}`}>
                  {Math.round(rate * 100)}%
                </p>
                <p className="text-xs text-[#737477] mt-1">
                  {rate > 0 ? t('requests.fineOfTuition') : t('requests.noFine')}
                </p>
                {request.withdrawal_tuition_kwd != null && rate > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-[#737477]">
                      {t('requests.termTuition')}:{' '}
                      <span className="font-medium text-[#222222]">
                        {request.withdrawal_tuition_kwd.toLocaleString()} KWD
                      </span>
                    </p>
                    <p className="text-xs text-[#737477] mt-1">{t('requests.fineAmount')}</p>
                    <p className="text-xl font-bold text-danger-600">
                      {calcWithdrawalFine(request.withdrawal_tuition_kwd, week).toLocaleString()} KWD
                    </p>
                  </div>
                )}
              </section>
            );
          })()}

          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-2">
            <h3 className="text-sm font-semibold text-[#737477] uppercase tracking-wider mb-2">
              {t('common.actions')}
            </h3>
            {(request.status === 'submitted' || request.status === 'in_progress') && (
              <button
                onClick={() => setStatus('completed')}
                disabled={busy !== null}
                className="w-full px-3 py-2 bg-oasis-500 text-white rounded-lg text-sm font-medium hover:bg-oasis-600 disabled:opacity-50"
              >
                {t('requests.markCompleted')}
              </button>
            )}
            <button
              onClick={notifyStudent}
              disabled={busy !== null}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {t('requests.notifyStudent')}
            </button>
            {(request.status === 'submitted' || request.status === 'in_progress') && (
              <button
                onClick={() => setRejectOpen(true)}
                disabled={busy !== null}
                className="w-full px-3 py-2 bg-danger-500 text-white rounded-lg text-sm font-medium hover:bg-danger-600 disabled:opacity-50"
              >
                {t('requests.rejectRequest')}
              </button>
            )}
            {request.status !== 'completed' && request.status !== 'cancelled' && request.status !== 'rejected' && (
              <button
                onClick={() => setCancelOpen(true)}
                disabled={busy !== null}
                className="w-full px-3 py-2 border border-danger-200 text-danger-700 rounded-lg text-sm hover:bg-danger-50 disabled:opacity-50"
              >
                {t('requests.cancelRequest')}
              </button>
            )}
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        title={t('confirm.cancelRequest.title')}
        message={t('confirm.cancelRequest.message')}
        confirmLabel={t('confirm.cancelRequest.confirm')}
        cancelLabel={t('confirm.cancelRequest.keep')}
        variant="danger"
        onConfirm={() => { setCancelOpen(false); setStatus('cancelled'); }}
        onCancel={() => setCancelOpen(false)}
      />

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" dir={dir}>
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-1">{t('requests.rejectRequest')}</h3>
            <p className="text-sm text-[#737477] mb-3">{t('requests.rejectHint')}</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder={t('requests.rejectReasonPlaceholder')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setRejectOpen(false); setRejectReason(''); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={rejectRequest}
                disabled={!rejectReason.trim() || busy === 'reject'}
                className="px-4 py-2 bg-danger-500 text-white rounded-lg text-sm font-medium hover:bg-danger-600 disabled:opacity-50"
              >
                {t('requests.confirmReject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
