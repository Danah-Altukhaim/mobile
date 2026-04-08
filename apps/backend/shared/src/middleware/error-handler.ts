import { Request, Response, NextFunction } from 'express';
import { logger } from './request-logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  logger.error({ err }, 'Unhandled error');

  res.status(500).json({
    success: false,
    errors: [
      {
        code: 'INTERNAL_ERROR',
        message_ar: 'حدث خطأ داخلي في الخادم',
        message_en: 'An internal server error occurred',
      },
    ],
  });
}
