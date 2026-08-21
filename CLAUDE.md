# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Gymodoro is a two-part app in one repo. There is **no root package.json** — `frontend/` and `backend/` are independent Node projects, each with its own `package.json`, `tsconfig`, and `node_modules`. Always `cd` into the relevant subdirectory before running commands.

- `frontend/` — Vite + React 19 + TypeScript, Tailwind CSS v4, shadcn/ui, React Router 7.
- `backend/` — Express 5 (ESM) + Prisma 7 on PostgreSQL. Exposes auth endpoints under `/api/auth`, a read-only exercise catalog under `/api/exercises`, and a Pomodoro session API under `/api/sessions`.

## Commands

Frontend (`cd frontend`):
- `npm run dev` — Vite dev server (default port 5173)
- `npm run build` — type-check (`tsc -b`) then production build
- `npm run lint` — ESLint over the project
- `npm run preview` — serve the built app

Backend (`cd backend`):
- `npm run dev` — run `src/server.ts` with `tsx watch` (hot reload) on port 3000
- `npm run build` — `tsc`, compiling `src/`, `lib/`, and `generated/` (rootDir is `.`) into `dist/`
- `npm start` — run the compiled server at `dist/src/server.js` (note the extra `src/` level, since `rootDir` is the backend root, not `src/`)
- `npx prisma migrate dev` — apply/create migrations against `DATABASE_URL`
- `npx prisma migrate deploy` — apply migrations in production (Neon: use the direct endpoint, not pooled, for this command)
- `npx prisma generate` — regenerate the client (see gotcha below)
- `npm run db:seed` — seed the `Exercise` catalog from `prisma/exercise-seed-data.json` (idempotent, safe to re-run)
- `npm run db:import-wger` — import fresh exercise data from the wger open exercise database (writes to `exercise-seed-data.json`, then re-run `db:seed`)
- `npx tsx script.ts` — run the standalone Prisma scratch script (creates a sample user; not part of the server)

There is **no test runner configured** in either project. `AUTH_TESTING_GUIDE.md` documents manual Postman testing for the auth endpoints.

CI (`.github/workflows/backend-ci.yml`, `frontend-ci.yml`) runs on push/PR to `main`, path-filtered to each app's own directory. Backend CI runs `prisma generate` then `npm run build`; frontend CI runs `npm run lint` then `npm run build`. Neither runs tests (none exist) or deploys.

**`backend/src/controllers/sessionControllers.ts` currently fails `tsc`/`npm run build`.** It reads `Exercise.duration`, `.caloriesBurned`, `.category`, `.imageUrl`, and `.instructions` (and calls `getRandomExercise` with one argument), none of which match the current `Exercise` model in `prisma/schema.prisma` (which has `mechanic`, `force`, `videoUrl`, `gifUrl`, `muscleDiagramUrl`, and a `difficulty` relation instead). The Session model/routes/middleware (`sessionRoutes.ts`, `middleware/authenticate.ts`) are otherwise wired up and mounted at `/api/sessions`, but the controller needs reconciling with the schema (or the schema extending) before this compiles. Check current state with `npx tsc --noEmit` before assuming this API works.

## Backend environment & first-run gotchas

- **Prisma client is generated to a custom path** (`backend/generated/prisma`, set in `prisma/schema.prisma`), not the default `@prisma/client` location, and Prisma 7 emits **`.ts` source files there**, not pre-compiled `.js`/`.d.ts`. Code imports it via `lib/prisma.ts` → `../generated/prisma/client.js`. This directory is not checked in (gitignored) — run `npx prisma generate` before first run or before `npm run build`/typecheck, since the generated `.ts` files must exist on disk for `tsc` to include them.
- **`tsconfig.json`'s `rootDir` is `.` (the backend root), not `./src`.** This is because compiled code pulls in `lib/prisma.ts` and the generated Prisma client, both of which live outside `src/`. `script.ts` and `prisma.config.ts` are explicitly excluded from the compile. This is also why `dist/server.js` is actually at `dist/src/server.js`.
- **ESM + NodeNext.** `backend` is `"type": "module"` with `moduleResolution: NodeNext`. Relative imports **must use `.js` extensions** even though the source files are `.ts` (e.g. `import authRoutes from './routes/authRoutes.js'`). Follow this pattern for all new backend imports.
- Required env vars (in `backend/.env`, loaded via `dotenv`): `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID` (all three throw on startup if missing), plus optional `CLIENT_URL`, `EMAIL_HOST`/`EMAIL_PORT`/`EMAIL_USER`/`EMAIL_PASS`/`EMAIL_FROM`.
- Env vars read via `process.env` are typed `string | undefined`; TypeScript's narrowing after an `if (!X) throw` guard doesn't carry into functions defined later in the file. The pattern used for `JWT_SECRET` in `authControllers.ts` (and duplicated in `middleware/authenticate.ts`) — guard on an intermediate variable, then re-assign to an explicitly `: string`-typed constant — is the fix; follow it for any new required secret read this way.
- **Neon pooled vs. direct endpoints.** `.env`'s `DATABASE_URL` points at Neon's pooled endpoint (`-pooler` in hostname), which is good for the running app but doesn't support Prisma's session-level advisory lock. `prisma migrate deploy` will time out on the pooled endpoint. Use Neon's direct endpoint (same URL, drop `-pooler`) only for migrations: `npx prisma migrate deploy`. The app code (seed, queries) works fine with either; keep `.env` on pooled for efficiency.
- **CORS** is configured in `src/server.ts` via the `cors` package, allowlisting only `process.env.CLIENT_URL` (falls back to `http://localhost:5173`) with `credentials: true`. If the frontend runs on a different origin/port, update `CLIENT_URL` in `backend/.env` — without a matching origin, every browser fetch with `credentials: "include"` (i.e. every frontend auth/session/exercise call) is silently blocked by the browser, not by the server (no error appears server-side).

## Auth architecture (backend)

All logic lives in `src/controllers/authControllers.ts`, routed from `src/routes/authRoutes.ts`, mounted at `/api/auth` in `src/server.ts`. Data model is two Prisma tables: `User` and `RefreshToken` (see `prisma/schema.prisma`).

Endpoints: `POST /register`, `POST /login`, `POST /google`, `POST /refresh-token`, `POST /logout`, `POST /resend-verification`, `GET /get-me`, `GET /verify-email`.

Key design decisions that span multiple functions:
- **Access + rotating refresh tokens.** Login/google issue a short-lived JWT access token (15m) plus a 7-day refresh token. The refresh token is delivered as an httpOnly, `secure`, `sameSite: strict` cookie; the access token is returned in the JSON body only — it is never itself put in a cookie. `register` does **not** issue any tokens (see next point).
- **Registration requires email verification before login.** `register` creates the user and emails a verification link but returns no access token / refresh cookie. `login` hard-rejects with 403 (`{ emailVerified: false }`) until the user clicks the emailed link (`GET /verify-email?token=...`, handled by `verifyEmail`), which flips `User.emailVerified`. `resendVerificationEmail` re-issues a token with a 1-minute cooldown and returns the same generic message regardless of whether the account exists (anti-enumeration).
- **`GET /get-me` and `middleware/authenticate.ts` (used by `/api/sessions`) both expect the access token as `Authorization: Bearer <token>`, not a cookie.** Only the refresh token lives in a cookie. A client that only sends cookies (no bearer header) will always get 401 from these routes.
- **Tokens are stored hashed, never raw.** `hashToken()` SHA-256s both email-verification tokens and refresh tokens before persisting. The raw value only ever leaves the server (email link / cookie). DB lookups hash the incoming value first.
- **Refresh rotation + reuse detection.** `refreshToken` verifies the JWT, looks the hash up in the `RefreshToken` table, revokes the used token, and issues a new one (plus a fresh access token in the JSON response). If an already-**revoked** token is presented again, it treats this as a leak and revokes *all* of that user's tokens, forcing re-login.
- **Google accounts have no password.** `googleLogin` verifies a Google ID token (client posts `{ idToken }`), then links `googleId` to an existing email or creates a passwordless user (`emailVerified: true` immediately, since Google already confirmed the address). `login` explicitly rejects password attempts on such accounts. Any nullable-`password` logic must preserve this.

## Exercise catalog architecture (backend)

Read-only exercise API mounted at `/api/exercises`. Data model: `Exercise` with lookup tables for `Difficulty`, `BodyArea`, `MuscleGroup`, `Equipment`, and `ExerciseType` (N-to-N via join tables). Source of truth is `prisma/exercise-seed-data.json` (static snapshot, not network-fetched).

Endpoints (all GET, all in `src/controllers/exerciseControllers.ts`):
- `GET /api/exercises` — list all exercises, filterable by `?difficulty=`, `?bodyArea=`, `?muscleGroup=`, `?equipment=`, `?type=`. Returns `{ exercises: [], count }`.
- `GET /api/exercises/:id` — fetch a single exercise by ID.
- `GET /api/exercises/random` — fetch a random exercise, accepts same filter params as list.

All endpoints flatten join-table rows into plain string arrays (`exercise.muscleGroups` is `["Chest", "Triceps"]`, not join objects).

**Seeding pipeline:**
- `import-wger.ts` fetches exercise data from the free wger API (difficulty, mechanic, force, video/GIF URLs), maps to `SeedExercise` shape, writes to `exercise-seed-data.json`. Run on demand: `npm run db:import-wger` (one-time, not CI).
- `exercise-seed-data.json` is the static snapshot (checked in). Never edit by hand; it's overwritten by `import-wger`.
- `seed.ts` reads the JSON and upserts `Exercise` rows + lookup tables (Difficulty, BodyArea, MuscleGroup, Equipment, ExerciseType). Idempotent; safe to re-run. Run with `npm run db:seed` after migrations or to refresh from latest JSON.
- MVP scope: read-only catalog only, no user-created workouts/routines yet.

## Session API (backend)

`Session` model tracks a single Pomodoro run (`prisma/schema.prisma`): `workDuration`/`breakDuration` in seconds, `status` (`in_progress` | `break` | `completed` | `skipped` | `abandoned`), timestamps, and an optional linked `Exercise`. Routes in `src/routes/sessionRoutes.ts`, mounted at `/api/sessions`, all behind `middleware/authenticate.ts` (Bearer token → `req.userId`).

- `POST /` — start a session (`createSession`). Body optionally overrides `workDuration`/`breakDuration`; values `<= 120` are treated as minutes and converted to seconds, larger values are treated as already-seconds.
- `PATCH /:id/start-break` — call when the work period ends; assigns a random exercise via `getRandomExercise()` (shared, direct function call into `exerciseControllers.ts`, not an internal HTTP round-trip) and flips status to `break`.
- `PATCH /:id` — update status/durations/exercise. All non-owner or missing-session lookups return 403/404, not silently no-op.
- `GET /`, `GET /:id` — session history (paginated, filterable by `status`/date range) and single-session detail, always scoped to `req.userId`.
- `GET /stats` — heavy aggregation endpoint (today/by-hour/by-day/by-day-of-week/heatmap/exercise-category breakdown) for a dashboard that doesn't exist in the frontend yet. Registered before `/:id` in the router specifically so `"stats"` isn't parsed as an id.

See the note under Commands above — this controller does not currently type-check against the `Exercise` model.

## Frontend architecture

- Entry `src/main.tsx` → `src/App.tsx`. Routing is in `App.tsx` with auth protection: unauthenticated users see `/welcome` (welcome page), authenticated users can access `/` (timer) and other protected routes. The whole router is wrapped in `AuthProvider` (`src/context/AuthContext.tsx`) so all pages/components share one auth state — do not call the underlying context hook outside the provider, and do not reintroduce a local per-component auth hook (see Frontend auth flow below for why that broke things previously). The app is also wrapped in a `ThemeProvider` (dark default, persisted to `localStorage` under `vite-ui-theme`) with a floating `ModeToggle`.
- **Path alias `@` → `src/`** is configured in `vite.config.ts` (`resolve.alias`) and `tsconfig.app.json` (`paths`, resolved without `baseUrl` — deprecated as of TS 6 and intentionally not used here). Import shared code as `@/components/...`, `@/lib/utils`, etc.
- **shadcn/ui.** Primitives live in `src/components/ui/` (generated via the shadcn CLI, config in `components.json`). Compose these rather than hand-rolling equivalents; use the `cn()` helper from `@/lib/utils` for conditional classes. Styling is Tailwind v4 (via `@tailwindcss/vite`, no separate config file) plus CSS variables in `src/index.css`.
- Feature/page components are grouped by area (e.g. `src/components/welcome/`, `src/components/timer/`), pages in `src/pages/`.
- **`verbatimModuleSyntax` is on** (`tsconfig`), so type-only imports (interfaces/types) must use `import type { X } from ...`. A plain `import { X }` of a type compiles under `tsc` but throws a runtime `SyntaxError: does not provide an export named 'X'` in the Vite dev server (esbuild transpiles files independently and doesn't know `X` is type-only). If the app renders a blank white screen with nothing but a console `SyntaxError` about a missing export, check for this first.
- **Env vars** (`frontend/.env`, Vite-prefixed): `VITE_API_URL` (backend origin, defaults to `http://localhost:3000` where read) and `VITE_GOOGLE_CLIENT_ID` (must match backend's `GOOGLE_CLIENT_ID`). `AuthContext.tsx` reads `VITE_API_URL`; `useGoogleSignIn.ts` reads `VITE_GOOGLE_CLIENT_ID`. `useExercises.ts` still hardcodes `http://localhost:3000` rather than using the env var — inconsistent, worth fixing together if you touch either.

## Frontend auth flow

- Auth state lives in `AuthContext`/`AuthProvider` (`src/context/AuthContext.tsx`); `src/hooks/useAuth.ts` just re-exports `useAuth` from there for import-path stability. **Do not give `useAuth` its own local `useState` again** — it previously did, which meant every component calling it had independent, unsynchronized auth state (e.g. `SignIn` would "log in" successfully but `ProtectedRoute`'s own instance never found out, so it kept redirecting to `/welcome`).
- **Access token is kept in memory only** (a `useRef` in `AuthContext`, never `localStorage`). Because of that, a page reload has no access token to send. `checkAuth()` (run once on `AuthProvider` mount) recovers from this by first `POST`ing `/api/auth/refresh-token` (uses the httpOnly refresh cookie) to mint a fresh access token, then calls `GET /api/auth/get-me` with `Authorization: Bearer <token>`. `get-me` does **not** accept the refresh cookie by itself.
- **Endpoints used:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google`, `POST /api/auth/refresh-token`, `POST /api/auth/logout`, `GET /api/auth/get-me`. All requests include `credentials: "include"` to send/receive the httpOnly refresh cookie.
- **Google Sign-In** (`useGoogleSignIn.ts`) wraps Google Identity Services, loaded via a `<script src="https://accounts.google.com/gsi/client">` tag in `index.html`. It calls `google.accounts.id.initialize()` once the script is available, then a custom-styled button triggers `google.accounts.id.prompt()`; the resulting ID token is POSTed to `/api/auth/google` via `AuthContext.googleLogin()`. There's no dedicated Google button component — this hook is used inline in both `SignIn.tsx` and `SignUp.tsx`. Apple sign-in was removed; there is no Apple auth path anywhere in the app.
- **Routing:** `ProtectedRoute` component wraps authenticated routes (`/` → Timer). Unauthenticated users redirected to `/welcome`.
- **Sign-in** (`SignIn.tsx`) calls `login()` then navigates to `/`. **Sign-up** (`SignUp.tsx`) does **not** navigate anywhere on success — `register()` never logs the user in (see the auth architecture section above), so the page instead swaps to a "check your inbox" confirmation using the message the backend returned.
- **Pages:** `Welcome.tsx` shows landing page for unauthenticated users (redirects to `/` if authenticated). `SignUp.tsx` and `SignIn.tsx` have integrated auth forms with error display and loading states.

## Timer page (frontend)

The timer page (`src/pages/Timer.tsx`) is the main authenticated feature: a Pomodoro timer with exercise breaks. Architecture:
- **Main state:** Timer mode (focus/short/long), remaining time, running status, current activity index, sidebar state, description state.
- **Modes & durations:** Configurable via props (default: 25/5/15 min focus/short-break/long-break). Timer counts down 1s at a time; pause/resume/reset/add-time controls.
- **Sub-components** in `src/components/timer/`:
  - `Sidebar.tsx` — Navigation buttons (Timer, Workout Library, Background, Settings). Toggles open/closed based on state. Fixed position on left side.
  - `FocusView.tsx` — Full-screen timer for focus mode. Mode dots (select focus/short/long), large timer display, add-time buttons (+1/+5/+10), play/pause/reset/expand controls.
  - `BreakView.tsx` — Two-column layout for break modes. Left: exercise selection (Roll Dice / Choose Activity buttons), activity name, difficulty/type/area tags, exercise video embed, description dropdown. Right: exercise video embed, centered timer below, play/pause/reset.
  - `WorkoutLibrary.tsx` — Exercise grid with client-side filtering. Filters: difficulty, body area. Supports clear/toggle. Click exercise → switch to that activity, switch to break mode if in focus, return to timer view.
  - `BackgroundView.tsx` — Background selection (Forest, Jungle, Night Sky, Beach, Rainy Cafe, City Lights). Placeholder UI.
  - `SettingsView.tsx` — Settings toggles (Auto-start breaks, Notifications, Sound effects) + logged-in user display + Sign Out button (calls `logout()`, navigates to `/welcome`).
- **Data fetching:** `useExercises()` hook fetches `GET /api/exercises` on mount. Returns exercises array; errors fall back to empty array so app stays functional. Note: this hook does not talk to the `/api/sessions` endpoints at all — the timer currently runs purely client-side with no session persisted to the backend.
- **YouTube embeds:** GIF preview on BreakView left side uses YouTube IFrame with `autoplay=1&mute=1&loop=1` params; video embeds are standard IFrames with controls and `allow="encrypted-media"`.
- **Exercise model:** Flattened structure from backend: `{ id, name, description, difficulty, bodyArea, muscleGroups[], equipment[], exerciseTypes[], videoUrl?, gifUrl? }`.

## Development & testing

**Local development flow:**
1. Start backend: `cd backend && npm run dev` (port 3000)
2. Start frontend: `cd frontend && npm run dev` (port 5173 or next available)
3. Frontend will try to authenticate on load (refresh-token → get-me). If neither succeeds, redirects to `/welcome`.
4. Test auth: Sign Up → check the "check your inbox" message → verify via the emailed link → Sign In → redirected to Timer page (`/`).
5. Test timer: Start/pause/reset, switch modes, try Roll Dice or Choose Activity.

**Common issues:**
- **Frontend renders a blank white screen** → almost always a runtime JS error, not a backend issue. Open the browser console first. A `SyntaxError: ... does not provide an export named 'X'` means a type-only import is missing `import type` (see the `verbatimModuleSyntax` note above) — Vite dev mode does not type-check, so `tsc` won't have caught it.
- **Frontend requests silently fail with no server-side error / login doesn't redirect** → check CORS: `backend/.env`'s `CLIENT_URL` must match the frontend's actual origin, or the browser blocks every `credentials: "include"` fetch before it reaches the server.
- **"Token not found" on GET /api/auth/get-me** → expected if the caller isn't sending `Authorization: Bearer <accessToken>` (a cookie alone is not enough for this route).
- **"Failed to fetch exercises"** → Backend not running or exercises not seeded. Run `cd backend && npm run db:seed`.
- **Refresh token not persisting** → Ensure browser allows httpOnly cookies (not blocked by privacy settings); note the refresh cookie is set with `secure: true`, so it requires an HTTPS or browser-trusted-localhost context.

**API expectations:**
- Auth endpoints expect credentials in request body (JSON): `{ email, password }`, `{ email, password, name }` (register), or `{ idToken }` (Google).
- Responses include `{ user: { id, email, name?, emailVerified? }, accessToken? }` (access token in body for immediate use; refresh token in httpOnly cookie). `register`'s response has no `accessToken` — only `{ message, emailSent, user }`.
- Exercise endpoints return `{ exercises: [...], count }` with flattened join-table structures (arrays, not objects).
