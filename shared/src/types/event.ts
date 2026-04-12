export interface Event {
  id: string;
  university_id: string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  start_time: string;
  end_time: string;
  location: string;
  location_lat: number | null;
  location_lng: number | null;
  organizer_id: string;
  organizer_name_ar: string;
  organizer_name_en: string;
  organizer_type: 'club' | 'department' | 'university';
  capacity: number | null;
  rsvp_count: number;
  image_url: string | null;
  category: string;
  is_rsvped: boolean;
  created_at: string;
  updated_at: string;
}

export interface Club {
  id: string;
  university_id: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  category: string;
  advisor_id: string | null;
  advisor_name_ar: string | null;
  advisor_name_en: string | null;
  member_count: number;
  logo_url: string | null;
  status: 'active' | 'inactive' | 'pending';
  is_member: boolean;
  created_at: string;
  updated_at: string;
}
