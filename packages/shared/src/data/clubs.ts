// CCK student clubs. Source: Student Life Department.docx.
// Students request to join via the app; requests route to the club advisor,
// then Student Life follows up.
import type { StudentClub } from '../types/reference';

export const STUDENT_CLUBS: StudentClub[] = [
  { slug: 'media', name_en: 'Media Club', name_ar: 'نادي الإعلام' },
  { slug: 'community', name_en: 'Community Club', name_ar: 'نادي المجتمع' },
  { slug: 'student-workers', name_en: 'Student Workers Club', name_ar: 'نادي الطلبة العاملين' },
  { slug: 'computer-science', name_en: 'Computer Science Club', name_ar: 'نادي علوم الحاسوب' },
  { slug: 'debate', name_en: 'Debate Club', name_ar: 'نادي المناظرات' },
];
