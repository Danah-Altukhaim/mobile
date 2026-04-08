import { Response } from 'express';
import type { AuthRequest } from '@masari/backend-shared';
import { aiQueries } from '@masari/backend-shared';
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
      const lang = language || 'ar';

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

      // Get or create conversation
      let conversation: any;
      if (conversation_id) {
        conversation = await aiQueries.getConversation(conversation_id);
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
      } else {
        conversation = await aiQueries.createConversation(req.user.id);
      }

      const now = new Date().toISOString();

      // Append user message
      await aiQueries.appendMessage(conversation.id, {
        role: 'user',
        content: message,
        timestamp: now,
      });

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
        assistantContent = buildMockResponse(message, lang);
      }

      const assistantTimestamp = new Date().toISOString();

      // Append assistant message
      await aiQueries.appendMessage(conversation.id, {
        role: 'assistant',
        content: assistantContent,
        timestamp: assistantTimestamp,
        model: modelUsed,
      });

      // Update conversation metadata
      await aiQueries.updateConversationMeta(conversation.id, {
        model_used: modelUsed,
        tokens_input: tokensInput,
        tokens_output: tokensOutput,
      });

      res.json({
        success: true,
        data: {
          conversation_id: conversation.id,
          message: {
            role: 'assistant',
            content: assistantContent,
            timestamp: assistantTimestamp,
          },
          suggested_prompts: SUGGESTED_PROMPTS,
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
