import express from 'express';
import * as authController from '../controllers/authControllers.js';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/authenticate.js';

const authRouter = express.Router();

const rateLimitMessage = { message: 'Too many requests. Please try again in a few minutes.' };

// Everything under /api/auth: generous, stops runaway scripts.
const generalAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitMessage,
});

// Endpoints that guess passwords or send email: strict.
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitMessage,
});

authRouter.use(generalAuthLimiter);

// Express automatically passes the (req, res) objects into these controller functions
authRouter.post('/register', strictAuthLimiter, authController.register);
authRouter.post('/login', strictAuthLimiter, authController.login);
authRouter.post('/google', authController.googleLogin);
authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/logout', authController.logout);
authRouter.post('/resend-verification', strictAuthLimiter, authController.resendVerificationEmail);
authRouter.post('/forgot-password', strictAuthLimiter, authController.forgotPassword);
authRouter.post('/reset-password', strictAuthLimiter, authController.resetPassword);

authRouter.get('/get-me', authController.getMe);
authRouter.get('/verify-email', authController.verifyEmail);

authRouter.delete('/account', authenticate, authController.deleteAccount);

export default authRouter;