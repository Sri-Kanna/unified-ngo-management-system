import { Router } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { events, eventParticipants, users } from '../db/schema.js';
import { authenticateJWT, authorize, AuthenticatedRequest } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';
import { z } from 'zod';

const router = Router();

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  startTime: z.string(), // ISO String
  endTime: z.string(), // ISO String
  location: z.string().min(1),
  capacity: z.number().int().optional().nullable(),
  status: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']).default('scheduled'),
});

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const list = await db.select().from(events).orderBy(desc(events.startTime));
    return res.json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving events' });
  }
});

router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const [event] = await db.select().from(events).where(eq(events.id, req.params.id)).limit(1);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return res.json(event);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving event' });
  }
});

router.post('/', authenticateJWT, authorize(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
  const result = eventSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
  }

  try {
    const [newEvent] = await db
      .insert(events)
      .values({
        ...result.data,
        startTime: new Date(result.data.startTime),
        endTime: new Date(result.data.endTime),
      })
      .returning();

    await logActivity(req.user?.id, 'CREATE_EVENT', 'events', newEvent.id, `Created event "${newEvent.title}"`);
    return res.status(201).json(newEvent);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating event' });
  }
});

router.put('/:id', authenticateJWT, authorize(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
  const result = eventSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
  }

  try {
    const [updatedEvent] = await db
      .update(events)
      .set({
        ...result.data,
        startTime: new Date(result.data.startTime),
        endTime: new Date(result.data.endTime),
        updatedAt: new Date(),
      })
      .where(eq(events.id, req.params.id))
      .returning();

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await logActivity(req.user?.id, 'UPDATE_EVENT', 'events', updatedEvent.id, `Updated event "${updatedEvent.title}"`);
    return res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating event' });
  }
});

router.delete('/:id', authenticateJWT, authorize(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const [deletedEvent] = await db
      .delete(events)
      .where(eq(events.id, req.params.id))
      .returning();

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await logActivity(req.user?.id, 'DELETE_EVENT', 'events', req.params.id, `Deleted event "${deletedEvent.title}"`);
    return res.json({ message: 'Event deleted successfully', event: deletedEvent });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error deleting event' });
  }
});

// Participant registration
router.get('/:id/participants', authenticateJWT, async (req, res) => {
  try {
    const list = await db
      .select({
        id: eventParticipants.id,
        role: eventParticipants.role,
        attended: eventParticipants.attended,
        registeredAt: eventParticipants.registeredAt,
        userName: users.name,
        userEmail: users.email,
        userId: users.id,
      })
      .from(eventParticipants)
      .innerJoin(users, eq(eventParticipants.userId, users.id))
      .where(eq(eventParticipants.eventId, req.params.id));

    return res.json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving participants' });
  }
});

router.post('/:id/register', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const participantSchema = z.object({
    userId: z.string().uuid(),
    role: z.enum(['volunteer', 'beneficiary', 'staff']),
  });

  const result = participantSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
  }

  try {
    const [participant] = await db
      .insert(eventParticipants)
      .values({
        eventId: req.params.id,
        userId: result.data.userId,
        role: result.data.role,
      })
      .returning();

    return res.status(201).json(participant);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error registering participant' });
  }
});

// Update attendance
router.post('/:id/attendance', authenticateJWT, authorize(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
  const attendanceSchema = z.object({
    participantId: z.string().uuid(),
    attended: z.boolean(),
  });

  const result = attendanceSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
  }

  try {
    const [updated] = await db
      .update(eventParticipants)
      .set({ attended: result.data.attended })
      .where(eq(eventParticipants.id, result.data.participantId))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating attendance' });
  }
});

export default router;
