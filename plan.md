# Exercise Catalog API + Session/Pomodoro API — team split plan

## Context

Gymodoro's auth API is done (`backend/src/controllers/authControllers.ts`, routed at `/api/auth`). Two teammates have joined: one on frontend, one on backend alongside the user. The next feature is the exercise/pomodoro core: users work for 25 minutes, then get an exercise suggestion for a 5-minute break. This plan splits that work into two independently-buildable API slices — an **Exercise Catalog API** (owned by the user) and a **Session/Pomodoro Tracking API** (owned by the backend teammate) — plus the shared groundwork both depend on, so the two devs can branch off in parallel without stepping on each other's files or migrations.

Current backend layout (Express 5 ESM, Prisma 7, custom generated-client path — see `backend/CLAUDE.md` rules on `.js` import extensions and `rootDir`):
- `src/controllers/authControllers.ts`, `src/routes/authRoutes.ts`, mounted in `src/server.ts` via `app.use('/api/auth', authRoutes)`.
- `lib/prisma.ts` exports a singleton `prisma` client (`PrismaPg` adapter).
- `prisma/schema.prisma` currently has `User` and `RefreshToken` only.
- No middleware directory exists yet — every current auth endpoint does its own JWT verification inline (see `signAccessToken`/`JWT_SECRET` pattern in `authControllers.ts`).

## Shared groundwork (build first, before the two tracks branch)

Whoever starts first builds these two pieces; the other rebases onto them. Recommend the user (auth owner) does this since it's a direct extension of existing auth code.

**1. Auth middleware — `backend/src/middleware/authenticate.ts`**
Extracts the pattern currently inlined per-endpoint in `authControllers.ts` (JWT verify against `JWT_SECRET`) into reusable Express middleware:
```ts
// reads Authorization: Bearer <token>, jwt.verify with JWT_SECRET,
// sets req.userId = decoded.id, else res.status(401)
```
Both new APIs need this to scope data to the calling user. Follow the existing `JWT_SECRET` guard pattern (lines 14-21 of `authControllers.ts`: guard on a `rawJwtSecret` intermediate, then re-assign to an explicitly `: string`-typed constant) rather than re-deriving it.

**2. Prisma schema additions — `backend/prisma/schema.prisma`**
Add two models plus a back-relation on `User`. Both devs need to agree on field names before writing code against them, since changing them later means a second migration:

```prisma
model Exercise {
  id          String   @id @default(uuid())
  name        String
  description String
  category    String   // "cardio" | "stretch" | "strength" | "mobility"
  difficulty  String   // "easy" | "medium" | "hard"
  durationSec Int      // suggested duration, meant to fit inside a 5-min break
  imageUrl    String?
  createdAt   DateTime @default(now())

  sessions    Session[]
}

model Session {
  id            String    @id @default(uuid())
  userId        String
  User          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workDuration  Int       @default(1500) // seconds, 25 min
  breakDuration Int       @default(300)  // seconds, 5 min
  exerciseId    String?
  Exercise      Exercise? @relation(fields: [exerciseId], references: [id])
  status        String    @default("in_progress") // in_progress | completed | skipped | abandoned
  startedAt     DateTime  @default(now())
  completedAt   DateTime?
}
```
Add `sessions Session[]` to `User`. One person runs `npx prisma migrate dev --name add_exercise_and_session` and commits the migration; the other pulls it rather than generating a second migration touching the same tables.

Both tracks below assume this middleware and schema exist.

## Track A — Exercise Catalog API (user)

New files: `backend/src/controllers/exerciseControllers.ts`, `backend/src/routes/exerciseRoutes.ts`, a seed script (`backend/prisma/seed.ts` or reuse the pattern in `backend/script.ts`) to populate ~15-20 starter exercises across categories.

Endpoints (all read-only, no auth required — it's a public catalog):
- `GET /api/exercises` — list all, supports `?category=` and `?difficulty=` query filters.
- `GET /api/exercises/:id` — single exercise detail.
- `GET /api/exercises/random` — returns one random exercise, optionally filtered by `?category=`. Implement the picking logic as a standalone exported function, e.g. `export async function getRandomExercise(category?: string)`, with the route handler as a thin wrapper around it — Track B's `start-break` endpoint imports and calls this function directly instead of making an internal HTTP request. Implement via Prisma `count()` + random `skip`, or `ORDER BY RANDOM() LIMIT 1` raw query if Prisma's ordering doesn't support it directly.

Mount in `src/server.ts`: `app.use('/api/exercises', exerciseRoutes)`, following the exact pattern of the existing `app.use('/api/auth', authRoutes)` line.

## Track B — Session/Pomodoro Tracking API (backend teammate)

New files: `backend/src/controllers/sessionControllers.ts`, `backend/src/routes/sessionRoutes.ts`.

Endpoints (all require `authenticate` middleware — sessions are per-user):
- `POST /api/sessions` — start a new pomodoro session for `req.userId`. Body optionally overrides `workDuration`/`breakDuration`. `exerciseId` stays null — the work period hasn't finished yet, so there's nothing to suggest.
- `PATCH /api/sessions/:id/start-break` — called when the 25-min work period ends. Picks a random exercise (calls the Track A random-exercise logic directly via a shared helper, e.g. `getRandomExercise()` exported from `exerciseControllers.ts`, rather than an internal HTTP call) and stores it on `exerciseId`. Verify the session belongs to `req.userId` first.
- `PATCH /api/sessions/:id` — update status (`completed`, `skipped`, `abandoned`), sets `completedAt`. Must verify the session belongs to `req.userId` before updating (mirror the ownership-check pattern implicit in `RefreshToken`'s `userId` scoping).
- `GET /api/sessions` — list the current user's session history, newest first, for a stats/history view.
- `GET /api/sessions/stats` — optional aggregate endpoint (total sessions completed, total exercise minutes) if time allows.

Mount in `src/server.ts`: `app.use('/api/sessions', sessionRoutes)`.

## Coordination notes

- Git: two feature branches (`feature/exercise-api`, `feature/session-api`), PR review before merging to `main` — CI (`backend-ci.yml`) already runs `prisma generate` + `npm run build` on PRs touching `backend/`.
- The schema migration is the one shared touchpoint — land it as its own small PR first, both devs pull `main` before starting their controller/route files.
- No test runner is configured in the backend (per `CLAUDE.md`); manual testing via Postman/curl, same as the existing `AUTH_TESTING_GUIDE.md` pattern — worth writing a short `EXERCISE_SESSION_TESTING_GUIDE.md` alongside this work if the team wants a repeatable checklist.

## Verification

- `cd backend && npx prisma generate && npx prisma migrate dev --name add_exercise_and_session` — confirms schema compiles and migration applies cleanly against `DATABASE_URL`.
- `cd backend && npm run build` — type-checks both new controller/route files against the regenerated Prisma client.
- `cd backend && npm run dev`, then manually hit each endpoint with curl/Postman (register+login first to get an access token for the Track B endpoints, since they're behind `authenticate`).

---

## Full MVP scope: adding the Chrome extension features

Two more MVP features were named beyond the core pomodoro loop:
- **Distraction blocker extension** — a Chrome extension that watches the pages/content a user visits during a work session and blocks distracting content (the "YouTube can be study or cat videos" problem), using an LLM to classify intent rather than a static domain blocklist.
- **"Convince the bot"** — a friction/override mechanism: instead of a hard block, the user has to argue their case to a chatbot to get temporary access to an otherwise-blocked site. This is a product/gamification feature, not just an escape hatch, so it should feel like part of the app rather than a bypass.

Both are extension-shaped (need a Chrome extension shell) but LLM-classification/conversation logic is backend work, not frontend work — so this splits across all three people, not just frontend.

### Track C — Distraction Classification API (backend)
New files: `backend/src/controllers/classificationControllers.ts`, `backend/src/routes/classificationRoutes.ts`.
- `POST /api/classify` — body `{ url, pageTitle, pageTextExcerpt }`, behind `authenticate` (ties classification to a user's active session so it only fires during work blocks, not breaks). Calls an LLM (e.g. Claude via the Anthropic SDK) with a prompt that returns `{ verdict: "focus" | "distracting", confidence }`. Cache verdicts per-URL for a short TTL (in-memory `Map` or Postgres table `ClassificationCache { urlHash, verdict, expiresAt }`) so repeat visits to the same page in one session don't re-hit the LLM on every navigation.
- Needs its own env var for the LLM API key, following the same "guard-then-typed-const" pattern used for `JWT_SECRET`/`GOOGLE_CLIENT_ID` in `authControllers.ts`.
- Should only need `req.userId` from the existing `authenticate` middleware.
- **Also write a permanent `DistractionEvent` row per classification** (separate from the ephemeral cache — the cache is a TTL performance shortcut, this is the durable log): `DistractionEvent { id, userId, sessionId?, url, verdict, category?, occurredAt }`. This table isn't used by anything in Phase 2 — it exists purely so Phase 3's analyser (below) has a data source to mine later without needing a schema migration + backfill at that point. Cheap to add now, expensive to retrofit once the extension is already shipping without it.

### Track D — "Convince the Bot" API (backend)
New files: `backend/src/controllers/persuasionControllers.ts`, `backend/src/routes/persuasionRoutes.ts`.
- `POST /api/persuasion/sessions` — start a persuasion attempt for a blocked `url`, tied to `req.userId` and the active `Session`.
- `POST /api/persuasion/sessions/:id/messages` — user sends an argument; the bot (LLM, with a system prompt that's skeptical but persuadable within reason) replies and the endpoint returns either a continued conversation turn or a `{ granted: true, unlockMinutes }` verdict.
- Schema addition (own small migration, separate from the `add_exercise_and_session` one): `PersuasionAttempt { id, userId, url, sessionId?, granted, transcript Json, createdAt }` — storing the transcript is useful later for tuning the bot's leniency.
- Shares the same LLM client/API-key setup as Track C — factor a small `lib/llm.ts` helper once both exist, rather than each controller instantiating its own client.

### Track E — Chrome Extension shell (frontend teammate)
New top-level directory: `extension/` (separate from `frontend/`, since a Chrome extension has its own `manifest.json`, build config, and no Vite dev server in the same sense — likely its own small Vite/CRXJS or esbuild setup).
- `manifest.json` (Manifest V3), background service worker, and a content script injected into pages during an active work session.
- Content script responsibility: extract lightweight page signal (URL, title, maybe visible text excerpt) and POST it to `/api/classify` (Track C); on a `distracting` verdict, render a full-page overlay blocking the content, with a "convince the bot" button that opens the Track D chat flow in a popup/side panel.
- Needs the extension to know the user's access token — reuse the existing auth flow's access token (stored via `chrome.storage`, refreshed via the existing `/api/auth/refresh-token` cookie-based flow, adapted since extensions don't share the web app's cookie jar — likely needs the access token passed from the web app on login, or a lightweight extension-specific login).
- This track can start once Track C's `/api/classify` contract (request/response shape) is agreed, even before the endpoint is fully implemented — stub it with a fixed JSON response first.

### Team assignment across all five tracks

| Person | Phase 1 (core loop) | Phase 2 (extension) |
|---|---|---|
| User (you) | Shared groundwork + Track A (Exercise Catalog) | Track C (Classification API) — natural extension of owning the exercise/suggestion logic |
| Backend teammate | Track B (Session/Pomodoro API) | Track D (Persuasion/"convince the bot" API) |
| Frontend teammate | Web app UI consuming Track A/B (pomodoro timer screen, exercise display) | Track E (Chrome extension shell) |

Rationale: Tracks C and D both need an LLM client and a similar request/response shape (verdict-style vs conversation-style), so splitting them across the two backend devs — rather than giving both to one person — keeps neither blocked waiting on the other, and each is a natural extension of the person's Phase 1 domain (exercise/suggestion-picking logic → content classification; session lifecycle management → persuasion-session lifecycle). Track E is scoped separately from the main `frontend/` web app work so the frontend teammate isn't blocked switching between the two — recommend finishing the core web app screens first, then moving to the extension once Track C's contract is stable.

Sequencing: land Phase 1 (core pomodoro + exercise loop) as a working MVP first — it's the smaller, faster win and de-risks the schema/auth-middleware groundwork every later track depends on. Start Phase 2 once Phase 1 is merged, not in parallel from day one, since Tracks C/D depend on `authenticate` middleware and Track D depends on the `Session` model both coming out of Phase 1.

---

## Phase 3 (stretch, build only once Phases 1-2 are stable): Distraction Analyser & Voice Task Capture

Two further features were named as "later, if time allows" — not part of the current team assignment, but the architecture above is deliberately shaped so neither requires re-architecting the data model when the team gets to them:

**Distraction Time Analyser** — mines the `DistractionEvent` log (Track C) and `Session` history (Track B) to find *when* during the day a user is most focused vs. most distracted, then: (1) suggests scheduling work blocks in their historically-focused hours, (2) suggests exercise/socializing/chores during their historically-distracted hours instead of fighting them, (3) surfaces this as an analytics dashboard. This is naturally a **read-only aggregation layer over data the other tracks already produce** — `GET /api/analytics/focus-patterns` (bucket `DistractionEvent`+`Session` rows by hour-of-day, compute focus ratio per bucket) and `GET /api/analytics/summary`. Whether the "which hours are best" logic is a statistical aggregation (SQL `GROUP BY EXTRACT(HOUR FROM ...)`) or an LLM asked to summarize the aggregated stats is an implementation choice for whoever picks this up later — either way it consumes existing tables, so it doesn't gate anything in Phases 1-2. The only Phase-1/2 discipline this requires: keep timestamping consistent (`occurredAt`/`startedAt` in UTC) and keep `DistractionEvent`/`Session` rows around rather than pruning them.

**Voice task capture** — user dictates ad-hoc tasks while working; speech-to-text (browser Web Speech API or a backend transcription endpoint) produces raw text, an LLM parses it into discrete tasks with priority + estimated duration, and the result gets slotted into the user's schedule. This needs one new model — `Task { id, userId, title, priority, estimatedMinutes, scheduledAt?, status, createdAt }` — and a `POST /api/tasks/from-voice` endpoint (transcript in, parsed+prioritized `Task[]` out, using the same shared `lib/llm.ts` helper as Tracks C/D). It's additive: no changes needed to `User`, `Session`, or `Exercise`, so it can be bolted on whenever the team gets to it without touching Phase 1-2 code.

**Why this doesn't need to change anything in Phases 1-2:** both stretch features are pure *consumers* of data the earlier phases already produce (or, for voice tasks, an entirely new isolated table) — the one deliberate hook is the `DistractionEvent` log in Track C, added now specifically so Phase 3 has something to analyse without a retroactive migration. Everything else in Phase 3 is new files, new routes, and at most one new table, with no edits to existing controllers.
