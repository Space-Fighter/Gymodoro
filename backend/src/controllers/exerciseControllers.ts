import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

const VALID_DIFFICULTIES = ['light', 'easy', 'normal', 'hard', 'advanced', 'untagged'];

// Shared include shape so list/single/random all return the same tag shape.
const EXERCISE_INCLUDE = {
  muscleGroups: { include: { muscleGroup: true } },
  equipment: { include: { equipment: true } },
  exerciseTypes: { include: { exerciseType: true } },
  difficulty: true,
  bodyArea: true,
} as const;

// Flattens the join-table wrapper objects into plain string arrays so
// clients don't have to unwrap muscleGroups[].muscleGroup.name.
function serializeExercise(exercise: any) {
  const { muscleGroups, equipment, exerciseTypes, difficulty, bodyArea, ...rest } = exercise;
  return {
    ...rest,
    muscleGroups: muscleGroups.map((mg: any) => mg.muscleGroup.name),
    equipment: equipment.map((e: any) => e.equipment.name),
    exerciseTypes: exerciseTypes.map((et: any) => et.exerciseType.name),
    difficulty: difficulty.name,
    bodyArea: bodyArea?.name ?? null,
  };
}

// Builds a Prisma `where` clause shared by list + random, from
// ?muscleGroup=&equipment=&type=&difficulty= query params.
function buildWhere(query: Request['query']) {
  const { muscleGroup, equipment, type, difficulty, bodyArea } = query;
  const where: any = {};

  if (typeof difficulty === 'string') {
    where.difficulty = { name: { equals: difficulty, mode: 'insensitive' } };
  }
  if (typeof bodyArea === 'string') {
    where.bodyArea = { name: { equals: bodyArea, mode: 'insensitive' } };
  }
  if (typeof muscleGroup === 'string') {
    where.muscleGroups = { some: { muscleGroup: { name: { equals: muscleGroup, mode: 'insensitive' } } } };
  }
  if (typeof equipment === 'string') {
    where.equipment = { some: { equipment: { name: { equals: equipment, mode: 'insensitive' } } } };
  }
  if (typeof type === 'string') {
    where.exerciseTypes = { some: { exerciseType: { name: { equals: type, mode: 'insensitive' } } } };
  }
  return where;
}

export async function listExercises(req: Request, res: Response) {
  try {
    const { difficulty } = req.query;
    if (typeof difficulty === 'string' && !VALID_DIFFICULTIES.includes(difficulty.toLowerCase())) {
      return res.status(400).json({ message: `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}.` });
    }

    const where = buildWhere(req.query);
    const exercises = await prisma.exercise.findMany({ where, include: EXERCISE_INCLUDE, orderBy: { name: 'asc' } });

    res.status(200).json({ exercises: exercises.map(serializeExercise), count: exercises.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exercises.' });
  }
}

export async function getExerciseById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const exercise = await prisma.exercise.findUnique({ where: { id }, include: EXERCISE_INCLUDE });

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found.' });
    }

    res.status(200).json({ exercise: serializeExercise(exercise) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exercise.' });
  }
}

export async function getRandomExercise(req: Request, res: Response) {
  try {
    const { difficulty } = req.query;
    if (typeof difficulty === 'string' && !VALID_DIFFICULTIES.includes(difficulty.toLowerCase())) {
      return res.status(400).json({ message: `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}.` });
    }

    const where = buildWhere(req.query);

    // Catalog is small (~15-20 rows), so picking a random id in JS and
    // re-fetching it is simpler than a raw ORDER BY RANDOM() query and
    // reuses buildWhere instead of duplicating the filter logic in SQL.
    const matchingIds = await prisma.exercise.findMany({ where, select: { id: true } });
    if (matchingIds.length === 0) {
      return res.status(404).json({ message: 'No exercises match the given filters.' });
    }

    const randomId = matchingIds[Math.floor(Math.random() * matchingIds.length)].id;
    const exercise = await prisma.exercise.findUnique({ where: { id: randomId }, include: EXERCISE_INCLUDE });

    res.status(200).json({ exercise: serializeExercise(exercise!) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch a random exercise.' });
  }
}
