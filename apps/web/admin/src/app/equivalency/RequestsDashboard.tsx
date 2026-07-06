'use client';

import { useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import EmptyState from '@/components/EmptyState';
import { CheckIcon, CloseIcon, ClockIcon } from '@/components/icons';
import {
  useEquivalencyRequests,
  removeEquivalencyRequest,
  type EquivalencyRequestStage,
  type EquivalencyRequestRecord,
  type EquivalencyOutcome,
} from './requestsStore';

// Ordered pipeline stages, mirroring the workflow stepper. `step` is the 1-based
// position used in the stepper (Documents = 1), so the dashboard reads the same.
const STAGE_FLOW: { stage: EquivalencyRequestStage; step: number; tone: string }[] = [
  { stage: 'registration', step: 2, tone: 'bg-canvas text-body border-line-strong' },
  { stage: 'academic', step: 3, tone: 'bg-canvas text-body border-line-strong' },
  { stage: 'vp', step: 4, tone: 'bg-canvas text-body border-line-strong' },
  { stage: 'student', step: 5, tone: 'bg-canvas text-body border-line-strong' },
  { stage: 'done', step: 5, tone: 'bg-pair-50 text-pair-700 border-pair-200' },
];

// Display for a completed request, keyed by the student's final decision. The
// tone mirrors the colour of the last progress bar (green / red / neutral).
const DONE_OUTCOME: Record<
  EquivalencyOutcome,
  { Icon: typeof CheckIcon; title: string; tone: string }
> = {
  accepted: { Icon: CheckIcon, title: 'eqwf.doneTitle', tone: 'bg-pair-50 text-pair-700 border-pair-200' },
  declined: { Icon: CloseIcon, title: 'eqwf.doneDeclined', tone: 'bg-danger-50 text-danger-700 border-danger-200' },
  pending: { Icon: ClockIcon, title: 'eqwf.donePending', tone: 'bg-canvas text-body border-line-strong' },
};

// Selectable values for the column dropdown filters, in display order.
const SOURCE_OPTIONS: EquivalencyRequestRecord['source'][] = ['paaet', 'public', 'private'];
const STAGE_OPTIONS: EquivalencyRequestStage[] = ['registration', 'academic', 'vp', 'student', 'done'];

// Label for a stage in the Stage filter dropdown. The pipeline stages reuse the
// stepper labels; `done` has no stepper entry so it gets its own "completed" key.
function stageOptionLabel(stage: EquivalencyRequestStage, t: (key: string) => string): string {
  return stage === 'done' ? t('eqwf.dashStageDone') : t(`eqwf.step.${stage}`);
}

function StageBadge({ stage, outcome }: { stage: EquivalencyRequestStage; outcome?: EquivalencyOutcome }) {
  const { t } = useI18n();
  if (stage === 'done') {
    const done = DONE_OUTCOME[outcome ?? 'accepted'];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium border ${done.tone}`}>
        <done.Icon className="w-3.5 h-3.5 shrink-0" />
        {t(done.title)}
      </span>
    );
  }
  // Resolve via STAGE_FLOW so legacy/unknown stages (e.g. the old combined
  // "form" stage) fall back to registration for both the step number AND the
  // label - otherwise an unmapped stage renders its raw, untranslated key.
  const meta = STAGE_FLOW.find((s) => s.stage === stage) ?? STAGE_FLOW[0];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium border ${meta.tone}`}>
      <span className="tabular-nums" dir="ltr">{meta.step}</span>
      {t(`eqwf.step.${meta.stage}`)}
    </span>
  );
}

// Compact progress bar so reviewers can see at a glance how far each request has
// moved through the staged workflow.
function StageProgress({ stage, outcome }: { stage: EquivalencyRequestStage; outcome?: EquivalencyOutcome }) {
  const order: EquivalencyRequestStage[] = ['registration', 'academic', 'vp', 'student', 'done'];
  const idx = order.indexOf(stage);
  // Colour of the final bar once the request is done, by the student's decision:
  // accepted → green, declined → red, pending → neutral.
  const lastTone =
    outcome === 'declined' ? 'bg-danger-500' : outcome === 'pending' ? 'bg-line-strong' : 'bg-pair-600';
  return (
    <div className="flex items-center gap-1" dir="ltr">
      {order.map((s, i) => {
        const isLast = i === order.length - 1;
        return (
          <span
            key={s}
            className={`h-1.5 w-6 rounded-full ${
              i > idx
                ? 'bg-line-strong'
                : isLast && stage === 'done'
                  ? lastTone
                  : 'bg-pair-600'
            }`}
          />
        );
      })}
    </div>
  );
}

// Resolve the human-readable source label for the table.
function sourceLabel(r: EquivalencyRequestRecord, t: (key: string) => string): string {
  if (r.source === 'private') {
    return r.sourceInstitution || t('eqwf.sourcePrivate');
  }
  return t(r.source === 'public' ? 'eqwf.sourcePublic' : 'eqwf.sourcePaaet');
}

// Empty filter state - all columns unfiltered.
const EMPTY_FILTERS = {
  applicant: '',
  phone: '',
  major: '',
  source: 'all' as 'all' | EquivalencyRequestRecord['source'],
  stage: 'all' as 'all' | EquivalencyRequestStage,
};
type Filters = typeof EMPTY_FILTERS;

export default function RequestsDashboard({ onOpen }: { onOpen: (id: string) => void }) {
  const { t, dir } = useI18n();
  const requests = useEquivalencyRequests();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const hasActiveFilter =
    filters.applicant.trim() !== '' ||
    filters.phone.trim() !== '' ||
    filters.major.trim() !== '' ||
    filters.source !== 'all' ||
    filters.stage !== 'all';

  // Apply the column filters: free-text columns match case-insensitively on a
  // substring (applicant also matches Civil ID, major also matches the second
  // major), categorical columns match exactly.
  const filtered = useMemo(() => {
    const applicant = filters.applicant.trim().toLowerCase();
    const phone = filters.phone.trim().toLowerCase();
    const major = filters.major.trim().toLowerCase();
    return requests.filter((r) => {
      if (applicant && !`${r.applicant} ${r.civilId}`.toLowerCase().includes(applicant)) return false;
      if (phone && !r.phone.toLowerCase().includes(phone)) return false;
      if (major && !`${r.major} ${r.secondMajor}`.toLowerCase().includes(major)) return false;
      if (filters.source !== 'all' && r.source !== filters.source) return false;
      if (filters.stage !== 'all' && r.stage !== filters.stage) return false;
      return true;
    });
  }, [requests, filters]);

  const setField = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const textFilterClass =
    'mt-1 w-full px-2 py-1 rounded-sm border border-line-strong text-xs font-normal text-ink placeholder:text-muted';
  const selectFilterClass =
    'mt-1 w-full px-2 py-1 rounded-sm border border-line-strong text-xs font-normal text-ink bg-white';

  return (
    <div dir={dir}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm text-muted">{t('eqwf.dashDesc')}</p>
        <span className="text-xs text-muted">
          {hasActiveFilter
            ? `${filtered.length} ${t('eqwf.dashShowing')} ${requests.length} ${t('eqwf.dashCount')}`
            : `${requests.length} ${t('eqwf.dashCount')}`}
        </span>
      </div>

      {requests.length === 0 ? (
        <EmptyState title={t('eqwf.dashEmpty')} description={t('eqwf.dashEmptyDesc')} />
      ) : (
        <div className="cck-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted border-b align-top">
                <th className="px-4 py-3 text-start font-medium">
                  {t('eqwf.dashApplicant')}
                  <input
                    value={filters.applicant}
                    onChange={(e) => setField('applicant', e.target.value)}
                    placeholder={t('eqwf.dashFilter')}
                    aria-label={`${t('eqwf.dashApplicant')} - ${t('eqwf.dashFilter')}`}
                    className={textFilterClass}
                  />
                </th>
                <th className="px-4 py-3 text-start font-medium">
                  {t('eqwf.dashPhone')}
                  <input
                    value={filters.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder={t('eqwf.dashFilter')}
                    aria-label={`${t('eqwf.dashPhone')} - ${t('eqwf.dashFilter')}`}
                    dir="ltr"
                    className={textFilterClass}
                  />
                </th>
                <th className="px-4 py-3 text-start font-medium">
                  {t('eqwf.dashMajor')}
                  <input
                    value={filters.major}
                    onChange={(e) => setField('major', e.target.value)}
                    placeholder={t('eqwf.dashFilter')}
                    aria-label={`${t('eqwf.dashMajor')} - ${t('eqwf.dashFilter')}`}
                    className={textFilterClass}
                  />
                </th>
                <th className="px-4 py-3 text-start font-medium">
                  {t('eqwf.dashSource')}
                  <select
                    value={filters.source}
                    onChange={(e) => setField('source', e.target.value as Filters['source'])}
                    aria-label={`${t('eqwf.dashSource')} - ${t('eqwf.dashFilter')}`}
                    className={selectFilterClass}
                  >
                    <option value="all">{t('eqwf.dashFilterAll')}</option>
                    {SOURCE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {t(s === 'paaet' ? 'eqwf.sourcePaaet' : s === 'public' ? 'eqwf.sourcePublic' : 'eqwf.sourcePrivate')}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-4 py-3 text-start font-medium">{t('eqwf.dashCredits')}</th>
                <th className="px-4 py-3 text-start font-medium">
                  {t('eqwf.dashStage')}
                  <select
                    value={filters.stage}
                    onChange={(e) => setField('stage', e.target.value as Filters['stage'])}
                    aria-label={`${t('eqwf.dashStage')} - ${t('eqwf.dashFilter')}`}
                    className={selectFilterClass}
                  >
                    <option value="all">{t('eqwf.dashFilterAll')}</option>
                    {STAGE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {stageOptionLabel(s, t)}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-4 py-3 text-start font-medium">{t('eqwf.dashProgress')}</th>
                <th className="px-4 py-3 text-end font-medium align-top">
                  {t('equivalency.actions')}
                  {hasActiveFilter && (
                    <button
                      type="button"
                      onClick={() => setFilters(EMPTY_FILTERS)}
                      className="mt-1 block w-full px-2 py-1 rounded-sm border border-line-strong text-xs font-normal text-pair-700 hover:bg-canvas"
                    >
                      {t('eqwf.dashFilterClear')}
                    </button>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                    {t('eqwf.dashFilterNone')}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                <tr
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpen(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpen(r.id);
                    }
                  }}
                  aria-label={`${r.applicant || t('eqwf.unnamedApplicant')} - ${t('eqwf.editTitle')}`}
                  className="border-b border-line last:border-0 align-top cursor-pointer hover:bg-canvas focus:outline-none focus:bg-canvas"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.applicant || t('eqwf.unnamedApplicant')}</p>
                    {r.civilId && (
                      <p className="text-xs text-muted" dir="ltr">{r.civilId}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.phone ? <span dir="ltr">{r.phone}</span> : <span>-</span>}
                  </td>
                  <td className="px-4 py-3">
                    <p>{r.major || <span className="text-muted">-</span>}</p>
                    {r.secondMajor && (
                      <p className="text-xs text-muted">+ {r.secondMajor}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{sourceLabel(r, t)}</td>
                  <td className="px-4 py-3 text-muted" dir="ltr">
                    {r.totalCredits} {t('eqwf.creditUnit')}
                    <span className="text-xs"> · {r.courseCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <StageBadge stage={r.stage} outcome={r.outcome} />
                      {r.blocked && r.stage !== 'done' && (
                        <span className="inline-flex w-fit items-center px-1.5 py-0.5 rounded-sm text-[10px] font-medium bg-danger-50 text-danger-700">
                          {t('eqwf.dashBlocked')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StageProgress stage={r.stage} outcome={r.outcome} />
                  </td>
                  <td className="px-4 py-3 text-end whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEquivalencyRequest(r.id);
                      }}
                      className="px-2.5 py-1 rounded-sm border border-line-strong text-xs font-medium text-danger-700 hover:bg-danger-50"
                    >
                      {t('eqwf.dashRemove')}
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
