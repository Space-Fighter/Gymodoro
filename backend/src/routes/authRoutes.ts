import express from 'express';
import * as authController from '../controllers/authControllers.js';

const authRouter = express.Router();

// Express automatically passes the (req, res) objects into these controller functions
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/google', authController.googleLogin);
authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/logout', authController.logout);

authRouter.get('/get-me', authController.getMe);
authRouter.get('/verify-email', authController.verifyEmail);

export default authRouter;