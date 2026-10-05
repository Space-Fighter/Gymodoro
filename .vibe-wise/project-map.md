# Project Map

(Source: CLAUDE.md and repo layout; not yet independently verified against code.)

## Purpose
Gymodoro: Pomodoro timer where breaks are exercise breaks. Users focus, then get a random exercise (with video) for the break; sessions and stats are tracked.

## Requirements
Not yet discussed with the learner.

## Components
- `frontend/` — Vite + React 19 + TS, Tailwind v4, shadcn/ui, React Router 7. Timer page `src/pages/Timer.tsx`, auth in `src/context/AuthContext.tsx`.
- `backend/` — Express 5 (ESM) + Prisma 7 on PostgreSQL. Routes: `/api/auth`, `/api/exercises`, `/api/sessions`.
- `deploy/` + `docker-compose.yml` — nginx (TLS, static frontend, proxies `/api/`), backend, certbot.

## Main Flow
Browser (React) --fetch, Bearer access token + refresh cookie--> nginx --/api/--> Express --Prisma--> PostgreSQL (Neon)
Timer phase transitions --> POST/PATCH /api/sessions (best-effort) --> Stats view <-- GET /api/sessions/stats

## Data and Trust Boundaries
- Access token in memory (frontend); refresh token in httpOnly cookie; tokens stored hashed server-side.
- Google sign-in via ID token. Email verification required before login.

## Build and Deployment
- Frontend: `npm run dev|build|lint` in `frontend/`. Backend: `npm run dev|build`, `npx prisma ...` in `backend/`.
- CI: GitHub Actions per app; production via Docker Compose.

## Unknowns
- What the learner wants to build or change this session.
- Learner's familiarity with each part of the stack.
