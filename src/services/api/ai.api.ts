import { API_PATHS } from '@masari/shared';
import type { AIChatRequest, AIChatResponse, AIConversation } from '@masari/shared';
import { apiClient } from './client';

export const aiApi = {
  sendMessage: (data: AIChatRequest) =>
    apiClient.post<AIChatResponse>(API_PATHS.AI_CHAT, data),

  getConversation: (conversationId: string) =>
    apiClient.get<AIConversation>(API_PATHS.AI_CHAT_HISTORY(conversationId)),

  getCourseRecommendations: () =>
    apiClient.get<any[]>(API_PATHS.AI_COURSE_RECOMMENDATIONS),
};
