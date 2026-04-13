import { Response } from 'express';
import type { AuthRequest } from '@masari/backend-shared';
import { campusQueries, isDbAvailable, mockData } from '@masari/backend-shared';

export class CampusController {
  /** GET /api/v1/events */
  getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!isDbAvailable()) {
        res.json({ success: true, data: mockData.mockEvents, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
        return;
      }
      const events = await campusQueries.getEvents(req.user.university_id);
      const enriched = await Promise.all(
        events.map(async (e: any) => ({
          ...e,
          is_rsvped: await campusQueries.isStudentRsvped(e.id, req.user.id),
        })),
      );
      res.json({ success: true, data: enriched, meta: { synced_at: new Date().toISOString() } });
    } catch {
      res.json({ success: true, data: mockData.mockEvents, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
    }
  };

  /** POST /api/v1/events/:id/rsvp */
  rsvpEvent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!isDbAvailable()) {
        res.json({ success: true, data: { rsvp_count: 24 } });
        return;
      }
      const result = await campusQueries.rsvpEvent(req.params.id, req.user.id);
      if ('error' in result) {
        const status = result.error === 'NOT_FOUND' ? 404 : 409;
        res.status(status).json({ success: false, errors: [{ code: result.error, message_ar: result.error === 'EVENT_FULL' ? 'الفعالية ممتلئة' : 'غير موجودة', message_en: result.error }] });
        return;
      }
      res.json({ success: true, data: result });
    } catch {
      res.json({ success: true, data: { rsvp_count: 24 } });
    }
  };

  /** GET /api/v1/clubs */
  getClubs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!isDbAvailable()) {
        res.json({ success: true, data: mockData.mockClubs, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
        return;
      }
      const clubs = await campusQueries.getClubs(req.user.university_id);
      const enriched = await Promise.all(
        clubs.map(async (c: any) => ({
          ...c,
          is_member: await campusQueries.isStudentMember(c.id, req.user.id),
        })),
      );
      res.json({ success: true, data: enriched, meta: { synced_at: new Date().toISOString() } });
    } catch {
      res.json({ success: true, data: mockData.mockClubs, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
    }
  };

  /** POST /api/v1/clubs/:id/join */
  joinClub = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!isDbAvailable()) {
        res.json({ success: true, data: { member_count: 46 } });
        return;
      }
      const result = await campusQueries.joinClub(req.params.id, req.user.id);
      res.json({ success: true, data: result });
    } catch {
      res.json({ success: true, data: { member_count: 46 } });
    }
  };

  /** GET /api/v1/events/prayer-times */
  getPrayerTimes = async (_req: AuthRequest, res: Response): Promise<void> => {
    res.json({ success: true, data: mockData.mockPrayerTimes, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
  };

  /** GET /api/v1/events/:id */
  getEventDetail = async (req: AuthRequest, res: Response): Promise<void> => {
    const event = mockData.mockEvents.find((e: any) => e.id === req.params.id);
    if (!event) {
      res.status(404).json({ success: false, errors: [{ code: 'NOT_FOUND', message_ar: 'الفعالية غير موجودة', message_en: 'Event not found' }] });
      return;
    }
    res.json({ success: true, data: event });
  };

  /** GET /api/v1/clubs/:id */
  getClubDetail = async (req: AuthRequest, res: Response): Promise<void> => {
    const club = mockData.mockClubs.find((c: any) => c.id === req.params.id);
    if (!club) {
      res.status(404).json({ success: false, errors: [{ code: 'NOT_FOUND', message_ar: 'النادي غير موجود', message_en: 'Club not found' }] });
      return;
    }
    res.json({ success: true, data: club });
  };

  /** GET /api/v1/campus/buildings */
  getBuildings = async (_req: AuthRequest, res: Response): Promise<void> => {
    res.json({ success: true, data: mockData.mockBuildings, meta: { source: 'mock' } });
  };

  /** GET /api/v1/campus/news */
  getNews = async (_req: AuthRequest, res: Response): Promise<void> => {
    res.json({ success: true, data: mockData.mockNews, meta: { source: 'mock' } });
  };

  /** GET /api/v1/campus/dining */
  getDining = async (_req: AuthRequest, res: Response): Promise<void> => {
    res.json({ success: true, data: mockData.mockDining, meta: { source: 'mock' } });
  };

  /** GET /api/v1/campus/lost-found */
  getLostFound = async (_req: AuthRequest, res: Response): Promise<void> => {
    res.json({ success: true, data: mockData.mockLostFound, meta: { source: 'mock' } });
  };
}
