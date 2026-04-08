import { API_PATHS } from '@masari/shared';
import type { TokenPair } from '@masari/shared';
import { apiClient } from './client';

export const authApi = {
  ssoInitiate: (universitySlug: string, redirectUrl: string) =>
    apiClient.post<{ sso_redirect_url: string; state: string }>(API_PATHS.AUTH_SSO_INITIATE, {
      university_slug: universitySlug,
      redirect_url: redirectUrl,
    }),

  ssoCallback: (email: string, universitySlug: string) =>
    apiClient.post<TokenPair & { user: { id: string; university_id: string; role: string; email: string; name_ar: string; name_en: string } }>(
      '/api/v1/auth/sso/callback',
      { email, university_slug: universitySlug },
    ),

  refreshToken: (refreshToken: string) =>
    apiClient.post<TokenPair>(API_PATHS.AUTH_TOKEN_REFRESH, {
      refresh_token: refreshToken,
    }),
};
