import { Request, Response } from 'express';
import { AuthRequest } from '@masari/backend-shared';

export class SocialController {
  /** GET /api/v1/feed */
  getFeed = (_req: Request, res: Response): void => {
    res.json({
      success: true,
      data: [
        {
          id: 'post_001',
          author: {
            id: 'user_201',
            name_ar: 'فاطمة الزهراني',
            name_en: 'Fatimah Al-Zahrani',
            avatar_url: 'https://cdn.masari.sa/avatars/user_201.jpg',
          },
          content_ar: 'هل أحد حضر محاضرة الذكاء الاصطناعي اليوم؟ كانت رائعة! الدكتور شرح موضوع الشبكات العصبية بطريقة مبسطة جداً 🧠',
          content_en: 'Did anyone attend the AI lecture today? It was amazing! The professor explained neural networks in a very simplified way 🧠',
          type: 'text',
          likes_count: 24,
          comments_count: 7,
          created_at: '2026-04-08T09:30:00Z',
        },
        {
          id: 'post_002',
          author: {
            id: 'user_302',
            name_ar: 'عبدالله القحطاني',
            name_en: 'Abdullah Al-Qahtani',
            avatar_url: 'https://cdn.masari.sa/avatars/user_302.jpg',
          },
          content_ar: 'تذكير: آخر موعد لتسليم مشروع مادة هندسة البرمجيات يوم الخميس. من يبي يراجع معي في المكتبة؟',
          content_en: 'Reminder: Software Engineering project deadline is Thursday. Anyone want to review together at the library?',
          type: 'text',
          likes_count: 15,
          comments_count: 12,
          created_at: '2026-04-08T08:15:00Z',
        },
        {
          id: 'post_003',
          author: {
            id: 'club_cs',
            name_ar: 'نادي علوم الحاسب',
            name_en: 'Computer Science Club',
            avatar_url: 'https://cdn.masari.sa/avatars/club_cs.jpg',
          },
          content_ar: 'يسرنا دعوتكم لحضور هاكاثون الابتكار يوم السبت القادم في قاعة المؤتمرات. جوائز قيمة بانتظاركم! 🏆',
          content_en: 'We are pleased to invite you to the Innovation Hackathon next Saturday at the conference hall. Valuable prizes await you! 🏆',
          type: 'event',
          likes_count: 52,
          comments_count: 18,
          created_at: '2026-04-07T16:00:00Z',
        },
        {
          id: 'post_004',
          author: {
            id: 'user_145',
            name_ar: 'نورة السبيعي',
            name_en: 'Noura Al-Subaie',
            avatar_url: 'https://cdn.masari.sa/avatars/user_145.jpg',
          },
          content_ar: 'الحمدلله حصلت على تقدير ممتاز في مادة قواعد البيانات! شكراً لكل من ساعدني في المذاكرة 💪',
          content_en: 'Alhamdulillah I got an excellent grade in Database course! Thanks to everyone who helped me study 💪',
          type: 'text',
          likes_count: 87,
          comments_count: 23,
          created_at: '2026-04-07T14:20:00Z',
        },
      ],
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** POST /api/v1/feed */
  createPost = (req: Request, res: Response): void => {
    const user = (req as AuthRequest).user;
    const { content_ar, content_en, type } = req.body;

    res.status(201).json({
      success: true,
      data: {
        id: `post_${Date.now()}`,
        author: {
          id: user.sub || 'user_123',
          name_ar: 'المستخدم الحالي',
          name_en: 'Current User',
        },
        content_ar: content_ar || 'منشور جديد',
        content_en: content_en || 'New post',
        type: type || 'text',
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** GET /api/v1/messages */
  getMessages = (_req: Request, res: Response): void => {
    res.json({
      success: true,
      data: [
        {
          conversation_id: 'conv_001',
          participant: {
            id: 'user_201',
            name_ar: 'فاطمة الزهراني',
            name_en: 'Fatimah Al-Zahrani',
            avatar_url: 'https://cdn.masari.sa/avatars/user_201.jpg',
          },
          last_message: {
            content_ar: 'تمام، نتقابل في المكتبة الساعة ٤',
            content_en: 'OK, let\'s meet at the library at 4',
            sent_at: '2026-04-08T10:30:00Z',
            is_read: false,
          },
          unread_count: 2,
        },
        {
          conversation_id: 'conv_002',
          participant: {
            id: 'user_302',
            name_ar: 'عبدالله القحطاني',
            name_en: 'Abdullah Al-Qahtani',
            avatar_url: 'https://cdn.masari.sa/avatars/user_302.jpg',
          },
          last_message: {
            content_ar: 'شكراً على الملاحظات، راح أعدل التقرير',
            content_en: 'Thanks for the notes, I\'ll update the report',
            sent_at: '2026-04-08T09:15:00Z',
            is_read: true,
          },
          unread_count: 0,
        },
        {
          conversation_id: 'conv_003',
          participant: {
            id: 'user_145',
            name_ar: 'نورة السبيعي',
            name_en: 'Noura Al-Subaie',
            avatar_url: 'https://cdn.masari.sa/avatars/user_145.jpg',
          },
          last_message: {
            content_ar: 'هل عندك ملخص الفصل الخامس؟',
            content_en: 'Do you have the Chapter 5 summary?',
            sent_at: '2026-04-07T20:00:00Z',
            is_read: true,
          },
          unread_count: 0,
        },
      ],
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** POST /api/v1/messages/:userId */
  sendMessage = (req: Request, res: Response): void => {
    const { userId } = req.params;
    const { content_ar, content_en } = req.body;

    res.status(201).json({
      success: true,
      data: {
        message_id: `msg_${Date.now()}`,
        conversation_id: `conv_${userId}`,
        content_ar: content_ar || 'رسالة جديدة',
        content_en: content_en || 'New message',
        sent_at: new Date().toISOString(),
        status: 'sent',
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };
}
