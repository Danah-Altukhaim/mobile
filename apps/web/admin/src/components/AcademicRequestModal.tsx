'use client';

import { useState } from 'react';
import {
  api,
  type StudentRequest, type ChangeOfGradeDetails, type IncompleteGradeDetails,
  type GradeChangeJustification, type IncompleteAssignment, type IncompleteInstructorDecision,
} from '@/lib/api';
import { isGradeChangeLate, gradeChangeCutoff, CCK_INCOMPLETE_AUTO_F } from '@/lib/cckPolicies';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

type AcademicType = 'change_of_grade' | 'incomplete_grade';
const SEMESTERS = ['fall', 'spring', 'summer'] as const;
const JUSTIFICATIONS: GradeChangeJustification[] = [
  'data_entry_error', 'computational_error', 'incomplete_completed', 'other',
];
const ASSIGNMENTS: IncompleteAssignment[] = ['final_exam', 'project', 'midterm', 'other'];
// Majors on the Incomplete "I" form: Diploma (CP / IAWD / IMD) and Bachelor
// (BME / MKTG / ACCT) tracks, exactly as the source form lists them.
const INCOMPLETE_MAJORS = ['CP', 'IAWD', 'IMD', 'BME', 'MKTG', 'ACCT'] as const;

/** Faculty-facing form for the two academic requests (Change of Grade and
 *  Incomplete "I"), mirroring the fields of the source forms. On submit it
 *  creates the request (routed to the Head of Department) and hands the new
 *  record back to the caller for optimistic insertion. */
export default function AcademicRequestModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (req: StudentRequest) => void;
}) {
  const { t, dir, locale } = useI18n();
  const { user } = useAuth();
  const instructorDefault = user ? (locale === 'ar' ? user.name_ar : user.name_en) : '';

  const [type, setType] = useState<AcademicType>('change_of_grade');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [f, setF] = useState({
    student_name: '', cck_id: '', department: '', major: '', telephone: '',
    program: 'diploma' as 'diploma' | 'bachelor',
    semester: 'spring' as (typeof SEMESTERS)[number], year: '26',
    course_code: '', section: '', course_title: '',
    original_grade: '', new_grade: '',
    justification: 'data_entry_error' as GradeChangeJustification,
    justification_other: '',
    incomplete_justification: '',
    instructor_decision: 'approved' as IncompleteInstructorDecision,
    denied_grade_assigned: '',
    completion_deadline: '',
    required_assignments: [] as IncompleteAssignment[],
    instructor_name: instructorDefault,
  });

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((prev) => ({ ...prev, [k]: v }));

  const toggleAssignment = (a: IncompleteAssignment) =>
    setF((prev) => ({
      ...prev,
      required_assignments: prev.required_assignments.includes(a)
        ? prev.required_assignments.filter((x) => x !== a)
        : [...prev.required_assignments, a],
    }));

  const submit = async () => {
    if (!f.student_name.trim() || !f.cck_id.trim() || !f.course_code.trim() || !f.instructor_name.trim()) {
      setError(t('requests.academicValidation'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const instructor = { en: f.instructor_name, ar: f.instructor_name };
      const details: ChangeOfGradeDetails | IncompleteGradeDetails = type === 'change_of_grade'
        ? {
            student_name: f.student_name, cck_id: f.cck_id, department: f.department, major: f.major,
            semester: f.semester, year: f.year,
            course_code: f.course_code, section: f.section, course_title: f.course_title,
            original_grade: f.original_grade, new_grade: f.new_grade,
            justification: f.justification,
            ...(f.justification === 'other' ? { justification_other: f.justification_other } : {}),
            instructor_name: f.instructor_name,
          }
        : {
            student_name: f.student_name, cck_id: f.cck_id, program: f.program, major: f.major,
            telephone: f.telephone, semester: f.semester, year: f.year,
            course_code: f.course_code, section: f.section, course_title: f.course_title,
            instructor_name: f.instructor_name,
            justification: f.incomplete_justification,
            instructor_decision: f.instructor_decision,
            ...(f.instructor_decision === 'denied'
              ? { denied_grade_assigned: f.denied_grade_assigned }
              : {}),
            required_assignments: f.instructor_decision === 'denied' ? [] : f.required_assignments,
            completion_deadline: f.instructor_decision === 'denied' ? '' : f.completion_deadline,
          };
      const req = await api.createAcademicRequest(type, details, instructor) as StudentRequest;
      onCreated(req);
    } finally {
      setBusy(false);
    }
  };

  const isCog = type === 'change_of_grade';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto" dir={dir}>
      <div className="cck-card w-full max-w-2xl p-6 my-8">
        <h3 className="text-lg font-semibold mb-1">{t('requests.newAcademicRequest')}</h3>
        <p className="text-sm text-muted mb-4">{t('requests.academicRequestDesc')}</p>

        {/* Type toggle */}
        <div className="flex gap-2 mb-4">
          {(['change_of_grade', 'incomplete_grade'] as AcademicType[]).map((tp) => (
            <button
              key={tp}
              onClick={() => setType(tp)}
              className={`btn btn-sm ${type === tp ? 'btn-primary' : 'btn-outline'}`}
            >
              {t(`requestType.${tp}`)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('requests.field.studentName')}>
              <input value={f.student_name} onChange={(e) => set('student_name', e.target.value)} className="cck-input" />
            </Field>
            <Field label={t('requests.field.cckId')}>
              <input value={f.cck_id} onChange={(e) => set('cck_id', e.target.value)} className="cck-input font-mono" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {isCog ? (
              <Field label={t('requests.field.department')}>
                <input value={f.department} onChange={(e) => set('department', e.target.value)} className="cck-input" />
              </Field>
            ) : (
              <Field label={t('requests.field.program')}>
                <select value={f.program} onChange={(e) => set('program', e.target.value as 'diploma' | 'bachelor')} className="cck-input">
                  <option value="diploma">{t('requests.program.diploma')}</option>
                  <option value="bachelor">{t('requests.program.bachelor')}</option>
                </select>
              </Field>
            )}
            <Field label={t('requests.field.major')}>
              {isCog ? (
                <input value={f.major} onChange={(e) => set('major', e.target.value)} className="cck-input" />
              ) : (
                <select value={f.major} onChange={(e) => set('major', e.target.value)} className="cck-input">
                  <option value="">{t('requests.field.selectMajor')}</option>
                  {INCOMPLETE_MAJORS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              )}
            </Field>
          </div>

          {!isCog && (
            <Field label={t('requests.field.telephone')}>
              <input value={f.telephone} onChange={(e) => set('telephone', e.target.value)} className="cck-input" dir="ltr" />
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('requests.field.semester')}>
              <select value={f.semester} onChange={(e) => set('semester', e.target.value as (typeof SEMESTERS)[number])} className="cck-input">
                {SEMESTERS.map((s) => <option key={s} value={s}>{t(`requests.semester.${s}`)}</option>)}
              </select>
            </Field>
            <Field label={t('requests.field.year')}>
              <input value={f.year} onChange={(e) => set('year', e.target.value)} placeholder="26" className="cck-input" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label={t('requests.field.courseCode')}>
              <input value={f.course_code} onChange={(e) => set('course_code', e.target.value)} className="cck-input" />
            </Field>
            <Field label={t('requests.field.section')}>
              <input value={f.section} onChange={(e) => set('section', e.target.value)} className="cck-input" />
            </Field>
            <Field label={t('requests.field.courseTitle')}>
              <input value={f.course_title} onChange={(e) => set('course_title', e.target.value)} className="cck-input" />
            </Field>
          </div>

          {isCog ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('requests.field.originalGrade')}>
                  <input value={f.original_grade} onChange={(e) => set('original_grade', e.target.value)} className="cck-input" />
                </Field>
                <Field label={t('requests.field.newGrade')}>
                  <input value={f.new_grade} onChange={(e) => set('new_grade', e.target.value)} className="cck-input" />
                </Field>
              </div>
              <Field label={t('requests.field.justification')}>
                <select value={f.justification} onChange={(e) => set('justification', e.target.value as GradeChangeJustification)} className="cck-input">
                  {JUSTIFICATIONS.map((j) => <option key={j} value={j}>{t(`requests.justification.${j}`)}</option>)}
                </select>
              </Field>
              {f.justification === 'other' && (
                <Field label={t('requests.justification.other')}>
                  <input value={f.justification_other} onChange={(e) => set('justification_other', e.target.value)} className="cck-input" />
                </Field>
              )}
              {(f.justification === 'data_entry_error' || f.justification === 'computational_error') && (() => {
                const cutoff = gradeChangeCutoff(f.semester, f.year).toLocaleDateString(
                  locale === 'ar' ? 'ar-KW' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const late = isGradeChangeLate(
                  { semester: f.semester, year: f.year, justification: f.justification },
                  new Date(),
                );
                return late ? (
                  <p className="text-xs text-danger-600">{t('requests.gradeChangeLateWarning', { value: cutoff })}</p>
                ) : (
                  <p className="text-xs text-muted">{t('requests.gradeChangeDeadlineHint', { value: cutoff })}</p>
                );
              })()}
            </>
          ) : (
            <>
              <Field label={t('requests.field.justification')}>
                <textarea value={f.incomplete_justification} onChange={(e) => set('incomplete_justification', e.target.value)} rows={2} className="cck-input" />
              </Field>
              <Field label={t('requests.field.instructorDecision')}>
                <div className="space-y-1.5">
                  {(['approved', 'denied'] as IncompleteInstructorDecision[]).map((d) => (
                    <label key={d} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="instructor-decision"
                        checked={f.instructor_decision === d}
                        onChange={() => set('instructor_decision', d)}
                        className="accent-pair-600"
                      />
                      {t(`requests.decision.${d}`)}
                    </label>
                  ))}
                </div>
              </Field>
              {f.instructor_decision === 'denied' ? (
                <Field label={t('requests.field.deniedGrade')}>
                  <input value={f.denied_grade_assigned} onChange={(e) => set('denied_grade_assigned', e.target.value)} className="cck-input" />
                </Field>
              ) : (
                <>
                  <Field label={t('requests.field.requiredAssignments')}>
                    <div className="flex flex-wrap gap-3">
                      {ASSIGNMENTS.map((a) => (
                        <label key={a} className="flex items-center gap-1.5 text-sm cursor-pointer">
                          <input type="checkbox" checked={f.required_assignments.includes(a)} onChange={() => toggleAssignment(a)} className="accent-pair-600" />
                          {t(`requests.assignment.${a}`)}
                        </label>
                      ))}
                    </div>
                  </Field>
                  <Field label={t('requests.field.completionDeadline')}>
                    <input type="date" value={f.completion_deadline} onChange={(e) => set('completion_deadline', e.target.value)} className="cck-input" />
                  </Field>
                  <p className="text-xs text-muted">{locale === 'ar' ? CCK_INCOMPLETE_AUTO_F.ar : CCK_INCOMPLETE_AUTO_F.en}</p>
                </>
              )}
            </>
          )}

          <Field label={t('requests.field.instructorName')}>
            <input value={f.instructor_name} onChange={(e) => set('instructor_name', e.target.value)} className="cck-input" />
          </Field>
        </div>

        {error && <p className="text-xs text-danger-600 mt-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="btn btn-outline">{t('common.cancel')}</button>
          <button onClick={submit} disabled={busy} className="btn btn-primary">{t('requests.submitAcademicRequest')}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      {children}
    </div>
  );
}
