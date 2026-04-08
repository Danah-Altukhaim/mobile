import { Response } from 'express';
import type { AuthRequest } from '@masari/backend-shared';
import { campusQueries } from '@masari/backend-shared';

export class CampusController {
  /** GET /api/v1/events */
  getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const events = await campusQueries.getEvents(req.user.university_id);

      // Enrich each event with is_rsvped for the current student
      const enriched = await Promise.all(
        events.map(async (event: any) => {
          const is_rsvped = await campusQueries.isStudentRsvped(event.id, req.user.id);
          return { ...event, is_rsvped };
        }),
      );

      res.json({
        success: true,
        data: enriched,
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[Campus GetEvents] Error:', err);
      res.status(500).json({
        success: false,
        errors: [
          {
            code: 'INTERNAL_ERROR',
            message_ar: 'حدث خطأ أثناء جلب الفعاليات',
            message_en: 'An error occurred while fetching events',
          },
        ],
      });
    }
  };

  /** POST /api/v1/events/:id/rsvp */
  rsvpEvent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await campusQueries.rsvpEvent(id, req.user.id);

      if ('error' in result) {
        if (result.error === 'NOT_FOUND') {
          res.status(404).json({
            success: false,
            errors: [
              {
                code: 'NOT_FOUND',
                message_ar: 'الفعالية غير موجودة',
                message_en: 'Event not found',
              },
            ],
          });
          return;
        }

        if (result.error === 'EVENT_FULL') {
          res.status(409).json({
            success: false,
            errors: [
              {
                code: 'EVENT_FULL',
                message_ar: 'الفعالية ممتلئة',
                message_en: 'Event is at full capacity',
              },
            ],
          });
          return;
        }
      }

      res.json({
        success: true,
        data: {
          event_id: id,
          rsvp_count: (result as any).rsvp_count,
          message_ar: 'تم تسجيلك في الفعالية بنجاح',
          message_en: 'Successfully registered for the event',
        },
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[Campus RSVP] Error:', err);
      res.status(500).json({
        success: false,
        errors: [
          {
            code: 'INTERNAL_ERROR',
            message_ar: 'حدث خطأ أثناء التسجيل في الفعالية',
            message_en: 'An error occurred while registering for the event',
          },
        ],
      });
    }
  };

  /** GET /api/v1/clubs */
  getClubs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const clubs = await campusQueries.getClubs(req.user.university_id);

      // Enrich each club with is_member for the current student
      const enriched = await Promise.all(
        clubs.map(async (club: any) => {
          const is_member = await campusQueries.isStudentMember(club.id, req.user.id);
          return { ...club, is_member };
        }),
      );

      res.json({
        success: true,
        data: enriched,
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[Campus GetClubs] Error:', err);
      res.status(500).json({
        success: false,
        errors: [
          {
            code: 'INTERNAL_ERROR',
            message_ar: 'حدث خطأ أثناء جلب الأندية',
            message_en: 'An error occurred while fetching clubs',
          },
        ],
      });
    }
  };

  /** POST /api/v1/clubs/:id/join */
  joinClub = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await campusQueries.joinClub(id, req.user.id);

      res.json({
        success: true,
        data: {
          club_id: id,
          member_count: result.member_count,
          message_ar: 'تم انضمامك للنادي بنجاح',
          message_en: 'Successfully joined the club',
        },
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[Campus JoinClub] Error:', err);
      res.status(500).json({
        success: false,
        errors: [
          {
            code: 'INTERNAL_ERROR',
            message_ar: 'حدث خطأ أثناء الانضمام للنادي',
            message_en: 'An error occurred while joining the club',
          },
        ],
      });
    }
  };
}
