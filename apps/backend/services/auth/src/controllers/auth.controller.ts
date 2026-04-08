import { Request, Response } from 'express';
import crypto from 'crypto';

export class AuthController {
  /** POST /api/v1/auth/sso/initiate */
  ssoInitiate = (req: Request, res: Response): void => {
    const { university_slug, redirect_url } = req.body;

    if (!university_slug || !redirect_url) {
      res.status(400).json({
        success: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            message_ar: 'معرّف الجامعة ورابط التحويل مطلوبان',
            message_en: 'university_slug and redirect_url are required',
          },
        ],
      });
      return;
    }

    const state = crypto.randomUUID();

    res.json({
      success: true,
      data: {
        sso_redirect_url: `https://sso.${university_slug}.edu.sa/oauth2/authorize?client_id=masari&state=${state}&redirect_uri=${encodeURIComponent(redirect_url)}`,
        state,
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** POST /api/v1/auth/token/refresh */
  tokenRefresh = (req: Request, res: Response): void => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({
        success: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            message_ar: 'رمز التحديث مطلوب',
            message_en: 'refresh_token is required',
          },
        ],
      });
      return;
    }

    res.json({
      success: true,
      data: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsInVuaXZlcnNpdHlfaWQiOiJrdXNhIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MTIwMDAwMDAsImV4cCI6MTcxMjAwMzYwMH0.mock_signature',
        refresh_token: `rt_${crypto.randomUUID().replace(/-/g, '')}`,
        expires_in: 3600,
        token_type: 'Bearer',
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };
}
