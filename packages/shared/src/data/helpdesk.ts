// General Helpdesk catalog — departments and their common issues.
// The CCK Hub IT Department doc requires support requests to be categorised by
// the department they originate from; this powers the helpdesk screen's
// department picker and the dependent issue picker beneath it.
//
// IT issues mirror IT_HELPDESK_CATEGORIES (CCK Hub IT Department.docx); the
// other departments cover the common student-facing requests described across
// the Registration, Finance, Student Life and Admission workflow docs.
import type { HelpdeskDepartment } from '../types/reference';

export const HELPDESK_DEPARTMENTS: HelpdeskDepartment[] = [
  {
    slug: 'it',
    name_en: 'IT Department',
    name_ar: 'قسم تقنية المعلومات',
    email: 'it@cck.edu.kw',
    issues: [
      { slug: 'login', label_en: 'Login issues', label_ar: 'مشاكل تسجيل الدخول' },
      { slug: 'email-activation', label_en: 'Email activation', label_ar: 'تفعيل البريد الإلكتروني' },
      { slug: 'password-reset', label_en: 'Password reset request', label_ar: 'طلب إعادة تعيين كلمة المرور' },
      { slug: 'office-activation', label_en: 'Microsoft Office activation on devices', label_ar: 'تفعيل Microsoft Office على الأجهزة' },
      { slug: 'timetable-sis', label_en: 'Timetable not showing in SIS on iPhone/iPad', label_ar: 'الجدول الدراسي لا يظهر في نظام معلومات الطلبة على iPhone/iPad' },
      { slug: 'course-not-in-lms', label_en: 'Course not available in LMS', label_ar: 'المادة غير متاحة في نظام التعلم' },
      { slug: 'sis-lms-mismatch', label_en: 'Course mismatch between SIS and LMS', label_ar: 'عدم تطابق المادة بين نظام معلومات الطلبة ونظام التعلم' },
      { slug: 'lms-file-upload', label_en: 'File upload issues in LMS', label_ar: 'مشاكل في رفع الملفات على نظام التعلم' },
      { slug: 'seb', label_en: 'Safe Exam Browser (SEB) related issues', label_ar: 'مشاكل متعلقة بمتصفح الاختبارات الآمن (SEB)' },
      { slug: 'ipad-display', label_en: 'Display issues on iPad while viewing website menus', label_ar: 'مشاكل في العرض على iPad عند تصفّح قوائم الموقع' },
      { slug: 'navigation-help', label_en: 'Assistance with menu navigation', label_ar: 'المساعدة في التنقل بين القوائم' },
    ],
  },
  {
    slug: 'registration',
    name_en: 'Registration & Records',
    name_ar: 'القبول والتسجيل',
    email: 'registration@cck.edu.kw',
    issues: [
      { slug: 'data-inaccuracy', label_en: 'Data inaccuracies in registered courses', label_ar: 'بيانات غير دقيقة في المواد المسجلة' },
      { slug: 'name-spelling', label_en: 'Incorrect spelling of student name', label_ar: 'خطأ في كتابة اسم الطالب' },
      { slug: 'add-drop', label_en: 'Add / drop a course', label_ar: 'إضافة أو حذف مادة' },
      { slug: 'timetable-conflict', label_en: 'Timetable conflict', label_ar: 'تعارض في الجدول الدراسي' },
      { slug: 'transcript', label_en: 'Transcript request question', label_ar: 'استفسار عن طلب كشف الدرجات' },
      { slug: 'enrollment-letter', label_en: 'Enrollment / TWIMC letter question', label_ar: 'استفسار عن خطاب القيد / لمن يهمه الأمر' },
      { slug: 'withdrawal', label_en: 'Withdrawal request question', label_ar: 'استفسار عن طلب الانسحاب' },
      { slug: 'excused-absence', label_en: 'Excused absence / medical excuse question', label_ar: 'استفسار عن العذر الطبي / عذر الغياب' },
    ],
  },
  {
    slug: 'finance',
    name_en: 'Finance Department',
    name_ar: 'الإدارة المالية',
    email: 'finance@cck.edu.kw',
    issues: [
      { slug: 'balance', label_en: 'Account balance enquiry', label_ar: 'استفسار عن رصيد الحساب' },
      { slug: 'installments', label_en: 'Installment plan question', label_ar: 'استفسار عن خطة التقسيط' },
      { slug: 'payment-failed', label_en: 'Online payment failed or not reflected', label_ar: 'فشل الدفع الإلكتروني أو لم يُحتسب' },
      { slug: 'late-fee', label_en: 'Late fee enquiry', label_ar: 'استفسار عن رسوم التأخير' },
      { slug: 'refund', label_en: 'Refund status', label_ar: 'حالة استرداد المبلغ' },
      { slug: 'discount', label_en: 'Grant / discount enquiry', label_ar: 'استفسار عن المنحة أو الخصم' },
      { slug: 'invoice', label_en: 'Request an invoice or receipt', label_ar: 'طلب فاتورة أو إيصال' },
    ],
  },
  {
    slug: 'student-life',
    name_en: 'Student Life Department',
    name_ar: 'قسم شؤون الطلبة',
    email: 'studentlife@cck.edu.kw',
    issues: [
      { slug: 'club-join', label_en: 'Club membership question', label_ar: 'استفسار عن الانضمام للأندية' },
      { slug: 'event-registration', label_en: 'Event registration issue', label_ar: 'مشكلة في التسجيل للفعاليات' },
      { slug: 'sport-student', label_en: 'Sport student recognition', label_ar: 'اعتماد الطالب الرياضي' },
      { slug: 'complaint', label_en: 'Follow up on a complaint', label_ar: 'متابعة شكوى' },
      { slug: 'suggestion', label_en: 'Follow up on a suggestion', label_ar: 'متابعة اقتراح' },
      { slug: 'social-allowance', label_en: 'Social allowance question', label_ar: 'استفسار عن الإعانة الاجتماعية' },
    ],
  },
  {
    slug: 'admissions',
    name_en: 'Admissions Department',
    name_ar: 'قسم القبول',
    email: 'admissions@cck.edu.kw',
    issues: [
      { slug: 'application-status', label_en: 'Application status enquiry', label_ar: 'استفسار عن حالة الطلب' },
      { slug: 'missing-documents', label_en: 'Missing admission documents', label_ar: 'مستندات قبول ناقصة' },
      { slug: 'equivalency', label_en: 'Transfer credit equivalency question', label_ar: 'استفسار عن معادلة المقررات المنقولة' },
      { slug: 'id-card', label_en: 'Student ID card question', label_ar: 'استفسار عن البطاقة الجامعية' },
      { slug: 'funding-path', label_en: 'PUC / self-funded status question', label_ar: 'استفسار عن حالة التمويل (PUC / ذاتي)' },
    ],
  },
  {
    slug: 'academic',
    name_en: 'Academic Affairs',
    name_ar: 'الشؤون الأكاديمية',
    email: 'academic@cck.edu.kw',
    issues: [
      { slug: 'grade-appeal', label_en: 'Grade appeal question', label_ar: 'استفسار عن تظلم الدرجات' },
      { slug: 'advising', label_en: 'Academic advising request', label_ar: 'طلب إرشاد أكاديمي' },
      { slug: 'degree-audit', label_en: 'Degree audit / graduation plan question', label_ar: 'استفسار عن تدقيق الخطة الدراسية / خطة التخرج' },
      { slug: 'attendance', label_en: 'Attendance / FA warning question', label_ar: 'استفسار عن الحضور / إنذار الحرمان' },
      { slug: 'instructor', label_en: 'Issue with a course or instructor', label_ar: 'مشكلة متعلقة بمادة أو مدرّس' },
    ],
  },
];
