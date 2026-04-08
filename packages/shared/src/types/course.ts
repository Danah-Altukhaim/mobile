export interface Course {
  id: string;
  university_id: string;
  code: string;
  name_ar: string;
  name_en: string;
  department_id: string;
  credit_hours: number;
  description_ar: string | null;
  description_en: string | null;
  prerequisites: string[];
  created_at: string;
  updated_at: string;
}

export interface ScheduleSlot {
  day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday';
  start_time: string;
  end_time: string;
  room: string;
}

export interface Section {
  id: string;
  course_id: string;
  course: Pick<Course, 'code' | 'name_ar' | 'name_en'>;
  term_id: string;
  instructor: {
    id: string;
    name_ar: string;
    name_en: string;
  };
  schedule_slots: ScheduleSlot[];
  room: string;
  capacity: number;
  enrolled_count: number;
  created_at: string;
  updated_at: string;
}

export interface Term {
  id: string;
  university_id: string;
  name_ar: string;
  name_en: string;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  type: 'fall' | 'spring' | 'summer';
  created_at: string;
  updated_at: string;
}
