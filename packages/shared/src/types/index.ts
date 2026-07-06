export * from './university';
export * from './student';
export * from './course';
export * from './catalog';
export * from './reference';
export * from './enrollment';
export * from './payment';
export * from './event';
export * from './ai';
export * from './admin';
export * from './service-request';

// Shared response envelope
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    cursor?: string;
    hasMore?: boolean;
    synced_at?: string;
    total?: number;
  };
  errors?: ApiError[];
}

export interface ApiError {
  code: string;
  message_ar: string;
  message_en: string;
  field?: string;
}

// Pagination
export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

// Auth
export interface AuthUser {
  id: string;
  university_id: string;
  role: 'student' | 'admin' | 'super_admin' | 'advisor' | 'staff';
  email: string;
  name_ar: string;
  name_en: string;
  funding_type?: import('./student').FundingType | null;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
