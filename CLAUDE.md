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
- `npm run build` — `tsc` → `dist/`
- `npm start` — run compiled `dist/server.js`
- `npx prisma migrate dev` — apply/create migrations against `DATABASE_URL`
- `npx prisma generate` — regenerate the client (see gotcha below)

There is **no test runner configured** in either project.

## Backend environment & first-run gotchas

- **Imports of unlisted deps.** `src/server.ts` imports `morgan`, and `src/controllers/authControllers.ts` imports `nodemailer` and `google-auth-library`, but none of these are in `backend/package.json` dependencies. They must be installed (`npm i morgan nodemailer google-auth-library`) or the server won't start. Add them to `package.json` when you touch this.
- **Prisma client is generated to a custom path** (`backend/generated/prisma`, set in `prisma/schema.prisma`), not the default `@prisma/client` location. Code imports it via `lib/prisma.ts` → `../generated/prisma/client.js`. This directory is not checked in — run `npx prisma generate` before first run.
- **ESM + NodeNext.** `backend` is `"type": "module"` with `moduleResolution: NodeNext`. Relative imports **must use `.js` extensions** even though the source files are `.ts` (e.g. `import authRoutes from './routes/authRoutes.js'`). Follow this pattern for all new backend imports.
- Required env vars (in `backend/.env`, loaded via `dotenv`): `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID` (all three throw on startup if missing), plus optional `CLIENT_URL`, `EMAIL_HOST`/`EMAIL_PORT`/`EMAIL_USER`/`EMAIL_PASS`/`EMAIL_FROM`.
- `backend/script.ts` is a standalone Prisma scratch script (creates a sample user), not part of the server. Run ad hoc with `npx tsx script.ts`.

## Auth architecture (backend)

All logic lives in `src/controllers/authControllers.ts`, routed from `src/routes/authRoutes.ts`, mounted at `/api/auth` in `src/server.ts`. Data model is two Prisma tables: `User` and `RefreshToken` (see `prisma/schema.prisma`).

Key design decisions that span multiple functions:
- **Access + rotating refresh tokens.** Login/register/google issue a short-lived JWT access token (15m) plus a 7-day refresh token. The refresh token is delivered as an httpOnly, `secure`, `sameSite: strict` cookie; the access token is returned in the JSON body.
- **Tokens are stored hashed, never raw.** `hashToken()` SHA-256s both email-verification tokens and refresh tokens before persisting. The raw value only ever leaves the server (email link / cookie). DB lookups hash the incoming value first.
- **Refresh rotation + reuse detection.** `refreshToken` verifies the JWT, looks the hash up in the `RefreshToken` table, revokes the used token, and issues a new one. If an already-**revoked** token is presented again, it treats this as a leak and revokes *all* of that user's tokens, forcing re-login.
- **Google accounts have no password.** `googleLogin` verifies a Google ID token (client posts `{ idToken }`), then links `googleId` to an existing email or creates a passwordless user. `login` explicitly rejects password attempts on such accounts. Any nullable-`password` logic must preserve this.

## Frontend architecture

- Entry `src/main.tsx` → `src/App.tsx`. Routing is in `App.tsx`: `/` → `Home`, `/welcome` → `Welcome`. The app is wrapped in a `ThemeProvider` (dark default, persisted to `localStorage` under `vite-ui-theme`) with a floating `ModeToggle`.
- **Path alias `@` → `src/`** is configured in both `vite.config.ts` and `tsconfig`. Import shared code as `@/components/...`, `@/lib/utils`, etc.
- **shadcn/ui.** Primitives live in `src/components/ui/` (generated via the shadcn CLI, config in `components.json`). Compose these rather than hand-rolling equivalents; use the `cn()` helper from `@/lib/utils` for conditional classes. Styling is Tailwind v4 (via `@tailwindcss/vite`, no separate config file) plus CSS variables in `src/index.css`.
- Feature/page components are grouped by area (e.g. `src/components/welcome/`), pages in `src/pages/`.
