export interface AIConversation {
  id: string;
  student_id: string;
  messages: AIMessage[];
  model_used: string;
  tokens_input: number;
  tokens_output: number;
  confidence_score: number | null;
  escalated: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  sources?: AISource[];
}

export interface AISource {
  document_title: string;
  section: string;
  url: string | null;
}

export interface AIChatRequest {
  message: string;
  conversation_id?: string;
  language?: 'ar' | 'en';
}

export interface AIChatResponse {
  conversation_id: string;
  message: AIMessage;
  suggested_prompts: string[];
  confidence_score: number;
  model_tier: 'budget' | 'standard' | 'premium';
  detected_language: 'ar' | 'en';
  can_escalate: boolean;
}

export interface CourseRecommendation {
  id: string;
  course_code: string;
  name_ar: string;
  name_en: string;
  credits: number;
  reason_ar: string;
  reason_en: string;
  match_score: number;
  historical_grade_avg: string;
  workload_level: 'light' | 'moderate' | 'heavy';
  schedule: string;
  seats_available: number;
  total_seats: number;
  prerequisites: string[];
}

export interface RiskAlert {
  id: string;
  student_id: string;
  student_name_ar: string;
  student_name_en: string;
  student_number: string;
  risk_score: number;
  risk_level: 'critical' | 'warning' | 'watch';
  contributing_factors: RiskFactor[];
  status: 'active' | 'resolved' | 'escalated';
  assigned_advisor_id: string | null;
  interventions: Intervention[];
  created_at: string;
  updated_at: string;
}

export interface RiskFactor {
  type: 'attendance' | 'grades' | 'lms_engagement' | 'payment' | 'app_usage';
  description_ar: string;
  description_en: string;
  weight: number;
}

export interface Intervention {
  id: string;
  advisor_id: string;
  action: 'message' | 'meeting' | 'counseling_referral' | 'parent_contact' | 'custom';
  notes: string;
  outcome: 'resolved' | 'ongoing' | 'escalated' | 'withdrew' | null;
  created_at: string;
}
