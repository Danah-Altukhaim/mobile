import { Request, Response } from 'express';
import { AuthRequest } from '@masari/backend-shared';

export class FileController {
  /** POST /api/v1/files/upload */
  uploadFile = (req: Request, res: Response): void => {
    const user = (req as AuthRequest).user;
    const { filename, content_type, size_bytes } = req.body;

    const fileId = `file_${Date.now()}`;

    res.status(201).json({
      success: true,
      data: {
        file_id: fileId,
        url: `https://cdn.masari.sa/uploads/${user.sub || 'user_123'}/${fileId}/${filename || 'document.pdf'}`,
        filename: filename || 'document.pdf',
        content_type: content_type || 'application/pdf',
        size_bytes: size_bytes || 1048576,
        uploaded_by: user.sub || 'user_123',
        uploaded_at: new Date().toISOString(),
        status: 'ready',
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** GET /api/v1/files/:id */
  getFile = (req: Request, res: Response): void => {
    const { id } = req.params;

    res.json({
      success: true,
      data: {
        file_id: id,
        filename_ar: 'كشف_الدرجات_٢٠٢٦.pdf',
        filename_en: 'transcript_2026.pdf',
        url: `https://cdn.masari.sa/uploads/user_123/${id}/transcript_2026.pdf`,
        content_type: 'application/pdf',
        size_bytes: 245780,
        uploaded_by: 'user_123',
        uploaded_at: '2026-04-01T10:00:00Z',
        last_accessed: '2026-04-08T08:30:00Z',
        metadata: {
          description_ar: 'كشف الدرجات الأكاديمية للفصل الدراسي الثاني ٢٠٢٦',
          description_en: 'Academic transcript for second semester 2026',
          tags: ['transcript', 'academic', 'official'],
        },
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };
}
