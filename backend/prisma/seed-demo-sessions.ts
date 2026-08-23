// Generates a realistic ~5-week history of Pomodoro Sessions for one
// existing user, so the Stats dashboard (Analytics + Review Sessions tabs)
// has real, varied data to demo instead of an empty state.
//
// Idempotent-ish: deletes and regenerates this user's Sessions each run, so
// it's safe to re-run without accumulating duplicates.
//
// Run with: npx tsx prisma/seed-demo-sessions.ts <userId>
import { prisma } from '../lib/prisma.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS_OF_HISTORY = 5;
const STREAK_DAYS = 6; // last N days (including today) guaranteed >= 1 completed session

// Weighted so weekdays are busier than weekends and mid-morning/mid-afternoon
// focus blocks are more common than early morning or late evening ones —
// mirrors a believable desk-work pattern for the Hourly/Day-of-week charts.
const WORK_HOURS = [8, 9, 9, 10, 10, 11, 13, 14, 14, 15, 15, 16, 17, 20];

function pick<T>(arr: T[]): T {
  const item = arr[Math.floor(Math.random() * arr.length)];
  if (item === undefined) throw new Error('pick() called on empty array');
  return item;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type SessionRow = {
  id: string;
  userId: string;
  workDuration: number;
  breakDuration: number;
  exerciseId: string | null;
  status: string;
  startedAt: Date;
  breakStartedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: npx tsx prisma/seed-demo-sessions.ts <userId>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error(`No user found with id ${userId}. Create/verify the account first.`);
    process.exit(1);
  }

  const exercises = await prisma.exercise.findMany({ select: { id: true, name: true } });
  if (exercises.length === 0) {
    console.error('No exercises in the database. Run `npm run db:seed` first.');
    process.exit(1);
  }

  const { count: deleted } = await prisma.session.deleteMany({ where: { userId } });
  console.log(`Cleared ${deleted} existing session(s) for ${user.email}.`);

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const currentHour = now.getHours();

  const rows: SessionRow[] = [];

  for (let daysAgo = WEEKS_OF_HISTORY * 7 - 1; daysAgo >= 0; daysAgo--) {
    const day = new Date(startOfToday.getTime() - daysAgo * DAY_MS);
    const isToday = daysAgo === 0;
    const isStreakDay = daysAgo < STREAK_DAYS;
    const dow = day.getDay(); // 0 Sun .. 6 Sat
    const isWeekend = dow === 0 || dow === 6;

    // "Today" can only have sessions in hours that have already happened —
    // no scheduling into the future.
    const hoursPool = isToday ? WORK_HOURS.filter((h) => h <= currentHour) : WORK_HOURS;

    let sessionsWanted: number;
    if (isToday) {
      sessionsWanted = hoursPool.length === 0 ? 0 : randInt(1, Math.min(4, hoursPool.length));
    } else {
      sessionsWanted = isWeekend ? randInt(1, 3) : randInt(2, 6);
      if (!isStreakDay) {
        // Occasional real-looking gaps in the older history — more on
        // weekends — so the heatmap isn't a suspiciously unbroken line.
        const skipChance = isWeekend ? 0.55 : 0.15;
        if (Math.random() < skipChance) sessionsWanted = 0;
      } else {
        sessionsWanted = Math.max(sessionsWanted, 1); // streak window: never a blank day
      }
    }

    const usedHours = new Set<number>();
    let completedAddedForDay = 0;

    for (let i = 0; i < sessionsWanted; i++) {
      const pool = hoursPool.length > 0 ? hoursPool : WORK_HOURS;
      let hour = pick(pool);
      let attempts = 0;
      while (usedHours.has(hour) && attempts < 5) {
        hour = pick(pool);
        attempts++;
      }
      usedHours.add(hour);

      const isLastAttempt = i === sessionsWanted - 1;
      const forceCompleted = isStreakDay && completedAddedForDay === 0 && isLastAttempt;

      const workDuration = pick([1200, 1500, 1500, 1500, 1800]); // 20/25/30 min
      const breakDuration = pick([300, 300, 600]); // 5 or 10 min

      const startedAt = new Date(day);
      if (forceCompleted && isToday) {
        // Give the guaranteed "today" session maximum buffer so its break
        // and completion timestamps can't land in the future — use the
        // earliest available hour with a low minute.
        startedAt.setHours(pool[0]!, randInt(0, 20), 0, 0);
      } else {
        startedAt.setHours(hour, randInt(0, 59), 0, 0);
      }

      // Outcome mix: mostly completed, some abandoned/skipped, matching a
      // realistic completion rate rather than a perfect 100%.
      let status: string;
      if (forceCompleted) {
        status = 'completed';
      } else {
        const roll = Math.random();
        status = roll < 0.72 ? 'completed' : roll < 0.85 ? 'abandoned' : roll < 0.95 ? 'skipped' : 'break';
      }

      const hasExercise = status === 'completed' || status === 'break';
      const breakStartedAt = hasExercise ? new Date(startedAt.getTime() + workDuration * 1000) : null;
      const completedAt =
        status === 'completed' || status === 'abandoned' || status === 'skipped'
          ? new Date(startedAt.getTime() + workDuration * 1000 + (hasExercise ? breakDuration * 1000 : 0))
          : null;

      // Safety net: never persist an event timestamp in the future — this
      // is what made "today" look broken before (completed sessions whose
      // completedAt was minutes ahead of the current time).
      if ((breakStartedAt && breakStartedAt > now) || (completedAt && completedAt > now)) {
        continue;
      }

      if (status === 'completed') completedAddedForDay++;

      rows.push({
        id: crypto.randomUUID(),
        userId,
        workDuration,
        breakDuration,
        exerciseId: hasExercise ? pick(exercises).id : null,
        status,
        startedAt,
        breakStartedAt,
        completedAt,
        createdAt: startedAt,
        updatedAt: completedAt ?? breakStartedAt ?? startedAt,
      });
    }
  }

  // One session "in progress right now" so the live/today state has
  // something to show if the demo also opens the timer itself.
  const liveStart = new Date(now.getTime() - randInt(1, 10) * 60 * 1000);
  rows.push({
    id: crypto.randomUUID(),
    userId,
    workDuration: 1500,
    breakDuration: 300,
    exerciseId: null,
    status: 'in_progress',
    startedAt: liveStart,
    breakStartedAt: null,
    completedAt: null,
    createdAt: liveStart,
    updatedAt: liveStart,
  });

  await prisma.session.createMany({ data: rows });

  const todayCount = rows.filter((r) => r.startedAt >= startOfToday).length;
  const completed = rows.filter((r) => r.status === 'completed').length;
  console.log(`Created ${rows.length} sessions for ${user.email} (${user.id}):`);
  console.log(
    `  completed=${completed}, abandoned=${rows.filter((r) => r.status === 'abandoned').length}, ` +
      `skipped=${rows.filter((r) => r.status === 'skipped').length}, break=${rows.filter((r) => r.status === 'break').length}, ` +
      `in_progress=${rows.filter((r) => r.status === 'in_progress').length}`
  );
  console.log(`  today (as of ${now.toLocaleTimeString()}): ${todayCount} session(s), all timestamps <= now.`);
  console.log('Reload the Stats tab to see it.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
