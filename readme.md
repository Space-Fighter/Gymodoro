# Gymodoro

## Vision

Gymodoro combines the Pomodoro Technique with short exercise breaks.

Instead of scrolling during breaks, users perform quick workouts to improve health, posture, energy, and focus.

Core loop:

```text
Focus Session
    ↓
Exercise Break
    ↓
Focus Session
```

---

# Tech Stack

## Frontend

* React (Vite)
* Tailwind CSS
* DaisyUI

## Backend

* Node.js
* Express.js

## Database (Later)

* PostgreSQL
* Neon (hosting)
* Drizzle ORM

---

# Project Structure

```text
gymodoro/
├── frontend/
└── backend/
```

Frontend and backend remain separate projects.

---

# Current Status

Installed:

* React
* Vite
* Tailwind
* DaisyUI
* Express
* Drizzle packages

Not installed/configured yet:

* PostgreSQL
* Neon

Database setup will be done after MVP is working.

---

# MVP (Version 1)

## Landing Page

### UI

* Full screen background
* Gymodoro branding
* Tagline
* Pomodoro ring
* Start button

### Pomodoro

* 25 minute focus timer
* Start
* Pause
* Reset

### Break Mode

When timer ends:

```text
Focus
    ↓
Break
```

Display:

* Motivational message
* Random workout

---

# Workout System (V1)

Hardcoded workout list.

Example:

```js
[
  "10 Pushups",
  "15 Squats",
  "20 Jumping Jacks",
  "30s Plank"
]
```

Select random workout during break.

No backend required.

---

# Workout System (Future)

## Exercise Source

ExerciseDB API

Provides:

* Exercise name
* GIF
* Instructions
* Equipment
* Target muscle group

## Backend Flow

```text
ExerciseDB
     ↓
Backend
     ↓
Workout Generator
     ↓
Frontend
```

Example:

```text
Chest
    ↓
Pushups
Wide Pushups
Dips
    ↓
Generate Workout
```

---

# Future Features

## Free

* Pomodoro Timer
* Random Workouts
* Session Counter
* Streaks

## Pro

* Custom Workout Selection
* Custom Timer Lengths
* Analytics
* Statistics
* Workout Categories

---

# Learning Philosophy

Learn only when needed.

Examples:

Need multiple pages:
→ Learn React Router

Need frontend-backend communication:
→ Learn fetch/Axios

Need persistent storage:
→ Learn PostgreSQL + Drizzle

Need authentication:
→ Learn JWT

---

# Immediate Goal

Do NOT work on:

* Authentication
* PostgreSQL
* Neon
* Payments
* Analytics
* AI Features

Current goal:

```text
Open Website
      ↓
Press Start
      ↓
25 Minute Timer
      ↓
Break Starts
      ↓
Random Workout Appears
      ↓
Continue Studying
```

Build this loop first.
