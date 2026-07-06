// CCK Foundation Department / Degree-Diploma Department - Fall/Spring Attendance Policy.
// Thresholds are cumulative contact hours (الساعات التراكمية).

export type AttendanceTrack = 'foundation' | 'degree';

export interface AttendanceThresholds {
  first_warning_hours: number;
  second_warning_hours: number;
  fa_hours: number;
}

export const FOUNDATION_THRESHOLDS: AttendanceThresholds = {
  first_warning_hours: 28,
  second_warning_hours: 42,
  fa_hours: 72,
};

export const DEGREE_THRESHOLDS_BY_CREDITS: Record<number, AttendanceThresholds> = {
  2: { first_warning_hours: 2,  second_warning_hours: 4,  fa_hours: 5 },
  3: { first_warning_hours: 3,  second_warning_hours: 6,  fa_hours: 8 },
  4: { first_warning_hours: 4,  second_warning_hours: 8,  fa_hours: 10 },
  5: { first_warning_hours: 5,  second_warning_hours: 10, fa_hours: 13 },
};

export function getAttendanceThresholds(track: AttendanceTrack, credit_hours = 3): AttendanceThresholds {
  if (track === 'foundation') return FOUNDATION_THRESHOLDS;
  return DEGREE_THRESHOLDS_BY_CREDITS[credit_hours] ?? DEGREE_THRESHOLDS_BY_CREDITS[3];
}

export type AttendanceLevel = 'ok' | 'first_warning' | 'second_warning' | 'fa';

export function attendanceLevel(absent_hours: number, t: AttendanceThresholds): AttendanceLevel {
  if (absent_hours >= t.fa_hours) return 'fa';
  if (absent_hours >= t.second_warning_hours) return 'second_warning';
  if (absent_hours >= t.first_warning_hours) return 'first_warning';
  return 'ok';
}

// Rendered verbatim in the mobile policy card and admin policy page.
// The five bullets mirror the ملاحظات section of the policy poster.
export const ATTENDANCE_POLICY_NOTES = {
  en: [
    'A medical or official excuse must be submitted to Student Administrative Affairs within 5 working days of the absence date.',
    'If the student arrives more than 10 minutes late, they may enter the lecture but the session is counted as an absence.',
    'A student who leaves the lecture for 20 minutes or more is considered absent.',
    'Phone calls and restroom visits should be scheduled before, after, or at the mid-lecture break, not during the lecture.',
    'Excuses accepted for missing exams: hospital admission, or death of a first-degree relative.',
    'All students must carry their university ID while on campus.',
  ],
  ar: [
    'يتوجب على الطالب تسليم العذر خلال 5 أيام عمل من تاريخ الغياب وتقديمه إلى الشؤون الإدارية للطلبة.',
    'في حالة تأخر الطالب أكثر من عشر دقائق، سيتم السماح له بدخول المحاضرة ولكن سيتم احتسابه غياب.',
    'سيتم اعتبار الطلاب الذين يغادرون المحاضرة لمدة 20 دقيقة على أنهم متغيبين.',
    'من الضروري جدولة المكالمات الهاتفية وزيارات دورة المياه قبل أو بعد نهاية وقت المحاضرة، وليس خلال منتصف المحاضرة.',
    'الأعذار المقبولة للتغيب عن الاختبارات: دخول المستشفى أو حالات الوفاة (صلة القرابة من الدرجة الأولى).',
    'على جميع الطلبة حمل البطاقة الجامعية أثناء التواجد في الكلية.',
  ],
} as const;

export const EXCUSE_SUBMISSION_WINDOW_DAYS = 5;
