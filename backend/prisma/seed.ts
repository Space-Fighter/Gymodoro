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
import type { SeedExercise } from './import-wger.js';

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

  const muscleGroupIds = await upsertLookup(prisma.muscleGroup, allMuscleGroups);
  const equipmentIds = await upsertLookup(prisma.equipment, allEquipment);
  const exerciseTypeIds = await upsertLookup(prisma.exerciseType, allExerciseTypes);

  console.log(
    `   Lookups: ${muscleGroupIds.size} muscle groups, ${equipmentIds.size} equipment, ${exerciseTypeIds.size} types.`,
  );

  for (const exercise of exercises) {
    const scalars = {
      description: exercise.description,
      difficulty: exercise.difficulty,
      mechanic: exercise.mechanic,
      force: exercise.force,
      videoUrl: exercise.videoUrl,
      gifUrl: exercise.gifUrl,
      muscleDiagramUrl: exercise.muscleDiagramUrl,
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
