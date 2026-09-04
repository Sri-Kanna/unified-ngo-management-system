import { Router } from 'express';
import { sql, desc, gte } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { authenticateJWT } from '../middleware/auth.js';
const router = Router();
router.get('/stats', authenticateJWT, async (req, res) => {
    try {
        // 1. Beneficiaries Count
        const [benCount] = await db
            .select({ count: sql `count(*)::int` })
            .from(schema.beneficiaries);
        // 2. Volunteers Count
        const [volCount] = await db
            .select({ count: sql `count(*)::int` })
            .from(schema.volunteers);
        // 3. Donations Summary
        const [donationsSummary] = await db
            .select({
            totalAmount: sql `coalesce(sum(amount), 0)`,
            count: sql `count(*)::int`,
        })
            .from(schema.donations);
        // 4. Upcoming Events Count
        const [eventCount] = await db
            .select({ count: sql `count(*)::int` })
            .from(schema.events)
            .where(gte(schema.events.startTime, new Date()));
        // 5. Inventory Count (total items)
        const [invCount] = await db
            .select({ count: sql `count(*)::int` })
            .from(schema.inventory);
        // 6. Monthly Donations Chart Data
        const monthlyDonations = await db.execute(sql `
      SELECT 
        TO_CHAR(donation_date, 'YYYY-MM') as month,
        SUM(amount)::float as total
      FROM donations
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `);
        // 7. Resource Distribution (Inventory by Category/Item)
        const resourceDist = await db
            .select({
            name: schema.inventory.itemName,
            value: schema.inventory.quantity,
        })
            .from(schema.inventory)
            .limit(10);
        // 8. Beneficiary Growth
        const beneficiaryGrowth = await db.execute(sql `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*)::int as count
      FROM beneficiaries
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `);
        // 9. Event Participation
        const eventParticipation = await db.execute(sql `
      SELECT 
        e.title,
        COUNT(ep.id)::int as participants
      FROM events e
      LEFT JOIN event_participants ep ON e.id = ep.event_id
      GROUP BY e.id, e.title
      ORDER BY e.start_time DESC
      LIMIT 5
    `);
        // 10. Upcoming Events List
        const upcomingEvents = await db
            .select()
            .from(schema.events)
            .where(gte(schema.events.startTime, new Date()))
            .orderBy(schema.events.startTime)
            .limit(5);
        return res.json({
            cards: {
                beneficiaries: benCount.count,
                volunteers: volCount.count,
                donations: {
                    totalAmount: donationsSummary.totalAmount,
                    count: donationsSummary.count,
                },
                events: eventCount.count,
                inventory: invCount.count,
            },
            charts: {
                monthlyDonations: monthlyDonations.rows,
                resourceDist,
                beneficiaryGrowth: beneficiaryGrowth.rows,
                eventParticipation: eventParticipation.rows,
            },
            upcomingEvents,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving stats' });
    }
});
router.get('/recent-activity', authenticateJWT, async (req, res) => {
    try {
        const activities = await db
            .select({
            id: schema.activityLogs.id,
            action: schema.activityLogs.action,
            details: schema.activityLogs.details,
            timestamp: schema.activityLogs.timestamp,
            userName: schema.users.name,
        })
            .from(schema.activityLogs)
            .leftJoin(schema.users, sql `${schema.activityLogs.userId} = ${schema.users.id}`)
            .orderBy(desc(schema.activityLogs.timestamp))
            .limit(10);
        return res.json(activities);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving activities' });
    }
});
export default router;
