import { db } from '../db/index.js';
import { activityLogs } from '../db/schema.js';
export async function logActivity(userId, action, targetTable, targetId, details) {
    try {
        await db.insert(activityLogs).values({
            userId,
            action,
            targetTable,
            targetId,
            details,
        });
    }
    catch (err) {
        console.error('Failed to write activity log:', err);
    }
}
