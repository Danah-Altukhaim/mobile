'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  api, APPEAL_GRADE_SCALE,
  type Appeal, type AppealStage, type AppealDecision, type AppealMarkItem,
} from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import StatusBadge, { type LifecycleStatus } from '@/components/StatusBadge';
import AppealOutcomeEmailModal, { appealEmailRecipients } from '@/components/AppealOutcomeEmailModal';
import ChangeOfGradeFormModal from '@/components/ChangeOfGradeFormModal';
import { CheckIcon } from '@/components/icons';

const STAGE_ORDER: AppealStage[] = ['submitted', 'faculty_review', 'committee', 'decided'];

const stageToLifecycle = (s: AppealStage): LifecycleStatus =>
  s === 'submitted' ? 'not_started'
  : s === 'decided' ? 'completed'
  : 'pending';

const decisionToLifecycle = (d: AppealDecision): LifecycleStatus =>
  d === 'approved' ? 'completed' : d === 'rejected' ? 'rejected' : 'pending';

const sumWeight = (items: AppealMarkItem[]) =>
  items.reduce((acc, it) => acc + (Number.isFinite(it.weight) ? it.weight : 0), 0);

/** Weighted final = Σ(score × weight) / Σ(weight), rounded to 1 decimal. */
const weightedFinal = (items: AppealMarkItem[]) => {
  const total = sumWeight(items);
  if (total <= 0) return 0;
  const earned = items.reduce((acc, it) => acc + it.score * it.weight, 0);
  return Math.round((earned / total) * 10) / 10;
};

const clampPct = (v: number) => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));

/** What-if sandbox: seeded from the current marks, lets the instructor nudge any
 *  score and see the resulting weighted final. Advisory only; nothing is saved. */
function GradeSimulator({ baseItems, t }: { baseItems: AppealMarkItem[]; t: (key: string) => string }) {
  const [original, setOriginal] = useState<AppealMarkItem[]>(baseItems);
  const [sim, setSim] = useState<AppealMarkItem[]>(baseItems);

  // Auto-seed the first time marks appear; afterwards re-sync is manual so an
  // in-progress what-if is never clobbered by edits to the table above.
  useEffect(() => {
    if (baseItems.length && sim.length === 0) {
      setOriginal(baseItems);
      setSim(baseItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseItems]);

  const loadCurrent = () => {
    setOriginal(baseItems);
    setSim(baseItems);
  };
  const setScore = (itemId: string, score: number) =>
    setSim((prev) => prev.map((it) => (it.id === itemId ? { ...it, score: clampPct(score) } : it)));

  const baseFinal = weightedFinal(original);
  const simFinal = weightedFinal(sim);
  const delta = Math.round((simFinal - baseFinal) * 10) / 10;
  const dirty = sim.some((it) => {
    const o = original.find((x) => x.id === it.id);
    return o ? o.score !== it.score : false;
  });

  return (
    <div className="mt-4 border border-line rounded-sm bg-canvas p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-ink uppercase tracking-wide">{t('appeals.simulator')}</p>
          <p className="text-xs text-muted mt-0.5">{t('appeals.simulatorHint')}</p>
        </div>
        <button type="button" onClick={loadCurrent} className="btn btn-outline btn-sm shrink-0">
          {t('appeals.simulatorLoad')}
        </button>
      </div>

      {sim.length === 0 ? (
        <p className="text-sm text-muted mt-3">{t('appeals.simulatorEmpty')}</p>
      ) : (
        <>
          <div className="space-y-2 mt-3">
            {sim.map((it) => {
              const o = original.find((x) => x.id === it.id);
              const d = o ? Math.round((it.score - o.score) * 10) / 10 : 0;
              return (
                <div key={it.id} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-ink truncate">
                    {it.label || t('appeals.marks.item')}
                    <span className="text-muted"> · {t('appeals.marks.weight')} {it.weight}%</span>
                  </span>
                  {d !== 0 && (
                    <span className={`text-xs tabular-nums ${d > 0 ? 'text-pair-600' : 'text-danger-600'}`}>
                      {d > 0 ? '+' : ''}{d}
                    </span>
                  )}
                  <div className="relative w-24">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={it.score}
                      onChange={(e) => setScore(it.id, Number(e.target.value))}
                      className="cck-input pe-7"
                    />
                    <span className="pointer-events-none absolute inset-y-0 end-2 flex items-center text-xs text-muted">%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-line">
            <span className="text-sm text-muted">{t('appeals.projectedFinal')}</span>
            <span className="flex items-baseline gap-2">
              <span className="text-xl font-bold tabular-nums">{simFinal}%</span>
              {dirty && (
                <span className={`text-xs font-medium tabular-nums ${delta > 0 ? 'text-pair-600' : delta < 0 ? 'text-danger-600' : 'text-muted'}`}>
                  {delta > 0 ? '+' : ''}{delta} {t('appeals.simulatorFrom')} {baseFinal}%
                </span>
              )}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default function AppealDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { t, locale, dir, isRTL } = useI18n();
  const qc = useQueryClient();
  const appealKey = ['appeals', id] as const;

  const { data: appeal, isError, refetch } = useQuery<Appeal>({
    queryKey: appealKey,
    queryFn: async () => {
      const d = await api.getAppeal(id);
      if (!d) throw new Error('not_found');
      return d as Appeal;
    },
  });

  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [markItems, setMarkItems] = useState<AppealMarkItem[]>([]);
  const [facultyComment, setFacultyComment] = useState('');
  const [suggestedGrade, setSuggestedGrade] = useState('');
  const [committeeComment, setCommitteeComment] = useState('');
  const [committeeGrade, setCommitteeGrade] = useState('');
  const [emailOpen, setEmailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const nextItemId = useRef(0);

  const addMarkItem = () =>
    setMarkItems((prev) => [...prev, { id: `new-${nextItemId.current++}`, label: '', score: 0, weight: 0 }]);
  const updateMarkItem = (id: string, patch: Partial<AppealMarkItem>) =>
    setMarkItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeMarkItem = (id: string) =>
    setMarkItems((prev) => prev.filter((it) => it.id !== id));

  // Seed the review table from the LMS marks once per appeal.
  const seededFor = useRef<string | null>(null);
  useEffect(() => {
    if (appeal && seededFor.current !== appeal.id) {
      seededFor.current = appeal.id;
      setMarkItems(appeal.marks_breakdown?.items ?? []);
      // Pre-fill the committee's grade with the instructor's suggestion as a starting point.
      setCommitteeGrade(appeal.committee_suggested_grade ?? appeal.faculty_suggested_grade ?? '');
      setCommitteeComment(appeal.committee_comment ?? '');
    }
  }, [appeal]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const patch = (next: Partial<Appeal>) =>
    qc.setQueryData<Appeal>(appealKey, (prev) => (prev ? { ...prev, ...next } : prev));

  const sendToFaculty = async () => {
    if (!appeal) return;
    setBusy('faculty');
    try {
      await api.sendToFaculty(appeal.id);
      patch({ stage: 'faculty_review', status: 'in_progress' });
      showToast(t('appeals.sentToFaculty'));
    } finally {
      setBusy(null);
    }
  };

  const submitFacultyReview = async () => {
    if (!appeal || !facultyComment.trim()) return;
    const items = markItems.filter((it) => it.label.trim());
    const breakdown = { items };
    const grade = suggestedGrade || undefined;
    setBusy('review');
    try {
      await api.submitFacultyReview(appeal.id, {
        faculty_comment: facultyComment, marks_breakdown: breakdown, faculty_suggested_grade: grade,
      });
      patch({
        stage: 'committee', faculty_comment: facultyComment, marks_breakdown: breakdown,
        faculty_suggested_grade: grade,
      });
      showToast(t('appeals.reviewSubmitted'));
    } finally {
      setBusy(null);
    }
  };

  const recordDecision = async (decision: AppealDecision) => {
    if (!appeal) return;
    const grade = committeeGrade || undefined;
    const comment = committeeComment.trim() || undefined;
    setBusy(decision);
    try {
      const res = await api.recordAppealDecision(appeal.id, decision, {
        committee_suggested_grade: grade, committee_comment: comment,
      }) as {
        stage: AppealStage; status: Appeal['status']; decided_at?: string;
      };
      patch({
        committee_decision: decision,
        committee_suggested_grade: grade,
        committee_comment: comment,
        stage: res.stage,
        status: res.status,
        decided_at: res.decided_at,
      });
      // An approved appeal auto-generates the e-signed Change of Grade Form
      // (Change of Grade Form situation 3) carrying the approved grade to SIS.
      if (decision === 'approved') {
        const newGrade = grade ?? appeal.faculty_suggested_grade ?? '';
        const gc = await api.generateAppealGradeChange(appeal.id, newGrade) as {
          grade_change_form: NonNullable<Appeal['grade_change_form']>;
        };
        patch({ grade_change_form: gc.grade_change_form });
      }
      showToast(t('appeals.decisionRecorded'));
    } finally {
      setBusy(null);
    }
  };

  // Ensure the form exists (e.g. for an appeal approved before this feature)
  // then open it.
  const openGradeChangeForm = async () => {
    if (!appeal) return;
    if (!appeal.grade_change_form?.generated) {
      const newGrade = appeal.committee_suggested_grade ?? appeal.faculty_suggested_grade ?? '';
      const gc = await api.generateAppealGradeChange(appeal.id, newGrade) as {
        grade_change_form: NonNullable<Appeal['grade_change_form']>;
      };
      patch({ grade_change_form: gc.grade_change_form });
    }
    setFormOpen(true);
  };

  const sendEmail = async () => {
    if (!appeal) return;
    setBusy('email');
    try {
      const recipients = appealEmailRecipients(appeal);
      await api.sendAppealOutcomeEmail(appeal.id, recipients);
      patch({ outcome_email: { sent: true, sent_at: new Date().toISOString(), recipients } });
      showToast(t('appeals.emailSentToast'));
    } finally {
      setBusy(null);
    }
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;
  if (!appeal) return <SkeletonPage />;

  const currentIdx = STAGE_ORDER.indexOf(appeal.stage);
  const reviewLocked = currentIdx > STAGE_ORDER.indexOf('faculty_review');
  const savedItems = appeal.marks_breakdown?.items ?? [];
  const weightTotal = sumWeight(markItems);

  return (
    <div dir={dir}>
      <Link href="/appeals" className="text-sm text-pair-600 hover:text-pair-700 mb-4 inline-flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {isRTL ? <path d="M3 8h10M9 4l4 4-4 4" /> : <path d="M13 8H3M7 4L3 8l4 4" />}
        </svg>
        {t('common.back')}
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-mono text-muted">{appeal.id}</p>
          <h1 className="text-2xl font-bold mt-1">{appeal.course_code} · {appeal.course_name}</h1>
          <p className="text-sm text-muted mt-1">
            {locale === 'ar' ? appeal.student_name_ar : appeal.student_name_en}
            {' · '}{appeal.student_id}{' · '}{fmtDate(appeal.submitted_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={stageToLifecycle(appeal.stage)} size="md" />
          <span className="text-sm text-muted">{t(`appeals.stage.${appeal.stage}`)}</span>
        </div>
      </div>

      {toast && (
        <div role="status" aria-live="polite" className="mb-4 bg-pair-50 border border-pair-200 rounded-sm px-4 py-2 text-sm text-pair-700">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Captured SIS data + student comment */}
          <section className="cck-card p-6">
            <h2 className="text-lg font-semibold mb-4">{t('appeals.captured')}</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted">{t('requests.student')}</dt>
                <dd className="font-medium">{locale === 'ar' ? appeal.student_name_ar : appeal.student_name_en}</dd>
              </div>
              <div>
                <dt className="text-muted">{t('appeals.studentId')}</dt>
                <dd className="font-medium font-mono">{appeal.student_id}</dd>
              </div>
              <div>
                <dt className="text-muted">{t('appeals.course')}</dt>
                <dd className="font-medium">{appeal.course_code} · {appeal.course_name}</dd>
              </div>
              <div>
                <dt className="text-muted">{t('appeals.currentGrade')}</dt>
                <dd className="font-semibold">{appeal.current_grade}</dd>
              </div>
              <div>
                <dt className="text-muted">{t('appeals.cgpa')}</dt>
                <dd className="font-semibold">{appeal.cgpa.toFixed(2)}</dd>
              </div>
            </dl>
            <div className="mt-4 pt-4 border-t border-line">
              <p className="text-muted text-xs uppercase tracking-wide mb-1">{t('appeals.studentComment')}</p>
              <p className="text-sm text-ink">{appeal.student_comment}</p>
            </div>
          </section>

          {/* Faculty review */}
          <section className="cck-card p-6">
            <h2 className="text-lg font-semibold mb-1">{t('appeals.facultyReview')}</h2>
            <p className="text-sm text-muted mb-4">
              {t('appeals.assignedFaculty')}: {locale === 'ar' ? appeal.faculty_assigned_ar : appeal.faculty_assigned_en}
            </p>
            <p className="text-xs text-muted uppercase tracking-wide mb-2">{t('appeals.marksBreakdown')}</p>
            {reviewLocked ? (
              <>
                {savedItems.length > 0 ? (
                  <div className="border border-line rounded-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-canvas text-muted text-xs">
                          <th className="text-start font-medium px-3 py-2">{t('appeals.marks.item')}</th>
                          <th className="text-end font-medium px-3 py-2 w-24">{t('appeals.marks.score')}</th>
                          <th className="text-end font-medium px-3 py-2 w-24">{t('appeals.marks.weight')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {savedItems.map((it) => (
                          <tr key={it.id} className="border-t border-line">
                            <td className="px-3 py-2 text-ink">{it.label}</td>
                            <td className="px-3 py-2 text-end font-medium tabular-nums">{it.score}%</td>
                            <td className="px-3 py-2 text-end text-muted tabular-nums">{it.weight}%</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-line bg-canvas font-semibold">
                          <td className="px-3 py-2">{t('appeals.marks.weightedFinal')}</td>
                          <td className="px-3 py-2 text-end tabular-nums">{weightedFinal(savedItems)}%</td>
                          <td className="px-3 py-2 text-end text-muted tabular-nums">{sumWeight(savedItems)}%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted">{t('appeals.marks.empty')}</p>
                )}
                {appeal.faculty_suggested_grade && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-muted uppercase tracking-wide">{t('appeals.suggestedGrade')}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-pair-50 text-pair-700 text-sm font-bold">
                      {appeal.faculty_suggested_grade}
                    </span>
                  </div>
                )}
                {appeal.faculty_comment && (
                  <div className="mt-4">
                    <p className="text-xs text-muted uppercase tracking-wide mb-1">{t('appeals.facultyComment')}</p>
                    <p className="text-sm text-ink">{appeal.faculty_comment}</p>
                  </div>
                )}
              </>
            ) : appeal.stage === 'faculty_review' ? (
              <>
                {markItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <span className="flex-1 text-xs font-medium text-muted">{t('appeals.marks.item')}</span>
                      <span className="w-24 text-xs font-medium text-muted">{t('appeals.marks.score')}</span>
                      <span className="w-24 text-xs font-medium text-muted">{t('appeals.marks.weight')}</span>
                      <span className="w-8" aria-hidden />
                    </div>
                    {markItems.map((it) => (
                      <div key={it.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={it.label}
                          onChange={(e) => updateMarkItem(it.id, { label: e.target.value })}
                          placeholder={t('appeals.marks.itemPlaceholder')}
                          className="cck-input flex-1"
                        />
                        <div className="relative w-24">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={it.score}
                            onChange={(e) => updateMarkItem(it.id, { score: clampPct(Number(e.target.value)) })}
                            className="cck-input pe-7"
                          />
                          <span className="pointer-events-none absolute inset-y-0 end-2 flex items-center text-xs text-muted">%</span>
                        </div>
                        <div className="relative w-24">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={it.weight}
                            onChange={(e) => updateMarkItem(it.id, { weight: clampPct(Number(e.target.value)) })}
                            className="cck-input pe-7"
                          />
                          <span className="pointer-events-none absolute inset-y-0 end-2 flex items-center text-xs text-muted">%</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMarkItem(it.id)}
                          aria-label={t('appeals.marks.remove')}
                          title={t('appeals.marks.remove')}
                          className="w-8 h-8 shrink-0 flex items-center justify-center text-muted hover:text-danger-600 rounded-sm"
                        >
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
                            <path d="M4 4l8 8M12 4l-8 8" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 mt-3">
                  <button type="button" onClick={addMarkItem} className="btn btn-outline btn-sm">
                    + {t('appeals.marks.addLine')}
                  </button>
                  {markItems.length > 0 && (
                    <span className={`text-xs ${weightTotal === 100 ? 'text-muted' : 'text-danger-600'}`}>
                      {t('appeals.marks.weightTotal')}: {weightTotal}%
                      {weightTotal !== 100 && ` · ${t('appeals.marks.weightWarning')}`}
                    </span>
                  )}
                </div>
                <GradeSimulator baseItems={markItems} t={t} />
                <label className="block text-xs font-medium text-muted mb-1 mt-4">{t('appeals.suggestedGrade')}</label>
                <select
                  value={suggestedGrade}
                  onChange={(e) => setSuggestedGrade(e.target.value)}
                  className="cck-input w-40"
                >
                  <option value="">{t('appeals.suggestedGradePlaceholder')}</option>
                  {APPEAL_GRADE_SCALE.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <p className="text-xs text-muted mt-1">{t('appeals.suggestedGradeHint')}</p>
                <label className="block text-xs font-medium text-muted mb-1 mt-4">{t('appeals.facultyComment')}</label>
                <textarea
                  value={facultyComment}
                  onChange={(e) => setFacultyComment(e.target.value)}
                  rows={3}
                  placeholder={t('appeals.facultyCommentPlaceholder')}
                  className="cck-input"
                />
                <button
                  onClick={submitFacultyReview}
                  disabled={busy !== null || !facultyComment.trim()}
                  className="btn btn-primary mt-3"
                >
                  {t('appeals.submitReview')}
                </button>
              </>
            ) : (
              <p className="text-sm text-muted">{t('appeals.awaitingFaculty')}</p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Workflow stepper */}
          <section className="cck-card p-6">
            <h3 className="cck-section-label text-muted mb-4">{t('requests.workflow')}</h3>
            <ol className="space-y-4">
              {STAGE_ORDER.map((s, i) => {
                const done = i < currentIdx || appeal.stage === 'decided';
                const isCurrent = i === currentIdx && appeal.stage !== 'decided';
                return (
                  <li key={s} className="flex items-start gap-3">
                    <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      done ? 'bg-pair-600 text-white' : isCurrent ? 'bg-pair-500 text-white' : 'bg-canvas text-muted'
                    }`}>
                      {done ? <CheckIcon className="w-3.5 h-3.5" /> : i + 1}
                    </span>
                    <p className={`text-sm font-medium mt-1 ${!done && !isCurrent ? 'text-muted' : 'text-ink'}`}>
                      {t(`appeals.stage.${s}`)}
                    </p>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Stage actions */}
          <section className="cck-card p-6 space-y-2">
            <h3 className="cck-section-label text-muted mb-2">{t('common.actions')}</h3>

            {appeal.stage === 'submitted' && (
              <button onClick={sendToFaculty} disabled={busy !== null} className="btn btn-primary w-full">
                {t('appeals.sendToFaculty')}
              </button>
            )}

            {appeal.stage === 'committee' && (
              <>
                {appeal.faculty_suggested_grade && (
                  <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-line">
                    <span className="text-xs text-muted">{t('appeals.facultySuggestedGrade')}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-pair-50 text-pair-700 text-sm font-bold">
                      {appeal.faculty_suggested_grade}
                    </span>
                  </div>
                )}
                <label className="block text-xs font-medium text-muted mb-1">{t('appeals.committeeSuggestedGrade')}</label>
                <select
                  value={committeeGrade}
                  onChange={(e) => setCommitteeGrade(e.target.value)}
                  className="cck-input w-full"
                >
                  <option value="">{t('appeals.suggestedGradePlaceholder')}</option>
                  {APPEAL_GRADE_SCALE.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <label className="block text-xs font-medium text-muted mb-1 mt-3">{t('appeals.committeeComment')}</label>
                <textarea
                  value={committeeComment}
                  onChange={(e) => setCommitteeComment(e.target.value)}
                  rows={3}
                  placeholder={t('appeals.committeeCommentPlaceholder')}
                  className="cck-input"
                />
                <p className="text-xs text-muted mb-1 mt-3">{t('appeals.committeeDecisionPrompt')}</p>
                <button onClick={() => recordDecision('approved')} disabled={busy !== null}
                  className="btn btn-primary w-full">{t('appeals.approve')}</button>
                <button onClick={() => recordDecision('rejected')} disabled={busy !== null}
                  className="btn btn-danger w-full">{t('appeals.reject')}</button>
                <button onClick={() => recordDecision('pending')} disabled={busy !== null}
                  className="btn btn-outline w-full">{t('appeals.markPending')}</button>
              </>
            )}

            {appeal.stage === 'decided' && appeal.committee_decision && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted">{t('appeals.decision')}:</span>
                  <StatusBadge status={decisionToLifecycle(appeal.committee_decision)} />
                  <span className="text-sm font-medium">{t(`appeals.decisionValue.${appeal.committee_decision}`)}</span>
                </div>
                {appeal.committee_suggested_grade && (
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs text-muted">{t('appeals.committeeSuggestedGrade')}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-pair-50 text-pair-700 text-sm font-bold">
                      {appeal.committee_suggested_grade}
                    </span>
                  </div>
                )}
                {appeal.committee_comment && (
                  <div className="mb-3">
                    <p className="text-xs text-muted uppercase tracking-wide mb-1">{t('appeals.committeeComment')}</p>
                    <p className="text-sm text-ink">{appeal.committee_comment}</p>
                  </div>
                )}
                <button onClick={() => setEmailOpen(true)} className="btn btn-primary w-full">
                  {appeal.outcome_email?.sent ? t('appeals.viewEmail') : t('appeals.emailOutcome')}
                </button>
                {appeal.outcome_email?.sent && (
                  <p className="text-xs text-pair-700 pt-1 flex items-center gap-1.5">
                    <CheckIcon className="w-3.5 h-3.5 shrink-0" />{t('appeals.emailSent')} · {appeal.outcome_email.recipients.length} {t('appeals.recipients')}
                  </p>
                )}
                {appeal.committee_decision === 'approved' && (
                  <>
                    <button onClick={openGradeChangeForm} disabled={busy !== null} className="btn btn-outline w-full mt-1">
                      {appeal.grade_change_form?.generated ? t('appeals.viewGradeChangeForm') : t('appeals.generateGradeChangeForm')}
                    </button>
                    {appeal.grade_change_form?.generated && (
                      <p className="text-xs text-pair-700 pt-1 flex items-center gap-1.5">
                        <CheckIcon className="w-3.5 h-3.5 shrink-0" />{t('appeals.gradeChangeGenerated')}
                      </p>
                    )}
                  </>
                )}
              </>
            )}

            {(appeal.stage === 'faculty_review') && (
              <p className="text-xs text-muted">{t('appeals.awaitingFacultyAction')}</p>
            )}
          </section>
        </aside>
      </div>

      {emailOpen && (
        <AppealOutcomeEmailModal
          appeal={appeal}
          busy={busy === 'email'}
          onSend={sendEmail}
          onClose={() => setEmailOpen(false)}
        />
      )}

      {formOpen && (
        <ChangeOfGradeFormModal appeal={appeal} onClose={() => setFormOpen(false)} />
      )}
    </div>
  );
}
