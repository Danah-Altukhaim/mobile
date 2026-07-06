/**
 * Department roles and the modules each one is allowed to see.
 *
 * Scopes are grounded in the CCK Student Hub Docs workflows:
 * - Registration + Advising: academic requests land at the Registration Manager
 *   (change of grade, incomplete, withdrawal), enrolment stage of equivalency,
 *   schedules, warnings, FA screen, appeal outcomes go to the advising inbox.
 * - Admission: acceptance letters, ID cards, admission-registration submissions,
 *   initiates the equivalency workflow for transferred students.
 * - VP (Vice Dean for Academic Affairs): final equivalency approval, appeal
 *   committee decisions, oversight analytics and the audit log.
 * - Professors: submit change of grade / incomplete requests, give faculty
 *   feedback on appeals, course catalog and schedules.
 * - Facilities: rooms, inventory and budgets, event fulfilment, IT helpdesk.
 * - Marketing: campaigns, communications, event briefs, engagement analytics.
 * - Student Life: sport students, clubs, events, complaints and suggestions.
 */

export type Role =
  | 'super_admin'
  | 'registration_staff'
  | 'admission_staff'
  | 'vp'
  | 'faculty'
  | 'facilities_staff'
  | 'marketing_staff'
  | 'student_life_staff';

const ALL = 'all' as const;

export const ROLE_MODULES: Record<Role, string[] | typeof ALL> = {
  super_admin: ALL,
  registration_staff: [
    '/', '/requests', '/students', '/equivalency', '/catalog', '/calendar',
    '/warnings', '/fa-screen', '/appeals', '/social-allowance', '/directory',
  ],
  admission_staff: [
    '/', '/admissions', '/equivalency', '/students', '/calendar', '/directory',
  ],
  vp: [
    '/', '/equivalency', '/appeals', '/warnings', '/fa-screen', '/feedback',
    '/students', '/engagement', '/retention', '/payments', '/ai-monitoring',
    '/audit-log', '/calendar', '/directory',
  ],
  faculty: [
    '/', '/requests', '/appeals', '/catalog', '/calendar', '/directory',
  ],
  facilities_staff: [
    '/', '/facilities', '/event-requests', '/it-helpdesk', '/calendar', '/directory',
  ],
  marketing_staff: [
    '/', '/marketing', '/communications', '/event-requests', '/engagement',
    '/calendar', '/directory',
  ],
  student_life_staff: [
    '/', '/student-life', '/sport', '/event-requests', '/feedback',
    '/communications', '/calendar', '/directory',
  ],
};

export function canAccess(role: string | undefined, href: string): boolean {
  if (!role) return false;
  const modules = ROLE_MODULES[role as Role];
  if (!modules) return false;
  if (modules === ALL) return true;
  if (href === '/') return true;
  return modules.some((m) => m !== '/' && (href === m || href.startsWith(`${m}/`)));
}

/** Demo accounts surfaced on the login screen - one per department plus Admin. */
export const DEMO_ACCOUNTS: { email: string; role: Role; labelKey: string }[] = [
  { email: 'dean@cck.edu.kw', role: 'super_admin', labelKey: 'role.super_admin' },
  { email: 'registrar@cck.edu.kw', role: 'registration_staff', labelKey: 'role.registration_staff' },
  { email: 'admission@cck.edu.kw', role: 'admission_staff', labelKey: 'role.admission_staff' },
  { email: 'vp@cck.edu.kw', role: 'vp', labelKey: 'role.vp' },
  { email: 'professor@cck.edu.kw', role: 'faculty', labelKey: 'role.faculty' },
  { email: 'facilities@cck.edu.kw', role: 'facilities_staff', labelKey: 'role.facilities_staff' },
  { email: 'marketing@cck.edu.kw', role: 'marketing_staff', labelKey: 'role.marketing_staff' },
  { email: 'studentlife@cck.edu.kw', role: 'student_life_staff', labelKey: 'role.student_life_staff' },
];

export const DEMO_PASSWORD = 'admin123';
