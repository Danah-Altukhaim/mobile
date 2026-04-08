import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthUser } from '@masari/shared';

export interface AuthRequest extends Request {
  user: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      errors: [
        {
          code: 'AUTH_INVALID_TOKEN',
          message_ar: 'رمز المصادقة مطلوب',
          message_en: 'Authentication token required',
        },
      ],
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    (req as AuthRequest).user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      errors: [
        {
          code: 'AUTH_TOKEN_EXPIRED',
          message_ar: 'انتهت صلاحية رمز المصادقة',
          message_en: 'Authentication token expired',
        },
      ],
    });
  }
}
