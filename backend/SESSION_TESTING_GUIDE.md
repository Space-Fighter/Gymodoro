# Track B — Session & Analytics API Guide

## Overview

The Session / Pomodoro Tracking & Analytics API powers the core workout-study cycle and productivity dashboard in Gymodoro. All session endpoints require authentication via Bearer token and enforce strict user ownership.

---

## Session Lifecycle

```
 POST /api/sessions (status: 'in_progress', exerciseId: null)
        │
        ▼ (25-min focus block)
 PATCH /api/sessions/:id/start-break (status: 'break', exercise assigned)
        │
        ▼ (5-min exercise break)
 PATCH /api/sessions/:id (status: 'completed' | 'skipped' | 'abandoned', completedAt set)
        │
        ▼
 GET /api/sessions/stats (Productivity & Workout Analytics)
```

---

## Endpoints Reference

### 1. Start a Pomodoro Session
`POST /api/sessions`
- **Headers:** `Authorization: Bearer <token>`
- **Body (Optional):**
  ```json
  {
    "workDuration": 25,
    "breakDuration": 5
  }
  ```
  *(Durations $\le 120$ are normalized from minutes to seconds, e.g. $25 \to 1500\text{s}$, $5 \to 300\text{s}$)*
- **Response (201 Created):**
  ```json
  {
    "message": "Pomodoro session started successfully.",
    "session": {
      "id": "uuid-1234",
      "userId": "user-uuid",
      "workDuration": 1500,
      "breakDuration": 300,
      "status": "in_progress",
      "exerciseId": null,
      "startedAt": "2026-08-19T15:30:00.000Z",
      "workMinutes": 25,
      "breakMinutes": 5
    }
  }
  ```

---

### 2. Start Break + Assign Exercise
`PATCH /api/sessions/:id/start-break`
- **Headers:** `Authorization: Bearer <token>`
- **Body (Optional):**
  ```json
  {
    "category": "cardio"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Break started and exercise assigned.",
    "session": {
      "id": "uuid-1234",
      "status": "break",
      "exerciseId": "exercise-uuid",
      "breakStartedAt": "2026-08-19T15:55:00.000Z",
      "workMinutes": 25,
      "breakMinutes": 5,
      "exerciseMinutes": 5,
      "estimatedCaloriesBurned": 25
    },
    "exercise": {
      "id": "exercise-uuid",
      "name": "Bicycle Crunches",
      "category": "core",
      "difficulty": "medium",
      "duration": 300,
      "caloriesBurned": 25
    }
  }
  ```

---

### 3. Update Session Status
`PATCH /api/sessions/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "status": "completed"
  }
  ```
  *(Allowed statuses: `completed`, `skipped`, `abandoned`, `in_progress`, `break`)*
- **Response (200 OK):**
  ```json
  {
    "message": "Session updated successfully.",
    "session": {
      "id": "uuid-1234",
      "status": "completed",
      "completedAt": "2026-08-19T16:00:00.000Z",
      "estimatedCaloriesBurned": 25
    }
  }
  ```

---

### 4. Get Session History
`GET /api/sessions`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters (Optional):**
  - `status`: filter by status (`completed`, `skipped`, `abandoned`, `in_progress`, `break`)
  - `startDate`: ISO date string
  - `endDate`: ISO date string
  - `limit`: number (default: 50)
  - `page`: number (default: 1)
- **Response (200 OK):**
  ```json
  {
    "sessions": [
      {
        "id": "uuid-1234",
        "status": "completed",
        "startedAt": "2026-08-19T15:30:00.000Z",
        "breakStartedAt": "2026-08-19T15:55:00.000Z",
        "completedAt": "2026-08-19T16:00:00.000Z",
        "workMinutes": 25,
        "breakMinutes": 5,
        "exerciseMinutes": 5,
        "caloriesBurned": 25,
        "exercise": {
          "id": "exercise-uuid",
          "name": "Bicycle Crunches",
          "category": "core",
          "difficulty": "medium",
          "duration": 300,
          "caloriesBurned": 25
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
  ```

---

### 5. Session Statistics & Analytics
`GET /api/sessions/stats`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters (Optional):**
  - `range`: `today` | `week` | `month` | `year` | `all`
  - `startDate`: ISO date string / YYYY-MM-DD
  - `endDate`: ISO date string / YYYY-MM-DD
- **Response (200 OK):**
  ```json
  {
    "summary": {
      "totalPomodoros": 6,
      "totalFocusMinutes": 150,
      "totalBreakMinutes": 30,
      "totalExerciseMinutes": 24,
      "totalCaloriesBurned": 120,
      "completedSessions": 6,
      "skippedSessions": 1,
      "abandonedSessions": 0,
      "inProgressSessions": 0,
      "breakSessions": 0,
      "totalSessions": 7,
      "completionRate": 85.7
    },
    "today": {
      "pomodoros": 6,
      "focusMinutes": 150,
      "breakMinutes": 30,
      "exerciseMinutes": 24,
      "caloriesBurned": 120,
      "formattedFocusTime": "2h 30m"
    },
    "byHour": [
      { "hour": 0, "label": "0:00", "completedPomodoros": 0, "totalSessions": 0, "focusMinutes": 0 },
      { "hour": 9, "label": "9:00", "completedPomodoros": 2, "totalSessions": 2, "focusMinutes": 50 }
    ],
    "byDay": [
      {
        "date": "2026-08-19",
        "dayOfWeek": "Wednesday",
        "dayOfWeekShort": "Wed",
        "completedPomodoros": 6,
        "focusMinutes": 150,
        "breakMinutes": 30,
        "exerciseMinutes": 24,
        "caloriesBurned": 120,
        "sessionsCount": 7
      }
    ],
    "byDayOfWeek": {
      "Mon": { "count": 2, "completedCount": 2, "focusMinutes": 50, "caloriesBurned": 40 },
      "Tue": { "count": 2, "completedCount": 2, "focusMinutes": 50, "caloriesBurned": 40 },
      "Wed": { "count": 3, "completedCount": 2, "focusMinutes": 50, "caloriesBurned": 40 }
    },
    "heatmap": [
      { "date": "2026-08-19", "dayOfWeek": "Wed", "count": 6, "focusMinutes": 150, "intensity": 3 }
    ],
    "exerciseActivity": {
      "totalSessionsWithExercise": 6,
      "totalExerciseMinutes": 24,
      "totalCaloriesBurned": 120,
      "categoryBreakdown": {
        "core": { "count": 2, "exerciseMinutes": 10, "caloriesBurned": 50 },
        "cardio": { "count": 4, "exerciseMinutes": 14, "caloriesBurned": 70 }
      }
    }
  }
  ```

---

## Running Automated Tests

```bash
cd backend
npx tsx tests/session.test.js
```
