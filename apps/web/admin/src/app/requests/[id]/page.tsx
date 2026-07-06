'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  api, getRequestStageInfo,
  type StudentRequest, type RequestStatus, type RequestStageStatus, type AssignableStaff,
  type RejectReasonCode, type StudentContact, type RequestAttachment,
} from '@/lib/api';
import { withdrawalFineRate, calcWithdrawalFine } from '@masari/shared';
import { isRequestOnFinanceHold, isGradeChangeLate, gradeChangeCutoff, CCK_INCOMPLETE_AUTO_F } from '@/lib/cckPolicies';
import { useI18n } from '@/lib/i18n';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import { useAuth } from '@/lib/auth';
import StatusBadge, { type LifecycleStatus } from '@/components/StatusBadge';
import { CheckIcon } from '@/components/icons';

const toLifecycle = (s: RequestStatus): LifecycleStatus =>
  s === 'submitted' ? 'not_started'
  : s === 'in_progress' ? 'pending'
  : s === 'completed' ? 'completed'
  : 'rejected'; // both rejected and cancelled collapse here

const STAGE_PILL_STYLE: Record<RequestStageStatus, string> = {
  on_track: 'bg-pair-50 text-pair-700 border-pair-200',
  due_soon: 'bg-canvas text-body border-line',
  due_today: 'bg-canvas text-body border-line',
  overdue: 'bg-danger-50 text-danger-700 border-danger-200',
};

const REJECT_REASONS: RejectReasonCode[] = ['late_submission', 'invalid_document', 'other'];

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
  const { data: contact } = useQuery<StudentContact>({
    queryKey: ['student-contact', request?.student_id],
    queryFn: () => api.getStudentContact(request!.student_id) as Promise<StudentContact>,
    enabled: !!request?.student_id,
  });
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectCode, setRejectCode] = useState<RejectReasonCode | ''>('');
  const [rejectNote, setRejectNote] = useState('');
  const [previewDoc, setPreviewDoc] = useState<RequestAttachment | null>(null);

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
      if (status === 'completed') {
        // Completing a request auto-fires email + WhatsApp + push to the
        // student so staff do not need a separate "notify" action.
        await api.notifyRequestStudent(request.id);
        showToast(t('requests.completedAndNotified'));
      } else {
        showToast(t('requests.statusUpdated', {
          value: status === 'in_progress' ? t('status.pending') : status,
        }));
      }
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
      auto_assigned: false,
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

  const rejectRequest = async () => {
    if (!request || !rejectCode) return;
    const reasonLabel = t(`requests.rejectReason.${rejectCode}`);
    const fullReason = rejectNote.trim()
      ? `${reasonLabel} - ${rejectNote.trim()}`
      : reasonLabel;
    setBusy('reject');
    try {
      await api.rejectRequest(request.id, fullReason, rejectCode);
      qc.setQueryData<StudentRequest>(requestKey, {
        ...request,
        status: 'rejected',
        rejection_reason: fullReason,
        rejection_reason_code: rejectCode,
      });
      setRejectOpen(false);
      setRejectCode('');
      setRejectNote('');
      showToast(t('requests.rejectedAndNotified'));
    } finally {
      setBusy(null);
    }
  };

  // Head of Department approves an academic request → routes to the VPAA for
  // Change of Grade (the form is addressed to the VPAA Office), straight to
  // the Registration Manager for Incomplete.
  const hodApprove = async () => {
    if (!request) return;
    const nextKey = request.type === 'change_of_grade' ? 'vpaa_approval' : 'registration_entry';
    setBusy('hod');
    try {
      await api.hodDecision(request.id, 'approve');
      qc.setQueryData<StudentRequest>(requestKey, {
        ...request,
        status: 'in_progress',
        workflow: request.workflow.map((s) =>
          s.key === 'hod_approval' ? { ...s, status: 'completed', completed_at: new Date().toISOString() }
          : s.key === nextKey ? { ...s, status: 'current' }
          : s),
      });
      showToast(t(nextKey === 'vpaa_approval' ? 'requests.hodApprovedVpaa' : 'requests.hodApproved'));
    } finally {
      setBusy(null);
    }
  };

  // V.P. for Academic Affairs approves a Change of Grade → routes to the
  // Registration Manager.
  const vpaaApprove = async () => {
    if (!request) return;
    setBusy('vpaa');
    try {
      await api.vpaaDecision(request.id, 'approve');
      qc.setQueryData<StudentRequest>(requestKey, {
        ...request,
        status: 'in_progress',
        workflow: request.workflow.map((s) =>
          s.key === 'vpaa_approval' ? { ...s, status: 'completed', completed_at: new Date().toISOString() }
          : s.key === 'registration_entry' ? { ...s, status: 'current' }
          : s),
      });
      showToast(t('requests.vpaaApproved'));
    } finally {
      setBusy(null);
    }
  };

  // Registration Manager updates the grade in SIS and confirms the entry,
  // completing the request, notifying the student, and recording the form's
  // paper distribution (copies to signatories / Registration + Advising).
  const confirmSisEntry = async () => {
    if (!request) return;
    setBusy('sis');
    try {
      await api.confirmSisEntry(request.id);
      const distribution = {
        id: `c_${Date.now()}`,
        author_en: 'CCK Hub',
        author_ar: 'CCK Hub',
        body: t(request.type === 'change_of_grade'
          ? 'requests.distributionGradeChange'
          : 'requests.distributionIncomplete'),
        created_at: new Date().toISOString(),
        internal: true,
      };
      qc.setQueryData<StudentRequest>(requestKey, {
        ...request,
        status: 'completed',
        workflow: request.workflow.map((s) =>
          s.key === 'registration_entry' ? { ...s, status: 'completed', completed_at: new Date().toISOString() } : s),
        comments: [...request.comments, distribution],
      });
      await api.notifyRequestStudent(request.id);
      showToast(t('requests.sisConfirmed'));
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
  // PUC turnaround is unpredictable, so we don't track SLA against it.
  const stageIsPuc = stage?.department === 'puc';
  const stageDueLabel = stage
    ? stage.status === 'overdue'
      ? t('requests.overdueDays', { value: stage.daysOverdue })
      : stage.status === 'due_today'
        ? t('requests.dueToday')
        : t('requests.dueInDays', { value: stage.daysUntilDue })
    : null;

  const outstanding = request.outstanding_balance_kwd ?? 0;
  const paymentBlocked = request.payment_status === 'pending' && outstanding > 0;
  const financeHold = isRequestOnFinanceHold(request);

  const isAcademic = request.type === 'change_of_grade' || request.type === 'incomplete_grade';
  const currentStepKey = request.workflow.find((s) => s.status === 'current')?.key;

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
          <p className="text-xs font-mono text-muted">{request.id}</p>
          <h1 className="text-2xl font-bold mt-1">{t(`requestType.${request.type}`)}</h1>
          <p className="text-sm text-muted mt-1">
            {locale === 'ar' ? request.student_name_ar : request.student_name_en}
            {' · '}
            {request.student_id}
            {' · '}
            {fmtDate(request.submitted_at)}
          </p>
        </div>
        <StatusBadge status={toLifecycle(request.status)} size="md" />
      </div>

      {toast && (
        <div role="status" aria-live="polite" className="mb-4 bg-pair-50 border border-pair-200 rounded-sm px-4 py-2 text-sm text-pair-700">
          {toast}
        </div>
      )}

      {/* Finance hold banner for TWIMC/Transcript - feedback v3: these
          requests cannot be issued while the student owes money. */}
      {financeHold && (
        <div className="mb-4 rounded-sm border border-danger-200 bg-danger-50 px-4 py-3">
          <p className="text-sm font-semibold text-danger-700">{t('requests.financeHoldTitle')}</p>
          <p className="text-xs text-danger-700 mt-1">{t('requests.financeHoldDesc')}</p>
          <p className="text-xs font-mono text-danger-700 mt-1">
            {t('requests.financeHoldAmount', { value: outstanding.toLocaleString() })}
          </p>
        </div>
      )}

      {/* Outstanding balance banner - blocks online payment per feedback. */}
      {paymentBlocked && !financeHold && (
        <div className="mb-4 rounded-sm border border-danger-200 bg-danger-50 px-4 py-3">
          <p className="text-sm font-semibold text-danger-700">{t('requests.balanceWarningTitle')}</p>
          <p className="text-xs text-danger-700 mt-1">
            {t('requests.balanceWarningDesc', { value: outstanding.toLocaleString() })}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {request.status === 'rejected' && request.rejection_reason && (
            <section className="bg-danger-50 border border-danger-200 rounded-sm p-5">
              <h2 className="cck-section-label text-danger-700 mb-2">
                {t('requests.rejectionReason')}
              </h2>
              {request.rejection_reason_code && (
                <p className="text-xs font-semibold text-danger-700 mb-1">
                  {t(`requests.rejectReason.${request.rejection_reason_code}`)}
                </p>
              )}
              <p className="text-sm text-ink">{request.rejection_reason}</p>
              <p className="text-xs text-danger-700 mt-2">{t('requests.rejectionEmailed')}</p>
            </section>
          )}

          {/* Workflow */}
          <section className="cck-card p-6">
            <h2 className="text-lg font-semibold mb-4">{t('requests.workflow')}</h2>

            {stage && (
              <div className={`mb-4 rounded-sm border px-4 py-3 ${stageIsPuc ? 'bg-canvas text-ink border-line' : STAGE_PILL_STYLE[stage.status]}`}>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                  {t('requests.currentStage')}
                </p>
                <p className="text-sm font-medium mt-1">
                  {stage.department ? t(`dept.${stage.department}`) : (locale === 'ar' ? stage.step.label_ar : stage.step.label_en)}
                  {' · '}
                  {locale === 'ar' ? stage.step.label_ar : stage.step.label_en}
                </p>
                <p className="text-xs mt-1">
                  {stageIsPuc ? (
                    t('status.pending')
                  ) : (
                    <>
                      {t('requests.daysAtStage', { value: stage.daysAtStage })}
                      {' · '}
                      {t('requests.deadlineDays', { value: stage.slaDays })}
                      {' · '}
                      {stageDueLabel}
                    </>
                  )}
                </p>
              </div>
            )}

            <ol className="space-y-4">
              {request.workflow.map((step, i) => {
                const isCurrent = step.status === 'current';
                const slaDays = step.sla_days;
                const stepIsPuc = step.key === 'puc';
                return (
                  <li key={step.key} className="flex items-start gap-3">
                    <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.status === 'completed' ? 'bg-pair-600 text-white'
                      : isCurrent ? 'bg-pair-500 text-white'
                      : 'bg-canvas text-muted'
                    }`}>
                      {step.status === 'completed' ? <CheckIcon className="w-3.5 h-3.5" /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-sm font-medium ${
                          step.status === 'pending' ? 'text-muted' : 'text-ink'
                        }`}>
                          {locale === 'ar' ? step.label_ar : step.label_en}
                        </p>
                        {!stepIsPuc && slaDays !== undefined && slaDays > 0 && step.status !== 'completed' && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded-sm bg-canvas text-muted font-medium">
                            {t('requests.deadlineDays', { value: slaDays })}
                          </span>
                        )}
                        {isCurrent && stageIsPuc && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded-sm font-medium border bg-canvas text-ink border-line">
                            {t('status.pending')}
                          </span>
                        )}
                        {isCurrent && !stageIsPuc && stage && stageDueLabel && (
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-sm font-medium border ${STAGE_PILL_STYLE[stage.status]}`}>
                            {t('requests.daysAtStage', { value: stage.daysAtStage })} · {stageDueLabel}
                          </span>
                        )}
                      </div>
                      {step.completed_at && (
                        <p className="text-xs text-muted mt-0.5">{fmtDate(step.completed_at)}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            {request.type === 'lost_id' && (
              <p className="mt-3 text-xs text-muted">{t('requests.idIssuedEmail')}</p>
            )}
          </section>

          {/* Academic request form details (Change of Grade / Incomplete "I") */}
          {request.change_of_grade_details && (() => {
            const d = request.change_of_grade_details;
            const late = isGradeChangeLate(d, request.submitted_at);
            const cutoff = gradeChangeCutoff(d.semester, d.year).toLocaleDateString(
              locale === 'ar' ? 'ar-KW' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            return (
              <section className="cck-card p-6">
                <h2 className="text-lg font-semibold mb-4">{t('requests.formDetails')}</h2>
                {late && (
                  <div className="mb-4 rounded-sm border border-danger-200 bg-danger-50 px-4 py-3">
                    <p className="text-sm font-semibold text-danger-700">{t('requests.lateGradeChangeTitle')}</p>
                    <p className="text-xs text-danger-700 mt-1">
                      {t('requests.gradeChangeLateWarning', { value: cutoff })}
                    </p>
                  </div>
                )}
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <Detail label={t('requests.field.studentName')} value={d.student_name} />
                  <Detail label={t('requests.field.cckId')} value={d.cck_id} mono />
                  <Detail label={t('requests.field.department')} value={d.department} />
                  <Detail label={t('requests.field.major')} value={d.major} />
                  <Detail label={t('requests.field.semester')} value={`${t(`requests.semester.${d.semester}`)} 20${d.year}`} />
                  <Detail label={t('requests.field.courseCode')} value={`${d.course_code} · ${t('requests.field.section')} ${d.section}`} />
                  <Detail label={t('requests.field.courseTitle')} value={d.course_title} />
                  <Detail label={t('requests.field.originalGrade')} value={d.original_grade} />
                  <Detail label={t('requests.field.newGrade')} value={d.new_grade} />
                  <Detail
                    label={t('requests.field.justification')}
                    value={d.justification === 'other' && d.justification_other
                      ? `${t('requests.justification.other')}: ${d.justification_other}`
                      : t(`requests.justification.${d.justification}`)}
                  />
                  <Detail label={t('requests.field.instructorName')} value={d.instructor_name} />
                </dl>
              </section>
            );
          })()}

          {request.incomplete_grade_details && (() => {
            const d = request.incomplete_grade_details;
            return (
              <section className="cck-card p-6">
                <h2 className="text-lg font-semibold mb-4">{t('requests.formDetails')}</h2>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <Detail label={t('requests.field.studentName')} value={d.student_name} />
                  <Detail label={t('requests.field.cckId')} value={d.cck_id} mono />
                  <Detail label={t('requests.field.program')} value={t(`requests.program.${d.program}`)} />
                  <Detail label={t('requests.field.major')} value={d.major} />
                  <Detail label={t('requests.field.telephone')} value={d.telephone} />
                  <Detail label={t('requests.field.semester')} value={`${t(`requests.semester.${d.semester}`)} 20${d.year}`} />
                  <Detail label={t('requests.field.courseCode')} value={`${d.course_code} · ${t('requests.field.section')} ${d.section}`} />
                  <Detail label={t('requests.field.courseTitle')} value={d.course_title} />
                  <Detail label={t('requests.field.instructorName')} value={d.instructor_name} />
                  <div>
                    <dt className="text-muted">{t('requests.field.instructorDecision')}</dt>
                    <dd className="mt-1">
                      <span className={d.instructor_decision === 'approved' ? 'cck-chip-positive' : 'cck-chip-negative'}>
                        {t(`requests.decision.${d.instructor_decision}`)}
                      </span>
                    </dd>
                  </div>
                  {d.instructor_decision === 'denied' ? (
                    <Detail label={t('requests.field.deniedGrade')} value={d.denied_grade_assigned ?? ''} />
                  ) : (
                    <>
                      <Detail label={t('requests.field.completionDeadline')} value={d.completion_deadline} />
                      <div className="col-span-2">
                        <dt className="text-muted">{t('requests.field.requiredAssignments')}</dt>
                        <dd className="font-medium mt-0.5">
                          {d.required_assignments.map((a) => t(`requests.assignment.${a}`)).join(' · ') || '-'}
                        </dd>
                      </div>
                    </>
                  )}
                  <div className="col-span-2">
                    <dt className="text-muted">{t('requests.field.justification')}</dt>
                    <dd className="font-medium mt-0.5">{d.justification}</dd>
                  </div>
                </dl>
                {d.instructor_decision === 'approved' && (
                  <div className="mt-4 rounded-sm border border-line bg-canvas px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t('requests.autoFTitle')}</p>
                    <p className="text-xs text-body mt-1">{locale === 'ar' ? CCK_INCOMPLETE_AUTO_F.ar : CCK_INCOMPLETE_AUTO_F.en}</p>
                  </div>
                )}
              </section>
            );
          })()}

          {/* Attachments */}
          <section className="cck-card p-6">
            <h2 className="text-lg font-semibold mb-4">{t('requests.attachments')}</h2>
            {request.attachments.length === 0 ? (
              <p className="text-sm text-muted">{t('common.noData')}</p>
            ) : (
              <ul className="space-y-2">
                {request.attachments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-canvas rounded-sm">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(a)}
                      className="min-w-0 flex-1 text-start group"
                    >
                      <p className="text-sm font-medium truncate group-hover:text-pair-600">{a.name}</p>
                      <p className="text-xs text-muted">
                        {a.size_kb} KB · {t('requests.uploadedBy')} {locale === 'ar' ? a.uploaded_by_ar : a.uploaded_by_en}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(a)}
                      className="text-pair-600 hover:text-pair-700 text-xs font-medium shrink-0"
                    >
                      {t('requests.previewAttachment')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Comments */}
          <section className="cck-card p-6">
            <h2 className="text-lg font-semibold mb-4">{t('requests.comments')}</h2>
            <ul className="space-y-3 mb-4">
              {request.comments.map((c) => (
                <li key={c.id} className="bg-canvas rounded-sm p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium">{locale === 'ar' ? c.author_ar : c.author_en}</p>
                    <span className="text-xs text-muted">{fmtDate(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-ink">{c.body}</p>
                </li>
              ))}
              {request.comments.length === 0 && (
                <p className="text-sm text-muted">{t('common.noData')}</p>
              )}
            </ul>
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('requests.commentPlaceholder')}
                rows={3}
                className="cck-input"
              />
              <button
                onClick={postComment}
                disabled={busy === 'comment' || !comment.trim()}
                className="mt-2 px-4 py-2 bg-pair-600 text-white rounded-sm text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
              >
                {t('requests.postComment')}
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <section className="cck-card p-6">
            <h3 className="cck-section-label text-muted mb-3">
              {t('requests.assignedTo')}
            </h3>
            {request.assigned_to_en ? (
              <p className="text-sm font-medium">{locale === 'ar' ? request.assigned_to_ar : request.assigned_to_en}</p>
            ) : (
              <p className="text-sm italic text-muted">{t('requests.unassigned')}</p>
            )}
            {request.auto_assigned && request.assigned_to_en && (
              <p className="text-xs text-muted mt-2">
                {t('requests.autoAssignNote', { value: locale === 'ar' ? request.assigned_to_ar! : request.assigned_to_en })}
              </p>
            )}
            {!(user && request.assigned_to_en === user.name_en) && (
              <button
                onClick={assignToMe}
                disabled={busy === 'assign'}
                className="mt-3 w-full px-3 py-1.5 border border-line-strong rounded-sm text-sm hover:bg-canvas disabled:opacity-50"
              >
                {t('requests.assignToMe')}
              </button>
            )}
            <div className="mt-3">
              <label className="block text-xs font-medium text-muted mb-1">
                {t('requests.assignToOther')}
              </label>
              <select
                value=""
                onChange={(e) => { if (e.target.value) assignToStaff(e.target.value); }}
                disabled={busy === 'assign'}
                className="w-full px-3 py-1.5 border border-line-strong rounded-sm text-sm bg-white hover:bg-canvas disabled:opacity-50"
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

          {/* Student contact panel - feedback: phone, emergency, address. */}
          <section className="cck-card p-6">
            <h3 className="cck-section-label text-muted mb-3">
              {t('requests.contactsTitle')}
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t('requests.contactPhone')}</dt>
                <dd className="font-medium text-end" dir="ltr">
                  {contact?.phone ?? <span className="italic text-muted">{t('requests.contactMissing')}</span>}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t('requests.contactEmergency')}</dt>
                <dd className="font-medium text-end" dir="ltr">
                  {contact?.emergency_phone ?? <span className="italic text-muted">{t('requests.contactMissing')}</span>}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t('requests.contactEmail')}</dt>
                <dd className="font-medium text-end break-all" dir="ltr">
                  {contact?.email ?? <span className="italic text-muted">{t('requests.contactMissing')}</span>}
                </dd>
              </div>
              <div className="pt-2 border-t border-line">
                <dt className="text-muted text-xs uppercase tracking-wide mb-1">{t('requests.contactAddress')}</dt>
                <dd className="text-sm">
                  {(locale === 'ar' ? contact?.address_ar : contact?.address_en)
                    ?? <span className="italic text-muted">{t('requests.contactMissing')}</span>}
                </dd>
              </div>
            </dl>
          </section>

          <section className="cck-card p-6">
            <h3 className="cck-section-label text-muted mb-3">
              {t('requests.paymentStatus')}
            </h3>
            <p className="text-sm font-medium">
              {request.payment_status === 'paid' ? t('requests.paymentPaid')
                : request.payment_status === 'pending' ? t('requests.paymentPending')
                : t('requests.paymentNotRequired')}
            </p>
            {request.payment_status === 'pending' && (
              <button
                type="button"
                disabled={paymentBlocked}
                className="mt-3 w-full px-3 py-2 bg-pair-600 text-white rounded-sm text-sm font-medium hover:bg-pair-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title={paymentBlocked ? t('requests.payOnlineBlocked') : undefined}
              >
                {paymentBlocked ? t('requests.payOnlineBlocked') : t('requests.payOnline')}
              </button>
            )}
            {request.payment_status === 'paid' && outstanding === 0 && (
              <p className="text-xs text-pair-700 mt-2">{t('requests.balanceCleared')}</p>
            )}
          </section>

          {request.withdrawal_study_week != null && (() => {
            const week = request.withdrawal_study_week;
            const rate = withdrawalFineRate(week);
            return (
              <section className="cck-card p-6">
                <h3 className="cck-section-label text-muted mb-3">
                  {t('requests.withdrawalFine')}
                </h3>
                <p className="text-sm text-muted">
                  {t('requests.filedInWeek')}: <span className="font-medium text-ink">{week}</span>
                </p>
                <p className={`text-2xl font-bold mt-1 ${rate > 0 ? 'text-danger-600' : 'text-ink'}`}>
                  {Math.round(rate * 100)}%
                </p>
                <p className="text-xs text-muted mt-1">
                  {rate > 0 ? t('requests.fineOfTuition') : t('requests.noFine')}
                </p>
                {request.withdrawal_tuition_kwd != null && rate > 0 && (
                  <div className="mt-3 pt-3 border-t border-line">
                    <p className="text-xs text-muted">
                      {t('requests.termTuition')}:{' '}
                      <span className="font-medium text-ink">
                        {request.withdrawal_tuition_kwd.toLocaleString()} KWD
                      </span>
                    </p>
                    <p className="text-xs text-muted mt-1">{t('requests.fineAmount')}</p>
                    <p className="text-xl font-bold text-danger-600">
                      {calcWithdrawalFine(request.withdrawal_tuition_kwd, week).toLocaleString()} KWD
                    </p>
                  </div>
                )}
              </section>
            );
          })()}

          <section className="cck-card p-6 space-y-2">
            <h3 className="cck-section-label text-muted mb-2">
              {t('common.actions')}
            </h3>
            {isAcademic ? (
              (request.status === 'submitted' || request.status === 'in_progress') ? (
                currentStepKey === 'hod_approval' ? (
                  <>
                    <p className="text-xs text-muted mb-1">{t('requests.hodPrompt')}</p>
                    <button
                      onClick={hodApprove}
                      disabled={busy !== null}
                      className="w-full px-3 py-2 bg-pair-600 text-white rounded-sm text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
                    >
                      {t('requests.hodApprove')}
                    </button>
                    <button
                      onClick={() => setRejectOpen(true)}
                      disabled={busy !== null}
                      className="w-full px-3 py-2 bg-danger-500 text-white rounded-sm text-sm font-medium hover:bg-danger-600 disabled:opacity-50"
                    >
                      {t('requests.hodReject')}
                    </button>
                  </>
                ) : currentStepKey === 'vpaa_approval' ? (
                  <>
                    <p className="text-xs text-muted mb-1">{t('requests.vpaaPrompt')}</p>
                    <button
                      onClick={vpaaApprove}
                      disabled={busy !== null}
                      className="w-full px-3 py-2 bg-pair-600 text-white rounded-sm text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
                    >
                      {t('requests.vpaaApprove')}
                    </button>
                    <button
                      onClick={() => setRejectOpen(true)}
                      disabled={busy !== null}
                      className="w-full px-3 py-2 bg-danger-500 text-white rounded-sm text-sm font-medium hover:bg-danger-600 disabled:opacity-50"
                    >
                      {t('requests.vpaaReject')}
                    </button>
                  </>
                ) : currentStepKey === 'registration_entry' ? (
                  <>
                    <p className="text-xs text-muted mb-1">{t('requests.registrationPrompt')}</p>
                    <button
                      onClick={confirmSisEntry}
                      disabled={busy !== null}
                      className="w-full px-3 py-2 bg-pair-600 text-white rounded-sm text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
                    >
                      {t('requests.confirmSisEntry')}
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-muted">{t('requests.noActionsAvailable')}</p>
                )
              ) : (
                <p className="text-xs text-muted">{t('requests.noActionsAvailable')}</p>
              )
            ) : (request.status === 'submitted' || request.status === 'in_progress') ? (
              <>
                <button
                  onClick={() => setStatus('completed')}
                  disabled={busy !== null || financeHold}
                  title={financeHold ? t('requests.financeHoldAction') : undefined}
                  className="w-full px-3 py-2 bg-pair-600 text-white rounded-sm text-sm font-medium hover:bg-pair-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {financeHold ? t('requests.financeHoldAction') : t('requests.markCompleted')}
                </button>
                <button
                  onClick={() => setStatus('in_progress')}
                  disabled={busy !== null || request.status === 'in_progress'}
                  className="w-full px-3 py-2 border border-line-strong text-ink rounded-sm text-sm font-medium hover:bg-canvas disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('requests.markPending')}
                </button>
                <button
                  onClick={() => setRejectOpen(true)}
                  disabled={busy !== null}
                  className="w-full px-3 py-2 bg-danger-500 text-white rounded-sm text-sm font-medium hover:bg-danger-600 disabled:opacity-50"
                >
                  {t('requests.rejectRequest')}
                </button>
                <p className="text-xs text-muted pt-1">{t('requests.actionsAutoNotifyHint')}</p>
              </>
            ) : (
              <p className="text-xs text-muted">{t('requests.noActionsAvailable')}</p>
            )}
          </section>
        </aside>
      </div>

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" dir={dir}>
          <div className="cck-card w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-1">{t('requests.rejectRequest')}</h3>
            <p className="text-sm text-muted mb-3">{t('requests.rejectHint')}</p>
            <label className="block text-xs font-medium text-muted mb-1">
              {t('requests.rejectReasonLabel')}
            </label>
            <div className="space-y-1.5 mb-3">
              {REJECT_REASONS.map((code) => (
                <label key={code} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="reject-reason"
                    value={code}
                    checked={rejectCode === code}
                    onChange={() => setRejectCode(code)}
                    className="accent-pair-600"
                  />
                  <span>{t(`requests.rejectReason.${code}`)}</span>
                </label>
              ))}
            </div>
            <label className="block text-xs font-medium text-muted mb-1">
              {t('requests.rejectReasonNote')}
            </label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder={t('requests.rejectReasonPlaceholder')}
              className="cck-input"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setRejectOpen(false); setRejectCode(''); setRejectNote(''); }}
                className="px-4 py-2 border border-line-strong rounded-sm text-sm hover:bg-canvas"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={rejectRequest}
                disabled={!rejectCode || busy === 'reject'}
                className="px-4 py-2 bg-danger-500 text-white rounded-sm text-sm font-medium hover:bg-danger-600 disabled:opacity-50"
              >
                {t('requests.confirmReject')}
              </button>
            </div>
            {!rejectCode && (
              <p className="mt-2 text-xs text-danger-600">{t('requests.rejectReasonRequired')}</p>
            )}
          </div>
        </div>
      )}

      {/* Attachment preview modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir={dir} onClick={() => setPreviewDoc(null)}>
          <div
            className="cck-card w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between px-5 py-3 border-b border-line">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted">{t('requests.previewLabel')}</p>
                <p className="text-sm font-semibold truncate">{previewDoc.name}</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-sm text-muted hover:text-ink px-3 py-1"
              >
                {t('requests.previewClose')}
              </button>
            </header>
            <div className="px-5 py-6">
              <div className="bg-canvas border border-line rounded-sm h-72 flex items-center justify-center">
                <div className="text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-muted mx-auto" aria-hidden>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                  <p className="mt-3 text-sm font-medium text-ink">{previewDoc.name}</p>
                  <p className="text-xs text-muted mt-1">
                    {previewDoc.size_kb} KB · {t('requests.uploadedBy')} {locale === 'ar' ? previewDoc.uploaded_by_ar : previewDoc.uploaded_by_en}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted mt-3">{t('requests.previewNotice')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className={`font-medium mt-0.5 ${mono ? 'font-mono' : ''}`}>{value || '-'}</dd>
    </div>
  );
}
