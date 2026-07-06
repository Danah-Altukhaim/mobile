// CCK IT Helpdesk catalog. Source: CCK Hub IT Department.docx.
// Surfaced under the app's "Services" tab as "IT Helpdesk" — students pick a
// category and a common problem when raising a support ticket.
import type { ITHelpdeskCategory } from '../types/reference';

export const IT_HELPDESK_CATEGORIES: ITHelpdeskCategory[] = [
  {
    slug: 'account-access',
    name_en: 'Account & Access Issues',
    name_ar: 'مشاكل الحساب والدخول',
    problems_en: [
      'Login issues',
      'Email activation',
      'Password reset request',
      'Microsoft Office activation on devices',
    ],
    problems_ar: [
      'مشاكل تسجيل الدخول',
      'تفعيل البريد الإلكتروني',
      'طلب إعادة تعيين كلمة المرور',
      'تفعيل Microsoft Office على الأجهزة',
    ],
  },
  {
    slug: 'sis-lms',
    name_en: 'SIS & LMS',
    name_ar: 'نظام معلومات الطلبة ونظام التعلم',
    problems_en: [
      'Student timetable not showing in SIS on iPhone/iPad',
      'Data inaccuracies in registered courses',
      'Course not available in LMS',
      'Course mismatch between SIS and LMS',
      'Incorrect spelling of student name',
      'File upload issues in LMS',
    ],
    problems_ar: [
      'الجدول الدراسي لا يظهر في نظام معلومات الطلبة على iPhone/iPad',
      'بيانات غير دقيقة في المواد المسجلة',
      'المادة غير متاحة في نظام التعلم',
      'عدم تطابق المادة بين نظام معلومات الطلبة ونظام التعلم',
      'خطأ في كتابة اسم الطالب',
      'مشاكل في رفع الملفات على نظام التعلم',
    ],
  },
  {
    slug: 'technical-device',
    name_en: 'Technical Support & Device Issues',
    name_ar: 'الدعم الفني ومشاكل الأجهزة',
    problems_en: [
      'Assistance with menu navigation',
      'Display issues on iPad while viewing website menus',
      'Safe Exam Browser (SEB) related issues',
    ],
    problems_ar: [
      'المساعدة في التنقل بين القوائم',
      'مشاكل في العرض على iPad عند تصفّح قوائم الموقع',
      'مشاكل متعلقة بمتصفح الاختبارات الآمن (SEB)',
    ],
  },
];
