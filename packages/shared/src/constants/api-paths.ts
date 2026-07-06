const V1 = '/api/v1';

export const API_PATHS = {
  // Auth
  AUTH_SSO_INITIATE: `${V1}/auth/sso/initiate`,
  AUTH_TOKEN_REFRESH: `${V1}/auth/token/refresh`,

  // Student / Academic
  STUDENT_ME: `${V1}/students/me`,
  STUDENT_SCHEDULE: `${V1}/students/me/schedule`,
  STUDENT_GRADES: `${V1}/students/me/grades`,
  STUDENT_GRADE_DETAIL: (enrollmentId: string) => `${V1}/students/me/grades/${enrollmentId}`,
  STUDENT_ATTENDANCE: `${V1}/students/me/attendance`,
  STUDENT_ASSIGNMENTS: `${V1}/students/me/assignments`,
  STUDENT_FEES: `${V1}/students/me/fees`,
  STUDENT_DEGREE_AUDIT: `${V1}/students/me/degree-audit`,

  STUDENT_REGISTER_COURSE: (courseId: string) => `${V1}/students/me/register-course/${courseId}`,
  STUDENT_CALENDAR: `${V1}/students/me/calendar`,
  STUDENT_ADVISING_MEETINGS: `${V1}/students/me/advising-meetings`,
  STUDENT_AVAILABLE_COURSES: `${V1}/students/me/available-courses`,

  // Payments
  PAYMENT_INITIATE: `${V1}/payments/initiate`,
  PAYMENT_WEBHOOK: `${V1}/payments/webhook`,
  PAYMENT_RECEIPT: (paymentId: string) => `${V1}/payments/${paymentId}/receipt`,
  PAYMENT_HISTORY: `${V1}/payments/history`,
  PAYMENT_INSTALLMENTS: `${V1}/payments/installments`,

  // AI
  AI_CHAT: `${V1}/ai/chat`,
  AI_CHAT_HISTORY: (conversationId: string) => `${V1}/ai/chat/${conversationId}`,
  AI_ESCALATE: `${V1}/ai/escalate`,
  AI_COURSE_RECOMMENDATIONS: `${V1}/ai/course-recommendations`,
  AI_NUDGES: `${V1}/ai/nudges`,

  // Campus
  EVENTS: `${V1}/events`,
  EVENT_DETAIL: (eventId: string) => `${V1}/events/${eventId}`,
  EVENT_RSVP: (eventId: string) => `${V1}/events/${eventId}/rsvp`,
  PRAYER_TIMES: `${V1}/events/prayer-times`,
  CLUBS: `${V1}/clubs`,
  CLUB_DETAIL: (clubId: string) => `${V1}/clubs/${clubId}`,
  CLUB_JOIN: (clubId: string) => `${V1}/clubs/${clubId}/join`,
  CAMPUS_BUILDINGS: `${V1}/campus/buildings`,
  CAMPUS_NEWS: `${V1}/campus/news`,
  CAMPUS_DINING: `${V1}/campus/dining`,
  CAMPUS_LOST_FOUND: `${V1}/campus/lost-found`,
  CLASS_CHANNELS: `${V1}/campus/class-channels`,
  CLASS_CHANNEL_DETAIL: (channelId: string) => `${V1}/campus/class-channels/${channelId}`,
  CLASS_CHANNEL_POST: (channelId: string) => `${V1}/campus/class-channels/${channelId}/post`,
  CLUB_CHANNELS: `${V1}/campus/club-channels`,
  CLUB_CHANNEL_DETAIL: (channelId: string) => `${V1}/campus/club-channels/${channelId}`,
  CLUB_CHANNEL_POST: (channelId: string) => `${V1}/campus/club-channels/${channelId}/post`,

  // Social
  SOCIAL_FEED: `${V1}/feed`,
  SOCIAL_CREATE_POST: `${V1}/feed`,
  SOCIAL_MESSAGES: `${V1}/messages`,
  SOCIAL_CONVERSATION: (conversationId: string) => `${V1}/messages/${conversationId}`,
  SOCIAL_SEND_MESSAGE: (userId: string) => `${V1}/messages/${userId}`,
  SOCIAL_STUDY_GROUPS: `${V1}/feed/study-groups`,
  SOCIAL_JOIN_STUDY_GROUP: (groupId: string) => `${V1}/feed/study-groups/${groupId}/join`,
  SOCIAL_MENTORING: `${V1}/feed/mentoring`,
  SOCIAL_ANONYMOUS_QA: `${V1}/feed/anonymous-qa`,

  // Notifications
  NOTIFICATIONS: `${V1}/notifications`,
  NOTIFICATION_PREFERENCES: `${V1}/notifications/preferences`,
  NOTIFICATION_READ: (notificationId: string) => `${V1}/notifications/${notificationId}/read`,

  // Files
  TRANSCRIPT_REQUESTS: `${V1}/files/transcript-requests`,
  TRANSCRIPT_REQUEST: `${V1}/files/transcript-request`,

  // CCK-Hub Service Requests
  SERVICE_REQUESTS: `${V1}/services/requests`,
  SERVICE_REQUEST_DETAIL: (id: string) => `${V1}/services/requests/${id}`,
  SERVICE_REQUEST_CANCEL: (id: string) => `${V1}/services/requests/${id}/cancel`,
  SERVICE_REQUEST_AMEND_ATTACHMENT: (id: string, attachmentId: string) =>
    `${V1}/services/requests/${id}/attachments/${attachmentId}/amend`,
  SERVICE_REQUEST_CREATE: `${V1}/services/requests`,
  SERVICE_CONTACT_DIRECTORY: `${V1}/services/contact-directory`,
  SERVICE_EXCUSED_ABSENCE_POLICY: `${V1}/services/excused-absence/policy`,
  SERVICE_SOCIAL_ALLOWANCE_REQUIREMENTS: `${V1}/services/social-allowance/requirements`,
  SERVICE_APPEAL_WINDOW: `${V1}/services/appeals/window`,

  // Admin
  ADMIN_ANALYTICS_ENGAGEMENT: `${V1}/admin/analytics/engagement`,
  ADMIN_ANALYTICS_RETENTION: `${V1}/admin/analytics/retention`,
  ADMIN_STUDENTS_AT_RISK: `${V1}/admin/students/at-risk`,
  ADMIN_STUDENT_INTERVENE: (studentId: string) => `${V1}/admin/students/${studentId}/intervene`,
  ADMIN_COMMUNICATIONS_SEND: `${V1}/admin/communications/send`,
  ADMIN_CONFIG_BRANDING: `${V1}/admin/config/branding`,
  ADMIN_INTEGRATIONS_STATUS: `${V1}/admin/integrations/status`,
  ADMIN_INTEGRATIONS_SYNC: `${V1}/admin/integrations/sync`,
} as const;
