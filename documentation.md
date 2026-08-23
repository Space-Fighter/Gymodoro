# Gymodoro — Technical Documentation

Gymodoro is a Pomodoro-style focus timer that assigns a real exercise as the activity for each break. The repository holds two independent Node projects — `frontend/` and `backend/` — with no root `package.json`; each has its own dependencies, tooling, and lifecycle.

---

## 1. Repository Layout

```
Gymodoro/
├── backend/                  Express 5 + Prisma 7 API (ESM, TypeScript)
│   ├── src/                  routes, controllers, middleware, server entry
│   ├── lib/prisma.ts         Prisma client singleton
│   ├── generated/prisma/     generated Prisma client (gitignored, .ts source)
│   ├── prisma/               schema, migrations, seed data, importer scripts
│   ├── script.ts             standalone scratch script (creates a sample user)
│   └── dist/                 compiled build output (tsc)
├── frontend/                 Vite + React 19 + TypeScript SPA
│   └── src/
│       ├── pages/            top-level routed pages
│       ├── components/       feature components grouped by area (timer/, welcome/, stats/, ui/)
│       ├── context/          AuthContext (global auth state)
│       ├── hooks/            useAuth, useExercises, useGoogleSignIn, useSessions, useSessionStats
│       ├── lib/               utils, chime.ts (sound), youtube.ts, tagColors.ts
│       └── types/            shared TS interfaces (auth, exercise, session)
├── deploy/                   nginx config + Dockerfile, deploy.sh
├── docker-compose.yml        production 3-service stack (backend, nginx, certbot)
├── .github/workflows/        CI (backend-ci, frontend-ci) + Neon preview-branch automation
└── CLAUDE.md                 authoritative internal engineering notes (source for most of this doc)
```

---

## 2. Backend

### 2.1 Stack & Runtime Notes
- **Express 5**, ESM (`"type": "module"`), TypeScript compiled with `moduleResolution: NodeNext`.
- Relative imports require explicit `.js` extensions (e.g. `import authRoutes from './routes/authRoutes.js'`) even though source files are `.ts`.
- `tsconfig.json`'s `rootDir` is the backend root (`.`), not `./src`, because compiled code pulls in `lib/prisma.ts` and the generated Prisma client from outside `src/`. `script.ts` and `prisma.config.ts` are excluded from the compile. Consequently the compiled entry point is `dist/src/server.js` (an extra `src/` nesting), which is why `npm start` runs `dist/src/server.js`.
- **Prisma client is generated to a custom path** (`backend/generated/prisma`, configured in `prisma/schema.prisma`'s `generator client { output = "../generated/prisma" }`), not the default `@prisma/client` location. Prisma 7 emits `.ts` source files there (not precompiled `.js`/`.d.ts`); the directory is gitignored, so `npx prisma generate` must run before first build/dev/typecheck. `lib/prisma.ts` imports it as `../generated/prisma/client.js`.

### 2.2 Commands
```bash
cd backend
npm run dev                    # tsx watch src/server.ts, hot reload, port 3000
npm run build                  # tsc -> dist/
npm start                      # node dist/src/server.js
npx prisma migrate dev         # create/apply migration (DATABASE_URL)
npx prisma migrate deploy      # apply migrations in prod (use Neon DIRECT endpoint)
npx prisma generate            # regenerate Prisma client
npm run db:seed                # seed Exercise catalog from exercise-seed-data.json (idempotent)
npm run db:import-wger         # scrape wger open exercise DB -> exercise-seed-data.json
npm run db:import-darebee      # scrape Darebee.com -> exercise-seed-data.json (current primary source)
npm run db:fill-missing-videos # fallback pass filling null videoUrl via unrestricted YouTube search
npx tsx script.ts              # standalone Prisma scratch script, not part of the server
```
No automated test runner is configured (`backend/tests/*.test.js` and `AUTH_TESTING_GUIDE.md` / `TESTING.md` / `SESSION_TESTING_GUIDE.md` document manual/Postman-style testing).

### 2.3 Environment Variables (`backend/.env`)
| Var | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Neon **pooled** endpoint for app runtime. Throws on startup if missing. |
| `JWT_SECRET` | yes | Throws on startup if missing. TypeScript narrowing doesn't survive across functions — guard on an intermediate var then reassign to an explicit `: string` constant (see `authControllers.ts`, `middleware/authenticate.ts`). |
| `GOOGLE_CLIENT_ID` | yes | Must match frontend's `VITE_GOOGLE_CLIENT_ID`. Throws on startup if missing. |
| `CLIENT_URL` | optional | CORS allowlist origin, falls back to `http://localhost:5173`. Mismatch silently blocks all `credentials:"include"` fetches client-side with no server-visible error. |
| `EMAIL_HOST`/`EMAIL_PORT`/`EMAIL_USER`/`EMAIL_PASS`/`EMAIL_FROM` | optional | verification email delivery |

**Neon pooled vs. direct:** `DATABASE_URL` uses the `-pooler` hostname for the running app; `prisma migrate deploy` needs Prisma's session-level advisory lock and times out on pooled — use the direct endpoint (same URL, drop `-pooler`) only for migration commands.

### 2.4 Data Model (`prisma/schema.prisma`)

- **User** — `id (uuid)`, `name`, `email (unique)`, `password?` (null for Google-only accounts), `emailVerified`, `verificationToken?`/`verificationTokenExpiry?`, `googleId?`, relations to `refreshTokens[]` and `sessions[]`.
- **RefreshToken** — `hashedToken (unique)`, `userId`, `revoked`, `expireAt`. Tokens are SHA-256 hashed before storage; only the raw value ever leaves the server (cookie / email link).
- **Exercise** — `id`, `name (unique)`, `description`, `mechanic?` (compound/isolation), `force?` (push/pull/static), `videoUrl?`, `gifUrl?`, `muscleDiagramUrl?`, `caloriesPerMinute (Float, default 5)`. Belongs to one `Difficulty` and optional `BodyArea`; many-to-many with `MuscleGroup`, `Equipment`, `ExerciseType` via explicit join tables (`ExerciseMuscleGroup`, `ExerciseEquipment`, `ExerciseExerciseType`).
- **Difficulty / BodyArea / MuscleGroup / Equipment / ExerciseType** — simple lookup tables, each `name (unique)`.
- **Session** — `id`, `userId`, `workDuration (Int, default 1500s)`, `breakDuration (Int, default 300s)`, `exerciseId?` (SetNull on exercise delete), `status (default "in_progress")`, `startedAt`, `breakStartedAt?`, `completedAt?`. Indexed on `[userId, startedAt]`.

`Exercise` intentionally has **no** `duration`, `category`, `imageUrl`, or `instructions` fields — session responses that embed exercise data are limited to `id`, `name`, `description`, `videoUrl`, `gifUrl`.

### 2.5 Auth API (`/api/auth`, `src/controllers/authControllers.ts` + `routes/authRoutes.ts`)

| Method & Path | Purpose |
|---|---|
| `POST /register` | Creates user, sends verification email. **No tokens issued.** |
| `POST /login` | Password login. 403 `{ emailVerified: false }` if unverified. Issues access token (JSON body) + refresh cookie. |
| `POST /google` | Verifies Google ID token (`{ idToken }`), links `googleId` to existing email or creates a passwordless user (`emailVerified: true` immediately). |
| `POST /refresh-token` | Rotates refresh token from httpOnly cookie; issues new access + refresh pair. |
| `POST /logout` | Revokes refresh token, clears cookie. |
| `POST /resend-verification` | 1-minute cooldown; generic response regardless of account existence (anti-enumeration). |
| `GET /get-me` | Requires `Authorization: Bearer <accessToken>` — cookie alone insufficient. |
| `GET /verify-email?token=...` | Flips `User.emailVerified`. |

Key mechanics:
- **Access token**: 15-minute JWT, returned only in the JSON response body — never set as a cookie.
- **Refresh token**: 7-day JWT, delivered as an httpOnly, `secure`, `sameSite: strict` cookie.
- **Rotation + reuse detection**: presenting a token already marked `revoked` is treated as a leak signal — all of that user's refresh tokens are revoked, forcing re-login.
- **Hashing**: both verification tokens and refresh tokens are SHA-256 hashed (`hashToken()`) before persisting; DB lookups hash the incoming value to compare.
- Google accounts have `password: null`; `login` explicitly rejects password attempts against such accounts.

### 2.6 Exercise Catalog API (`/api/exercises`, `src/controllers/exerciseControllers.ts`)

| Method & Path | Purpose |
|---|---|
| `GET /` | List exercises. Filters: `?difficulty=`, `?bodyArea=`, `?muscleGroup=`, `?equipment=`, `?type=`. Returns `{ exercises: [], count }`. |
| `GET /:id` | Single exercise by ID. |
| `GET /random` | Random exercise (`getRandomExerciseHandler`), same filters as list. |

All join-table results are flattened to plain string arrays (e.g. `muscleGroups: ["Chest", "Triceps"]`).

A non-HTTP export `getRandomExercise(category?)` in the same file filters by exercise-type name and is called directly by `sessionControllers.startBreak` to assign a break exercise — sharing selection logic with the HTTP handler via an internal `selectRandomExercise(where)` helper rather than an HTTP round-trip.

**Seeding pipeline:** `import-wger.ts` and `import-darebee.ts` each independently scrape their source into the shared `SeedExercise[]` shape (`prisma/types.ts`), overwriting `exercise-seed-data.json`. Darebee is primary; wger is kept for reference/fallback and filters via the `curated.ts` allowlist. Both share a YouTube video lookup (`youtube.ts`, via a standalone `yt-dlp` binary, no API key). `db:fill-missing-videos` is a maintenance pass over exercises either importer left with `videoUrl: null`. `exercise-seed-data.json` is a static checked-in snapshot — never hand-edit it. `seed.ts` idempotently upserts `Exercise` rows plus all lookup tables from that JSON.

MVP scope: read-only catalog only — no user-created workouts/routines.

### 2.7 Session API (`/api/sessions`, `src/controllers/sessionControllers.ts` + `routes/sessionRoutes.ts`)

All routes require `middleware/authenticate.ts` (Bearer token → `req.userId`).

| Method & Path | Purpose |
|---|---|
| `POST /` | Start a session (`createSession`). Body may override `workDuration`/`breakDuration`; values `<= 120` are treated as minutes and converted to seconds. |
| `PATCH /:id/start-break` | Assigns a random exercise via `getRandomExercise()`, flips status to `break`. Optional `category` (body/query) filters by exercise-type name. |
| `PATCH /:id` | Updates status/durations/exercise. Non-owner or missing-session lookups return 403/404. |
| `GET /` | Paginated session history, filterable by `status`/date range, scoped to `req.userId`. |
| `GET /:id` | Single session detail, scoped to `req.userId`. |
| `GET /stats` | Aggregation (`?range=today\|week\|month\|...`): today/by-hour/by-day/by-day-of-week/heatmap/completion-rate + `totalCaloriesBurned`. Registered before `/:id` so `"stats"` isn't parsed as an id. |

`totalCaloriesBurned` = sum of `exercise.caloriesPerMinute * (breakDuration / 60)` across sessions with an attached exercise and status `break` or `completed`.

### 2.8 Server Bootstrap (`src/server.ts`)
Mounts `/api/auth`, `/api/exercises`, `/api/sessions`. CORS is configured via the `cors` package, allowlisting only `process.env.CLIENT_URL` (default `http://localhost:5173`) with `credentials: true`.

---

## 3. Frontend

### 3.1 Stack
Vite + React 19 + TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`, no separate config file, CSS variables in `src/index.css`), shadcn/ui primitives (`src/components/ui/`, config in `components.json`), React Router 7.

### 3.2 Commands
```bash
cd frontend
npm run dev       # Vite dev server, default port 5173
npm run build     # tsc -b (type-check) then production build
npm run lint      # ESLint
npm run preview   # serve the build
```

### 3.3 Conventions
- **Path alias** `@` → `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`, no `baseUrl`).
- **`verbatimModuleSyntax` is on** — type-only imports must use `import type { X } from ...`. A plain `import { X }` of a type-only export compiles under `tsc` but throws a runtime `SyntaxError` in Vite dev (esbuild transpiles files independently). A blank white screen + console `SyntaxError` about a missing export is the signature of this bug.
- Compose shadcn primitives + `cn()` from `@/lib/utils` rather than hand-rolling equivalents.
- Feature components grouped by area: `components/timer/`, `components/welcome/`, `components/stats/`, `components/ui/`.

### 3.4 Env Vars (`frontend/.env`)
| Var | Used by | Notes |
|---|---|---|
| `VITE_API_URL` | `AuthContext.tsx` | backend origin, defaults to `http://localhost:3000` |
| `VITE_GOOGLE_CLIENT_ID` | `useGoogleSignIn.ts` | must match backend `GOOGLE_CLIENT_ID` |

`useExercises.ts` still hardcodes `http://localhost:3000` instead of reading the env var — a known inconsistency, worth fixing if either is touched.

### 3.5 App Shell & Routing
`src/main.tsx` → `src/App.tsx`. Routing lives in `App.tsx`: unauthenticated users see `/welcome`; authenticated users get `/` (Timer) and other protected routes via `ProtectedRoute`. The whole router is wrapped in `AuthProvider` (`src/context/AuthContext.tsx`) so auth state is shared globally, and in a `ThemeProvider` (dark default, persisted to `localStorage` under `vite-ui-theme`) with a floating `ModeToggle`.

**Do not** give `useAuth` its own local `useState` — it previously did, causing desynchronized auth state across components (e.g. `SignIn` "logging in" while `ProtectedRoute`'s separate instance never found out and kept redirecting to `/welcome`). `src/hooks/useAuth.ts` only re-exports the context hook for import-path stability.

### 3.6 Auth Flow
- **Access token is kept in memory only** (`useRef` in `AuthContext`), never `localStorage`, so it's lost on reload. `checkAuth()` (runs once on `AuthProvider` mount) recovers by `POST`ing `/api/auth/refresh-token` (httpOnly cookie) for a fresh access token, then `GET /api/auth/get-me` with `Authorization: Bearer <token>`.
- All auth requests use `credentials: "include"`.
- **Google Sign-In** (`useGoogleSignIn.ts`) wraps Google Identity Services (loaded via `<script src="https://accounts.google.com/gsi/client">` in `index.html`). No dedicated button component — the hook is used inline in both `SignIn.tsx` and `SignUp.tsx`. There is no Apple sign-in anywhere in the app (removed).
- **Sign-in** (`SignIn.tsx`) calls `login()` then navigates to `/`. **Sign-up** (`SignUp.tsx`) never navigates on success — it swaps to a "check your inbox" confirmation, since `register()` issues no tokens.

### 3.7 Timer Page (`src/pages/Timer.tsx`)

The main authenticated feature — a Pomodoro timer with exercise breaks.

**State:** timer mode (focus/short/long), remaining time, running status, current activity index, sidebar state, description state. Durations configurable via props (default 25/5/15 min). Countdown ticks 1s at a time with pause/resume/reset/add-time controls.

**Sub-components** (`src/components/timer/`):
| Component | Role |
|---|---|
| `Sidebar.tsx` | Fixed-left nav: Timer, Workout Library, Background, Settings, Stats. |
| `FocusView.tsx` | Full-screen focus timer: mode dots, large display, +1/+5/+10 buttons, play/pause/reset/expand. |
| `BreakView.tsx` | Two-column break layout: exercise selection (Roll Dice / Choose Activity), tags, video embed + description on the left; video + centered timer + controls on the right. |
| `WorkoutLibrary.tsx` | Client-side-filtered exercise grid (difficulty, body area); clicking an exercise switches to it and enters break mode if currently in focus. |
| `BackgroundView.tsx` | Background selection (Forest, Jungle, Night Sky, Beach, Rainy Cafe, City Lights) — placeholder UI. |
| `SettingsView.tsx` | Auto-start breaks / Notifications / Sound effects toggles, logged-in user display, Sign Out. |

**Data fetching:** `useExercises()` fetches `GET /api/exercises` on mount; errors fall back to an empty array so the app stays functional. YouTube embeds: GIF preview uses `autoplay=1&mute=1&loop=1`; video embeds are standard IFrames with controls and `allow="encrypted-media"`.

**Exercise model (frontend):** `{ id, name, description, difficulty, bodyArea, muscleGroups[], equipment[], exerciseTypes[], videoUrl?, gifUrl? }`.

**Session persistence (best-effort, fire-and-forget):** Timer.tsx mirrors countdown phase transitions to the backend so `/api/sessions/stats` has real data, without gating the client-side countdown on network success.
- `activeSessionRef` (a `ref`, not state) tracks the in-flight backend session id/phase.
- `startFocusSession()` → `POST /api/sessions` at the start of a focus period.
- On countdown reaching 0: `beginBreakForActiveSession()` (`PATCH /:id/start-break`) or `completeActiveSession()` (`PATCH /:id { status: "completed" }`) depending on `isFocusMode`.
- Abandoning the timer → `abandonActiveSession()` (`status: "abandoned"`).
- All calls go through a local `authedFetch()` using `getAccessToken()` from `AuthContext`; silently no-ops without a token.
- Phase-completion logic lives in a separate `useEffect` keyed on `remaining === 0` (not inlined in the `setRemaining` updater) because React StrictMode double-invokes updater functions in dev, and this must fire exactly once.

**Sound effects:** `src/lib/chime.ts` synthesizes a focus/break completion chime, wired to the Settings "Sound effects" toggle.

### 3.8 Stats View
`StatsView.tsx` (the `"stats"` sidebar tab) has two sub-tabs:
- `AnalyticsTab.tsx` — calls `useSessionStats(range)` → `GET /api/sessions/stats?range=`; renders `StatTile.tsx` cards and `HourlyChart.tsx`.
- `ReviewSessionsTab.tsx` — calls `useSessions(limit)` → `GET /api/sessions?limit=`; session history list.

Both hooks live in `src/hooks/`; response shapes are typed in `src/types/session.ts` (`Session`, `SessionListResponse`, `SessionStatsResponse`, `StatsRange`).

---

## 4. CI/CD

- `.github/workflows/backend-ci.yml` — path-filtered to `backend/`, runs on push/PR to `main`: `prisma generate` then `npm run build`. No tests run (none exist), no deploy.
- `.github/workflows/frontend-ci.yml` — path-filtered to `frontend/`: `npm run lint` then `npm run build`.
- `.github/workflows/neon-branch.yml` — creates a temporary Neon DB branch (`preview/pr-<number>-<branch>`, 14-day expiry) on PR open/sync, deletes it on close. Provisioning-only for now — the migrate/seed step is present but commented out.

---

## 5. Deployment

Production runs via Docker Compose (`docker-compose.yml`), three services on one network:

| Service | Build | Notes |
|---|---|---|
| `backend` | `backend/Dockerfile` (two-stage: `prisma generate` + `npm run build`, ships only `dist/`) | `expose`-only, never reachable directly from the internet. |
| `nginx` | `deploy/nginx/Dockerfile` | Runs the frontend's `npm run build` with `VITE_API_URL`/`VITE_GOOGLE_CLIENT_ID` passed as Docker build `args` — **baked in at image build time**, not read at container runtime. Changing them requires `--build`, not just a restart. |
| `certbot` | — | One-off, shares a volume with `nginx` for Let's Encrypt certs. |

`deploy/nginx/nginx.conf` terminates TLS, proxies `/api/` to `http://backend:3000`, and falls back unmatched routes to `index.html` for client-side routing. Day-to-day flow: `docker compose up -d --build` (see `README.md` / `DEPLOYMENT.md` for details).

---

## 6. Local Development Flow

1. `cd backend && npm run dev` (port 3000)
2. `cd frontend && npm run dev` (port 5173 or next available)
3. On load, the frontend attempts auth recovery (refresh-token → get-me); if both fail, it redirects to `/welcome`.
4. Test auth: Sign Up → "check your inbox" message → verify via emailed link → Sign In → redirected to `/`.
5. Test timer: start/pause/reset, switch modes, try Roll Dice or Choose Activity.

### Common Issues

| Symptom | Likely Cause |
|---|---|
| Frontend renders a blank white screen | Runtime JS error — check console first. `SyntaxError: ... does not provide an export named 'X'` = missing `import type` on a type-only import (Vite dev doesn't type-check). |
| Requests silently fail, no server-side error, login doesn't redirect | CORS: `backend/.env`'s `CLIENT_URL` must match the frontend's actual origin, or the browser blocks every `credentials: "include"` fetch before it reaches the server. |
| "Token not found" on `GET /api/auth/get-me` | Caller isn't sending `Authorization: Bearer <accessToken>` — a cookie alone is insufficient for this route. |
| "Failed to fetch exercises" | Backend not running, or exercises not seeded — run `npm run db:seed`. |
| Refresh token not persisting | Browser is blocking httpOnly cookies, or context isn't HTTPS/trusted-localhost (cookie is `secure: true`). |

### API Expectations
- Auth endpoints expect JSON body credentials: `{ email, password }`, `{ email, password, name }` (register), or `{ idToken }` (Google).
- Responses: `{ user: { id, email, name?, emailVerified? }, accessToken? }` — access token in body, refresh token in httpOnly cookie. `register`'s response has no `accessToken`, only `{ message, emailSent, user }`.
- Exercise endpoints: `{ exercises: [...], count }`, flattened join-table arrays.

---

## 7. Additional Reference Docs in Repo
- `AUTH_TESTING_GUIDE.md`, `backend/TESTING.md`, `backend/SESSION_TESTING_GUIDE.md` — manual/Postman testing guides.
- `DEPLOYMENT.md` — production deployment walkthrough.
- `GYMODORO_DEMO_SCRIPT.md` — demo script.
- `README.md` (root and `frontend/README.md`) — project overview and quickstart.
