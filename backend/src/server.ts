import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import morgan from 'morgan';

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// 🔀 Mount your new auth handlers under /api/auth
app.use('/api/auth', authRoutes);

app.listen(3000, () => console.log('⚡️ Server running on http://localhost:3000'));