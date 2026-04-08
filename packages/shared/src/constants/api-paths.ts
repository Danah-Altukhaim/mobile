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

  // Payments
  PAYMENT_INITIATE: `${V1}/payments/initiate`,
  PAYMENT_WEBHOOK: `${V1}/payments/webhook`,
  PAYMENT_RECEIPT: (paymentId: string) => `${V1}/payments/${paymentId}/receipt`,

  // AI
  AI_CHAT: `${V1}/ai/chat`,
  AI_CHAT_HISTORY: (conversationId: string) => `${V1}/ai/chat/${conversationId}`,

  // Campus
  EVENTS: `${V1}/events`,
  EVENT_RSVP: (eventId: string) => `${V1}/events/${eventId}/rsvp`,
  CLUBS: `${V1}/clubs`,
  CLUB_JOIN: (clubId: string) => `${V1}/clubs/${clubId}/join`,

  // Notifications
  NOTIFICATION_PREFERENCES: `${V1}/notifications/preferences`,

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
