import express from 'express';
import * as exerciseController from '../controllers/exerciseControllers.js';

const exerciseRouter = express.Router();

// /random must be registered before /:id, or Express will match "random"
// as an :id path param and route it to getExerciseById instead.
exerciseRouter.get('/random', exerciseController.getRandomExercise);
exerciseRouter.get('/:id', exerciseController.getExerciseById);
exerciseRouter.get('/', exerciseController.listExercises);

export default exerciseRouter;
