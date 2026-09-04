import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { reports, donations, beneficiaries, inventory, volunteers, events, donors } from '../db/schema.js';
import { authenticateJWT, authorize, AuthenticatedRequest } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const reportSchema = z.object({
  title: z.string().min(1),
  reportType: z.enum(['donation', 'beneficiary', 'inventory', 'volunteer', 'event']),
});

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const list = await db.select().from(reports).orderBy(desc(reports.createdAt));
    return res.json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving reports list' });
  }
});

router.post('/generate', authenticateJWT, authorize(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
  const result = reportSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
  }

  const { title, reportType } = result.data;
  const reportsDir = path.join(__dirname, '../../public/reports');

  try {
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    let csvContent = '';

    if (reportType === 'donation') {
      const records = await db
        .select({
          id: donations.id,
          amount: donations.amount,
          date: donations.donationDate,
          type: donations.donationType,
          status: donations.status,
          donorName: donors.name,
        })
        .from(donations)
        .innerJoin(donors, eq(donations.donorId, donors.id));

      csvContent = 'ID,Donor Name,Amount,Date,Type,Status\n';
      records.forEach((r) => {
        csvContent += `"${r.id}","${r.donorName}",${r.amount},"${r.date}","${r.type}","${r.status}"\n`;
      });
    } else if (reportType === 'beneficiary') {
      const records = await db.select().from(beneficiaries);
      csvContent = 'ID,Name,Email,Phone,Address,Gender,Status,QR Code ID\n';
      records.forEach((r) => {
        csvContent += `"${r.id}","${r.name}","${r.email || ''}","${r.phone || ''}","${r.address || ''}","${r.gender || ''}","${r.status}","${r.qrCodeId}"\n`;
      });
    } else if (reportType === 'inventory') {
      const records = await db.select().from(inventory);
      csvContent = 'ID,Item Name,Category,Quantity,Unit,Barcode,Location,Status\n';
      records.forEach((r) => {
        csvContent += `"${r.id}","${r.itemName}","${r.category}",${r.quantity},"${r.unit}","${r.barcode}","${r.location || ''}","${r.status}"\n`;
      });
    } else if (reportType === 'volunteer') {
      const records = await db.select().from(volunteers);
      csvContent = 'ID,Name,Email,Phone,Skills,Availability,Status\n';
      records.forEach((r) => {
        const skillsStr = r.skills ? r.skills.join('; ') : '';
        csvContent += `"${r.id}","${r.name}","${r.email}","${r.phone || ''}","${skillsStr}","${r.availability || ''}","${r.status}"\n`;
      });
    } else if (reportType === 'event') {
      const records = await db.select().from(events);
      csvContent = 'ID,Title,Description,Start Time,End Time,Location,Capacity,Status\n';
      records.forEach((r) => {
        csvContent += `"${r.id}","${r.title}","${r.description || ''}","${r.startTime.toISOString()}","${r.endTime.toISOString()}","${r.location}",${r.capacity || ''},"${r.status}"\n`;
      });
    }

    const fileName = `${reportType}_report_${Date.now()}.csv`;
    const filePath = path.join(reportsDir, fileName);
    fs.writeFileSync(filePath, csvContent);

    // Save report metadata
    const relativePath = `/public/reports/${fileName}`;
    const [newReport] = await db
      .insert(reports)
      .values({
        title,
        reportType,
        filePath: relativePath,
        generatedBy: req.user?.id,
      })
      .returning();

    await logActivity(req.user?.id, 'GENERATE_REPORT', 'reports', newReport.id, `Generated ${reportType} report titled "${title}"`);

    return res.status(201).json(newReport);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error generating report file' });
  }
});

export default router;
