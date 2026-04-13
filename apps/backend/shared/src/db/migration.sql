-- Masari Initial Schema
-- All tables use UUID PKs, university_id for multi-tenancy, and soft deletes

CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE enrollment_status AS ENUM ('enrolled', 'dropped', 'withdrawn', 'completed', 'suspended');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'excused', 'late');
CREATE TYPE risk_level AS ENUM ('critical', 'warning', 'watch');
CREATE TYPE assignment_type AS ENUM ('homework', 'quiz', 'exam', 'project');
CREATE TYPE term_type AS ENUM ('fall', 'spring', 'summer');
CREATE TYPE club_status AS ENUM ('active', 'inactive', 'pending');

-- Universities
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('KW', 'SA', 'AE', 'BH', 'QA', 'OM')),
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#1B4D3E',
  secondary_color TEXT NOT NULL DEFAULT '#D4AF37',
  font_family TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kuwait',
  currency TEXT NOT NULL DEFAULT 'KWD',
  sso_provider TEXT NOT NULL DEFAULT 'saml',
  sso_config JSONB NOT NULL DEFAULT '{}',
  modules_enabled TEXT[] NOT NULL DEFAULT ARRAY['academics', 'payments', 'campus', 'ai'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id),
  student_number TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  major_id TEXT,
  major_name_ar TEXT,
  major_name_en TEXT,
  cohort_year INTEGER NOT NULL,
  enrollment_status enrollment_status NOT NULL DEFAULT 'enrolled',
  gpa_cumulative NUMERIC(3,2),
  avatar_url TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'ar',
  password_hash TEXT, -- for fallback auth; SSO is primary
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (university_id, student_number),
  UNIQUE (university_id, email)
);

-- Terms
CREATE TABLE terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_start DATE NOT NULL,
  registration_end DATE NOT NULL,
  type term_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id),
  code TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  department_id TEXT,
  credit_hours INTEGER NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  prerequisites TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (university_id, code)
);

-- Sections
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id),
  term_id UUID NOT NULL REFERENCES terms(id),
  instructor_id TEXT,
  instructor_name_ar TEXT,
  instructor_name_en TEXT,
  schedule_slots JSONB NOT NULL DEFAULT '[]',
  room TEXT,
  capacity INTEGER NOT NULL DEFAULT 30,
  enrolled_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Enrollments
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id),
  section_id UUID NOT NULL REFERENCES sections(id),
  term_id UUID NOT NULL REFERENCES terms(id),
  status enrollment_status NOT NULL DEFAULT 'enrolled',
  grade TEXT,
  grade_points NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (student_id, section_id)
);

-- Attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id),
  session_date DATE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'present',
  source TEXT NOT NULL DEFAULT 'sis',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (enrollment_id, session_date)
);

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES sections(id),
  lms_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  max_score NUMERIC(6,2) NOT NULL,
  type assignment_type NOT NULL DEFAULT 'homework',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Fees
CREATE TABLE fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id),
  term_id UUID NOT NULL REFERENCES terms(id),
  type TEXT NOT NULL CHECK (type IN ('tuition', 'lab', 'housing', 'meal', 'registration', 'other')),
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  amount NUMERIC(10,3) NOT NULL,
  due_date DATE NOT NULL,
  paid_amount NUMERIC(10,3) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KWD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id),
  term_id UUID NOT NULL REFERENCES terms(id),
  amount NUMERIC(10,3) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KWD',
  status payment_status NOT NULL DEFAULT 'pending',
  method TEXT,
  tap_reference TEXT UNIQUE,
  description TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location_ar TEXT NOT NULL,
  location_en TEXT NOT NULL,
  location_lat NUMERIC(9,6),
  location_lng NUMERIC(9,6),
  organizer_id TEXT,
  organizer_name_ar TEXT,
  organizer_name_en TEXT,
  organizer_type TEXT NOT NULL DEFAULT 'university',
  capacity INTEGER,
  rsvp_count INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Event RSVPs
CREATE TABLE event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id),
  student_id UUID NOT NULL REFERENCES students(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, student_id)
);

-- Clubs
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  advisor_id TEXT,
  advisor_name_ar TEXT,
  advisor_name_en TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  logo_url TEXT,
  status club_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Club memberships
CREATE TABLE club_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES clubs(id),
  student_id UUID NOT NULL REFERENCES students(id),
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (club_id, student_id)
);

-- AI Conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id),
  messages JSONB NOT NULL DEFAULT '[]',
  model_used TEXT,
  tokens_input INTEGER NOT NULL DEFAULT 0,
  tokens_output INTEGER NOT NULL DEFAULT 0,
  confidence_score NUMERIC(3,2),
  escalated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Risk Alerts
CREATE TABLE risk_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id),
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  risk_level risk_level NOT NULL,
  contributing_factors JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated')),
  assigned_advisor_id TEXT,
  interventions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Embeddings (for RAG)
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id),
  document_title TEXT NOT NULL,
  section TEXT,
  content TEXT NOT NULL,
  embedding vector(1024),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops);

-- Admin users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id),
  email TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('super_admin', 'university_admin', 'advisor', 'staff')),
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (university_id, email)
);

-- Indexes
CREATE INDEX idx_students_university ON students(university_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_term ON enrollments(term_id);
CREATE INDEX idx_fees_student_term ON fees(student_id, term_id);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_events_university ON events(university_id, start_time);
CREATE INDEX idx_clubs_university ON clubs(university_id);
CREATE INDEX idx_ai_conversations_student ON ai_conversations(student_id);
CREATE INDEX idx_risk_alerts_student ON risk_alerts(student_id);
CREATE INDEX idx_risk_alerts_status ON risk_alerts(status);
CREATE INDEX idx_attendance_enrollment ON attendance(enrollment_id);
CREATE INDEX idx_assignments_section ON assignments(section_id);
