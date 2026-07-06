'use client';

import { useI18n } from '@/lib/i18n';
import type { Appeal } from '@/lib/api';
import { CheckIcon } from '@/components/icons';

const ADVISING_EMAIL = 'studentadvising@cck.edu.kw';

/** Recipients of the appeal outcome email: student, course instructor and the
 *  student-advising office (CCK Hub Update 17-06-26). */
export function appealEmailRecipients(appeal: Appeal): string[] {
  return [
    appeal.student_email,
    appeal.faculty_email,
    ADVISING_EMAIL,
  ].filter((x): x is string => !!x);
}

/** Renders the printable Appeal Result Email (Appeal Result Email Template) and
 *  records the send. The email body is the official English template; the
 *  surrounding controls follow the active locale. */
export default function AppealOutcomeEmailModal({
  appeal,
  busy,
  onSend,
  onClose,
}: {
  appeal: Appeal;
  busy: boolean;
  onSend: () => void;
  onClose: () => void;
}) {
  const { t, dir } = useI18n();
  const decisionWord = appeal.committee_decision === 'approved' ? 'Approved' : 'Rejected';
  const recipients = appealEmailRecipients(appeal);
  const alreadySent = appeal.outcome_email?.sent;

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
          <p className="text-sm font-semibold">{t('appeals.emailTitle')}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="btn btn-outline btn-sm">
              {t('appeals.printEmail')}
            </button>
            {!alreadySent && (
              <button onClick={onSend} disabled={busy} className="btn btn-primary btn-sm">
                {t('appeals.sendEmail')}
              </button>
            )}
            <button onClick={onClose} className="btn btn-ghost btn-sm">
              {t('admissions.previewClose')}
            </button>
          </div>
        </header>

        <div className="px-5 py-3 border-b border-line bg-canvas text-sm print:hidden">
          <span className="text-muted me-2">{t('appeals.recipients')}:</span>
          <span className="font-mono text-xs" dir="ltr">{recipients.join(', ')}</span>
          {alreadySent && (
            <span className="ms-2 text-xs text-pair-700 inline-flex items-center gap-1.5"><CheckIcon className="w-3.5 h-3.5 shrink-0" />{t('appeals.emailSent')}</span>
          )}
        </div>

        <article className="print-area px-10 py-10 text-[15px] leading-relaxed text-ink" dir="ltr">
          <p className="mb-4">Dear: {appeal.student_name_en}</p>
          <p className="mb-4">Student ID: {appeal.student_id}</p>
          <p className="mb-4">With reference to your Appeal for the following course</p>
          <p>Course Name: {appeal.course_name}</p>
          <p className="mb-4">Course Code: {appeal.course_code}</p>
          <p className="mb-6">
            Kindly note that after a review by the Appeal Committee, the decision on your Appeal
            request has been <strong>{decisionWord}</strong>.
          </p>
          <p className="mb-6">
            For any queries do not hesitate to pass by the Registration Counter.
          </p>
          <p>Best Regards</p>
          <p className="mt-4 font-semibold">Canadian College of Kuwait</p>
          <p className="text-muted text-sm mt-2">P.O. Box 22866 Safat 13089 Kuwait</p>
          <p className="text-muted text-sm">Office: +965 22060220</p>
          <p className="text-muted text-sm">{ADVISING_EMAIL}</p>
          <p className="text-muted text-sm">www.cck.edu.kw</p>
        </article>
      </div>
    </div>
  );
}
