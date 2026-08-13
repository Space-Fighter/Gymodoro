# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Gymodoro is a two-part app in one repo. There is **no root package.json** — `frontend/` and `backend/` are independent Node projects, each with its own `package.json`, `tsconfig`, and `node_modules`. Always `cd` into the relevant subdirectory before running commands.

- `frontend/` — Vite + React 19 + TypeScript, Tailwind CSS v4, shadcn/ui, React Router 7.
- `backend/` — Express 5 (ESM) + Prisma 7 on PostgreSQL. Currently exposes only auth endpoints under `/api/auth`.

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
- `npx prisma generate` — regenerate the client (see gotcha below)
- `npx tsx script.ts` — run the standalone Prisma scratch script (creates a sample user; not part of the server)

There is **no test runner configured** in either project. `AUTH_TESTING_GUIDE.md` documents manual Postman testing for the auth endpoints.

CI (`.github/workflows/backend-ci.yml`, `frontend-ci.yml`) runs on push/PR to `main`, path-filtered to each app's own directory. Backend CI runs `prisma generate` then `npm run build`; frontend CI runs `npm run lint` then `npm run build`. Neither runs tests (none exist) or deploys.

## Backend environment & first-run gotchas

- **Prisma client is generated to a custom path** (`backend/generated/prisma`, set in `prisma/schema.prisma`), not the default `@prisma/client` location, and Prisma 7 emits **`.ts` source files there**, not pre-compiled `.js`/`.d.ts`. Code imports it via `lib/prisma.ts` → `../generated/prisma/client.js`. This directory is not checked in (gitignored) — run `npx prisma generate` before first run or before `npm run build`/typecheck, since the generated `.ts` files must exist on disk for `tsc` to include them.
- **`tsconfig.json`'s `rootDir` is `.` (the backend root), not `./src`.** This is because compiled code pulls in `lib/prisma.ts` and the generated Prisma client, both of which live outside `src/`. `script.ts` and `prisma.config.ts` are explicitly excluded from the compile. This is also why `dist/server.js` is actually at `dist/src/server.js`.
- **ESM + NodeNext.** `backend` is `"type": "module"` with `moduleResolution: NodeNext`. Relative imports **must use `.js` extensions** even though the source files are `.ts` (e.g. `import authRoutes from './routes/authRoutes.js'`). Follow this pattern for all new backend imports.
- Required env vars (in `backend/.env`, loaded via `dotenv`): `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID` (all three throw on startup if missing), plus optional `CLIENT_URL`, `EMAIL_HOST`/`EMAIL_PORT`/`EMAIL_USER`/`EMAIL_PASS`/`EMAIL_FROM`.
- Env vars read via `process.env` are typed `string | undefined`; TypeScript's narrowing after an `if (!X) throw` guard doesn't carry into functions defined later in the file. The pattern used for `JWT_SECRET` in `authControllers.ts` — guard on an intermediate variable, then re-assign to an explicitly `: string`-typed constant — is the fix; follow it for any new required secret read this way.

## Auth architecture (backend)

All logic lives in `src/controllers/authControllers.ts`, routed from `src/routes/authRoutes.ts`, mounted at `/api/auth` in `src/server.ts`. Data model is two Prisma tables: `User` and `RefreshToken` (see `prisma/schema.prisma`).

Key design decisions that span multiple functions:
- **Access + rotating refresh tokens.** Login/register/google issue a short-lived JWT access token (15m) plus a 7-day refresh token. The refresh token is delivered as an httpOnly, `secure`, `sameSite: strict` cookie; the access token is returned in the JSON body.
- **Tokens are stored hashed, never raw.** `hashToken()` SHA-256s both email-verification tokens and refresh tokens before persisting. The raw value only ever leaves the server (email link / cookie). DB lookups hash the incoming value first.
- **Refresh rotation + reuse detection.** `refreshToken` verifies the JWT, looks the hash up in the `RefreshToken` table, revokes the used token, and issues a new one. If an already-**revoked** token is presented again, it treats this as a leak and revokes *all* of that user's tokens, forcing re-login.
- **Google accounts have no password.** `googleLogin` verifies a Google ID token (client posts `{ idToken }`), then links `googleId` to an existing email or creates a passwordless user. `login` explicitly rejects password attempts on such accounts. Any nullable-`password` logic must preserve this.

## Frontend architecture

- Entry `src/main.tsx` → `src/App.tsx`. Routing is in `App.tsx`: `/` → `Home`, `/welcome` → `Welcome`. The app is wrapped in a `ThemeProvider` (dark default, persisted to `localStorage` under `vite-ui-theme`) with a floating `ModeToggle`.
- **Path alias `@` → `src/`** is configured in `vite.config.ts` (`resolve.alias`) and `tsconfig.app.json` (`paths`, resolved without `baseUrl` — deprecated as of TS 6 and intentionally not used here). Import shared code as `@/components/...`, `@/lib/utils`, etc.
- **shadcn/ui.** Primitives live in `src/components/ui/` (generated via the shadcn CLI, config in `components.json`). Compose these rather than hand-rolling equivalents; use the `cn()` helper from `@/lib/utils` for conditional classes. Styling is Tailwind v4 (via `@tailwindcss/vite`, no separate config file) plus CSS variables in `src/index.css`.
- Feature/page components are grouped by area (e.g. `src/components/welcome/`), pages in `src/pages/`.
