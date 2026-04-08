import { Response } from 'express';
import type { AuthRequest } from '@masari/backend-shared';

export class CampusController {
  /** GET /api/v1/events */
  getEvents = (_req: AuthRequest, res: Response): void => {
    res.json({
      success: true,
      data: [
        {
          id: 'EVT-001',
          title_ar: 'هاكاثون الابتكار التقني ٢٠٢٦',
          title_en: 'Tech Innovation Hackathon 2026',
          description_ar: 'هاكاثون على مدار ٤٨ ساعة لتطوير حلول تقنية مبتكرة. جوائز قيمتها ٥٠,٠٠٠ ريال.',
          description_en: '48-hour hackathon to develop innovative tech solutions. Prizes worth 50,000 SAR.',
          date: '2026-04-20T09:00:00Z',
          end_date: '2026-04-22T09:00:00Z',
          location_ar: 'مركز الابتكار - مبنى ١٢',
          location_en: 'Innovation Center - Building 12',
          organizer_ar: 'نادي البرمجة',
          organizer_en: 'Programming Club',
          rsvp_count: 87,
          max_capacity: 150,
          is_registered: false,
          tags: ['hackathon', 'tech', 'competition'],
        },
        {
          id: 'EVT-002',
          title_ar: 'ملتقى التوظيف السنوي',
          title_en: 'Annual Career Fair',
          description_ar: 'ملتقى يجمع أكثر من ٣٠ شركة تقنية رائدة. فرصتك للتعرف على سوق العمل والتقديم المباشر.',
          description_en: 'Career fair featuring 30+ leading tech companies. Your chance to explore the job market and apply directly.',
          date: '2026-04-25T10:00:00Z',
          end_date: '2026-04-25T16:00:00Z',
          location_ar: 'قاعة المؤتمرات الرئيسية',
          location_en: 'Main Conference Hall',
          organizer_ar: 'عمادة شؤون الطلاب',
          organizer_en: 'Deanship of Student Affairs',
          rsvp_count: 245,
          max_capacity: 500,
          is_registered: true,
          tags: ['career', 'networking', 'jobs'],
        },
        {
          id: 'EVT-003',
          title_ar: 'ورشة عمل: مقدمة في الذكاء الاصطناعي التوليدي',
          title_en: 'Workshop: Introduction to Generative AI',
          description_ar: 'ورشة عملية عن أساسيات الذكاء الاصطناعي التوليدي واستخداماته في المشاريع البرمجية.',
          description_en: 'Hands-on workshop on generative AI fundamentals and their applications in software projects.',
          date: '2026-04-15T13:00:00Z',
          end_date: '2026-04-15T16:00:00Z',
          location_ar: 'مبنى ٦ - معمل ٢٠١',
          location_en: 'Building 6 - Lab 201',
          organizer_ar: 'نادي الذكاء الاصطناعي',
          organizer_en: 'AI Club',
          rsvp_count: 42,
          max_capacity: 50,
          is_registered: false,
          tags: ['workshop', 'ai', 'hands-on'],
        },
        {
          id: 'EVT-004',
          title_ar: 'بطولة كرة القدم بين الكليات',
          title_en: 'Inter-College Football Tournament',
          description_ar: 'البطولة السنوية لكرة القدم بين كليات الجامعة. تعال وشجع كليتك!',
          description_en: 'Annual football tournament between university colleges. Come support your college!',
          date: '2026-04-18T15:00:00Z',
          end_date: '2026-04-18T19:00:00Z',
          location_ar: 'الملعب الرئيسي',
          location_en: 'Main Stadium',
          organizer_ar: 'النادي الرياضي',
          organizer_en: 'Sports Club',
          rsvp_count: 320,
          max_capacity: 1000,
          is_registered: false,
          tags: ['sports', 'football', 'tournament'],
        },
      ],
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** POST /api/v1/events/:id/rsvp */
  rsvpEvent = (req: AuthRequest, res: Response): void => {
    const { id } = req.params;

    res.json({
      success: true,
      data: {
        event_id: id,
        rsvp_count: 88,
        message_ar: 'تم تسجيلك في الفعالية بنجاح',
        message_en: 'Successfully registered for the event',
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** GET /api/v1/clubs */
  getClubs = (_req: AuthRequest, res: Response): void => {
    res.json({
      success: true,
      data: [
        {
          id: 'CLB-001',
          name_ar: 'نادي البرمجة',
          name_en: 'Programming Club',
          description_ar: 'نادي متخصص في تطوير المهارات البرمجية وإقامة المسابقات والهاكاثونات.',
          description_en: 'A club focused on developing programming skills and organizing competitions and hackathons.',
          member_count: 156,
          category_ar: 'تقنية',
          category_en: 'Technology',
          is_member: true,
          logo_url: '/assets/clubs/programming.png',
          president_ar: 'عبدالرحمن الغامدي',
          president_en: 'Abdulrahman Al-Ghamdi',
        },
        {
          id: 'CLB-002',
          name_ar: 'نادي الذكاء الاصطناعي',
          name_en: 'AI Club',
          description_ar: 'نادي يهتم بأبحاث وتطبيقات الذكاء الاصطناعي وتعلم الآلة.',
          description_en: 'A club interested in AI and machine learning research and applications.',
          member_count: 89,
          category_ar: 'تقنية',
          category_en: 'Technology',
          is_member: false,
          logo_url: '/assets/clubs/ai.png',
          president_ar: 'ريم بنت سلطان المطيري',
          president_en: 'Reem Al-Mutairi',
        },
        {
          id: 'CLB-003',
          name_ar: 'نادي ريادة الأعمال',
          name_en: 'Entrepreneurship Club',
          description_ar: 'نادي يدعم رواد الأعمال الطلاب ويقدم ورش عمل وبرامج احتضان.',
          description_en: 'A club supporting student entrepreneurs with workshops and incubation programs.',
          member_count: 112,
          category_ar: 'أعمال',
          category_en: 'Business',
          is_member: false,
          logo_url: '/assets/clubs/entrepreneurship.png',
          president_ar: 'فيصل بن عبدالله العنزي',
          president_en: 'Faisal Al-Anazi',
        },
        {
          id: 'CLB-004',
          name_ar: 'النادي الرياضي',
          name_en: 'Sports Club',
          description_ar: 'نادي ينظم الأنشطة والبطولات الرياضية المختلفة على مستوى الجامعة.',
          description_en: 'A club organizing various sports activities and tournaments across the university.',
          member_count: 234,
          category_ar: 'رياضة',
          category_en: 'Sports',
          is_member: true,
          logo_url: '/assets/clubs/sports.png',
          president_ar: 'تركي بن محمد الشهراني',
          president_en: 'Turki Al-Shahrani',
        },
      ],
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** POST /api/v1/clubs/:id/join */
  joinClub = (req: AuthRequest, res: Response): void => {
    const { id } = req.params;

    res.json({
      success: true,
      data: {
        club_id: id,
        member_count: 90,
        message_ar: 'تم انضمامك للنادي بنجاح',
        message_en: 'Successfully joined the club',
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };
}
