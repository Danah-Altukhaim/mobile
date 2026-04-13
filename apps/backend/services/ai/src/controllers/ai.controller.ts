import { Response } from 'express';
import type { AuthRequest } from '@masari/backend-shared';
import { aiQueries, isDbAvailable } from '@masari/backend-shared';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT =
  'You are a university academic advisor at a GCC university. Respond in Arabic by default. ' +
  'Help students with schedule questions, grade inquiries, degree planning, and campus life. ' +
  'Be warm and encouraging. If you\'re not sure about specific university policies, say so and suggest they check with their advisor.';

const SUGGESTED_PROMPTS = [
  { text_ar: 'ما جدولي بكرة؟', text_en: "What's my schedule tomorrow?" },
  { text_ar: 'كم باقي علي؟', text_en: 'How much do I owe?' },
  { text_ar: 'وش المواد اللي أقدر أسجلها؟', text_en: 'What courses can I register for?' },
  { text_ar: 'كيف أرفع معدلي؟', text_en: 'How can I improve my GPA?' },
];

const MOCK_SOURCES = [
  { document_title: 'دليل السياسات الأكاديمية', section: 'القسم ٤.٢ - نظام الدرجات', url: null },
  { document_title: 'Academic Policy Manual', section: 'Section 4.2 - Grading System', url: null },
];

const MOCK_NUDGES = [
  {
    id: 'nudge-001',
    type: 'deadline',
    title_ar: 'تذكير: واجب البرمجة',
    title_en: 'Reminder: Programming Assignment',
    body_ar: 'موعد تسليم واجب CS101 بعد ٣ أيام',
    body_en: 'CS101 assignment due in 3 days',
    priority: 'high',
    action: 'open_assignments',
    created_at: new Date().toISOString(),
  },
  {
    id: 'nudge-002',
    type: 'registration',
    title_ar: 'نافذة التسجيل مفتوحة',
    title_en: 'Registration Window Open',
    body_ar: 'تسجيل الفصل الصيفي يبدأ قريباً. هل تحتاج مساعدة في اختيار المواد؟',
    body_en: 'Summer registration starts soon. Need help choosing courses?',
    priority: 'medium',
    action: 'open_registration',
    created_at: new Date().toISOString(),
  },
  {
    id: 'nudge-003',
    type: 'gpa_tip',
    title_ar: 'نصيحة لتحسين المعدل',
    title_en: 'GPA Improvement Tip',
    body_ar: 'بناءً على أدائك، التركيز على ENG102 يمكن أن يرفع معدلك بمقدار 0.1',
    body_en: 'Based on your performance, focusing on ENG102 could raise your GPA by 0.1',
    priority: 'low',
    action: 'open_grades',
    created_at: new Date().toISOString(),
  },
];

const MOCK_COURSE_RECOMMENDATIONS = [
  {
    id: 'rec-001',
    course_code: 'CS201',
    name_ar: 'هياكل البيانات',
    name_en: 'Data Structures',
    credits: 3,
    reason_ar: 'مطلوبة لتخصصك وحصلت على A- في المتطلب السابق CS101',
    reason_en: 'Required for your major and you got A- in prerequisite CS101',
    match_score: 95,
    historical_grade_avg: 'B+',
    workload_level: 'moderate' as const,
    schedule: 'Sun/Tue 10:00-11:30',
    seats_available: 12,
    total_seats: 35,
    prerequisites: ['CS101'],
  },
  {
    id: 'rec-002',
    course_code: 'MATH301',
    name_ar: 'الإحصاء',
    name_en: 'Statistics',
    credits: 3,
    reason_ar: 'مطلوبة للتخرج وتكمل مهارات MATH201 اللي خلصتها',
    reason_en: 'Required for graduation and builds on your completed MATH201',
    match_score: 88,
    historical_grade_avg: 'B',
    workload_level: 'moderate' as const,
    schedule: 'Sun/Tue 12:00-13:30',
    seats_available: 20,
    total_seats: 40,
    prerequisites: ['MATH201'],
  },
  {
    id: 'rec-003',
    course_code: 'CS202',
    name_ar: 'قواعد البيانات',
    name_en: 'Database Systems',
    credits: 3,
    reason_ar: 'طلاب بنفس مسارك الأكاديمي حققوا نتائج ممتازة في هذه المادة',
    reason_en: 'Students with similar academic profiles achieved excellent results',
    match_score: 82,
    historical_grade_avg: 'B+',
    workload_level: 'heavy' as const,
    schedule: 'Mon/Wed 14:00-15:30',
    seats_available: 5,
    total_seats: 30,
    prerequisites: ['CS101'],
  },
  {
    id: 'rec-004',
    course_code: 'GEN105',
    name_ar: 'مهارات التواصل',
    name_en: 'Communication Skills',
    credits: 3,
    reason_ar: 'مادة خفيفة تساعد في موازنة حمل الفصل الدراسي',
    reason_en: 'Light course to balance semester workload',
    match_score: 75,
    historical_grade_avg: 'A-',
    workload_level: 'light' as const,
    schedule: 'Mon/Wed 10:00-11:30',
    seats_available: 22,
    total_seats: 40,
    prerequisites: [],
  },
];

/** Detect language from message text */
function detectLanguage(text: string): 'ar' | 'en' {
  const arabicChars = text.match(/[\u0600-\u06FF]/g);
  const totalChars = text.replace(/\s/g, '').length;
  if (!totalChars) return 'ar';
  return (arabicChars && arabicChars.length / totalChars > 0.3) ? 'ar' : 'en';
}

/** Classify query complexity for model routing */
function classifyQueryTier(message: string): 'budget' | 'standard' | 'premium' {
  const lower = message.toLowerCase();
  // Simple lookups → budget tier
  const simplePatterns = ['schedule', 'جدول', 'prayer', 'صلاة', 'owe', 'باقي', 'balance', 'رصيد'];
  if (simplePatterns.some((p) => lower.includes(p))) return 'budget';
  // Complex advising → premium tier
  const complexPatterns = ['degree plan', 'خطة التخرج', 'improve gpa', 'أرفع معدل', 'recommend', 'أنسب', 'career', 'مسار'];
  if (complexPatterns.some((p) => lower.includes(p))) return 'premium';
  return 'standard';
}

/** Mock confidence score based on query type */
function computeConfidence(message: string, tier: string): number {
  if (tier === 'budget') return 92 + Math.floor(Math.random() * 6); // 92-97
  if (tier === 'standard') return 78 + Math.floor(Math.random() * 12); // 78-89
  return 65 + Math.floor(Math.random() * 15); // 65-79 (may trigger escalation)
}

function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function buildMockResponse(message: string, language: string): string {
  if (language === 'ar') {
    return `أهلاً! بناءً على سؤالك "${message}"، هذي المعلومات اللي عندي:\n\nعندك ٤ مواد هالفصل بإجمالي ١٢ ساعة. معدلك التراكمي ٣.٤٥ وأداؤك ممتاز في مادة هندسة البرمجيات المتقدمة. تبي تعرف تفاصيل أكثر عن أي مادة؟`;
  }
  return `Hi! Based on your question "${message}", here's what I found:\n\nYou have 4 courses this semester totaling 12 credit hours. Your cumulative GPA is 3.45 and you're performing excellently in Advanced Software Engineering. Would you like more details about any course?`;
}

export class AIController {
  /** POST /api/v1/ai/chat */
  chat = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { message, conversation_id, language } = req.body;
      const detectedLang = language || detectLanguage(message || '');
      const modelTier = classifyQueryTier(message || '');

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

      // Get or create conversation (with DB fallback)
      let conversation: any;
      let useDbPersistence = isDbAvailable();
      const now = new Date().toISOString();

      if (useDbPersistence) {
        try {
          if (conversation_id) {
            conversation = await aiQueries.getConversation(conversation_id);
            if (!conversation || conversation.student_id !== req.user.id) {
              conversation = await aiQueries.createConversation(req.user.id);
            }
          } else {
            conversation = await aiQueries.createConversation(req.user.id);
          }
          await aiQueries.appendMessage(conversation.id, { role: 'user', content: message, timestamp: now });
        } catch {
          useDbPersistence = false;
          conversation = { id: `mock-conv-${Date.now()}`, messages: [] };
        }
      } else {
        conversation = { id: conversation_id || `mock-conv-${Date.now()}`, messages: [] };
      }

      // Build assistant response
      let assistantContent: string;
      let tokensInput = 0;
      let tokensOutput = 0;
      let modelUsed = 'mock-v1';

      const client = getAnthropicClient();

      if (client) {
        // Real Claude API call
        const history = Array.isArray(conversation.messages) ? conversation.messages : [];
        const apiMessages: Anthropic.MessageParam[] = [
          ...history.map((m: any) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          { role: 'user', content: message },
        ];

        const response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        });

        const textBlock = response.content.find((b) => b.type === 'text');
        assistantContent = textBlock ? textBlock.text : '';
        tokensInput = response.usage.input_tokens;
        tokensOutput = response.usage.output_tokens;
        modelUsed = response.model;
      } else {
        // Fallback mock response
        assistantContent = buildMockResponse(message, detectedLang);
      }

      const confidenceScore = computeConfidence(message, modelTier);
      const canEscalate = confidenceScore < 70;

      // Add source attribution for non-trivial responses
      const sources = modelTier !== 'budget'
        ? [detectedLang === 'ar' ? MOCK_SOURCES[0] : MOCK_SOURCES[1]]
        : [];

      // If low confidence, append escalation note
      if (canEscalate) {
        const escalationNote = detectedLang === 'ar'
          ? '\n\n⚠️ لست متأكداً تماماً من هذه الإجابة. هل تحب أحوّلك لمستشار أكاديمي؟'
          : '\n\n⚠️ I\'m not fully confident in this answer. Would you like me to connect you with a human advisor?';
        assistantContent += escalationNote;
      }

      const assistantTimestamp = new Date().toISOString();

      // Persist to DB if available
      if (useDbPersistence) {
        try {
          await aiQueries.appendMessage(conversation.id, { role: 'assistant', content: assistantContent, timestamp: assistantTimestamp, model: modelUsed });
          await aiQueries.updateConversationMeta(conversation.id, { model_used: modelUsed, tokens_input: tokensInput, tokens_output: tokensOutput });
        } catch { /* DB unavailable, skip persistence */ }
      }

      res.json({
        success: true,
        data: {
          conversation_id: conversation.id,
          message: {
            role: 'assistant',
            content: assistantContent,
            timestamp: assistantTimestamp,
            sources,
          },
          suggested_prompts: SUGGESTED_PROMPTS,
          confidence_score: confidenceScore,
          model_tier: modelTier,
          detected_language: detectedLang,
          can_escalate: canEscalate,
        },
        meta: {
          synced_at: new Date().toISOString(),
          model: modelUsed,
        },
      });
    } catch (err: any) {
      console.error('[AI Chat] Error:', err);
      res.status(500).json({
        success: false,
        errors: [
          {
            code: 'INTERNAL_ERROR',
            message_ar: 'حدث خطأ أثناء معالجة الرسالة',
            message_en: 'An error occurred while processing the message',
          },
        ],
      });
    }
  };

  /** POST /api/v1/ai/escalate */
  escalate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { conversation_id, reason } = req.body;

      // Mock: In production this would create a ticket in the advisor queue
      res.json({
        success: true,
        data: {
          ticket_id: `esc-${Date.now()}`,
          conversation_id: conversation_id || 'unknown',
          status: 'queued',
          estimated_wait_ar: 'خلال ٢٤ ساعة',
          estimated_wait_en: 'Within 24 hours',
          message_ar: 'تم تحويل محادثتك لمستشار أكاديمي. سيتواصل معك قريباً.',
          message_en: 'Your conversation has been forwarded to an academic advisor. They will contact you soon.',
        },
      });
    } catch (err: any) {
      console.error('[AI Escalate] Error:', err);
      res.status(500).json({
        success: false,
        errors: [{ code: 'INTERNAL_ERROR', message_ar: 'حدث خطأ', message_en: 'An error occurred' }],
      });
    }
  };

  /** GET /api/v1/ai/course-recommendations */
  getCourseRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      res.json({
        success: true,
        data: MOCK_COURSE_RECOMMENDATIONS,
        meta: {
          synced_at: new Date().toISOString(),
          algorithm: 'collaborative_filtering_v1',
          student_profile_match: 'CS major, 3rd semester, GPA 3.45',
        },
      });
    } catch (err: any) {
      console.error('[AI CourseRecommendations] Error:', err);
      res.status(500).json({
        success: false,
        errors: [{ code: 'INTERNAL_ERROR', message_ar: 'حدث خطأ', message_en: 'An error occurred' }],
      });
    }
  };

  /** GET /api/v1/ai/nudges */
  getNudges = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      res.json({
        success: true,
        data: MOCK_NUDGES,
      });
    } catch (err: any) {
      console.error('[AI Nudges] Error:', err);
      res.status(500).json({
        success: false,
        errors: [{ code: 'INTERNAL_ERROR', message_ar: 'حدث خطأ', message_en: 'An error occurred' }],
      });
    }
  };

  /** GET /api/v1/ai/chat/:conversationId */
  getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { conversationId } = req.params;

      const conversation = await aiQueries.getConversation(conversationId);

      if (!conversation) {
        res.status(404).json({
          success: false,
          errors: [
            {
              code: 'NOT_FOUND',
              message_ar: 'المحادثة غير موجودة',
              message_en: 'Conversation not found',
            },
          ],
        });
        return;
      }

      if (conversation.student_id !== req.user.id) {
        res.status(403).json({
          success: false,
          errors: [
            {
              code: 'FORBIDDEN',
              message_ar: 'لا يمكنك الوصول لهذه المحادثة',
              message_en: 'You do not have access to this conversation',
            },
          ],
        });
        return;
      }

      res.json({
        success: true,
        data: {
          conversation_id: conversation.id,
          created_at: conversation.created_at,
          updated_at: conversation.updated_at,
          messages: conversation.messages || [],
          suggested_prompts: SUGGESTED_PROMPTS,
        },
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[AI GetConversation] Error:', err);
      res.status(500).json({
        success: false,
        errors: [
          {
            code: 'INTERNAL_ERROR',
            message_ar: 'حدث خطأ أثناء جلب المحادثة',
            message_en: 'An error occurred while fetching the conversation',
          },
        ],
      });
    }
  };
}
