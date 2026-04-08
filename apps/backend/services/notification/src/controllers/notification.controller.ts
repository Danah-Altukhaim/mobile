import { Request, Response } from 'express';
import { AuthRequest } from '@masari/backend-shared';

export class NotificationController {
  /** GET /api/v1/notifications */
  getNotifications = (_req: Request, res: Response): void => {
    res.json({
      success: true,
      data: [
        {
          id: 'notif_001',
          type: 'payment_reminder',
          title_ar: 'تذكير بموعد السداد',
          title_en: 'Payment Due Reminder',
          body_ar: 'موعد سداد القسط الثاني للرسوم الدراسية بعد ٣ أيام. المبلغ المتبقي: ١٥,٠٠٠ ريال',
          body_en: 'Second tuition installment is due in 3 days. Remaining amount: 15,000 SAR',
          priority: 'high',
          is_read: false,
          created_at: '2026-04-08T08:00:00Z',
        },
        {
          id: 'notif_002',
          type: 'grade_update',
          title_ar: 'تحديث الدرجات',
          title_en: 'Grade Update',
          body_ar: 'تم رصد درجة اختبار مادة هندسة البرمجيات - الاختبار الفصلي الأول: ٤٢/٥٠',
          body_en: 'Software Engineering midterm exam grade posted: 42/50',
          priority: 'medium',
          is_read: false,
          created_at: '2026-04-07T14:30:00Z',
        },
        {
          id: 'notif_003',
          type: 'event_reminder',
          title_ar: 'تذكير بفعالية',
          title_en: 'Event Reminder',
          body_ar: 'هاكاثون الابتكار يبدأ غداً الساعة ٩ صباحاً في قاعة المؤتمرات. لا تنسَ التسجيل!',
          body_en: 'Innovation Hackathon starts tomorrow at 9 AM in the conference hall. Don\'t forget to register!',
          priority: 'medium',
          is_read: true,
          created_at: '2026-04-07T10:00:00Z',
        },
        {
          id: 'notif_004',
          type: 'payment_reminder',
          title_ar: 'تأكيد استلام الدفعة',
          title_en: 'Payment Received Confirmation',
          body_ar: 'تم استلام دفعة بمبلغ ١٠,٠٠٠ ريال بنجاح. رقم المرجع: PAY-2026-0412',
          body_en: 'Payment of 10,000 SAR received successfully. Reference: PAY-2026-0412',
          priority: 'low',
          is_read: true,
          created_at: '2026-04-05T11:20:00Z',
        },
        {
          id: 'notif_005',
          type: 'grade_update',
          title_ar: 'تنبيه أكاديمي',
          title_en: 'Academic Alert',
          body_ar: 'تم تحديث المعدل التراكمي الخاص بك. المعدل الحالي: ٣.٧٥ من ٤.٠٠',
          body_en: 'Your GPA has been updated. Current GPA: 3.75 out of 4.00',
          priority: 'medium',
          is_read: true,
          created_at: '2026-04-04T09:00:00Z',
        },
      ],
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** PUT /api/v1/notifications/preferences */
  updatePreferences = (req: Request, res: Response): void => {
    const preferences = req.body;

    res.json({
      success: true,
      data: {
        user_id: (req as AuthRequest).user.sub || 'user_123',
        push_enabled: preferences.push_enabled ?? true,
        email_enabled: preferences.email_enabled ?? true,
        sms_enabled: preferences.sms_enabled ?? false,
        channels: {
          payment_reminders: preferences.channels?.payment_reminders ?? { push: true, email: true, sms: true },
          grade_updates: preferences.channels?.grade_updates ?? { push: true, email: true, sms: false },
          event_reminders: preferences.channels?.event_reminders ?? { push: true, email: false, sms: false },
          social_updates: preferences.channels?.social_updates ?? { push: true, email: false, sms: false },
          admin_announcements: preferences.channels?.admin_announcements ?? { push: true, email: true, sms: false },
        },
        quiet_hours: preferences.quiet_hours ?? {
          enabled: true,
          start: '22:00',
          end: '07:00',
          timezone: 'Asia/Riyadh',
        },
        language: preferences.language ?? 'ar',
        updated_at: new Date().toISOString(),
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };
}
