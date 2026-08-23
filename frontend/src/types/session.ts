export type SessionStatus =
  | "in_progress"
  | "break"
  | "completed"
  | "skipped"
  | "abandoned";

export interface SessionExercise {
  id: string;
  name: string;
  description: string;
  videoUrl: string | null;
  gifUrl: string | null;
}

export interface Session {
  id: string;
  userId: string;
  status: SessionStatus;
  startedAt: string;
  breakStartedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  workDuration: number;
  breakDuration: number;
  workMinutes: number;
  breakMinutes: number;
  exercise: SessionExercise | null;
}

export interface SessionListResponse {
  sessions: Session[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StatsSummary {
  totalPomodoros: number;
  totalFocusMinutes: number;
  totalBreakMinutes: number;
  completedSessions: number;
  skippedSessions: number;
  abandonedSessions: number;
  inProgressSessions: number;
  breakSessions: number;
  totalSessions: number;
  completionRate: number;
  totalCaloriesBurned: number;
}

export interface StatsToday {
  pomodoros: number;
  focusMinutes: number;
  breakMinutes: number;
  formattedFocusTime: string;
}

export interface StatsHourEntry {
  hour: number;
  label: string;
  completedPomodoros: number;
  totalSessions: number;
  focusMinutes: number;
}

export interface SessionStatsResponse {
  summary: StatsSummary;
  today: StatsToday;
  byHour: StatsHourEntry[];
  byDay: Array<{
    date: string;
    dayOfWeek: string;
    dayOfWeekShort: string;
    completedPomodoros: number;
    focusMinutes: number;
    breakMinutes: number;
    sessionsCount: number;
  }>;
  byDayOfWeek: Record<
    string,
    { count: number; completedCount: number; focusMinutes: number }
  >;
  heatmap: Array<{
    date: string;
    dayOfWeek: string;
    count: number;
    focusMinutes: number;
    intensity: number;
  }>;
  exerciseActivity: {
    totalSessionsWithExercise: number;
  };
}

export type StatsRange = "today" | "week" | "month";
