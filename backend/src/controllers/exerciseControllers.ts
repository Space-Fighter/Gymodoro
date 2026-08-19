import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

export const STARTER_EXERCISES = [
  {
    name: 'Jumping Jacks',
    description: 'A classic full-body cardio movement to get your heart rate up and blood circulating after sitting.',
    category: 'cardio',
    difficulty: 'easy',
    duration: 300, // 5 minutes
    caloriesBurned: 35,
    instructions: 'Stand upright with legs together, arms at your sides. Bend your knees slightly, and jump into the air. As you jump, spread your legs to shoulder-width apart and stretch your arms out and over your head. Jump back to starting position and repeat.',
  },
  {
    name: 'High Knees',
    description: 'Dynamic cardio exercise engaging core, hip flexors, and leg muscles while elevating energy.',
    category: 'cardio',
    difficulty: 'medium',
    duration: 300,
    caloriesBurned: 32,
    instructions: 'Stand tall with feet hip-width apart. Lift one knee up to chest level rapidly, then switch to the other leg at a running pace. Pump your arms rhythmically.',
  },
  {
    name: 'Mountain Climbers',
    description: 'High-intensity bodyweight cardio and core exercise for quick metabolism boost.',
    category: 'cardio',
    difficulty: 'hard',
    duration: 300,
    caloriesBurned: 38,
    instructions: 'Start in a high plank position with hands under shoulders. Alternate driving each knee towards your chest in a running motion while keeping your core tight.',
  },
  {
    name: 'Shadow Boxing',
    description: 'Aerobic exercise using rhythmic punches and footwork to release upper body tension.',
    category: 'cardio',
    difficulty: 'medium',
    duration: 300,
    caloriesBurned: 28,
    instructions: 'Adopt a boxing stance with knees slightly bent. Throw controlled combinations of jabs, crosses, hooks, and uppercuts while keeping light on your feet.',
  },
  {
    name: 'Bodyweight Squats',
    description: 'Fundamental lower body strength movement targeting quads, hamstrings, and glutes.',
    category: 'strength',
    difficulty: 'medium',
    duration: 300,
    caloriesBurned: 26,
    instructions: 'Stand with feet shoulder-width apart. Lower your hips back and down as if sitting in an imaginary chair. Keep chest upright and knees tracking over toes. Return to standing.',
  },
  {
    name: 'Push-ups',
    description: 'Upper body and core strengthening exercise targeting chest, shoulders, and triceps.',
    category: 'strength',
    difficulty: 'hard',
    duration: 300,
    caloriesBurned: 28,
    instructions: 'Place hands on floor slightly wider than shoulders. Keep body in a straight plank. Lower chest until nearly touching floor, then push back up. Incline or knee modifications are welcome.',
  },
  {
    name: 'Alternating Lunges',
    description: 'Single-leg strength exercise promoting stability, balance, and leg power.',
    category: 'strength',
    difficulty: 'medium',
    duration: 300,
    caloriesBurned: 24,
    instructions: 'Step forward with one leg until both knees are bent at 90-degree angles. Push off front foot back to start, then repeat on opposite side.',
  },
  {
    name: 'Isometric Wall Sit',
    description: 'Static hold targeting quadriceps endurance and posture.',
    category: 'strength',
    difficulty: 'medium',
    duration: 300,
    caloriesBurned: 20,
    instructions: 'Press back flat against a wall and slide down until knees are at 90 degrees and thighs parallel to floor. Hold position steadily while breathing deeply.',
  },
  {
    name: 'Desk Neck & Shoulder Relief',
    description: 'Gentle restorative stretches relieving cervical and trapezius stiffness from desk work.',
    category: 'stretch',
    difficulty: 'easy',
    duration: 300,
    caloriesBurned: 10,
    instructions: 'Gently tilt ear to shoulder, holding 20 seconds per side. Follow with gentle chin tucks, shoulder rolls backwards and forwards, and upper trapezius stretches.',
  },
  {
    name: 'Standing Hamstring & Back Stretch',
    description: 'Stretching posterior chain to decompress lower back and open tight hamstrings.',
    category: 'stretch',
    difficulty: 'easy',
    duration: 300,
    caloriesBurned: 12,
    instructions: 'Stand tall, hinge at the hips with soft knees, and reach gently towards toes or shins. Breathe deeply into the lower back for 30-second cycles.',
  },
  {
    name: 'Cobra Pose & Child’s Pose Flow',
    description: 'Yoga flow to lengthen hip flexors, extend spine, and calm the nervous system.',
    category: 'stretch',
    difficulty: 'easy',
    duration: 300,
    caloriesBurned: 12,
    instructions: 'Lie face down and press chest up into Cobra Pose. Then shift hips back onto heels into Child\'s Pose with arms outstretched. Alternate slowly with deep breaths.',
  },
  {
    name: 'Wrist, Forearm & Finger Mobility',
    description: 'Essential ergonomic routine for typing fatigue and carpal tunnel prevention.',
    category: 'mobility',
    difficulty: 'easy',
    duration: 300,
    caloriesBurned: 8,
    instructions: 'Extend arm with palm facing up, gently pull fingers back with opposite hand. Repeat with palm facing down. Perform slow wrist rotations clockwise and counterclockwise.',
  },
  {
    name: 'Thoracic Spine Openers',
    description: 'Upper back rotational mobility restoring posture and opening ribcage expansion.',
    category: 'mobility',
    difficulty: 'easy',
    duration: 300,
    caloriesBurned: 14,
    instructions: 'Stand or sit upright with hands behind head. Rotate torso smoothly to left, pause, then rotate to right. Follow with gentle chest-opening backward extensions.',
  },
  {
    name: 'Plank Hold',
    description: 'Isometric abdominal and core stabilizer creating solid core engagement.',
    category: 'core',
    difficulty: 'medium',
    duration: 300,
    caloriesBurned: 22,
    instructions: 'Rest on forearms and toes, forming a straight line from heels to crown. Tighten abdominals and glutes, preventing hips from sagging or rising.',
  },
  {
    name: 'Bicycle Crunches',
    description: 'Dynamic rotational core movement engaging rectus abdominis and obliques.',
    category: 'core',
    difficulty: 'medium',
    duration: 300,
    caloriesBurned: 25,
    instructions: 'Lie on back with hands behind head and legs raised. Bring opposite elbow to knee while extending the other leg straight, alternating smoothly.',
  },
];

/**
 * Ensures starter exercises exist in the database.
 */
export async function seedStarterExercises() {
  const count = await prisma.exercise.count();
  if (count === 0) {
    await prisma.exercise.createMany({
      data: STARTER_EXERCISES,
      skipDuplicates: true,
    });
  }
}

/**
 * Standalone helper to pick a random exercise from the catalog.
 * Directly imported and invoked by Track B's startBreak endpoint.
 */
export async function getRandomExercise(category?: string) {
  await seedStarterExercises();

  const where: any = {};
  if (category && typeof category === 'string' && category.trim() !== '') {
    where.category = { equals: category.trim().toLowerCase(), mode: 'insensitive' };
  }

  const count = await prisma.exercise.count({ where });
  if (count === 0) {
    // If no exercises found for specific category, fallback to any available exercise
    const totalCount = await prisma.exercise.count();
    if (totalCount === 0) return null;
    const randomSkip = Math.floor(Math.random() * totalCount);
    const fallback = await prisma.exercise.findMany({
      skip: randomSkip,
      take: 1,
    });
    return fallback[0] || null;
  }

  const skip = Math.floor(Math.random() * count);
  const exercises = await prisma.exercise.findMany({
    where,
    skip,
    take: 1,
  });

  return exercises[0] || null;
}

/**
 * GET /api/exercises
 * List catalog exercises with optional category & difficulty filters.
 */
export async function getExercises(req: Request, res: Response) {
  try {
    await seedStarterExercises();

    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const difficulty = typeof req.query.difficulty === 'string' ? req.query.difficulty : undefined;
    const where: any = {};

    if (category) {
      where.category = { equals: category.toLowerCase(), mode: 'insensitive' };
    }
    if (difficulty) {
      where.difficulty = { equals: difficulty.toLowerCase(), mode: 'insensitive' };
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      count: exercises.length,
      exercises,
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return res.status(500).json({ error: 'Failed to fetch exercises.' });
  }
}

/**
 * GET /api/exercises/random
 * Return a random exercise.
 */
export async function getRandomExerciseHandler(req: Request, res: Response) {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const exercise = await getRandomExercise(category);

    if (!exercise) {
      return res.status(404).json({ message: 'No exercises available.' });
    }

    return res.status(200).json({ exercise });
  } catch (error) {
    console.error('Error picking random exercise:', error);
    return res.status(500).json({ error: 'Failed to pick random exercise.' });
  }
}

/**
 * GET /api/exercises/:id
 * Single exercise detail.
 */
export async function getExerciseById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found.' });
    }

    return res.status(200).json({ exercise });
  } catch (error) {
    console.error('Error fetching exercise details:', error);
    return res.status(500).json({ error: 'Failed to fetch exercise details.' });
  }
}
