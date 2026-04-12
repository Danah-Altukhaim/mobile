export interface EngagementAnalytics {
  period: string;
  dau: number;
  mau: number;
  dau_mau_ratio: number;
  avg_session_duration_seconds: number;
  feature_usage: Record<string, number>;
  trends: {
    date: string;
    active_users: number;
  }[];
}

export interface RetentionAnalytics {
  total_students: number;
  at_risk_count: number;
  at_risk_by_level: {
    critical: number;
    warning: number;
    watch: number;
  };
  retention_rate: number;
  previous_retention_rate: number;
  interventions_this_month: number;
  resolved_this_month: number;
}

export interface CommunicationRequest {
  title_ar: string;
  title_en: string;
  body_ar: string;
  body_en: string;
  target_segment: {
    cohort_years?: number[];
    majors?: string[];
    enrollment_status?: string[];
    custom_student_ids?: string[];
  };
  scheduled_at?: string;
}

export interface BrandingConfig {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string | null;
  app_name_ar: string;
  app_name_en: string;
}

export interface IntegrationStatus {
  integrations: {
    name: string;
    type: 'sis' | 'lms' | 'payment' | 'identity';
    status: 'connected' | 'error' | 'syncing' | 'disconnected';
    last_sync: string | null;
    records_synced: number;
    errors: {
      message: string;
      timestamp: string;
    }[];
  }[];
}

export type AdminRole = 'super_admin' | 'university_admin' | 'advisor' | 'staff';

export interface AdminUser {
  id: string;
  email: string;
  name_ar: string;
  name_en: string;
  role: AdminRole;
  status: 'active' | 'inactive';
  created_at: string;
  last_login: string | null;
}

export interface StudentImportResult {
  import_id: string;
  total_records: number;
  successful: number;
  failed: number;
  errors: { row: number; message_ar: string; message_en: string }[];
  status: 'completed' | 'partial' | 'failed';
}
