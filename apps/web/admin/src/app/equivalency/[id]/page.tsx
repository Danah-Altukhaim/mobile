'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { SkeletonPage } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import {
  useEquivalencyRequest,
  upsertEquivalencyRequest,
  removeEquivalencyRequest,
  type EquivalencyRequestStage,
  type EquivalencyRequestRecord,
} from '../requestsStore';

const STAGES: EquivalencyRequestStage[] = ['registration', 'academic', 'vp', 'student', 'done'];
const SOURCES: EquivalencyRequestRecord['source'][] = ['paaet', 'public', 'private'];

const stageLabelKey = (s: EquivalencyRequestStage) =>
  s === 'done' ? 'eqwf.doneTitle' : `eqwf.step.${s}`;
const sourceLabelKey = (s: EquivalencyRequestRecord['source']) =>
  s === 'private' ? 'eqwf.sourcePrivate' : s === 'public' ? 'eqwf.sourcePublic' : 'eqwf.sourcePaaet';

// Editable form state - everything the tracker persists for a request, as
// strings for the numeric inputs so the fields can be cleared while typing.
interface FormState {
  applicant: string;
  phone: string;
  civilId: string;
  major: string;
  secondMajor: string;
  source: EquivalencyRequestRecord['source'];
  sourceInstitution: string;
  stage: EquivalencyRequestStage;
  courseCount: string;
  totalCredits: string;
  blocked: boolean;
}

const toForm = (r: EquivalencyRequestRecord): FormState => ({
  applicant: r.applicant,
  phone: r.phone ?? '',
  civilId: r.civilId,
  major: r.major,
  secondMajor: r.secondMajor,
  source: r.source,
  sourceInstitution: r.sourceInstitution,
  stage: r.stage,
  courseCount: String(r.courseCount),
  totalCredits: String(r.totalCredits),
  blocked: r.blocked,
});

export default function EquivalencyRequestEditPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { t, dir, isRTL } = useI18n();
  const router = useRouter();
  const { request, loading } = useEquivalencyRequest(id);

  const [form, setForm] = useState<FormState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Seed the form once the record is read from the client store. We only seed
  // when the form is still empty so external store changes don't clobber edits.
  useEffect(() => {
    if (request && form === null) setForm(toForm(request));
  }, [request, form]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const save = () => {
    if (!request || !form) return;
    upsertEquivalencyRequest({
      id: request.id,
      applicant: form.applicant.trim(),
      phone: form.phone.trim(),
      civilId: form.civilId.trim(),
      major: form.major.trim(),
      secondMajor: form.secondMajor.trim(),
      source: form.source,
      sourceInstitution: form.sourceInstitution.trim(),
      stage: form.stage,
      courseCount: Math.max(0, Math.round(Number(form.courseCount) || 0)),
      totalCredits: Math.max(0, Number(form.totalCredits) || 0),
      blocked: form.blocked,
    });
    setToast(t('eqwf.editSaved'));
    setTimeout(() => setToast(null), 3000);
  };

  const del = () => {
    if (!request) return;
    if (!window.confirm(t('eqwf.editDeleteConfirm'))) return;
    removeEquivalencyRequest(request.id);
    router.push('/equivalency?tab=tracker');
  };

  const backLink = (
    <Link
      href="/equivalency?tab=tracker"
      className="text-sm text-pair-600 hover:text-pair-700 mb-4 inline-flex items-center gap-1.5"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {isRTL ? <path d="M3 8h10M9 4l4 4-4 4" /> : <path d="M13 8H3M7 4L3 8l4 4" />}
      </svg>
      {t('eqwf.editBackToTracker')}
    </Link>
  );

  if (loading || (request && form === null)) return <SkeletonPage />;

  if (!request) {
    return (
      <div dir={dir}>
        {backLink}
        <EmptyState title={t('eqwf.editNotFound')} description={t('eqwf.editNotFoundDesc')} />
      </div>
    );
  }

  const field = 'w-full border border-line-strong rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-500';
  const label = 'block text-xs font-medium text-muted mb-1';

  return (
    <div dir={dir}>
      {backLink}

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="cck-title">{t('eqwf.editTitle')}</h1>
          <p className="text-sm text-muted mt-1">{t('eqwf.editSubtitle')}</p>
        </div>
      </div>

      {toast && (
        <div role="status" aria-live="polite" className="mb-4 bg-pair-50 border border-pair-200 rounded-sm px-4 py-2 text-sm text-pair-700">
          {toast}
        </div>
      )}

      <div className="cck-card max-w-3xl">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={label}>{t('eqwf.editApplicant')}</label>
            <input className={field} value={form!.applicant} onChange={(e) => set('applicant', e.target.value)} />
          </div>
          <div>
            <label className={label}>{t('eqwf.civilId')}</label>
            <input className={field} value={form!.civilId} onChange={(e) => set('civilId', e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className={label}>{t('eqwf.phone')}</label>
            <input className={field} value={form!.phone} onChange={(e) => set('phone', e.target.value)} dir="ltr" inputMode="tel" />
          </div>
          <div>
            <label className={label}>{t('eqwf.editStage')}</label>
            <select className={field} value={form!.stage} onChange={(e) => set('stage', e.target.value as EquivalencyRequestStage)}>
              {STAGES.map((s) => <option key={s} value={s}>{t(stageLabelKey(s))}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>{t('eqwf.editMajor')}</label>
            <input className={field} value={form!.major} onChange={(e) => set('major', e.target.value)} />
          </div>
          <div>
            <label className={label}>{t('eqwf.editSecondMajor')}</label>
            <input className={field} value={form!.secondMajor} onChange={(e) => set('secondMajor', e.target.value)} />
          </div>
          <div>
            <label className={label}>{t('eqwf.editSource')}</label>
            <select className={field} value={form!.source} onChange={(e) => set('source', e.target.value as EquivalencyRequestRecord['source'])}>
              {SOURCES.map((s) => <option key={s} value={s}>{t(sourceLabelKey(s))}</option>)}
            </select>
          </div>
          {form!.source === 'private' && (
            <div>
              <label className={label}>{t('eqwf.sourceInstitution')}</label>
              <input
                className={field}
                value={form!.sourceInstitution}
                onChange={(e) => set('sourceInstitution', e.target.value)}
                placeholder={t('eqwf.sourceInstitutionPlaceholder')}
              />
            </div>
          )}
          <div>
            <label className={label}>{t('eqwf.editCredits')}</label>
            <input type="number" min={0} step="0.5" className={field} value={form!.totalCredits} onChange={(e) => set('totalCredits', e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className={label}>{t('eqwf.editCourses')}</label>
            <input type="number" min={0} step="1" className={field} value={form!.courseCount} onChange={(e) => set('courseCount', e.target.value)} dir="ltr" />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={form!.blocked}
                onChange={(e) => set('blocked', e.target.checked)}
                className="accent-danger-600 w-4 h-4"
              />
              <span>{t('eqwf.editBlocked')}</span>
            </label>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-line flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={del}
            className="px-4 py-2 text-sm border border-danger-200 text-danger-700 rounded-sm hover:bg-danger-50"
          >
            {t('eqwf.editDelete')}
          </button>
          <button
            type="button"
            onClick={save}
            className="px-4 py-2 text-sm bg-pair-600 text-white rounded-sm font-medium hover:bg-pair-700"
          >
            {t('eqwf.editSave')}
          </button>
        </div>
      </div>
    </div>
  );
}
