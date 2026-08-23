// Exercise data sourced from the wger open exercise database (https://wger.de),
// licensed CC-BY-SA 3.0. Each record keeps its wger id/uuid under `source`.
//
// Reads the static prisma/exercise-seed-data.json snapshot — no network calls,
// so this is fast, offline and deterministic. Refresh the snapshot with
// `npm run db:import-wger`. Idempotent: safe to re-run.
//
// Run with: npm run db:seed (or npx prisma db seed)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { prisma } from '../lib/prisma.js';
import type { SeedExercise } from './types.js';

// MET (Metabolic Equivalent of Task) values from the Compendium of Physical
// Activities (Ainsworth et al.), the standard reference fitness apps use to
// estimate calorie burn, matched to this catalog's exerciseTypes tags.
const MET_BY_EXERCISE_TYPE: Record<string, number> = {
  stretching: 2.5, // hatha yoga / stretching, light effort
  yoga: 3.0, // yoga, general
  strength: 5.0, // resistance training, moderate-vigorous effort
  cardio: 7.0, // aerobic exercise, general
  metcon: 8.0, // circuit training, vigorous effort, minimal rest
  combat: 9.0, // martial arts / boxing, vigorous effort
};

// Difficulty tag scales intensity within a MET category (e.g. "advanced"
// strength work burns more per minute than "light" strength work).
const DIFFICULTY_INTENSITY_MULTIPLIER: Record<string, number> = {
  light: 0.85,
  easy: 0.85,
  normal: 1.0,
  hard: 1.15,
  advanced: 1.3,
};

// The app doesn't track per-user body weight yet, so estimates use this as a
// reference adult body weight — the standard fallback used by MET-based
// calorie calculators when actual weight is unavailable.
const REFERENCE_BODY_WEIGHT_KG = 70;

function estimateCaloriesPerMinute(exercise: SeedExercise): number {
  if (exercise.caloriesPerMinute) return exercise.caloriesPerMinute;

  const types = exercise.exerciseTypes.length ? exercise.exerciseTypes : ['strength'];
  const avgMet =
    types.reduce((sum, t) => sum + (MET_BY_EXERCISE_TYPE[t] ?? MET_BY_EXERCISE_TYPE.strength), 0) /
    types.length;
  const multiplier = DIFFICULTY_INTENSITY_MULTIPLIER[exercise.difficulty.toLowerCase()] ?? 1.0;

  // Standard MET-to-calorie formula: kcal/min = MET * 3.5 * bodyWeightKg / 200
  const kcalPerMinute = (avgMet * multiplier * 3.5 * REFERENCE_BODY_WEIGHT_KG) / 200;
  return Number(kcalPerMinute.toFixed(2));
}

/** Upserts each name into a lookup table and returns a name → id map. */
async function upsertLookup(
  model: { upsert: (args: any) => Promise<{ id: string; name: string }> },
  names: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const name of names) {
    const row = await model.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    map.set(name, row.id);
  }
  return map;
}

async function main() {
  const dataPath = join(import.meta.dirname, 'exercise-seed-data.json');
  const exercises: SeedExercise[] = JSON.parse(readFileSync(dataPath, 'utf8'));
  console.log(`🌱 Seeding ${exercises.length} exercises from ${dataPath}`);

  const allMuscleGroups = [...new Set(exercises.flatMap((e) => e.muscleGroups))];
  const allEquipment = [...new Set(exercises.flatMap((e) => e.equipment))];
  const allExerciseTypes = [...new Set(exercises.flatMap((e) => e.exerciseTypes))];
  const allDifficulties = [...new Set(exercises.map((e) => e.difficulty))];
  const allBodyAreas = [...new Set(exercises.flatMap((e) => (e.bodyArea ? [e.bodyArea] : [])))];

  const muscleGroupIds = await upsertLookup(prisma.muscleGroup, allMuscleGroups);
  const equipmentIds = await upsertLookup(prisma.equipment, allEquipment);
  const exerciseTypeIds = await upsertLookup(prisma.exerciseType, allExerciseTypes);
  const difficultyIds = await upsertLookup(prisma.difficulty, allDifficulties);
  const bodyAreaIds = await upsertLookup(prisma.bodyArea, allBodyAreas);

  console.log(
    `   Lookups: ${muscleGroupIds.size} muscle groups, ${equipmentIds.size} equipment, ${exerciseTypeIds.size} types, ${difficultyIds.size} difficulties, ${bodyAreaIds.size} body areas.`,
  );

  for (const exercise of exercises) {
    const scalars = {
      description: exercise.description,
      mechanic: exercise.mechanic,
      force: exercise.force,
      videoUrl: exercise.videoUrl,
      gifUrl: exercise.gifUrl,
      muscleDiagramUrl: exercise.muscleDiagramUrl,
      caloriesPerMinute: estimateCaloriesPerMinute(exercise),
      difficultyId: difficultyIds.get(exercise.difficulty)!,
      bodyAreaId: exercise.bodyArea ? bodyAreaIds.get(exercise.bodyArea)! : null,
    };

    const row = await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: scalars,
      create: { name: exercise.name, ...scalars },
    });

    // Replace links wholesale rather than diffing, so a re-run with changed
    // tags doesn't leave stale join rows behind.
    await prisma.exerciseMuscleGroup.deleteMany({ where: { exerciseId: row.id } });
    await prisma.exerciseEquipment.deleteMany({ where: { exerciseId: row.id } });
    await prisma.exerciseExerciseType.deleteMany({ where: { exerciseId: row.id } });

    await prisma.exerciseMuscleGroup.createMany({
      data: exercise.muscleGroups.map((name) => ({
        exerciseId: row.id,
        muscleGroupId: muscleGroupIds.get(name)!,
      })),
    });
    await prisma.exerciseEquipment.createMany({
      data: exercise.equipment.map((name) => ({
        exerciseId: row.id,
        equipmentId: equipmentIds.get(name)!,
      })),
    });
    await prisma.exerciseExerciseType.createMany({
      data: exercise.exerciseTypes.map((name) => ({
        exerciseId: row.id,
        exerciseTypeId: exerciseTypeIds.get(name)!,
      })),
    });

    console.log(`   ✅ ${exercise.name}`);
  }

  const total = await prisma.exercise.count();
  console.log(`\n🌱 Seed complete — ${total} exercises in the catalog.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
