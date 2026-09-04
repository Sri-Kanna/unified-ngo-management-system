import { pgTable, uuid, text, numeric, integer, timestamp, date, boolean } from 'drizzle-orm/pg-core';
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').notNull(), // 'admin', 'staff', 'volunteer'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const beneficiaries = pgTable('beneficiaries', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    address: text('address'),
    dateOfBirth: date('date_of_birth'),
    gender: text('gender'),
    status: text('status').default('active').notNull(), // 'active', 'inactive'
    qrCodeId: text('qr_code_id').unique().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const donors = pgTable('donors', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    phone: text('phone'),
    address: text('address'),
    donorType: text('donor_type').notNull(), // 'individual', 'corporate'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const donations = pgTable('donations', {
    id: uuid('id').defaultRandom().primaryKey(),
    donorId: uuid('donor_id').references(() => donors.id, { onDelete: 'cascade' }).notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    donationDate: date('donation_date').notNull(),
    donationType: text('donation_type').notNull(), // 'monetary', 'in-kind'
    description: text('description'),
    status: text('status').default('completed').notNull(), // 'completed', 'pending'
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const inventory = pgTable('inventory', {
    id: uuid('id').defaultRandom().primaryKey(),
    itemName: text('item_name').notNull(),
    category: text('category').notNull(),
    quantity: integer('quantity').notNull(),
    unit: text('unit').notNull(), // 'kg', 'units', 'boxes'
    barcode: text('barcode').unique().notNull(),
    location: text('location'),
    status: text('status').default('in-stock').notNull(), // 'in-stock', 'low-stock', 'out-of-stock'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const volunteers = pgTable('volunteers', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    phone: text('phone'),
    skills: text('skills').array(),
    availability: text('availability'), // 'weekdays', 'weekends', 'flexible'
    status: text('status').default('active').notNull(), // 'active', 'inactive'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const events = pgTable('events', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time').notNull(),
    location: text('location').notNull(),
    capacity: integer('capacity'),
    status: text('status').default('scheduled').notNull(), // 'scheduled', 'ongoing', 'completed', 'cancelled'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const eventParticipants = pgTable('event_participants', {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // 'volunteer', 'beneficiary', 'staff'
    attended: boolean('attended').default(false).notNull(),
    registeredAt: timestamp('registered_at').defaultNow().notNull(),
});
export const reports = pgTable('reports', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    reportType: text('report_type').notNull(), // 'donation', 'beneficiary', 'inventory', 'volunteer', 'event'
    filePath: text('file_path').notNull(),
    generatedBy: uuid('generated_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const activityLogs = pgTable('activity_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    targetTable: text('target_table'),
    targetId: uuid('target_id'),
    details: text('details'),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
});
