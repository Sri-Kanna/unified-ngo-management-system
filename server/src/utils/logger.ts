import { db } from '../db/index.js';
import { activityLogs } from '../db/schema.js';

export async function logActivity(
  userId: string | undefined,
  action: string,
  targetTable?: string,
  targetId?: string,
  details?: string
) {
  try {
    await db.insert(activityLogs).values({
      userId,
      action,
      targetTable,
      targetId,
      details,
    });
  } catch (err) {
    console.error('Failed to write activity log:', err);
  }
}
