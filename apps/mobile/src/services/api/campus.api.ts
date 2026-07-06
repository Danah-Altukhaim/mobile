import { API_PATHS } from '@masari/shared';
import type { Event, Club } from '@masari/shared';
import { apiClient } from './client';

export const campusApi = {
  getEvents: () => apiClient.get<Event[]>(API_PATHS.EVENTS),

  rsvpEvent: (eventId: string) =>
    apiClient.post<{ rsvp_count: number }>(API_PATHS.EVENT_RSVP(eventId)),

  getClubs: () => apiClient.get<Club[]>(API_PATHS.CLUBS),

  joinClub: (clubId: string) =>
    apiClient.post<{ member_count: number }>(API_PATHS.CLUB_JOIN(clubId)),

  getPrayerTimes: () => apiClient.get<any>(API_PATHS.PRAYER_TIMES),

  getBuildings: () => apiClient.get<any[]>(API_PATHS.CAMPUS_BUILDINGS),

  getNews: () => apiClient.get<any[]>(API_PATHS.CAMPUS_NEWS),

  getDining: () => apiClient.get<any[]>(API_PATHS.CAMPUS_DINING),

  getLostFound: () => apiClient.get<any[]>(API_PATHS.CAMPUS_LOST_FOUND),

  getClassChannels: () => apiClient.get<any[]>(API_PATHS.CLASS_CHANNELS),

  getClassChannel: (channelId: string) =>
    apiClient.get<any>(API_PATHS.CLASS_CHANNEL_DETAIL(channelId)),

  postClassChannelReply: (
    channelId: string,
    data: { content_ar?: string; content_en?: string },
  ) => apiClient.post<any>(API_PATHS.CLASS_CHANNEL_POST(channelId), data),

  getClubChannels: () => apiClient.get<any[]>(API_PATHS.CLUB_CHANNELS),

  getClubChannel: (channelId: string) =>
    apiClient.get<any>(API_PATHS.CLUB_CHANNEL_DETAIL(channelId)),

  postClubChannelReply: (
    channelId: string,
    data: { content_ar?: string; content_en?: string },
  ) => apiClient.post<any>(API_PATHS.CLUB_CHANNEL_POST(channelId), data),
};
