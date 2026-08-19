import { Router } from 'express';
import {
  getExercises,
  getExerciseById,
  getRandomExerciseHandler,
} from '../controllers/exerciseControllers.js';

const router = Router();

// Public catalog endpoints
router.get('/', getExercises);
router.get('/random', getRandomExerciseHandler);
router.get('/:id', getExerciseById);

export default router;
