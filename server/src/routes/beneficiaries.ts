import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { beneficiaries } from '../db/schema.js';
import { authenticateJWT, authorize, AuthenticatedRequest } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';
import { z } from 'zod';

const router = Router();

const beneficiarySchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(), // YYYY-MM-DD
  gender: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
  qrCodeId: z.string().optional().nullable(),
});

// GET all
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const list = await db.select().from(beneficiaries).orderBy(desc(beneficiaries.createdAt));
    return res.json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving beneficiaries' });
  }
});

// GET one
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const [ben] = await db.select().from(beneficiaries).where(eq(beneficiaries.id, req.params.id)).limit(1);
    if (!ben) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }
    return res.json(ben);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving beneficiary' });
  }
});

// CREATE
router.post('/', authenticateJWT, authorize(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
  const result = beneficiarySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
  }

  try {
    const qrCode = result.data.qrCodeId || `BEN-QR-${Math.floor(100000 + Math.random() * 900000)}`;
    const [newBen] = await db
      .insert(beneficiaries)
      .values({
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone,
        address: result.data.address,
        dateOfBirth: result.data.dateOfBirth,
        gender: result.data.gender,
        status: result.data.status,
        qrCodeId: qrCode,
      })
      .returning();

    await logActivity(req.user?.id, 'CREATE_BENEFICIARY', 'beneficiaries', newBen.id, `Created beneficiary ${newBen.name}`);

    return res.status(201).json(newBen);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating beneficiary' });
  }
});

// UPDATE
router.put('/:id', authenticateJWT, authorize(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
  const result = beneficiarySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
  }

  try {
    const [updatedBen] = await db
      .update(beneficiaries)
      .set({
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone,
        address: result.data.address,
        dateOfBirth: result.data.dateOfBirth,
        gender: result.data.gender,
        status: result.data.status,
        qrCodeId: result.data.qrCodeId || undefined,
        updatedAt: new Date(),
      })
      .where(eq(beneficiaries.id, req.params.id))
      .returning();

    if (!updatedBen) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }

    await logActivity(req.user?.id, 'UPDATE_BENEFICIARY', 'beneficiaries', updatedBen.id, `Updated beneficiary ${updatedBen.name}`);

    return res.json(updatedBen);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating beneficiary' });
  }
});

// DELETE
router.delete('/:id', authenticateJWT, authorize(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const [deletedBen] = await db
      .delete(beneficiaries)
      .where(eq(beneficiaries.id, req.params.id))
      .returning();

    if (!deletedBen) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }

    await logActivity(req.user?.id, 'DELETE_BENEFICIARY', 'beneficiaries', req.params.id, `Deleted beneficiary ${deletedBen.name}`);

    return res.json({ message: 'Beneficiary deleted successfully', beneficiary: deletedBen });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error deleting beneficiary' });
  }
});

export default router;
