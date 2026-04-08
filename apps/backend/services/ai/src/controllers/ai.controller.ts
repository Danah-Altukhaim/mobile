import { Response } from 'express';
import crypto from 'crypto';
import type { AuthRequest } from '@masari/backend-shared';

export class AIController {
  /** POST /api/v1/ai/chat */
  chat = (req: AuthRequest, res: Response): void => {
    const { message, conversation_id, language } = req.body;

    if (!message) {
      res.status(400).json({
        success: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            message_ar: 'الرسالة مطلوبة',
            message_en: 'message is required',
          },
        ],
      });
      return;
    }

    const conversationId = conversation_id || `conv_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const lang = language || 'ar';

    // Mock AI response based on language
    const mockResponse = lang === 'ar'
      ? `أهلاً! بناءً على سؤالك "${message}"، هذي المعلومات اللي عندي:\n\nعندك ٤ مواد هالفصل بإجمالي ١٢ ساعة. معدلك التراكمي ٣.٤٥ وأداؤك ممتاز في مادة هندسة البرمجيات المتقدمة. تبي تعرف تفاصيل أكثر عن أي مادة؟`
      : `Hi! Based on your question "${message}", here's what I found:\n\nYou have 4 courses this semester totaling 12 credit hours. Your cumulative GPA is 3.45 and you're performing excellently in Advanced Software Engineering. Would you like more details about any course?`;

    res.json({
      success: true,
      data: {
        conversation_id: conversationId,
        message_id: `msg_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
        response: mockResponse,
        language: lang,
        suggested_prompts: [
          {
            text_ar: 'ما جدولي بكرة؟',
            text_en: "What's my schedule tomorrow?",
          },
          {
            text_ar: 'كم باقي علي؟',
            text_en: 'How much do I owe?',
          },
          {
            text_ar: 'وش المواد اللي أقدر أسجلها؟',
            text_en: 'What courses can I register for?',
          },
          {
            text_ar: 'كم نسبة حضوري؟',
            text_en: 'What is my attendance percentage?',
          },
        ],
        sources: [
          {
            type: 'academic_record',
            label_ar: 'السجل الأكاديمي',
            label_en: 'Academic Record',
          },
        ],
      },
      meta: {
        synced_at: new Date().toISOString(),
        model: 'masari-ai-stub-v1',
        note: 'This is a Node.js mock. Production service will use Python/FastAPI.',
      },
    });
  };

  /** GET /api/v1/ai/chat/:conversationId */
  getConversation = (req: AuthRequest, res: Response): void => {
    const { conversationId } = req.params;

    res.json({
      success: true,
      data: {
        conversation_id: conversationId,
        created_at: '2026-04-08T10:00:00Z',
        updated_at: '2026-04-08T10:05:00Z',
        messages: [
          {
            id: 'msg_001',
            role: 'user',
            content: 'ما جدولي بكرة؟',
            timestamp: '2026-04-08T10:00:00Z',
          },
          {
            id: 'msg_002',
            role: 'assistant',
            content: 'جدولك يوم الخميس ٩ أبريل:\n\n١. هندسة البرمجيات المتقدمة (SWE 481) - ٨:٠٠ ص إلى ٩:٢٠ ص - مبنى ٦ قاعة ٢٠٣\n٢. اختبار البرمجيات وضمان الجودة (SWE 466) - ٩:٣٠ ص إلى ١٠:٥٠ ص - مبنى ٦ معمل ١٠٥\n\nعندك محاضرتين بكرة. تبي أذكرك قبل المحاضرة؟',
            timestamp: '2026-04-08T10:00:02Z',
          },
          {
            id: 'msg_003',
            role: 'user',
            content: 'كم باقي علي من الرسوم؟',
            timestamp: '2026-04-08T10:03:00Z',
          },
          {
            id: 'msg_004',
            role: 'assistant',
            content: 'باقي عليك ١٢,٥٠٠ ريال من رسوم الفصل الدراسي. التفاصيل:\n\n- رسوم الفصل: ٢٥,٠٠٠ ريال (مدفوع ١٢,٥٠٠)\n- رسوم المكتبة: ٥٠٠ ريال (مدفوعة)\n- رسوم النشاط: ١,٠٠٠ ريال (غير مدفوعة - آخر موعد ٣٠ أبريل)\n\nتبي تسدد الآن؟ أقدر أوجهك لصفحة الدفع.',
            timestamp: '2026-04-08T10:03:03Z',
          },
        ],
        suggested_prompts: [
          {
            text_ar: 'ما جدولي بكرة؟',
            text_en: "What's my schedule tomorrow?",
          },
          {
            text_ar: 'كم باقي علي؟',
            text_en: 'How much do I owe?',
          },
          {
            text_ar: 'وش المواد اللي أقدر أسجلها؟',
            text_en: 'What courses can I register for?',
          },
        ],
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };
}
