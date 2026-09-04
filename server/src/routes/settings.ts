import { Router } from 'express';
import { desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { activityLogs, users } from '../db/schema.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';

const router = Router();

// Mock in-memory config for Settings (stores NGO settings)
let ngoSettings = {
  ngoName: 'A K Social Welfare Trust',
  contactEmail: 'contact@aktrust.org',
  contactPhone: '+91 98765 43210',
  address: '15, K.H. Road, Ayanavaram, Chennai - 600023',
  taxExemptionNumber: '80G-AKTRUST-2026-X89',
  defaultLanguage: 'en',
  maintenanceMode: false,
};

router.get('/', authenticateJWT, (req, res) => {
  return res.json(ngoSettings);
});

router.put('/', authenticateJWT, authorize(['admin']), (req, res) => {
  ngoSettings = {
    ...ngoSettings,
    ...req.body,
  };
  return res.json({ message: 'Settings updated successfully', settings: ngoSettings });
});

router.get('/logs', authenticateJWT, authorize(['admin']), async (req, res) => {
  try {
    const list = await db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        targetTable: activityLogs.targetTable,
        targetId: activityLogs.targetId,
        details: activityLogs.details,
        timestamp: activityLogs.timestamp,
        userName: users.name,
        userEmail: users.email,
      })
      .from(activityLogs)
      .leftJoin(users, sql`${activityLogs.userId} = ${users.id}`)
      .orderBy(desc(activityLogs.timestamp))
      .limit(100);

    return res.json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving audit logs' });
  }
});

export default router;
