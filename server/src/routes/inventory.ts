import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { inventory } from '../db/schema.js';
import { authenticateJWT, authorize, AuthenticatedRequest } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';
import { z } from 'zod';

const router = Router();

const inventorySchema = z.object({
  itemName: z.string().min(1),
  category: z.string().min(1),
  quantity: z.number().int().nonnegative(),
  unit: z.string().min(1),
  barcode: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  status: z.enum(['in-stock', 'low-stock', 'out-of-stock']).default('in-stock'),
});

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const list = await db.select().from(inventory).orderBy(desc(inventory.createdAt));
    return res.json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving inventory items' });
  }
});

router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, req.params.id)).limit(1);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    return res.json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving inventory item' });
  }
});

router.post('/', authenticateJWT, authorize(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
  const result = inventorySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
  }

  try {
    const code = result.data.barcode || `INV-BAR-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Auto status
    let autoStatus = result.data.status;
    if (result.data.quantity === 0) {
      autoStatus = 'out-of-stock';
    } else if (result.data.quantity <= 10) {
      autoStatus = 'low-stock';
    } else {
      autoStatus = 'in-stock';
    }

    const [newItem] = await db
      .insert(inventory)
      .values({
        itemName: result.data.itemName,
        category: result.data.category,
        quantity: result.data.quantity,
        unit: result.data.unit,
        barcode: code,
        location: result.data.location,
        status: autoStatus,
      })
      .returning();

    await logActivity(req.user?.id, 'CREATE_INVENTORY', 'inventory', newItem.id, `Created inventory item ${newItem.itemName}`);
    return res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating inventory item' });
  }
});

router.put('/:id', authenticateJWT, authorize(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
  const result = inventorySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
  }

  try {
    let autoStatus = result.data.status;
    if (result.data.quantity === 0) {
      autoStatus = 'out-of-stock';
    } else if (result.data.quantity <= 10) {
      autoStatus = 'low-stock';
    } else {
      autoStatus = 'in-stock';
    }

    const [updatedItem] = await db
      .update(inventory)
      .set({
        itemName: result.data.itemName,
        category: result.data.category,
        quantity: result.data.quantity,
        unit: result.data.unit,
        barcode: result.data.barcode || undefined,
        location: result.data.location,
        status: autoStatus,
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, req.params.id))
      .returning();

    if (!updatedItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    await logActivity(req.user?.id, 'UPDATE_INVENTORY', 'inventory', updatedItem.id, `Updated inventory item ${updatedItem.itemName}`);
    return res.json(updatedItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating inventory item' });
  }
});

router.delete('/:id', authenticateJWT, authorize(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const [deletedItem] = await db
      .delete(inventory)
      .where(eq(inventory.id, req.params.id))
      .returning();

    if (!deletedItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    await logActivity(req.user?.id, 'DELETE_INVENTORY', 'inventory', req.params.id, `Deleted inventory item ${deletedItem.itemName}`);
    return res.json({ message: 'Inventory item deleted successfully', item: deletedItem });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error deleting inventory item' });
  }
});

export default router;
