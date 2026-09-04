import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { authenticateJWT } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';
import { z } from 'zod';
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'unms-super-secret-key-123!';
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
router.post('/login', async (req, res) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: 'Invalid inputs', errors: result.error.errors });
    }
    const { email, password } = result.data;
    try {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isMatch = bcrypt.compareSync(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        await logActivity(user.id, 'USER_LOGIN', 'users', user.id, `User ${user.email} logged in.`);
        return res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/logout', authenticateJWT, async (req, res) => {
    if (req.user) {
        await logActivity(req.user.id, 'USER_LOGOUT', 'users', req.user.id, `User ${req.user.email} logged out.`);
    }
    res.clearCookie('token');
    return res.json({ message: 'Logged out successfully' });
});
router.get('/me', authenticateJWT, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    return res.json({ user: req.user });
});
export default router;
