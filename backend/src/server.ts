import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';

dotenv.config();

const app = express();

// Production traffic arrives through nginx, so Express would otherwise see
// nginx's address as every visitor's IP (which breaks rate limiting). Trust
// exactly one proxy hop and read the client IP from X-Forwarded-For.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
// Log the path only: query strings carry secrets (e.g. /verify-email?token=...).
morgan.token('path', (req) => (req as express.Request).originalUrl.split('?')[0]);
app.use(morgan(':method :path :status :response-time ms'));
app.use(cookieParser());

// 🔀 Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/exercises', exerciseRoutes);

const server = app.listen(3000, () => console.log('⚡️ Server running on http://localhost:3000'));

export { app, server };

