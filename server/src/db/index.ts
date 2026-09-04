import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/unms';

export const pool = new pg.Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
