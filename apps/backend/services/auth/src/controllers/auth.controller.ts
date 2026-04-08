import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { query, studentQueries } from '@masari/backend-shared';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

// In-memory state store (would be Redis in production)
const stateStore = new Map<string, { university_slug: string; redirect_url: string; created_at: number }>();

// Clean up expired states every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of stateStore.entries()) {
    if (now - value.created_at > 10 * 60 * 1000) { // 10 minute expiry
      stateStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function signTokenPair(payload: { id: string; university_id: string; role: string; email: string; name_ar: string; name_en: string }) {
  const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refresh_token = jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { access_token, refresh_token, expires_in: 3600, token_type: 'Bearer' as const };
}

export class AuthController {
  /** POST /api/v1/auth/sso/initiate */
  ssoInitiate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { university_slug, redirect_url } = req.body;

      if (!university_slug || !redirect_url) {
        res.status(400).json({
          success: false,
          errors: [
            {
              code: 'VALIDATION_ERROR',
              message_ar: '\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u062c\u0627\u0645\u0639\u0629 \u0648\u0631\u0627\u0628\u0637 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0645\u0637\u0644\u0648\u0628\u0627\u0646',
              message_en: 'university_slug and redirect_url are required',
            },
          ],
        });
        return;
      }

      // Look up university by slug
      const uniResult = await query(
        'SELECT * FROM universities WHERE slug = $1 AND deleted_at IS NULL',
        [university_slug],
      );

      if (uniResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          errors: [
            {
              code: 'UNIVERSITY_NOT_FOUND',
              message_ar: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u062c\u0627\u0645\u0639\u0629',
              message_en: 'University not found',
            },
          ],
        });
        return;
      }

      const university = uniResult.rows[0];
      const state = crypto.randomUUID();

      // Store state for callback verification
      stateStore.set(state, {
        university_slug,
        redirect_url,
        created_at: Date.now(),
      });

      const ssoBaseUrl = university.sso_url || `https://sso.${university_slug}.edu.sa/oauth2/authorize`;

      res.json({
        success: true,
        data: {
          sso_redirect_url: `${ssoBaseUrl}?client_id=masari&state=${state}&redirect_uri=${encodeURIComponent(redirect_url)}`,
          state,
        },
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('SSO initiate error:', error);
      res.status(500).json({
        success: false,
        errors: [
          {
            code: 'INTERNAL_ERROR',
            message_ar: '\u062d\u062f\u062b \u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u062e\u0627\u062f\u0645',
            message_en: 'Internal server error',
          },
        ],
      });
    }
  };

  /** POST /api/v1/auth/sso/callback */
  ssoCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, state, email, university_slug } = req.body;

      // Development mode: accept email + university_slug directly
      const isDev = !code && email && university_slug;

      if (!isDev && (!code || !state)) {
        res.status(400).json({
          success: false,
          errors: [
            {
              code: 'VALIDATION_ERROR',
              message_ar: '\u0631\u0645\u0632 \u0627\u0644\u0645\u0635\u0627\u062f\u0642\u0629 \u0648\u0627\u0644\u062d\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628\u0627\u0646',
              message_en: 'code and state are required',
            },
          ],
        });
        return;
      }

      let resolvedUniversitySlug: string;
      let resolvedEmail: string;

      if (isDev) {
        // Dev mode: trust the email and university_slug directly
        resolvedUniversitySlug = university_slug;
        resolvedEmail = email;
      } else {
        // Production mode: verify state token
        const storedState = stateStore.get(state);
        if (!storedState) {
          res.status(400).json({
            success: false,
            errors: [
              {
                code: 'INVALID_STATE',
                message_ar: '\u0631\u0645\u0632 \u0627\u0644\u062d\u0627\u0644\u0629 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d \u0623\u0648 \u0645\u0646\u062a\u0647\u064a \u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0629',
                message_en: 'Invalid or expired state token',
              },
            ],
          });
          return;
        }

        stateStore.delete(state);
        resolvedUniversitySlug = storedState.university_slug;

        // In production, you'd exchange the code with the SSO provider here
        // For now, decode the code as a simulated email
        resolvedEmail = Buffer.from(code, 'base64').toString('utf-8') || email;
      }

      // Look up university
      const uniResult = await query(
        'SELECT * FROM universities WHERE slug = $1 AND deleted_at IS NULL',
        [resolvedUniversitySlug],
      );

      if (uniResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          errors: [
            {
              code: 'UNIVERSITY_NOT_FOUND',
              message_ar: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u062c\u0627\u0645\u0639\u0629',
              message_en: 'University not found',
            },
          ],
        });
        return;
      }

      const university = uniResult.rows[0];

      // Look up student by email
      const student = await studentQueries.getStudentByEmail(university.id, resolvedEmail);

      if (!student) {
        res.status(404).json({
          success: false,
          errors: [
            {
              code: 'STUDENT_NOT_FOUND',
              message_ar: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0637\u0627\u0644\u0628',
              message_en: 'Student not found. Please contact your university registrar.',
            },
          ],
        });
        return;
      }

      // Sign JWT tokens
      const tokenPayload = {
        id: student.id,
        university_id: student.university_id,
        role: student.role || 'student',
        email: student.email,
        name_ar: student.name_ar,
        name_en: student.name_en,
      };

      const tokens = signTokenPair(tokenPayload);

      res.json({
        success: true,
        data: tokens,
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('SSO callback error:', error);
      res.status(500).json({
        success: false,
        errors: [
          {
            code: 'INTERNAL_ERROR',
            message_ar: '\u062d\u062f\u062b \u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u062e\u0627\u062f\u0645',
            message_en: 'Internal server error',
          },
        ],
      });
    }
  };

  /** POST /api/v1/auth/token/refresh */
  tokenRefresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        res.status(400).json({
          success: false,
          errors: [
            {
              code: 'VALIDATION_ERROR',
              message_ar: '\u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u062f\u064a\u062b \u0645\u0637\u0644\u0648\u0628',
              message_en: 'refresh_token is required',
            },
          ],
        });
        return;
      }

      // Verify the refresh token
      let decoded: any;
      try {
        decoded = jwt.verify(refresh_token, JWT_SECRET);
      } catch {
        res.status(401).json({
          success: false,
          errors: [
            {
              code: 'INVALID_REFRESH_TOKEN',
              message_ar: '\u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u062f\u064a\u062b \u063a\u064a\u0631 \u0635\u0627\u0644\u062d \u0623\u0648 \u0645\u0646\u062a\u0647\u064a \u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0629',
              message_en: 'Invalid or expired refresh token',
            },
          ],
        });
        return;
      }

      if (decoded.type !== 'refresh') {
        res.status(401).json({
          success: false,
          errors: [
            {
              code: 'INVALID_TOKEN_TYPE',
              message_ar: '\u0646\u0648\u0639 \u0627\u0644\u0631\u0645\u0632 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d',
              message_en: 'Invalid token type. Expected a refresh token.',
            },
          ],
        });
        return;
      }

      // Issue new token pair
      const tokenPayload = {
        id: decoded.id,
        university_id: decoded.university_id,
        role: decoded.role,
        email: decoded.email,
        name_ar: decoded.name_ar,
        name_en: decoded.name_en,
      };

      const tokens = signTokenPair(tokenPayload);

      res.json({
        success: true,
        data: tokens,
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        errors: [
          {
            code: 'INTERNAL_ERROR',
            message_ar: '\u062d\u062f\u062b \u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u062e\u0627\u062f\u0645',
            message_en: 'Internal server error',
          },
        ],
      });
    }
  };
}
