'use client';

import { useI18n } from '@/lib/i18n';
import type { AdmissionApplicant } from '@/lib/api';

/** Renders the printable Acceptance Letter (Offer Letters template) for an
 *  admitted applicant. The letter body has three variants matching the source
 *  document: placement-test Foundation entry, direct entry to a Diploma year,
 *  and the 2+2 Bachelor track. The letter itself is the official English text;
 *  surrounding controls follow the active locale. */
export default function AcceptanceLetterModal({
  applicant,
  onClose,
}: {
  applicant: AdmissionApplicant;
  onClose: () => void;
}) {
  const { t, dir } = useI18n();

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const body = (() => {
    switch (applicant.letter_variant) {
      case 'foundation':
        return `Based on your results in the Placement Test, we are pleased to inform you that you have been accepted direct entry in the Foundation 1 level, prior to commencing your study in the ${applicant.program_label}.`;
      case 'two_plus_two':
        return `We are pleased to inform you that you have been accepted in the ${applicant.program_label}.`;
      case 'direct_entry':
      default:
        return `Based on your results in the Placement Test, we are pleased to inform you that you have been accepted direct entry in the ${applicant.entry_level} in the ${applicant.program_label}.`;
    }
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto print:bg-white print:p-0"
      dir={dir}
      onClick={onClose}
    >
      <div
        className="cck-card w-full max-w-2xl my-8 print:my-0 print:max-w-none print:border-0 print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-3 border-b border-line print:hidden">
          <p className="text-sm font-semibold">{t('admissions.letterPreviewTitle')}</p>
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
        <article className="print-area px-10 py-12 text-[15px] leading-relaxed text-ink" dir="ltr">
          <p className="mb-8">Date: {today}</p>
          <h1 className="text-2xl font-bold text-center">Acceptance Letter</h1>
          <p className="text-center text-muted mt-1 mb-10">Academic Year 2025/2026</p>

          <dl className="mb-8 space-y-1">
            <div className="flex gap-2">
              <dt className="font-semibold w-32">Student Name:</dt>
              <dd>{applicant.applicant_name_en}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold w-32">Civil ID:</dt>
              <dd className="font-mono">{applicant.civil_id ?? ' - '}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold w-32">Major:</dt>
              <dd>{applicant.major}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold w-32">Semester Admitted:</dt>
              <dd>{applicant.semester_admitted}</dd>
            </div>
          </dl>

          <p className="mb-5">
            Congratulations! We are delighted to inform you that you have been granted admission to
            Canadian College of Kuwait for the {applicant.semester_admitted}.
          </p>
          <p className="mb-5">{body}</p>
          <p className="mb-10">We wish you all the best on your study in Canadian College of Kuwait.</p>

          <p>Sincerely,</p>
          <p className="font-semibold">Admissions and Registration Department</p>

          {/* Electronic stamp & signature — the doc requires the acceptance
              letter to be "stamped and signed electronically". */}
          <div className="mt-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-xl text-ink" style={{ fontFamily: 'cursive' }}>A. Al-Rashidi</p>
              <div className="w-56 border-t border-line mt-1 pt-1">
                <p className="text-xs text-muted">Head of Admissions &amp; Registration</p>
              </div>
            </div>
            <div
              className="shrink-0 -rotate-6 px-3 py-2 text-center leading-tight"
              style={{ color: 'var(--color-leaf)', border: '2px solid var(--color-leaf)' }}
            >
              <p className="text-[10px] font-bold uppercase">Canadian College of Kuwait</p>
              <p className="text-[9px] uppercase">Admissions &amp; Registration</p>
              <p className="text-[11px] font-bold uppercase mt-0.5">Electronically Verified</p>
              <p className="text-[9px] font-mono mt-0.5">{today}</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
