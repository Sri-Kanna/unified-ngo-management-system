import { db, pool } from './index.js';
import * as schema from './schema.js';
import bcrypt from 'bcrypt';
const hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};
async function main() {
    console.log('Seeding database...');
    try {
        // Clear existing data in reverse order of foreign keys
        await db.delete(schema.activityLogs);
        await db.delete(schema.reports);
        await db.delete(schema.eventParticipants);
        await db.delete(schema.events);
        await db.delete(schema.volunteers);
        await db.delete(schema.inventory);
        await db.delete(schema.donations);
        await db.delete(schema.donors);
        await db.delete(schema.beneficiaries);
        await db.delete(schema.users);
        console.log('Database cleared.');
        // 1. Seed Users
        const [adminUser, staffUser, volunteerUser] = await db.insert(schema.users).values([
            {
                name: 'Admin User',
                email: 'admin@unms.org',
                passwordHash: hashPassword('Admin@123'),
                role: 'admin',
            },
            {
                name: 'Staff User',
                email: 'staff@unms.org',
                passwordHash: hashPassword('Staff@123'),
                role: 'staff',
            },
            {
                name: 'Volunteer User',
                email: 'volunteer@unms.org',
                passwordHash: hashPassword('Volunteer@123'),
                role: 'volunteer',
            },
        ]).returning();
        console.log('Users seeded.');
        // Add extra volunteer users
        const [vol1, vol2] = await db.insert(schema.users).values([
            {
                name: 'Karthik Raja',
                email: 'karthik@example.com',
                passwordHash: hashPassword('Volunteer@123'),
                role: 'volunteer',
            },
            {
                name: 'Priya Sundar',
                email: 'priya@example.com',
                passwordHash: hashPassword('Volunteer@123'),
                role: 'volunteer',
            },
        ]).returning();
        // 2. Seed Beneficiaries
        const beneficiariesData = await db.insert(schema.beneficiaries).values([
            {
                name: 'Anbarasan M',
                email: 'anbu@example.com',
                phone: '9876543210',
                address: '12, Gandhi Street, Chennai',
                dateOfBirth: '1995-04-12',
                gender: 'Male',
                status: 'active',
                qrCodeId: 'BEN-QR-001',
            },
            {
                name: 'Lakshmi R',
                email: 'lakshmi@example.com',
                phone: '9876543211',
                address: '45, Nehru Salai, Trichy',
                dateOfBirth: '1988-11-23',
                gender: 'Female',
                status: 'active',
                qrCodeId: 'BEN-QR-002',
            },
            {
                name: 'Selvam K',
                email: 'selvam@example.com',
                phone: '9876543212',
                address: '7, Temple Road, Madurai',
                dateOfBirth: '2001-08-05',
                gender: 'Male',
                status: 'active',
                qrCodeId: 'BEN-QR-003',
            },
            {
                name: 'Meenakshi S',
                email: 'meena@example.com',
                phone: '9876543213',
                address: '102, West Car Street, Coimbatore',
                dateOfBirth: '1976-02-28',
                gender: 'Female',
                status: 'active',
                qrCodeId: 'BEN-QR-004',
            },
            {
                name: 'Dinesh Kumar',
                email: 'dinesh@example.com',
                phone: '9876543214',
                address: '3/42, Anna Nagar, Salem',
                dateOfBirth: '1999-07-19',
                gender: 'Male',
                status: 'inactive',
                qrCodeId: 'BEN-QR-005',
            },
        ]).returning();
        console.log('Beneficiaries seeded.');
        // 3. Seed Donors
        const [donor1, donor2, donor3] = await db.insert(schema.donors).values([
            {
                name: 'Ramesh Krishnan',
                email: 'ramesh@example.com',
                phone: '9443210987',
                address: '54, Lloyds Road, Chennai',
                donorType: 'individual',
            },
            {
                name: 'Tata Consultancy Services',
                email: 'csr@tcs.com',
                phone: '044-66112233',
                address: 'Siruseri IT Park, Chennai',
                donorType: 'corporate',
            },
            {
                name: 'Shanti Foundation',
                email: 'contact@shantifoundation.org',
                phone: '9123456789',
                address: '15, Palace Road, Bangalore',
                donorType: 'corporate',
            },
        ]).returning();
        console.log('Donors seeded.');
        // 4. Seed Donations
        await db.insert(schema.donations).values([
            {
                donorId: donor1.id,
                amount: '15000.00',
                donationDate: '2026-05-10',
                donationType: 'monetary',
                description: 'Educational scholarship support',
                status: 'completed',
            },
            {
                donorId: donor2.id,
                amount: '250000.00',
                donationDate: '2026-06-01',
                donationType: 'monetary',
                description: 'CSR contribution for health camp',
                status: 'completed',
            },
            {
                donorId: donor3.id,
                amount: '50000.00',
                donationDate: '2026-06-15',
                donationType: 'monetary',
                description: 'Monthly operational support funding',
                status: 'completed',
            },
            {
                donorId: donor1.id,
                amount: '5000.00',
                donationDate: '2026-06-20',
                donationType: 'monetary',
                description: 'Dry ration kit donation support',
                status: 'completed',
            },
        ]);
        console.log('Donations seeded.');
        // 5. Seed Inventory
        await db.insert(schema.inventory).values([
            {
                itemName: 'Rice Bags (25kg)',
                category: 'Food',
                quantity: 120,
                unit: 'bags',
                barcode: 'INV-BAR-001',
                location: 'Main Warehouse Chennai',
                status: 'in-stock',
            },
            {
                itemName: 'Cooking Oil (1L)',
                category: 'Food',
                quantity: 8,
                unit: 'bottles',
                barcode: 'INV-BAR-002',
                location: 'Main Warehouse Chennai',
                status: 'low-stock',
            },
            {
                itemName: 'First Aid Kits',
                category: 'Medical',
                quantity: 45,
                unit: 'kits',
                barcode: 'INV-BAR-003',
                location: 'Health Centre Room A',
                status: 'in-stock',
            },
            {
                itemName: 'Wheelchairs',
                category: 'Medical Equipment',
                quantity: 12,
                unit: 'units',
                barcode: 'INV-BAR-004',
                location: 'Rehab Depot B',
                status: 'in-stock',
            },
            {
                itemName: 'Blankets',
                category: 'Disaster Relief',
                quantity: 0,
                unit: 'units',
                barcode: 'INV-BAR-005',
                location: 'Disaster Store C',
                status: 'out-of-stock',
            },
        ]);
        console.log('Inventory seeded.');
        // 6. Seed Volunteers
        await db.insert(schema.volunteers).values([
            {
                userId: volunteerUser.id,
                name: volunteerUser.name,
                email: volunteerUser.email,
                phone: '9001234567',
                skills: ['Teaching', 'Event Organizing'],
                availability: 'weekends',
                status: 'active',
            },
            {
                userId: vol1.id,
                name: vol1.name,
                email: vol1.email,
                phone: '9007654321',
                skills: ['First Aid', 'Driving', 'Translation'],
                availability: 'weekdays',
                status: 'active',
            },
            {
                userId: vol2.id,
                name: vol2.name,
                email: vol2.email,
                phone: '9881122334',
                skills: ['Social Media', 'Data Entry', 'Tamil Translation'],
                availability: 'flexible',
                status: 'active',
            },
        ]);
        console.log('Volunteers seeded.');
        // 7. Seed Events
        const [event1, event2, event3] = await db.insert(schema.events).values([
            {
                title: 'Community Health Camp 2026',
                description: 'Free medical checkups, general physician consultations, and free medicines distribution.',
                startTime: new Date('2026-06-10T09:00:00Z'),
                endTime: new Date('2026-06-10T16:00:00Z'),
                location: 'A K Trust Community Hall, Madhavaram',
                capacity: 150,
                status: 'completed',
            },
            {
                title: 'Free Educational Kit Distribution',
                description: 'Distributing bags, notebooks, and writing materials to local school children from lower income backgrounds.',
                startTime: new Date('2026-06-28T10:00:00Z'),
                endTime: new Date('2026-06-28T13:00:00Z'),
                location: 'Government High School, Royapuram',
                capacity: 200,
                status: 'scheduled',
            },
            {
                title: 'Volunteer Orientation & Training',
                description: 'Introduction to A K Social Welfare Trust projects, code of conduct, and task allocations.',
                startTime: new Date('2026-07-05T14:00:00Z'),
                endTime: new Date('2026-07-05T17:00:00Z'),
                location: 'Main Trust Head Office Conference Room',
                capacity: 50,
                status: 'scheduled',
            },
        ]).returning();
        console.log('Events seeded.');
        // 8. Seed Event Participants
        await db.insert(schema.eventParticipants).values([
            // Health Camp participants
            {
                eventId: event1.id,
                userId: volunteerUser.id,
                role: 'volunteer',
                attended: true,
            },
            {
                eventId: event1.id,
                userId: vol1.id,
                role: 'volunteer',
                attended: true,
            },
            // Educational Kit participants (registered for upcoming event)
            {
                eventId: event2.id,
                userId: volunteerUser.id,
                role: 'volunteer',
                attended: false,
            },
            {
                eventId: event2.id,
                userId: vol2.id,
                role: 'volunteer',
                attended: false,
            },
        ]);
        console.log('Event Participants seeded.');
        // 9. Seed Activity Logs
        await db.insert(schema.activityLogs).values([
            {
                userId: adminUser.id,
                action: 'USER_LOGIN',
                details: 'Admin user successfully logged in from localhost.',
            },
            {
                userId: adminUser.id,
                action: 'DB_SEED',
                details: 'Initial system seeding and initialization successfully run.',
            },
        ]);
        console.log('Activity logs seeded.');
        console.log('Database seeding successfully finished!');
    }
    catch (error) {
        console.error('Error during seeding database:', error);
        process.exit(1);
    }
    finally {
        await pool.end();
    }
}
main();
