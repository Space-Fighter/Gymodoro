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

    const { workDuration: rawWork, breakDuration: rawBreak } = req.body || {};

    const workDuration = normalizeDuration(rawWork, DEFAULT_WORK_DURATION_SEC);
    const breakDuration = normalizeDuration(rawBreak, DEFAULT_BREAK_DURATION_SEC);

    const session = await prisma.session.create({
      data: {
        userId,
        workDuration,
        breakDuration,
        status: 'in_progress',
        exerciseId: null, // Important: exercise is only assigned when work period finishes
        startedAt: new Date(),
      },
      include: {
        Exercise: true,
      },
    });

    return res.status(201).json({
      message: 'Pomodoro session started successfully.',
      session: {
        ...session,
        workMinutes: Math.round(session.workDuration / 60),
        breakMinutes: Math.round(session.breakDuration / 60),
      },
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

    if (session.status === 'completed' || session.status === 'abandoned') {
      return res.status(400).json({
        message: `Cannot start break on a session that is already marked as '${session.status}'.`,
      });
    }

    // Optional category preference from body or query
    const category = typeof req.body?.category === 'string'
      ? req.body.category
      : typeof req.query?.category === 'string'
        ? req.query.category
        : undefined;

    // Direct invocation of the shared helper (no internal HTTP call)
    const exercise = await getRandomExercise(category);

    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        status: 'break',
        exerciseId: exercise ? exercise.id : session.exerciseId,
        breakStartedAt: new Date(),
      },
      include: {
        Exercise: true,
      },
    });

    return res.status(200).json({
      message: 'Break started and exercise assigned.',
      session: {
        ...updatedSession,
        workMinutes: Math.round(updatedSession.workDuration / 60),
        breakMinutes: Math.round(updatedSession.breakDuration / 60),
        exerciseMinutes: updatedSession.Exercise ? Math.round(updatedSession.Exercise.duration / 60) : 0,
        estimatedCaloriesBurned: updatedSession.Exercise ? updatedSession.Exercise.caloriesBurned : 0,
      },
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
    const { status, workDuration: rawWork, breakDuration: rawBreak, exerciseId } = req.body || {};

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

    const dataToUpdate: any = {};
    if (status) {
      dataToUpdate.status = status;
      if (status === 'completed' || status === 'skipped' || status === 'abandoned') {
        dataToUpdate.completedAt = new Date();
      }
    }

    if (rawWork !== undefined) {
      dataToUpdate.workDuration = normalizeDuration(rawWork, session.workDuration);
    }
    if (rawBreak !== undefined) {
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
      session: {
        ...updatedSession,
        workMinutes: Math.round(updatedSession.workDuration / 60),
        breakMinutes: Math.round(updatedSession.breakDuration / 60),
        exerciseMinutes: updatedSession.Exercise ? Math.round(updatedSession.Exercise.duration / 60) : 0,
        estimatedCaloriesBurned:
          updatedSession.Exercise && updatedSession.status === 'completed'
            ? updatedSession.Exercise.caloriesBurned
            : 0,
      },
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return res.status(500).json({ error: 'Failed to update session.' });
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
      const exerciseMinutes = s.Exercise ? Math.round(s.Exercise.duration / 60) : 0;
      const caloriesBurned =
        s.Exercise && (s.status === 'completed' || s.status === 'break')
          ? s.Exercise.caloriesBurned
          : 0;

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
        exerciseMinutes,
        caloriesBurned,
        exercise: s.Exercise
          ? {
              id: s.Exercise.id,
              name: s.Exercise.name,
              description: s.Exercise.description,
              category: s.Exercise.category,
              difficulty: s.Exercise.difficulty,
              duration: s.Exercise.duration,
              durationMinutes: exerciseMinutes,
              caloriesBurned: s.Exercise.caloriesBurned,
              imageUrl: s.Exercise.imageUrl,
              instructions: s.Exercise.instructions,
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

    const exerciseMinutes = session.Exercise ? Math.round(session.Exercise.duration / 60) : 0;
    const caloriesBurned =
      session.Exercise && (session.status === 'completed' || session.status === 'break')
        ? session.Exercise.caloriesBurned
        : 0;

    return res.status(200).json({
      session: {
        ...session,
        workMinutes: Math.round(session.workDuration / 60),
        breakMinutes: Math.round(session.breakDuration / 60),
        exerciseMinutes,
        caloriesBurned,
      },
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

    const where: any = { userId };

    // Range filtering
    if (range) {
      const start = new Date();
      if (range === 'today') {
        start.setHours(0, 0, 0, 0);
        where.startedAt = { gte: start };
      } else if (range === 'week') {
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        where.startedAt = { gte: start };
      } else if (range === 'month') {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        where.startedAt = { gte: start };
      } else if (range === 'year') {
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        where.startedAt = { gte: start };
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
    let totalExerciseSeconds = 0;
    let totalCaloriesBurned = 0;

    let completedCount = 0;
    let skippedCount = 0;
    let abandonedCount = 0;
    let inProgressCount = 0;
    let breakCount = 0;

    // 2. Today's Overview
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let todayPomodoros = 0;
    let todayFocusSeconds = 0;
    let todayBreakSeconds = 0;
    let todayExerciseSeconds = 0;
    let todayCaloriesBurned = 0;

    // 3. Hourly Distribution (0..23)
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
      focusMinutes: number;
      breakMinutes: number;
      exerciseMinutes: number;
      caloriesBurned: number;
      sessionsCount: number;
    }>();

    // 5. Day of Week Breakdown (Mon..Sun)
    const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeekStats: Record<string, { count: number; completedCount: number; focusMinutes: number; caloriesBurned: number }> = {
      Mon: { count: 0, completedCount: 0, focusMinutes: 0, caloriesBurned: 0 },
      Tue: { count: 0, completedCount: 0, focusMinutes: 0, caloriesBurned: 0 },
      Wed: { count: 0, completedCount: 0, focusMinutes: 0, caloriesBurned: 0 },
      Thu: { count: 0, completedCount: 0, focusMinutes: 0, caloriesBurned: 0 },
      Fri: { count: 0, completedCount: 0, focusMinutes: 0, caloriesBurned: 0 },
      Sat: { count: 0, completedCount: 0, focusMinutes: 0, caloriesBurned: 0 },
      Sun: { count: 0, completedCount: 0, focusMinutes: 0, caloriesBurned: 0 },
    };

    // 6. Exercise Category Breakdown
    const exerciseCategoryStats: Record<string, { count: number; exerciseMinutes: number; caloriesBurned: number }> = {};
    let totalSessionsWithExercise = 0;

    for (const session of sessions) {
      const sessionDate = new Date(session.startedAt);
      const isCompleted = session.status === 'completed';
      const isBreakOrCompleted = session.status === 'completed' || session.status === 'break';
      const isToday = sessionDate >= todayStart && sessionDate <= todayEnd;

      // Status counters
      if (session.status === 'completed') completedCount++;
      else if (session.status === 'skipped') skippedCount++;
      else if (session.status === 'abandoned') abandonedCount++;
      else if (session.status === 'in_progress') inProgressCount++;
      else if (session.status === 'break') breakCount++;

      // Focus time: count work duration for completed sessions (and in-progress work periods)
      if (isCompleted || session.status === 'break') {
        totalFocusSeconds += session.workDuration;
      }
      if (session.breakStartedAt || isCompleted) {
        totalBreakSeconds += session.breakDuration;
      }

      // Exercise calories and duration from completed exercises
      let sessionCalories = 0;
      let sessionExerciseSec = 0;
      if (session.Exercise && isBreakOrCompleted) {
        sessionCalories = session.Exercise.caloriesBurned;
        sessionExerciseSec = session.Exercise.duration;
        totalSessionsWithExercise++;
        totalCaloriesBurned += sessionCalories;
        totalExerciseSeconds += sessionExerciseSec;

        const cat = session.Exercise.category || 'other';
        if (!exerciseCategoryStats[cat]) {
          exerciseCategoryStats[cat] = { count: 0, exerciseMinutes: 0, caloriesBurned: 0 };
        }
        exerciseCategoryStats[cat].count++;
        exerciseCategoryStats[cat].exerciseMinutes += Math.round(sessionExerciseSec / 60);
        exerciseCategoryStats[cat].caloriesBurned += sessionCalories;
      }

      // Today's stats
      if (isToday) {
        if (isCompleted) {
          todayPomodoros++;
          todayFocusSeconds += session.workDuration;
          todayBreakSeconds += session.breakDuration;
        } else if (session.status === 'break') {
          todayFocusSeconds += session.workDuration;
        }
        if (session.Exercise && isBreakOrCompleted) {
          todayExerciseSeconds += session.Exercise.duration;
          todayCaloriesBurned += session.Exercise.caloriesBurned;
        }
      }

      // Hour of day (0..23)
      const hour = sessionDate.getHours();
      hourlyCounts[hour].totalSessions++;
      if (isCompleted) {
        hourlyCounts[hour].completedPomodoros++;
        hourlyCounts[hour].focusMinutes += Math.round(session.workDuration / 60);
      }

      // Day of Week
      const dayIndex = sessionDate.getDay();
      const shortDay = dayNamesShort[dayIndex];
      if (dayOfWeekStats[shortDay]) {
        dayOfWeekStats[shortDay].count++;
        if (isCompleted) {
          dayOfWeekStats[shortDay].completedCount++;
          dayOfWeekStats[shortDay].focusMinutes += Math.round(session.workDuration / 60);
        }
        dayOfWeekStats[shortDay].caloriesBurned += sessionCalories;
      }

      // By Day (YYYY-MM-DD)
      const dateKey = sessionDate.toISOString().split('T')[0];
      const existingDaily = dailyMap.get(dateKey);
      const dayFull = dayNamesFull[dayIndex];
      const workMin = isCompleted ? Math.round(session.workDuration / 60) : 0;
      const breakMin = isBreakOrCompleted ? Math.round(session.breakDuration / 60) : 0;
      const exMin = Math.round(sessionExerciseSec / 60);

      if (existingDaily) {
        existingDaily.sessionsCount++;
        if (isCompleted) existingDaily.completedPomodoros++;
        existingDaily.focusMinutes += workMin;
        existingDaily.breakMinutes += breakMin;
        existingDaily.exerciseMinutes += exMin;
        existingDaily.caloriesBurned += sessionCalories;
      } else {
        dailyMap.set(dateKey, {
          date: dateKey,
          dayOfWeek: dayFull,
          dayOfWeekShort: shortDay,
          completedPomodoros: isCompleted ? 1 : 0,
          focusMinutes: workMin,
          breakMinutes: breakMin,
          exerciseMinutes: exMin,
          caloriesBurned: sessionCalories,
          sessionsCount: 1,
        });
      }
    }

    const totalFocusMinutes = Math.round(totalFocusSeconds / 60);
    const totalBreakMinutes = Math.round(totalBreakSeconds / 60);
    const totalExerciseMinutes = Math.round(totalExerciseSeconds / 60);
    const totalSessions = sessions.length;
    const completionRate = totalSessions > 0 ? Number(((completedCount / totalSessions) * 100).toFixed(1)) : 0;

    const todayFocusMinutes = Math.round(todayFocusSeconds / 60);
    const todayBreakMinutes = Math.round(todayBreakSeconds / 60);
    const todayExerciseMinutes = Math.round(todayExerciseSeconds / 60);

    // Heatmap array format: [{ date: '2026-08-19', count: 6, intensity: 3 }]
    const byDay = Array.from(dailyMap.values());
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
        totalExerciseMinutes,
        totalCaloriesBurned,
        completedSessions: completedCount,
        skippedSessions: skippedCount,
        abandonedSessions: abandonedCount,
        inProgressSessions: inProgressCount,
        breakSessions: breakCount,
        totalSessions,
        completionRate,
      },
      today: {
        pomodoros: todayPomodoros,
        focusMinutes: todayFocusMinutes,
        breakMinutes: todayBreakMinutes,
        exerciseMinutes: todayExerciseMinutes,
        caloriesBurned: todayCaloriesBurned,
        formattedFocusTime: formatMinutes(todayFocusMinutes),
      },
      byHour: hourlyCounts,
      byDay,
      byDayOfWeek: dayOfWeekStats,
      heatmap,
      exerciseActivity: {
        totalSessionsWithExercise,
        totalExerciseMinutes,
        totalCaloriesBurned,
        categoryBreakdown: exerciseCategoryStats,
      },
    });
  } catch (error) {
    console.error('Error calculating session stats:', error);
    return res.status(500).json({ error: 'Failed to calculate session statistics.' });
  }
}
