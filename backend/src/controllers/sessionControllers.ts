import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { getRandomExercise } from './exerciseControllers.js';

// Default durations in seconds
const DEFAULT_WORK_DURATION_SEC = 25 * 60; // 1500 seconds (25 minutes)
const DEFAULT_BREAK_DURATION_SEC = 5 * 60;  // 300 seconds (5 minutes)

/**
 * Normalizes input duration to seconds.
 * If user passes <= 120, assume minutes and convert to seconds (e.g. 25 -> 1500).
 * If user passes > 120, assume already in seconds.
 */
function normalizeDuration(val: unknown, defaultSec: number): number {
  if (typeof val === 'number' && !isNaN(val) && val > 0) {
    if (val <= 120) {
      return Math.round(val * 60);
    }
    return Math.round(val);
  }
  return defaultSec;
}

/**
 * Reads an explicit seconds value (no minutes heuristic). Used by the timer,
 * which always knows exact seconds — e.g. a 90s partial focus must not be
 * mistaken for 90 minutes by normalizeDuration's <= 120 rule.
 */
function parseSeconds(val: unknown): number | undefined {
  if (typeof val === 'number' && Number.isFinite(val) && val >= 0) {
    return Math.round(val);
  }
  return undefined;
}

const ACTIVE_STATUSES = ['in_progress', 'break'];
const TERMINAL_STATUSES = ['completed', 'skipped', 'abandoned'];
// An unfinished session older than this is treated as forgotten rather than
// resumed when the user comes back.
const STALE_ACTIVE_SESSION_MS = 24 * 60 * 60 * 1000;

/**
 * Prisma data for the live timer state: a running phase stores its deadline,
 * a paused one stores the seconds left.
 */
function timerStateData(running: boolean, remainingSeconds: number) {
  return running
    ? { phaseEndsAt: new Date(Date.now() + remainingSeconds * 1000), pausedRemaining: null }
    : { phaseEndsAt: null, pausedRemaining: remainingSeconds };
}

type SessionTimerFields = {
  status: string;
  workDuration: number;
  breakDuration: number;
  phaseEndsAt: Date | null;
  pausedRemaining: number | null;
};

/**
 * Seconds left in the current phase, computed on the server so clients with
 * skewed clocks still agree. Clients re-anchor their own deadline from this.
 */
function getRemainingSeconds(session: SessionTimerFields): number {
  if (session.phaseEndsAt) {
    return Math.max(0, Math.ceil((session.phaseEndsAt.getTime() - Date.now()) / 1000));
  }
  if (session.pausedRemaining !== null) return session.pausedRemaining;
  return session.status === 'break' ? session.breakDuration : session.workDuration;
}

function serializeSession<T extends SessionTimerFields>(session: T) {
  const active = ACTIVE_STATUSES.includes(session.status);
  return {
    ...session,
    workMinutes: Math.round(session.workDuration / 60),
    breakMinutes: Math.round(session.breakDuration / 60),
    running: active && session.phaseEndsAt !== null,
    remainingSeconds: active ? getRemainingSeconds(session) : 0,
  };
}

/**
 * Formats minutes into human readable string e.g. "2h 30m" or "45m"
 */
function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * 1. Start a Pomodoro session
 * POST /api/sessions
 * Body optionally overrides: { "workDuration": 25, "breakDuration": 5 }
 */
export async function createSession(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { workDuration: rawWork, breakDuration: rawBreak, running, remainingSeconds } = req.body || {};

    const workDuration = normalizeDuration(rawWork, DEFAULT_WORK_DURATION_SEC);
    const breakDuration = normalizeDuration(rawBreak, DEFAULT_BREAK_DURATION_SEC);
    const remaining = parseSeconds(remainingSeconds) ?? workDuration;
    const now = new Date();

    // Only one session can be live per user — starting a new one (possibly on
    // another device) closes out whatever was left unfinished. A session whose
    // focus phase already ended still counts as a finished pomodoro.
    const [, , session] = await prisma.$transaction([
      prisma.session.updateMany({
        where: { userId, status: 'in_progress' },
        data: { status: 'abandoned', completedAt: now, phaseEndsAt: null, pausedRemaining: null },
      }),
      prisma.session.updateMany({
        where: { userId, status: 'break' },
        data: { status: 'completed', completedAt: now, phaseEndsAt: null, pausedRemaining: null },
      }),
      prisma.session.create({
        data: {
          userId,
          workDuration,
          breakDuration,
          status: 'in_progress',
          exerciseId: null, // Important: exercise is only assigned when work period finishes
          startedAt: now,
          ...timerStateData(running !== false, remaining),
        },
        include: {
          Exercise: true,
        },
      }),
    ]);

    return res.status(201).json({
      message: 'Pomodoro session started successfully.',
      session: serializeSession(session),
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(500).json({ error: 'Failed to start Pomodoro session.' });
  }
}

/**
 * 2. Start Break + Assign Exercise
 * PATCH /api/sessions/:id/start-break
 * Called when the Pomodoro work period ends.
 */
export async function startBreak(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const id = req.params.id as string;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const session = await prisma.session.findUnique({
      where: { id },
      include: { Exercise: true },
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    // Ownership check
    if (session.userId !== userId) {
      return res.status(403).json({ message: 'You do not have permission to access this session.' });
    }

    if (TERMINAL_STATUSES.includes(session.status)) {
      return res.status(409).json({
        message: `Cannot start break on a session that is already marked as '${session.status}'.`,
      });
    }

    // Idempotent: two devices (or a resumed tab) may both report the end of
    // the same focus period — don't roll a second exercise or restart the break.
    if (session.status === 'break') {
      return res.status(200).json({
        message: 'Break already started.',
        session: serializeSession(session),
        exercise: session.Exercise,
      });
    }

    const {
      workDurationSeconds,
      breakDuration: rawBreak,
      breakDurationSeconds,
      breakMode,
      running,
      exerciseId: requestedExerciseId,
    } = req.body || {};
    const actualWork = parseSeconds(workDurationSeconds);
    const breakDuration =
      parseSeconds(breakDurationSeconds) ??
      (rawBreak !== undefined ? normalizeDuration(rawBreak, session.breakDuration) : session.breakDuration);

    // Optional category preference from body or query
    const category = typeof req.body?.category === 'string'
      ? req.body.category
      : typeof req.query?.category === 'string'
        ? req.query.category
        : undefined;

    // Prefer the exercise the client is already showing for this break; fall
    // back to a random pick. Direct invocation of the shared helper (no
    // internal HTTP call).
    const requestedExercise =
      typeof requestedExerciseId === 'string'
        ? await prisma.exercise.findUnique({ where: { id: requestedExerciseId } })
        : null;
    const exercise = requestedExercise ?? (await getRandomExercise(category));

    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        status: 'break',
        exerciseId: exercise ? exercise.id : session.exerciseId,
        breakStartedAt: new Date(),
        breakDuration,
        breakMode: breakMode === 'long' || breakMode === 'short' ? breakMode : null,
        ...(actualWork !== undefined ? { workDuration: actualWork } : {}),
        ...timerStateData(running === true, breakDuration),
      },
      include: {
        Exercise: true,
      },
    });

    return res.status(200).json({
      message: 'Break started and exercise assigned.',
      session: serializeSession(updatedSession),
      exercise: updatedSession.Exercise,
    });
  } catch (error) {
    console.error('Error starting break:', error);
    return res.status(500).json({ error: 'Failed to start break.' });
  }
}

/**
 * 3. Update Session Status
 * PATCH /api/sessions/:id
 * Used to update status to completed, skipped, abandoned, etc.
 */
export async function updateSession(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const id = req.params.id as string;
    const {
      status,
      workDuration: rawWork,
      breakDuration: rawBreak,
      workDurationSeconds,
      breakDurationSeconds,
      exerciseId,
      breakMode,
      running,
      remainingSeconds,
    } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const validStatuses = ['in_progress', 'break', 'completed', 'skipped', 'abandoned'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    // Ownership check
    if (session.userId !== userId) {
      return res.status(403).json({ message: 'You do not have permission to modify this session.' });
    }

    // A finished session is final — a stale device trying to keep ticking it
    // gets a 409 so it knows to drop its local copy.
    if (TERMINAL_STATUSES.includes(session.status)) {
      return res.status(409).json({
        message: `Session is already '${session.status}' and can no longer be modified.`,
      });
    }

    const dataToUpdate: any = {};
    if (status) {
      dataToUpdate.status = status;
      if (TERMINAL_STATUSES.includes(status)) {
        dataToUpdate.completedAt = new Date();
        dataToUpdate.phaseEndsAt = null;
        dataToUpdate.pausedRemaining = null;
      }
    }

    // Pause / resume / add-time: the client reports whether the phase is
    // counting down and how many seconds it has left.
    const remaining = parseSeconds(remainingSeconds);
    if (typeof running === 'boolean' && remaining !== undefined && !TERMINAL_STATUSES.includes(status)) {
      Object.assign(dataToUpdate, timerStateData(running, remaining));
    }

    if (breakMode === 'short' || breakMode === 'long') {
      dataToUpdate.breakMode = breakMode;
    }

    const workSec = parseSeconds(workDurationSeconds);
    const breakSec = parseSeconds(breakDurationSeconds);
    if (workSec !== undefined) {
      dataToUpdate.workDuration = workSec;
    } else if (rawWork !== undefined) {
      dataToUpdate.workDuration = normalizeDuration(rawWork, session.workDuration);
    }
    if (breakSec !== undefined) {
      dataToUpdate.breakDuration = breakSec;
    } else if (rawBreak !== undefined) {
      dataToUpdate.breakDuration = normalizeDuration(rawBreak, session.breakDuration);
    }
    if (exerciseId !== undefined) {
      dataToUpdate.exerciseId = exerciseId;
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data: dataToUpdate,
      include: {
        Exercise: true,
      },
    });

    return res.status(200).json({
      message: 'Session updated successfully.',
      session: serializeSession(updatedSession),
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return res.status(500).json({ error: 'Failed to update session.' });
  }
}

/**
 * Current unfinished session, if any
 * GET /api/sessions/active
 * Lets a returning user (on any device) pick the timer up where it was.
 * `remainingSeconds` is computed server-side; it is 0 when a running phase's
 * deadline passed while the user was away — the client finalizes that phase.
 */
export async function getActiveSession(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const session = await prisma.session.findFirst({
      where: { userId, status: { in: ACTIVE_STATUSES } },
      orderBy: { startedAt: 'desc' },
      include: { Exercise: true },
    });

    if (!session) {
      return res.status(200).json({ session: null });
    }

    if (Date.now() - session.startedAt.getTime() > STALE_ACTIVE_SESSION_MS) {
      await prisma.session.update({
        where: { id: session.id },
        data: {
          status: session.status === 'break' ? 'completed' : 'abandoned',
          completedAt: new Date(),
          phaseEndsAt: null,
          pausedRemaining: null,
        },
      });
      return res.status(200).json({ session: null });
    }

    return res.status(200).json({ session: serializeSession(session) });
  } catch (error) {
    console.error('Error fetching active session:', error);
    return res.status(500).json({ error: 'Failed to fetch active session.' });
  }
}

/**
 * 4. Get Session History
 * GET /api/sessions
 * Return current user's session history (newest to oldest)
 */
export async function getSessions(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const limit = typeof req.query.limit === 'string' ? req.query.limit : undefined;
    const page = typeof req.query.page === 'string' ? req.query.page : undefined;
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) {
        where.startedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.startedAt.lte = new Date(endDate);
      }
    }

    const take = limit ? Math.min(Math.max(Number(limit) || 20, 1), 100) : 50;
    const pageNum = page ? Math.max(Number(page) || 1, 1) : 1;
    const skip = (pageNum - 1) * take;

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        include: {
          Exercise: true,
        },
        take,
        skip,
      }),
      prisma.session.count({ where }),
    ]);

    const formattedSessions = sessions.map((s) => {
      return {
        id: s.id,
        userId: s.userId,
        status: s.status,
        startedAt: s.startedAt,
        breakStartedAt: s.breakStartedAt,
        completedAt: s.completedAt,
        createdAt: s.createdAt,
        workDuration: s.workDuration,
        breakDuration: s.breakDuration,
        workMinutes: Math.round(s.workDuration / 60),
        breakMinutes: Math.round(s.breakDuration / 60),
        exercise: s.Exercise
          ? {
              id: s.Exercise.id,
              name: s.Exercise.name,
              description: s.Exercise.description,
              videoUrl: s.Exercise.videoUrl,
              gifUrl: s.Exercise.gifUrl,
            }
          : null,
      };
    });

    return res.status(200).json({
      sessions: formattedSessions,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error fetching session history:', error);
    return res.status(500).json({ error: 'Failed to fetch session history.' });
  }
}

/**
 * Single Session Details
 * GET /api/sessions/:id
 */
export async function getSessionById(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const id = req.params.id as string;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const session = await prisma.session.findUnique({
      where: { id },
      include: { Exercise: true },
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ message: 'You do not have permission to view this session.' });
    }

    return res.status(200).json({
      session: serializeSession(session),
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return res.status(500).json({ error: 'Failed to fetch session.' });
  }
}

/**
 * 5. Session Statistics & Analytics
 * GET /api/sessions/stats
 * Provides comprehensive productivity and workout metrics for dashboard.
 *
 * `?tzOffset=` is the client's `Date#getTimezoneOffset()` (minutes, UTC minus
 * local). Range boundaries ("today", "this week") and the hour/day buckets are
 * computed in that timezone — without it, a server running in UTC would put an
 * IST user's 9 AM session in the 3 AM bar, and "today" would start at 5:30 AM.
 */
export async function getSessionStats(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;
    const range = typeof req.query.range === 'string' ? req.query.range : undefined;

    const rawOffset = Number(req.query.tzOffset);
    const tzOffsetMin =
      Number.isFinite(rawOffset) && Math.abs(rawOffset) <= 14 * 60
        ? rawOffset
        : new Date().getTimezoneOffset();
    const tzOffsetMs = tzOffsetMin * 60 * 1000;
    // A Date whose UTC fields read as the user's local wall-clock time.
    const toLocal = (d: Date) => new Date(d.getTime() - tzOffsetMs);
    // Converts a "local wall-clock" Date (as produced by toLocal) back to a real instant.
    const fromLocal = (d: Date) => new Date(d.getTime() + tzOffsetMs);

    const localNow = toLocal(new Date());
    const localTodayStart = new Date(localNow);
    localTodayStart.setUTCHours(0, 0, 0, 0);

    const where: any = { userId };

    // Range filtering
    if (range) {
      const start = new Date(localTodayStart);
      let validRange = true;
      if (range === 'today') {
        // already local midnight
      } else if (range === 'week') {
        const day = start.getUTCDay();
        start.setUTCDate(start.getUTCDate() - (day === 0 ? 6 : day - 1)); // Monday
      } else if (range === 'month') {
        start.setUTCDate(1);
      } else if (range === 'year') {
        start.setUTCMonth(0, 1);
      } else {
        validRange = false;
      }
      if (validRange) {
        where.startedAt = { gte: fromLocal(start) };
      }
    } else if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) {
        where.startedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.startedAt.lte = new Date(endDate);
      }
    }

    // Fetch all matching sessions with their Exercise data
    const sessions = await prisma.session.findMany({
      where,
      orderBy: { startedAt: 'asc' },
      include: { Exercise: true },
    });

    // 1. Overall Aggregates
    let totalFocusSeconds = 0;
    let totalBreakSeconds = 0;

    let completedCount = 0;
    let skippedCount = 0;
    let abandonedCount = 0;
    let inProgressCount = 0;
    let breakCount = 0;

    // 2. Today's Overview
    const todayStart = fromLocal(localTodayStart);
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    let todayPomodoros = 0;
    let todayFocusSeconds = 0;
    let todayBreakSeconds = 0;

    // 3. Hourly Distribution (0..23). Accumulated in seconds and rounded once
    // at the end — rounding per session made short (finished-early) sessions
    // contribute 0 minutes, leaving the chart empty.
    const hourlySeconds = Array.from({ length: 24 }, () => 0);
    const hourlyCounts = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: `${h}:00`,
      completedPomodoros: 0,
      totalSessions: 0,
      focusMinutes: 0,
    }));

    // 4. Daily Breakdown
    const dailyMap = new Map<string, {
      date: string;
      dayOfWeek: string;
      dayOfWeekShort: string;
      completedPomodoros: number;
      focusSeconds: number;
      breakSeconds: number;
      sessionsCount: number;
    }>();

    // 5. Day of Week Breakdown (Mon..Sun)
    const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeekSeconds: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const dayOfWeekStats: Record<string, { count: number; completedCount: number; focusMinutes: number }> = {
      Mon: { count: 0, completedCount: 0, focusMinutes: 0 },
      Tue: { count: 0, completedCount: 0, focusMinutes: 0 },
      Wed: { count: 0, completedCount: 0, focusMinutes: 0 },
      Thu: { count: 0, completedCount: 0, focusMinutes: 0 },
      Fri: { count: 0, completedCount: 0, focusMinutes: 0 },
      Sat: { count: 0, completedCount: 0, focusMinutes: 0 },
      Sun: { count: 0, completedCount: 0, focusMinutes: 0 },
    };

    // 6. Exercise Engagement
    let totalSessionsWithExercise = 0;
    let totalCaloriesBurned = 0;

    for (const session of sessions) {
      const sessionDate = new Date(session.startedAt);
      const localDate = toLocal(sessionDate);
      const isCompleted = session.status === 'completed';
      const isBreakOrCompleted = session.status === 'completed' || session.status === 'break';
      // The focus phase counts as done once the break has started, whatever
      // happened afterwards (break still running, cut short, superseded by a
      // new session on another device). Previously only fully `completed`
      // sessions counted, so a focus period whose break was never finished
      // never showed up in the chart.
      const focusDone = isCompleted || session.breakStartedAt !== null;
      const focusSeconds = focusDone ? session.workDuration : 0;
      const breakSeconds = isBreakOrCompleted ? session.breakDuration : 0;
      const isToday = sessionDate >= todayStart && sessionDate < todayEnd;

      // Status counters
      if (session.status === 'completed') completedCount++;
      else if (session.status === 'skipped') skippedCount++;
      else if (session.status === 'abandoned') abandonedCount++;
      else if (session.status === 'in_progress') inProgressCount++;
      else if (session.status === 'break') breakCount++;

      totalFocusSeconds += focusSeconds;
      totalBreakSeconds += breakSeconds;

      if (session.Exercise && isBreakOrCompleted) {
        totalSessionsWithExercise++;
        totalCaloriesBurned += session.Exercise.caloriesPerMinute * (session.breakDuration / 60);
      }

      // Today's stats
      if (isToday) {
        if (focusDone) todayPomodoros++;
        todayFocusSeconds += focusSeconds;
        todayBreakSeconds += breakSeconds;
      }

      // Hour of day (0..23), in the user's timezone
      const hour = localDate.getUTCHours();
      hourlyCounts[hour].totalSessions++;
      if (focusDone) hourlyCounts[hour].completedPomodoros++;
      hourlySeconds[hour] += focusSeconds;

      // Day of Week
      const dayIndex = localDate.getUTCDay();
      const shortDay = dayNamesShort[dayIndex];
      if (dayOfWeekStats[shortDay]) {
        dayOfWeekStats[shortDay].count++;
        if (focusDone) dayOfWeekStats[shortDay].completedCount++;
        dayOfWeekSeconds[shortDay] += focusSeconds;
      }

      // By Day (YYYY-MM-DD, local)
      const dateKey = localDate.toISOString().split('T')[0];
      const existingDaily = dailyMap.get(dateKey);

      if (existingDaily) {
        existingDaily.sessionsCount++;
        if (focusDone) existingDaily.completedPomodoros++;
        existingDaily.focusSeconds += focusSeconds;
        existingDaily.breakSeconds += breakSeconds;
      } else {
        dailyMap.set(dateKey, {
          date: dateKey,
          dayOfWeek: dayNamesFull[dayIndex],
          dayOfWeekShort: shortDay,
          completedPomodoros: focusDone ? 1 : 0,
          focusSeconds,
          breakSeconds,
          sessionsCount: 1,
        });
      }
    }

    hourlyCounts.forEach((h, i) => {
      h.focusMinutes = Math.round(hourlySeconds[i] / 60);
    });
    for (const day of Object.keys(dayOfWeekStats)) {
      dayOfWeekStats[day].focusMinutes = Math.round(dayOfWeekSeconds[day] / 60);
    }

    const totalFocusMinutes = Math.round(totalFocusSeconds / 60);
    const totalBreakMinutes = Math.round(totalBreakSeconds / 60);
    const totalSessions = sessions.length;
    const completionRate = totalSessions > 0 ? Number(((completedCount / totalSessions) * 100).toFixed(1)) : 0;

    const todayFocusMinutes = Math.round(todayFocusSeconds / 60);
    const todayBreakMinutes = Math.round(todayBreakSeconds / 60);

    const byDay = Array.from(dailyMap.values()).map(({ focusSeconds, breakSeconds, ...d }) => ({
      ...d,
      focusMinutes: Math.round(focusSeconds / 60),
      breakMinutes: Math.round(breakSeconds / 60),
    }));
    // Heatmap array format: [{ date: '2026-08-19', count: 6, intensity: 3 }]
    const heatmap = byDay.map((d) => {
      let intensity = 0;
      if (d.completedPomodoros >= 8) intensity = 4;
      else if (d.completedPomodoros >= 5) intensity = 3;
      else if (d.completedPomodoros >= 3) intensity = 2;
      else if (d.completedPomodoros >= 1) intensity = 1;

      return {
        date: d.date,
        dayOfWeek: d.dayOfWeekShort,
        count: d.completedPomodoros,
        focusMinutes: d.focusMinutes,
        intensity,
      };
    });

    return res.status(200).json({
      summary: {
        totalPomodoros: completedCount,
        totalFocusMinutes,
        totalBreakMinutes,
        completedSessions: completedCount,
        skippedSessions: skippedCount,
        abandonedSessions: abandonedCount,
        inProgressSessions: inProgressCount,
        breakSessions: breakCount,
        totalSessions,
        completionRate,
        totalCaloriesBurned: Math.round(totalCaloriesBurned),
      },
      today: {
        pomodoros: todayPomodoros,
        focusMinutes: todayFocusMinutes,
        breakMinutes: todayBreakMinutes,
        formattedFocusTime: formatMinutes(todayFocusMinutes),
      },
      byHour: hourlyCounts,
      byDay,
      byDayOfWeek: dayOfWeekStats,
      heatmap,
      exerciseActivity: {
        totalSessionsWithExercise,
      },
    });
  } catch (error) {
    console.error('Error calculating session stats:', error);
    return res.status(500).json({ error: 'Failed to calculate session statistics.' });
  }
}
