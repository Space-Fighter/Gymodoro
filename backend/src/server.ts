import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

// 🔀 Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/exercises', exerciseRoutes);

const server = app.listen(3000, () => console.log('⚡️ Server running on http://localhost:3000'));

export { app, server };
