import express from 'express';
import * as authController from '../controllers/authControllers.js';
import { authenticate } from '../middleware/authenticate.js';

const authRouter = express.Router();

// Express automatically passes the (req, res) objects into these controller functions
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/google', authController.googleLogin);
authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/logout', authController.logout);
authRouter.post('/resend-verification', authController.resendVerificationEmail);

authRouter.get('/get-me', authController.getMe);
authRouter.get('/verify-email', authController.verifyEmail);

authRouter.delete('/account', authenticate, authController.deleteAccount);

export default authRouter;