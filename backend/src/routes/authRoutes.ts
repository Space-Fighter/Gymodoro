import express from 'express';
import { register, login } from '../controllers/authControllers.js';

const router = express.Router();

// Express automatically passes the (req, res) objects into these controller functions
router.post('/register', register);
router.post('/login', login);

export default router;