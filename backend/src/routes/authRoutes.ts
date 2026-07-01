import express from 'express';
import * as authController from '../controllers/authControllers.js';

const authRouter = express.Router();

// Express automatically passes the (req, res) objects into these controller functions
authRouter.post('/register', authController.register);
// authRouter.post('/login', authController.login);

export default authRouter;