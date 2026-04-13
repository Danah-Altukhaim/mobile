import { API_PATHS } from '@masari/shared';
import { apiClient } from './client';

export const notificationApi = {
  getNotifications: () => apiClient.get<any[]>(API_PATHS.NOTIFICATIONS),

  getPreferences: () => apiClient.get<any>(API_PATHS.NOTIFICATION_PREFERENCES),

  updatePreferences: (data: any) =>
    apiClient.put<any>(API_PATHS.NOTIFICATION_PREFERENCES, data),

  markAsRead: (notificationId: string) =>
    apiClient.put<any>(API_PATHS.NOTIFICATION_READ(notificationId)),
};
