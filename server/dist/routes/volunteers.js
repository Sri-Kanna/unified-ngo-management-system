import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { volunteers } from '../db/schema.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';
import { z } from 'zod';
const router = Router();
const volunteerSchema = z.object({
    userId: z.string().uuid().optional().nullable(),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional().nullable(),
    skills: z.array(z.string()).optional().default([]),
    availability: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']).default('active'),
});
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const list = await db.select().from(volunteers).orderBy(desc(volunteers.createdAt));
        return res.json(list);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving volunteers' });
    }
});
router.get('/:id', authenticateJWT, async (req, res) => {
    try {
        const [vol] = await db.select().from(volunteers).where(eq(volunteers.id, req.params.id)).limit(1);
        if (!vol) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }
        return res.json(vol);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving volunteer' });
    }
});
router.post('/', authenticateJWT, authorize(['admin', 'staff']), async (req, res) => {
    const result = volunteerSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
    }
    try {
        const [newVol] = await db.insert(volunteers).values(result.data).returning();
        await logActivity(req.user?.id, 'CREATE_VOLUNTEER', 'volunteers', newVol.id, `Created volunteer profile for ${newVol.name}`);
        return res.status(201).json(newVol);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating volunteer' });
    }
});
router.put('/:id', authenticateJWT, authorize(['admin', 'staff']), async (req, res) => {
    const result = volunteerSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
    }
    try {
        const [updatedVol] = await db
            .update(volunteers)
            .set({
            ...result.data,
            updatedAt: new Date(),
        })
            .where(eq(volunteers.id, req.params.id))
            .returning();
        if (!updatedVol) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }
        await logActivity(req.user?.id, 'UPDATE_VOLUNTEER', 'volunteers', updatedVol.id, `Updated volunteer ${updatedVol.name}`);
        return res.json(updatedVol);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating volunteer' });
    }
});
router.delete('/:id', authenticateJWT, authorize(['admin']), async (req, res) => {
    try {
        const [deletedVol] = await db
            .delete(volunteers)
            .where(eq(volunteers.id, req.params.id))
            .returning();
        if (!deletedVol) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }
        await logActivity(req.user?.id, 'DELETE_VOLUNTEER', 'volunteers', req.params.id, `Deleted volunteer ${deletedVol.name}`);
        return res.json({ message: 'Volunteer deleted successfully', volunteer: deletedVol });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting volunteer' });
    }
});
export default router;
