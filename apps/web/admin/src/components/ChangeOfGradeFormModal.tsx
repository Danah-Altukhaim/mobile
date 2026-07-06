'use client';

import { useI18n } from '@/lib/i18n';
import type { Appeal } from '@/lib/api';

/** The signing officers on an appeal-driven Change of Grade Form. The instructor
 *  is the faculty who reviewed the appeal; the rest are the standing approvers
 *  whose signature lines the paper form carries. Mocked for the demo. */
const HOD_SIGNER = 'Dr. Faisal Al-Otaibi';
const VPAA_SIGNER = 'Dr. Nadia Al-Sabah';
const REGISTRAR_SIGNER = 'A. Al-Rashidi';

/** Course-prefix → academic department + student major, derived from the course
 *  code the way the registrar would read it off SIS. Falls back to the prefix. */
function courseArea(courseCode: string): { department: string; major: string } {
  const prefix = courseCode.trim().split(/\s+/)[0]?.toUpperCase() ?? '';
  const map: Record<string, { department: string; major: string }> = {
    BUS: { department: 'Business', major: 'BME' },
    MGT: { department: 'Business', major: 'BME' },
    ACC: { department: 'Business', major: 'ACCT' },
    ACCT: { department: 'Business', major: 'ACCT' },
    MKT: { department: 'Business', major: 'MKTG' },
    MKTG: { department: 'Business', major: 'MKTG' },
    ENG: { department: 'Engineering Technology', major: 'IMD' },
    ENGR: { department: 'Engineering Technology', major: 'IMD' },
    CS: { department: 'Information Technology', major: 'CP' },
    IT: { department: 'Information Technology', major: 'CP' },
  };
  return map[prefix] ?? { department: prefix || '—', major: '—' };
}

/** Semester + 2-digit year the course was taken, derived from the appeal date. */
function termFromDate(iso: string): { semester: 'fall' | 'spring' | 'summer'; yy: string } {
  const d = new Date(iso);
  const m = d.getMonth(); // 0-11
  const semester = m <= 4 ? 'spring' : m <= 7 ? 'summer' : 'fall';
  return { semester, yy: String(d.getFullYear()).slice(-2) };
}

/** Renders the CCK Change of Grade Form, pre-filled from the (approved) appeal
 *  and electronically signed on every signature line. Situation (3) on the form
 *  — "grade change based on the decision from the student appeal committee". */
export default function ChangeOfGradeFormModal({
  appeal,
  onClose,
}: {
  appeal: Appeal;
  onClose: () => void;
}) {
  const { t, dir } = useI18n();

  const { department, major } = courseArea(appeal.course_code);
  const term = termFromDate(appeal.submitted_at);
  const newGrade = appeal.grade_change_form?.new_grade || appeal.faculty_suggested_grade || '';
  const signedIso = appeal.grade_change_form?.generated_at || appeal.decided_at || appeal.submitted_at;
  const signedDate = new Date(signedIso).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  // The section carried on the appeal isn't captured at submission; the
  // registrar reads it off SIS. Default to the primary section for the demo.
  const section = '01';

  const Check = ({ on }: { on: boolean }) => (
    <span
      className="inline-flex items-center justify-center w-3.5 h-3.5 border border-ink text-[10px] leading-none"
      style={on ? { color: 'var(--color-leaf)' } : undefined}
      aria-hidden
    >
      {on ? '✓' : ''}
    </span>
  );

  const Signature = ({ name, role }: { name: string; role: string }) => (
    <div className="flex-1 min-w-[180px]">
      <p className="text-lg text-ink -mb-0.5" style={{ fontFamily: 'cursive' }}>{name}</p>
      <div className="border-t border-ink pt-1 flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-muted">{role}</span>
        <span className="text-[10px] font-mono text-muted whitespace-nowrap">{signedDate}</span>
      </div>
      <p className="text-[9px] mt-0.5" style={{ color: 'var(--color-leaf)' }}>Electronically signed</p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto print:bg-white print:p-0"
      dir={dir}
      onClick={onClose}
    >
      <div
        className="cck-card w-full max-w-3xl my-8 print:my-0 print:max-w-none print:border-0 print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-3 border-b border-line print:hidden">
          <p className="text-sm font-semibold">{t('appeals.gradeChangeFormTitle')}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="btn btn-primary btn-sm">
              {t('admissions.printLetter')}
            </button>
            <button onClick={onClose} className="btn btn-outline btn-sm">
              {t('admissions.previewClose')}
            </button>
          </div>
        </header>

        {/* The print-area is the only thing that renders on paper (see globals.css). */}
        <article className="print-area px-10 py-8 text-[13px] leading-relaxed text-ink" dir="ltr">
          {/* Letterhead */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src="/cck-shield.png" alt="" aria-hidden className="h-16 w-16" />
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--color-leaf)' }}>CANADIAN COLLEGE OF KUWAIT</p>
                <p className="text-xs" style={{ color: 'var(--color-pair-700, #1f6b3b)' }} dir="rtl">الكلية الكندية في الكويت</p>
              </div>
            </div>
            <p className="text-sm font-medium text-pair-700">Office of Registration</p>
          </div>

          <h1 className="text-xl font-bold text-center underline mb-4">Change of Grade Form</h1>

          <p className="italic mb-2">
            Instructors should complete and submit this form to the VPAA Office to request a change of
            grade. The form may be utilized to address three distinct grade change situations:
          </p>
          <ol className="italic list-decimal ms-6 space-y-0.5 mb-5">
            <li>Change a grade submitted in error by the instructor electronically for the most recent semester. This form will not be accepted by the Registrar&rsquo;s Office after the first week of the following full semester.</li>
            <li>Change an Incomplete Grade (I) to a final letter grade.</li>
            <li>Change a grade based on the decision from the student appeal committee, headed by the VPSA.</li>
          </ol>

          {/* Boxed form */}
          <div className="border border-ink p-5 space-y-3">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <p><span className="font-semibold">Student name:</span> {appeal.student_name_en}</p>
              <p><span className="font-semibold">CCK ID:</span> <span className="font-mono">{appeal.student_id}</span></p>
              <p><span className="font-semibold">Department name:</span> {department}</p>
              <p><span className="font-semibold">Major:</span> {major}</p>
            </div>

            <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="font-semibold">Semester/Year Course Taken:</span>
              <span className="inline-flex items-center gap-1.5"><Check on={term.semester === 'fall'} /> Fall 20{term.semester === 'fall' ? term.yy : '__'}</span>
              <span className="inline-flex items-center gap-1.5"><Check on={term.semester === 'spring'} /> Spring 20{term.semester === 'spring' ? term.yy : '__'}</span>
              <span className="inline-flex items-center gap-1.5"><Check on={term.semester === 'summer'} /> Summer 20{term.semester === 'summer' ? term.yy : '__'}</span>
            </p>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <p><span className="font-semibold">Course code and number:</span> {appeal.course_code}</p>
              <p><span className="font-semibold">Section:</span> {section}</p>
            </div>
            <p><span className="font-semibold">Course Title:</span> {appeal.course_name}</p>

            <div className="flex items-center gap-6 pt-1">
              <p><span className="font-semibold">Original Grade Assigned:</span> {appeal.current_grade}</p>
              <p className="border border-ink px-3 py-1.5">
                <span className="font-semibold">Change Grade to:</span> <span className="font-bold">{newGrade}</span>
              </p>
            </div>

            <div>
              <p className="font-semibold mb-1">Justification for grade change request:</p>
              <div className="ms-2 space-y-1">
                <p className="flex items-center gap-2"><Check on={false} /> Data Entry Error</p>
                <p className="flex items-center gap-2"><Check on={false} /> Computational Error</p>
                <p className="flex items-center gap-2"><Check on={false} /> &ldquo;Incomplete Grade&rdquo; Requirements Completed</p>
                <p className="flex items-center gap-2">
                  <Check on={true} /> Other (please specify):
                  <span className="italic">Student Appeal Committee decision &mdash; {appeal.id}</span>
                </p>
              </div>
            </div>

            {/* Signature lines - all electronically signed */}
            <div className="flex flex-wrap gap-6 pt-4">
              <Signature name={appeal.faculty_assigned_en} role="Instructor's Name / Signature" />
              <Signature name={HOD_SIGNER} role="Head of Department Name / Signature" />
            </div>
            <div className="flex flex-wrap gap-6 pt-2">
              <Signature name={VPAA_SIGNER} role="V.P. for Academic Affairs / Signature" />
              <div className="flex-1 min-w-[180px]" />
            </div>
          </div>

          {/* Registrar's office use only */}
          <div className="border border-ink border-t-0 px-5 py-4">
            <p className="cck-section-label text-muted mb-3">Registrar&rsquo;s Office Use Only</p>
            <div className="flex flex-wrap gap-6">
              <Signature name={REGISTRAR_SIGNER} role="Head of Admission & Registration Signature" />
              <div className="flex-1 min-w-[180px]" />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
