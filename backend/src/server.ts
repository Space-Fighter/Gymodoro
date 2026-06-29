import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

// 🔀 Mount your new auth handlers under /api/auth
app.use('/auth', authRoutes);

app.listen(3000, () => console.log('⚡️ Server running on http://localhost:3000'));