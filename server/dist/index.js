import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import beneficiaryRouter from './routes/beneficiaries.js';
import donorRouter from './routes/donors.js';
import donationRouter from './routes/donations.js';
import inventoryRouter from './routes/inventory.js';
import volunteerRouter from './routes/volunteers.js';
import eventRouter from './routes/events.js';
import reportRouter from './routes/reports.js';
import settingsRouter from './routes/settings.js';
import chatRouter from './routes/chat.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;
// Security Middlewares
app.use(helmet({
    crossOriginResourcePolicy: false, // needed to fetch/download files from client side
}));
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Static folder for files and downloads
app.use('/public', express.static(path.join(__dirname, '../public')));
// Rate Limiting for APIs
app.use('/api/', apiRateLimiter);
// Route Bindings
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/beneficiaries', beneficiaryRouter);
app.use('/api/donors', donorRouter);
app.use('/api/donations', donationRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/volunteers', volunteerRouter);
app.use('/api/events', eventRouter);
app.use('/api/reports', reportRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/chat', chatRouter);
// Base route status check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : {},
    });
});
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
