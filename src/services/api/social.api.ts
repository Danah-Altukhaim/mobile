import { API_PATHS } from '@masari/shared';
import { apiClient } from './client';

export const socialApi = {
  getFeed: () => apiClient.get<any[]>(API_PATHS.SOCIAL_FEED),

  createPost: (data: { content_ar: string; content_en: string; type?: string }) =>
    apiClient.post<any>(API_PATHS.SOCIAL_CREATE_POST, data),

  getMessages: () => apiClient.get<any[]>(API_PATHS.SOCIAL_MESSAGES),

  getConversation: (conversationId: string) =>
    apiClient.get<any[]>(API_PATHS.SOCIAL_CONVERSATION(conversationId)),

  sendMessage: (userId: string, data: { content: string }) =>
    apiClient.post<any>(API_PATHS.SOCIAL_SEND_MESSAGE(userId), data),

  getStudyGroups: () => apiClient.get<any[]>(API_PATHS.SOCIAL_STUDY_GROUPS),

  joinStudyGroup: (groupId: string) =>
    apiClient.post<any>(API_PATHS.SOCIAL_JOIN_STUDY_GROUP(groupId)),

  getMentoring: () => apiClient.get<any[]>(API_PATHS.SOCIAL_MENTORING),

  getAnonymousQA: () => apiClient.get<any[]>(API_PATHS.SOCIAL_ANONYMOUS_QA),
};
