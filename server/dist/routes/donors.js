import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { donors } from '../db/schema.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';
import { z } from 'zod';
const router = Router();
const donorSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    donorType: z.enum(['individual', 'corporate']).default('individual'),
});
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const list = await db.select().from(donors).orderBy(desc(donors.createdAt));
        return res.json(list);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving donors' });
    }
});
router.get('/:id', authenticateJWT, async (req, res) => {
    try {
        const [donor] = await db.select().from(donors).where(eq(donors.id, req.params.id)).limit(1);
        if (!donor) {
            return res.status(404).json({ message: 'Donor not found' });
        }
        return res.json(donor);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving donor' });
    }
});
router.post('/', authenticateJWT, authorize(['admin', 'staff']), async (req, res) => {
    const result = donorSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
    }
    try {
        const [newDonor] = await db.insert(donors).values(result.data).returning();
        await logActivity(req.user?.id, 'CREATE_DONOR', 'donors', newDonor.id, `Created donor ${newDonor.name}`);
        return res.status(201).json(newDonor);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating donor' });
    }
});
router.put('/:id', authenticateJWT, authorize(['admin', 'staff']), async (req, res) => {
    const result = donorSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
    }
    try {
        const [updatedDonor] = await db
            .update(donors)
            .set({
            ...result.data,
            updatedAt: new Date(),
        })
            .where(eq(donors.id, req.params.id))
            .returning();
        if (!updatedDonor) {
            return res.status(404).json({ message: 'Donor not found' });
        }
        await logActivity(req.user?.id, 'UPDATE_DONOR', 'donors', updatedDonor.id, `Updated donor ${updatedDonor.name}`);
        return res.json(updatedDonor);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating donor' });
    }
});
router.delete('/:id', authenticateJWT, authorize(['admin']), async (req, res) => {
    try {
        const [deletedDonor] = await db
            .delete(donors)
            .where(eq(donors.id, req.params.id))
            .returning();
        if (!deletedDonor) {
            return res.status(404).json({ message: 'Donor not found' });
        }
        await logActivity(req.user?.id, 'DELETE_DONOR', 'donors', req.params.id, `Deleted donor ${deletedDonor.name}`);
        return res.json({ message: 'Donor deleted successfully', donor: deletedDonor });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting donor' });
    }
});
export default router;
