import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { query, isDbAvailable, mockData } from '@masari/backend-shared';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

function signTokenPair(payload: { id: string; university_id: string; role: string; email: string; name_ar: string; name_en: string }) {
  const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refresh_token = jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { access_token, refresh_token, expires_in: 3600, token_type: 'Bearer' as const };
}

export class AuthController {
  /** POST /api/v1/auth/sso/initiate */
  ssoInitiate = async (req: Request, res: Response): Promise<void> => {
    const { university_slug, redirect_url } = req.body;
    if (!university_slug || !redirect_url) {
      res.status(400).json({ success: false, errors: [{ code: 'VALIDATION_ERROR', message_ar: 'معرّف الجامعة ورابط التحويل مطلوبان', message_en: 'university_slug and redirect_url are required' }] });
      return;
    }

    const state = crypto.randomUUID();
    res.json({
      success: true,
      data: {
        sso_redirect_url: `https://sso.${university_slug}.edu/oauth2/authorize?client_id=masari&state=${state}&redirect_uri=${encodeURIComponent(redirect_url)}`,
        state,
      },
    });
  };

  /** POST /api/v1/auth/sso/callback — Dev mode: accepts email + university_slug directly */
  ssoCallback = async (req: Request, res: Response): Promise<void> => {
    const { email, university_slug } = req.body;
    if (!email || !university_slug) {
      res.status(400).json({ success: false, errors: [{ code: 'VALIDATION_ERROR', message_ar: 'البريد الإلكتروني ومعرّف الجامعة مطلوبان', message_en: 'email and university_slug are required' }] });
      return;
    }

    try {
      let student: any;
      let universityId: string;

      if (isDbAvailable()) {
        // Try DB lookup
        const uniResult = await query('SELECT * FROM universities WHERE slug = $1', [university_slug]);
        const university = uniResult.rows[0];
        if (!university) { res.status(404).json({ success: false, errors: [{ code: 'NOT_FOUND', message_ar: 'الجامعة غير موجودة', message_en: 'University not found' }] }); return; }
        universityId = university.id;

        const studentResult = await query('SELECT * FROM students WHERE university_id = $1 AND email = $2 AND deleted_at IS NULL', [universityId, email]);
        student = studentResult.rows[0];
        if (!student) { res.status(404).json({ success: false, errors: [{ code: 'NOT_FOUND', message_ar: 'الطالب غير موجود', message_en: 'Student not found' }] }); return; }
      } else {
        // Mock fallback
        student = mockData.mockStudent;
        universityId = mockData.mockUniversity.id;
      }

      const payload = {
        id: student.id,
        university_id: universityId,
        role: 'student',
        email: student.email,
        name_ar: student.name_ar,
        name_en: student.name_en,
      };

      const tokens = signTokenPair(payload);
      res.json({ success: true, data: { ...tokens, user: payload } });
    } catch (e: any) {
      // DB error fallback
      const student = mockData.mockStudent;
      const payload = { id: student.id, university_id: student.university_id, role: 'student', email: student.email, name_ar: student.name_ar, name_en: student.name_en };
      const tokens = signTokenPair(payload);
      res.json({ success: true, data: { ...tokens, user: payload } });
    }
  };

  /** POST /api/v1/auth/token/refresh */
  tokenRefresh = async (req: Request, res: Response): Promise<void> => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      res.status(400).json({ success: false, errors: [{ code: 'VALIDATION_ERROR', message_ar: 'رمز التحديث مطلوب', message_en: 'refresh_token is required' }] });
      return;
    }

    try {
      const decoded = jwt.verify(refresh_token, JWT_SECRET) as any;
      if (decoded.type !== 'refresh') {
        res.status(401).json({ success: false, errors: [{ code: 'AUTH_INVALID_TOKEN', message_ar: 'رمز التحديث غير صالح', message_en: 'Invalid refresh token' }] });
        return;
      }

      const payload = { id: decoded.id, university_id: decoded.university_id, role: decoded.role, email: decoded.email, name_ar: decoded.name_ar, name_en: decoded.name_en };
      const tokens = signTokenPair(payload);
      res.json({ success: true, data: tokens });
    } catch {
      res.status(401).json({ success: false, errors: [{ code: 'AUTH_TOKEN_EXPIRED', message_ar: 'انتهت صلاحية رمز التحديث', message_en: 'Refresh token expired' }] });
    }
  };
}
