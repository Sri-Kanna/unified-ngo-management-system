import { Router } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { donations, donors } from '../db/schema.js';
import { authenticateJWT, authorize, AuthenticatedRequest } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';
import { z } from 'zod';

const router = Router();

const donationSchema = z.object({
  donorId: z.string().uuid(),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  donationDate: z.string(), // YYYY-MM-DD
  donationType: z.enum(['monetary', 'in-kind']).default('monetary'),
  description: z.string().optional().nullable(),
  status: z.enum(['completed', 'pending']).default('completed'),
});

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const list = await db
      .select({
        id: donations.id,
        amount: donations.amount,
        donationDate: donations.donationDate,
        donationType: donations.donationType,
        description: donations.description,
        status: donations.status,
        createdAt: donations.createdAt,
        donorName: donors.name,
        donorEmail: donors.email,
        donorId: donors.id,
      })
      .from(donations)
      .innerJoin(donors, eq(donations.donorId, donors.id))
      .orderBy(desc(donations.createdAt));

    return res.json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving donations' });
  }
});

router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const [donation] = await db
      .select({
        id: donations.id,
        amount: donations.amount,
        donationDate: donations.donationDate,
        donationType: donations.donationType,
        description: donations.description,
        status: donations.status,
        createdAt: donations.createdAt,
        donorName: donors.name,
        donorEmail: donors.email,
        donorId: donors.id,
      })
      .from(donations)
      .innerJoin(donors, eq(donations.donorId, donors.id))
      .where(eq(donations.id, req.params.id))
      .limit(1);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    return res.json(donation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving donation' });
  }
});

router.post('/', authenticateJWT, authorize(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
  const result = donationSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
  }

  try {
    const [newDonation] = await db.insert(donations).values(result.data).returning();
    await logActivity(
      req.user?.id,
      'CREATE_DONATION',
      'donations',
      newDonation.id,
      `Created donation of ₹${newDonation.amount}`
    );
    return res.status(201).json(newDonation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating donation' });
  }
});

router.put('/:id', authenticateJWT, authorize(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
  const result = donationSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
  }

  try {
    const [updatedDonation] = await db
      .update(donations)
      .set(result.data)
      .where(eq(donations.id, req.params.id))
      .returning();

    if (!updatedDonation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    await logActivity(
      req.user?.id,
      'UPDATE_DONATION',
      'donations',
      updatedDonation.id,
      `Updated donation of ₹${updatedDonation.amount}`
    );
    return res.json(updatedDonation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating donation' });
  }
});

router.delete('/:id', authenticateJWT, authorize(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const [deletedDonation] = await db
      .delete(donations)
      .where(eq(donations.id, req.params.id))
      .returning();

    if (!deletedDonation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    await logActivity(
      req.user?.id,
      'DELETE_DONATION',
      'donations',
      req.params.id,
      `Deleted donation of ₹${deletedDonation.amount}`
    );
    return res.json({ message: 'Donation deleted successfully', donation: deletedDonation });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error deleting donation' });
  }
});

export default router;
