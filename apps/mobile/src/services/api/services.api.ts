import { API_PATHS } from '@masari/shared';
import type {
  ServiceRequest,
  ContactDirectoryEntry,
  ExcusedAbsencePolicy,
  SocialAllowanceCategory,
  SocialAllowanceDocRequirement,
} from '@masari/shared';
import { apiClient } from './client';

export const servicesApi = {
  list: () => apiClient.get<ServiceRequest[]>(API_PATHS.SERVICE_REQUESTS),
  detail: (id: string) =>
    apiClient.get<ServiceRequest>(API_PATHS.SERVICE_REQUEST_DETAIL(id)),
  create: (body: { type: ServiceRequest['type']; payload?: Record<string, unknown> }) =>
    apiClient.post<ServiceRequest>(API_PATHS.SERVICE_REQUEST_CREATE, body),
  cancel: (id: string) =>
    apiClient.post<ServiceRequest>(API_PATHS.SERVICE_REQUEST_CANCEL(id)),
  amendAttachment: (
    id: string,
    attachmentId: string,
    file: { name: string; size_kb: number },
  ) =>
    apiClient.post<ServiceRequest>(
      API_PATHS.SERVICE_REQUEST_AMEND_ATTACHMENT(id, attachmentId),
      file,
    ),
  contactDirectory: () =>
    apiClient.get<ContactDirectoryEntry[]>(API_PATHS.SERVICE_CONTACT_DIRECTORY),
  excusedAbsencePolicy: () =>
    apiClient.get<ExcusedAbsencePolicy>(API_PATHS.SERVICE_EXCUSED_ABSENCE_POLICY),
  socialAllowanceRequirements: () =>
    apiClient.get<Record<SocialAllowanceCategory | 'bank_change', SocialAllowanceDocRequirement[]>>(
      API_PATHS.SERVICE_SOCIAL_ALLOWANCE_REQUIREMENTS,
    ),
  // Grade appeals can only be filed while the appeal period is open
  // (CCK Hub Update 17-06-26: appeals are submitted "during appeal period").
  appealWindow: () =>
    apiClient.get<{ open: boolean; opens_at: string; closes_at: string; term_en: string; term_ar: string }>(
      API_PATHS.SERVICE_APPEAL_WINDOW,
    ),
};
