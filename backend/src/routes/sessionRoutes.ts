import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  createSession,
  startBreak,
  updateSession,
  getSessions,
  getSessionById,
  getSessionStats,
} from '../controllers/sessionControllers.js';

const router = Router();

// All session endpoints require authentication
router.use(authenticate);

// 1. Session statistics (must precede /:id)
router.get('/stats', getSessionStats);

// 2. Start a new Pomodoro session
router.post('/', createSession);

// 3. Get session history
router.get('/', getSessions);

// 4. Get single session details
router.get('/:id', getSessionById);

// 5. Start break & assign random exercise
router.patch('/:id/start-break', startBreak);

// 6. Update session status
router.patch('/:id', updateSession);

export default router;
