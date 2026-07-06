import { Request, Response } from 'express';
import { AuthRequest, academicQueries, isDbAvailable, mockData } from '@masari/backend-shared';

export class AdminController {
  /** GET /api/v1/admin/analytics/engagement */
  getEngagementAnalytics = (_req: Request, res: Response): void => {
    res.json({
      success: true,
      data: {
        daily_active_users: 2450,
        monthly_active_users: 4200,
        avg_session_duration_minutes: 23.5,
        feature_usage_heatmap: {
          schedule_view: { usage_count: 3820, label_ar: 'عرض الجدول', label_en: 'Schedule View' },
          grade_check: { usage_count: 2950, label_ar: 'التحقق من الدرجات', label_en: 'Grade Check' },
          payment_portal: { usage_count: 1870, label_ar: 'بوابة الدفع', label_en: 'Payment Portal' },
          ai_advisor: { usage_count: 1540, label_ar: 'المستشار الذكي', label_en: 'AI Advisor' },
          campus_events: { usage_count: 1320, label_ar: 'فعاليات الحرم', label_en: 'Campus Events' },
          social_feed: { usage_count: 2100, label_ar: 'المنشورات', label_en: 'Social Feed' },
          library_search: { usage_count: 980, label_ar: 'بحث المكتبة', label_en: 'Library Search' },
          club_activities: { usage_count: 760, label_ar: 'أنشطة الأندية', label_en: 'Club Activities' },
        },
        engagement_by_cohort: [
          { cohort: '2023', active_users: 1050, avg_session_min: 26.1 },
          { cohort: '2024', active_users: 1380, avg_session_min: 24.3 },
          { cohort: '2025', active_users: 920, avg_session_min: 21.8 },
          { cohort: '2026', active_users: 850, avg_session_min: 19.5 },
        ],
        engagement_by_major: [
          { major_en: 'Computer Science', major_ar: 'علوم الحاسب', active_users: 820, avg_session_min: 28.4 },
          { major_en: 'Engineering', major_ar: 'الهندسة', active_users: 710, avg_session_min: 25.1 },
          { major_en: 'Business', major_ar: 'إدارة الأعمال', active_users: 680, avg_session_min: 22.7 },
          { major_en: 'Science', major_ar: 'العلوم', active_users: 450, avg_session_min: 20.3 },
          { major_en: 'Arts', major_ar: 'الآداب', active_users: 390, avg_session_min: 18.9 },
        ],
        engagement_by_year: [
          { year: '1st Year', year_ar: 'السنة الأولى', active_users: 1100, avg_session_min: 19.2 },
          { year: '2nd Year', year_ar: 'السنة الثانية', active_users: 980, avg_session_min: 22.5 },
          { year: '3rd Year', year_ar: 'السنة الثالثة', active_users: 870, avg_session_min: 25.8 },
          { year: '4th Year', year_ar: 'السنة الرابعة', active_users: 650, avg_session_min: 27.1 },
          { year: '5th Year', year_ar: 'السنة الخامسة', active_users: 350, avg_session_min: 23.4 },
        ],
        peak_hours: [
          { hour: 9, users: 1200, label_ar: '٩ صباحاً', label_en: '9 AM' },
          { hour: 13, users: 1850, label_ar: '١ ظهراً', label_en: '1 PM' },
          { hour: 21, users: 1650, label_ar: '٩ مساءً', label_en: '9 PM' },
        ],
        period: {
          start: '2026-03-08',
          end: '2026-04-08',
        },
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** GET /api/v1/admin/analytics/retention */
  getRetentionAnalytics = (_req: Request, res: Response): void => {
    res.json({
      success: true,
      data: {
        overall_retention_rate: 94.2,
        at_risk_students_count: 47,
        total_enrolled: 4200,
        retention_by_college: [
          { college_ar: 'كلية علوم الحاسب', college_en: 'College of Computer Science', retention_rate: 96.1, enrolled: 820 },
          { college_ar: 'كلية الهندسة', college_en: 'College of Engineering', retention_rate: 93.8, enrolled: 950 },
          { college_ar: 'كلية إدارة الأعمال', college_en: 'College of Business', retention_rate: 94.5, enrolled: 1100 },
          { college_ar: 'كلية العلوم', college_en: 'College of Science', retention_rate: 92.3, enrolled: 680 },
          { college_ar: 'كلية الآداب', college_en: 'College of Arts', retention_rate: 95.0, enrolled: 650 },
        ],
        trend: [
          { month: '2026-01', rate: 95.1 },
          { month: '2026-02', rate: 94.8 },
          { month: '2026-03', rate: 94.5 },
          { month: '2026-04', rate: 94.2 },
        ],
        risk_factors_summary: {
          low_gpa: { count: 18, label_ar: 'انخفاض المعدل التراكمي', label_en: 'Low GPA' },
          attendance: { count: 12, label_ar: 'ضعف الحضور', label_en: 'Poor Attendance' },
          financial: { count: 9, label_ar: 'مشاكل مالية', label_en: 'Financial Issues' },
          engagement: { count: 8, label_ar: 'ضعف التفاعل', label_en: 'Low Engagement' },
        },
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** GET /api/v1/admin/students/at-risk */
  getAtRiskStudents = (_req: Request, res: Response): void => {
    res.json({
      success: true,
      data: [
        {
          id: 'student_401',
          name_ar: 'محمد العتيبي',
          name_en: 'Mohammed Al-Otaibi',
          student_id: '441012345',
          risk_score: 0.85,
          risk_level: 'high',
          college_ar: 'كلية علوم الحاسب',
          college_en: 'College of Computer Science',
          gpa: 1.8,
          contributing_factors: [
            { factor_ar: 'انخفاض حاد في المعدل التراكمي', factor_en: 'Sharp GPA decline', weight: 0.4 },
            { factor_ar: 'غياب متكرر في آخر ٣ أسابيع', factor_en: 'Frequent absences in last 3 weeks', weight: 0.3 },
            { factor_ar: 'عدم تسليم ٤ واجبات', factor_en: '4 missing assignments', weight: 0.15 },
          ],
          last_active: '2026-04-02T14:30:00Z',
        },
        {
          id: 'student_402',
          name_ar: 'سارة الدوسري',
          name_en: 'Sarah Al-Dosari',
          student_id: '441023456',
          risk_score: 0.78,
          risk_level: 'high',
          college_ar: 'كلية الهندسة',
          college_en: 'College of Engineering',
          gpa: 2.1,
          contributing_factors: [
            { factor_ar: 'تأخر في سداد الرسوم الدراسية', factor_en: 'Overdue tuition payment', weight: 0.35 },
            { factor_ar: 'انخفاض التفاعل مع المنصة', factor_en: 'Decreased platform engagement', weight: 0.25 },
            { factor_ar: 'رسوب في مادتين', factor_en: 'Failed 2 courses', weight: 0.18 },
          ],
          last_active: '2026-04-05T09:00:00Z',
        },
        {
          id: 'student_403',
          name_ar: 'خالد الشمري',
          name_en: 'Khalid Al-Shammari',
          student_id: '441034567',
          risk_score: 0.72,
          risk_level: 'medium',
          college_ar: 'كلية إدارة الأعمال',
          college_en: 'College of Business',
          gpa: 2.3,
          contributing_factors: [
            { factor_ar: 'انسحاب من مادتين هذا الفصل', factor_en: 'Withdrew from 2 courses this semester', weight: 0.3 },
            { factor_ar: 'انخفاض في درجات الاختبارات', factor_en: 'Declining exam scores', weight: 0.25 },
          ],
          last_active: '2026-04-07T16:45:00Z',
        },
        {
          id: 'student_404',
          name_ar: 'ريم الحربي',
          name_en: 'Reem Al-Harbi',
          student_id: '441045678',
          risk_score: 0.65,
          risk_level: 'medium',
          college_ar: 'كلية العلوم',
          college_en: 'College of Science',
          gpa: 2.5,
          contributing_factors: [
            { factor_ar: 'غياب عن ٣ اختبارات قصيرة', factor_en: 'Missed 3 quizzes', weight: 0.3 },
            { factor_ar: 'عدم حضور ساعات الإرشاد', factor_en: 'No advising session attendance', weight: 0.2 },
          ],
          last_active: '2026-04-06T11:20:00Z',
        },
        {
          id: 'student_405',
          name_ar: 'عمر المالكي',
          name_en: 'Omar Al-Malki',
          student_id: '441056789',
          risk_score: 0.61,
          risk_level: 'medium',
          college_ar: 'كلية الآداب',
          college_en: 'College of Arts',
          gpa: 2.4,
          contributing_factors: [
            { factor_ar: 'تراجع في الأداء الأكاديمي', factor_en: 'Academic performance decline', weight: 0.25 },
            { factor_ar: 'قلة التفاعل في المنتديات الدراسية', factor_en: 'Low participation in course forums', weight: 0.2 },
            { factor_ar: 'تأخر في تسليم المشاريع', factor_en: 'Late project submissions', weight: 0.16 },
          ],
          last_active: '2026-04-07T08:30:00Z',
        },
      ],
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** POST /api/v1/admin/students/:id/intervene */
  intervene = (req: Request, res: Response): void => {
    const { id } = req.params;
    const { action, notes_ar, notes_en } = req.body;

    res.json({
      success: true,
      data: {
        intervention_id: `int_${Date.now()}`,
        student_id: id,
        action: action || 'advisor_meeting',
        status: 'scheduled',
        notes_ar: notes_ar || 'تم جدولة اجتماع مع المرشد الأكاديمي',
        notes_en: notes_en || 'Meeting scheduled with academic advisor',
        created_by: (req as AuthRequest).user.sub || 'admin_001',
        created_at: new Date().toISOString(),
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** POST /api/v1/admin/students/:id/advising-meetings
   *  Schedule an advising meeting for a student. It then surfaces on the
   *  student's Academic Calendar via GET /students/me/advising-meetings. */
  scheduleAdvisingMeeting = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const b = req.body || {};
    const input = {
      student_id: String(id),
      type: b.type || 'general',
      title_ar: b.title_ar || 'موعد إرشاد أكاديمي',
      title_en: b.title_en || 'Advising Appointment',
      advisor_ar: b.advisor_ar || 'المرشد الأكاديمي',
      advisor_en: b.advisor_en || 'Academic Advisor',
      scheduled_at: b.scheduled_at || new Date().toISOString(),
      location_ar: b.location_ar || '',
      location_en: b.location_en || '',
      notes_ar: b.notes_ar ?? null,
      notes_en: b.notes_en ?? null,
      created_by: (req as AuthRequest).user?.id || 'admin_001',
    };

    try {
      let data;
      if (isDbAvailable()) {
        data = await academicQueries.createAdvisingMeeting(input);
      } else {
        // No-DB fallback: persist into the in-process mock store.
        data = { id: `adv_${Date.now()}`, status: 'scheduled', ...input };
        mockData.mockAdvisingMeetings.push(data);
      }
      res.status(201).json({ success: true, data, meta: { synced_at: new Date().toISOString() } });
    } catch (e: any) {
      if (e.message === 'DB_NOT_AVAILABLE') {
        const data = { id: `adv_${Date.now()}`, status: 'scheduled', ...input };
        mockData.mockAdvisingMeetings.push(data);
        res.status(201).json({ success: true, data, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
      } else {
        res.status(500).json({ success: false, errors: [{ code: 'INTERNAL_ERROR', message_ar: 'خطأ في الخادم', message_en: e.message }] });
      }
    }
  };

  /** POST /api/v1/admin/communications/send */
  sendCommunication = (req: Request, res: Response): void => {
    const { subject_ar, subject_en, body_ar, body_en, target_audience, channels } = req.body;

    res.json({
      success: true,
      data: {
        message_id: `comm_${Date.now()}`,
        recipients_count: 342,
        subject_ar: subject_ar || 'إشعار إداري',
        subject_en: subject_en || 'Administrative Notice',
        channels: channels || ['push', 'email'],
        target_audience: target_audience || 'all_students',
        status: 'queued',
        scheduled_at: new Date().toISOString(),
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** PUT /api/v1/admin/config/branding */
  updateBranding = (req: Request, res: Response): void => {
    const config = req.body;

    res.json({
      success: true,
      data: {
        university_name_ar: config.university_name_ar || 'جامعة الملك سعود',
        university_name_en: config.university_name_en || 'King Saud University',
        primary_color: config.primary_color || '#006847',
        secondary_color: config.secondary_color || '#FFD700',
        logo_url: config.logo_url || 'https://cdn.masari.sa/branding/ksu_logo.png',
        favicon_url: config.favicon_url || 'https://cdn.masari.sa/branding/ksu_favicon.ico',
        custom_css: config.custom_css || '',
        updated_at: new Date().toISOString(),
        updated_by: (req as AuthRequest).user.sub || 'admin_001',
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** GET /api/v1/admin/integrations/status */
  getIntegrationStatus = (_req: Request, res: Response): void => {
    res.json({
      success: true,
      data: [
        {
          adapter_id: 'blackboard',
          name_ar: 'بلاك بورد',
          name_en: 'Blackboard',
          status: 'connected',
          last_sync: '2026-04-08T06:00:00Z',
          records_synced: 12450,
          health: 'healthy',
        },
        {
          adapter_id: 'banner',
          name_ar: 'بانر',
          name_en: 'Banner',
          status: 'syncing',
          last_sync: '2026-04-08T07:30:00Z',
          records_synced: 8920,
          health: 'healthy',
          sync_progress: 67,
        },
        {
          adapter_id: 'canvas',
          name_ar: 'كانفاس',
          name_en: 'Canvas',
          status: 'disconnected',
          last_sync: '2026-04-01T12:00:00Z',
          records_synced: 0,
          health: 'error',
          error_ar: 'انتهت صلاحية مفتاح الاتصال',
          error_en: 'API key expired',
        },
      ],
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** GET /api/v1/admin/users */
  listAdminUsers = (_req: Request, res: Response): void => {
    res.json({
      success: true,
      data: [
        {
          id: 'admin_001',
          email: 'dean@ksu.edu.sa',
          name_ar: 'د. عبدالله الفيصل',
          name_en: 'Dr. Abdullah Al-Faisal',
          role: 'super_admin',
          status: 'active',
          created_at: '2025-09-01T00:00:00Z',
          last_login: '2026-04-08T08:30:00Z',
        },
        {
          id: 'admin_002',
          email: 'registrar@ksu.edu.sa',
          name_ar: 'نورة الشهري',
          name_en: 'Noura Al-Shahri',
          role: 'university_admin',
          status: 'active',
          created_at: '2025-09-15T00:00:00Z',
          last_login: '2026-04-07T14:20:00Z',
        },
        {
          id: 'admin_003',
          email: 'advisor.cs@ksu.edu.sa',
          name_ar: 'أحمد الغامدي',
          name_en: 'Ahmed Al-Ghamdi',
          role: 'advisor',
          status: 'active',
          created_at: '2025-10-01T00:00:00Z',
          last_login: '2026-04-08T10:15:00Z',
        },
      ],
      meta: { synced_at: new Date().toISOString() },
    });
  };

  /** POST /api/v1/admin/users */
  createAdminUser = (req: Request, res: Response): void => {
    const { email, name_ar, name_en, role } = req.body;

    res.status(201).json({
      success: true,
      data: {
        id: `admin_${Date.now()}`,
        email: email || 'new@ksu.edu.sa',
        name_ar: name_ar || 'مستخدم جديد',
        name_en: name_en || 'New User',
        role: role || 'staff',
        status: 'active',
        created_at: new Date().toISOString(),
        last_login: null,
      },
      meta: { synced_at: new Date().toISOString() },
    });
  };

  /** PUT /api/v1/admin/users/:id/role */
  updateAdminRole = (req: Request, res: Response): void => {
    const { id } = req.params;
    const { role } = req.body;

    res.json({
      success: true,
      data: {
        id,
        role: role || 'staff',
        updated_at: new Date().toISOString(),
        updated_by: (req as AuthRequest).user.sub || 'admin_001',
      },
      meta: { synced_at: new Date().toISOString() },
    });
  };

  /** POST /api/v1/admin/students/import */
  importStudents = (req: Request, res: Response): void => {
    const { students } = req.body;
    const count = Array.isArray(students) ? students.length : 150;

    res.status(201).json({
      success: true,
      data: {
        import_id: `imp_${Date.now()}`,
        total_records: count,
        successful: count - 2,
        failed: 2,
        errors: [
          { row: 23, message_ar: 'رقم الطالب مكرر', message_en: 'Duplicate student ID' },
          { row: 87, message_ar: 'بريد إلكتروني غير صالح', message_en: 'Invalid email format' },
        ],
        status: 'partial',
      },
      meta: { synced_at: new Date().toISOString() },
    });
  };

  /** GET /api/v1/admin/students/export */
  exportStudents = (_req: Request, res: Response): void => {
    res.json({
      success: true,
      data: {
        export_id: `exp_${Date.now()}`,
        download_url: '/api/v1/admin/students/export/download',
        format: 'csv',
        total_records: 4200,
        status: 'ready',
        generated_at: new Date().toISOString(),
        message_ar: 'تم تجهيز ملف التصدير',
        message_en: 'Export file ready for download',
      },
      meta: { synced_at: new Date().toISOString() },
    });
  };

  /** POST /api/v1/admin/integrations/sync */
  triggerSync = (_req: Request, res: Response): void => {
    res.json({
      success: true,
      data: {
        sync_id: `sync_${Date.now()}`,
        status: 'started',
        message_ar: 'تم بدء عملية المزامنة',
        message_en: 'Sync process started',
        started_at: new Date().toISOString(),
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };
}
