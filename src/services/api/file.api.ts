import { API_PATHS } from '@masari/shared';
import { apiClient } from './client';

export const fileApi = {
  requestTranscript: (data: { type: string; copies: number; delivery: string }) =>
    apiClient.post<any>(API_PATHS.TRANSCRIPT_REQUEST, data),

  getTranscriptRequests: () => apiClient.get<any[]>(API_PATHS.TRANSCRIPT_REQUESTS),
};
