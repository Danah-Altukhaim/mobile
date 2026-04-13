import type { ApiResponse } from '@masari/shared';
import { mockResponses } from './mock-data';

const BASE_URL = 'http://localhost:3000';
const USE_MOCK = true; // Set to false when backend is running

class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private getMockResponse<T>(path: string): ApiResponse<T> | null {
    const mock = mockResponses[path];
    if (mock) return mock as ApiResponse<T>;

    // Try prefix matching for parameterized routes
    for (const key of Object.keys(mockResponses)) {
      if (path.startsWith(key.replace(/\/:[^/]+/g, ''))) {
        return mockResponses[key] as ApiResponse<T>;
      }
    }
    return null;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    // Try real API first, fall back to mock
    if (!USE_MOCK) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept-Language': 'ar',
          ...((options.headers as Record<string, string>) || {}),
        };

        if (this.accessToken) {
          headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const response = await fetch(`${BASE_URL}${path}`, {
          ...options,
          headers,
        });

        if (!response.ok) {
          throw new ApiError(response.status, 'API error');
        }

        return response.json();
      } catch {
        // Fall through to mock
      }
    }

    // Use mock data
    const mock = this.getMockResponse<T>(path);
    if (mock) return mock;

    return { success: true, data: {} as T };
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path);
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = new ApiClient();
