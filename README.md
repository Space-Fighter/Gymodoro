# Gymodoro

A two-part pomodoro timer application with authentication. Built with React, TypeScript, Tailwind CSS, and Express.

## Proposed Features

- Pomodoro work/break timer (25 min work / 5 min break)
- Exercise suggestion during breaks
- Session/pomodoro history tracking
- Chrome extension: AI-based distraction blocker (classifies page content as focus vs. distracting, not a static blocklist)
- "Convince the bot" — persuasion-based override to temporarily unblock a distracting site
- Distraction time analyser — finds a user's most-focused vs. most-distracted hours from browsing/session data, recommends work scheduling and suggests exercise/socializing/chores during distracted hours, plus overall analytics
- Voice task capture — dictate ad-hoc tasks, LLM parses/prioritizes them and slots them into the schedule

## Project Overview

Gymodoro is a monorepo with two independent Node projects:
- **Frontend** — Vite + React 19 + TypeScript with Tailwind CSS v4 and shadcn/ui
- **Backend** — Express 5 (ESM) + Prisma 7 on PostgreSQL with JWT authentication

Each directory (`frontend/` and `backend/`) has its own `package.json`, `tsconfig`, and `node_modules`. There is **no root package.json**.

## Prerequisites

- **Node.js** v18+ (check with `node --version`)
- **npm** v9+ (check with `npm --version`)
- **PostgreSQL** (running and accessible)
- **Git**

## Project Structure

```
Gymodoro/
├── frontend/                  # React + Vite app
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                   # Express + Prisma app
│   ├── src/
│   ├── prisma/               # Database schema
│   ├── generated/            # Auto-generated Prisma client
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                  # Environment variables
├── AUTH_TESTING_GUIDE.md      # API testing guide
└── CLAUDE.md                  # Codebase documentation
```

---

## Getting Started

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Gymodoro
```

### Step 2: Backend Setup

#### 2a. Install Dependencies

```bash
cd backend
npm install
```

**⚠️ Important:** The following dependencies are imported but not listed in `package.json`. Add them:

```bash
npm install morgan nodemailer google-auth-library
```

This adds: `morgan` (logging), `nodemailer` (email), `google-auth-library` (Google OAuth).

#### 2b. Generate Prisma Client

```bash
npx prisma generate
```

This creates the Prisma client in `backend/generated/prisma/` (not checked in).

#### 2c: Set Up Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gymodoro"

# JWT
JWT_SECRET="your-secret-key-min-32-chars"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"

# Email (optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="noreply@gymodoro.com"

# Frontend URL (for verification links)
CLIENT_URL="http://localhost:5173"
```

**Generating JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2d: Run Database Migrations

```bash
npx prisma migrate dev
```

This creates tables and applies migrations.

### Step 3: Frontend Setup

#### 3a. Install Dependencies

```bash
cd ../frontend
npm install
```

### Step 4: Start the Application

**Open two terminal windows** (or use `npm concurrently`):

#### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

Expected output:
```
✓ Server listening on port 3000
✓ Database connected
```

#### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
  ➜  Local:   http://localhost:5173/
```

### Step 5: Access the App

Open your browser and go to:
```
http://localhost:5173
```

You should see the Gymodoro app. Register a new account to get started!

---

## Running the Frontend

The Gymodoro frontend is built with **Vite**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**.

### 1. Prerequisites
- **Node.js** v18+ (check with `node --version`)
- **npm** v9+ (check with `npm --version`)

### 2. Step-by-Step Instructions

1. **Navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Open [http://localhost:5173](http://localhost:5173) in your web browser.

### 3. Available Application Routes
- **`/` or `/welcome`** — Main Gymodoro landing page featuring the active-break marquee, interactive loop showcase, 3D timer mockup, voice AI simulator, and feature pillars.
- **`/signin`** — Sign In page with email/password and Google/Apple OAuth options.
- **`/signup`** — Sign Up page to register a new account.
- **`/home`** — Dashboard & session timer view.

### 4. Available Frontend Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server on `http://localhost:5173` with Hot Module Replacement (HMR) |
| `npm run build` | Run TypeScript type-checking (`tsc -b`) and compile production bundle into `dist/` |
| `npm run lint` | Run ESLint over all `.ts` and `.tsx` source files |
| `npm run preview` | Preview the production build locally |

### 5. UI Features & Controls
- **Light & Dark Theme Toggle**: Click the theme toggle icon (`☾` / `☀`) in the top navigation bar to switch between dark and light modes. Your preference is persisted in `localStorage` under `gymodoro-theme`.
- **Interactive Active Breaks Carousel**: Hover over the horizontal active-break cards to pause the infinite scrolling animation and explore break ideas.
- **The Gymodoro Loop**: Click on any of the 4 steps (`01 Focus`, `02 Move`, `03 Recover`, `04 Repeat`) to see the dynamic orbital diagrams update in real-time.
- **Voice AI Demo**: Click *"Build my plan →"* in the voice capture section to preview automated task prioritization.

---

## Available Commands

### Backend (`cd backend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload (port 3000) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled `dist/server.js` |
| `npx prisma migrate dev` | Create/apply database migrations |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma studio` | Open Prisma Studio (GUI for DB) |
| `npx tsx script.ts` | Run standalone Prisma script |

### Frontend (`cd frontend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Type-check + production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve built app locally |

---

## Testing the API

Use **Postman** to test authentication endpoints. See [AUTH_TESTING_GUIDE.md](./AUTH_TESTING_GUIDE.md) for complete testing steps.

Quick example — Register a new user:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

---

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `JWT_SECRET` | ✅ Yes | Secret key for signing JWTs (min 32 chars) |
| `GOOGLE_CLIENT_ID` | ✅ Yes | Google OAuth client ID |
| `CLIENT_URL` | ❌ Optional | Frontend URL for email links (default: `http://localhost:3000`) |
| `EMAIL_HOST` | ❌ Optional | SMTP server hostname |
| `EMAIL_PORT` | ❌ Optional | SMTP port (default: 587) |
| `EMAIL_USER` | ❌ Optional | SMTP authentication user |
| `EMAIL_PASS` | ❌ Optional | SMTP authentication password |
| `EMAIL_FROM` | ❌ Optional | From address for emails (default: `noreply@example.com`) |

### Frontend (.env)

Currently no required env vars. Frontend uses defaults.

---

## Database Setup

### PostgreSQL Installation

**Windows (via WSL or native):**
```bash
# Using WSL (recommended)
wsl
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Create Database

```bash
psql -U postgres
```

```sql
CREATE DATABASE gymodoro;
\c gymodoro
```

Then update `DATABASE_URL` in `backend/.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/gymodoro"
```

### View Database

```bash
cd backend
npx prisma studio
```

Opens GUI at `http://localhost:5555`

---

## Troubleshooting

### Error: "Cannot find module 'generated/prisma/client.js'"

**Solution:** Generate Prisma client
```bash
cd backend
npx prisma generate
```

### Error: "JWT_SECRET is not defined"

**Solution:** Add `JWT_SECRET` to `backend/.env`
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output and add to `.env`:
```
JWT_SECRET="<paste-here>"
```

### Error: "ECONNREFUSED 127.0.0.1:5432" (PostgreSQL connection failed)

**Solutions:**
1. Ensure PostgreSQL is running:
   ```bash
   sudo service postgresql start    # Linux
   brew services start postgresql   # macOS
   ```

2. Check connection string in `backend/.env`

3. Create the database if it doesn't exist:
   ```bash
   psql -U postgres
   CREATE DATABASE gymodoro;
   ```

### Error: "Cannot find module 'morgan'" or 'nodemailer' or 'google-auth-library'

**Solution:** Install missing dependencies
```bash
cd backend
npm install morgan nodemailer google-auth-library
```

### Frontend not connecting to backend

Check:
1. Backend is running on port 3000 (`npm run dev` in `backend/`)
2. `CLIENT_URL` in `backend/.env` points to frontend URL
3. Network tab in browser DevTools for failed requests

### Email verification not sending

Check:
1. Email env vars are set in `backend/.env`
2. SMTP provider credentials are correct
3. Gmail users: Use "App Password" not regular password
4. Check backend logs for error messages

---

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- **Frontend:** Changes to files auto-refresh browser
- **Backend:** Changes to files auto-restart server (via `tsx watch`)

### Debug Prisma Queries

Add to `backend/.env`:
```
DEBUG="prisma:*"
```

### Using Prisma Studio

```bash
cd backend
npx prisma studio
```

Opens interactive DB GUI at `http://localhost:5555`

---

## API Documentation

See [AUTH_TESTING_GUIDE.md](./AUTH_TESTING_GUIDE.md) for:
- All authentication endpoints
- Request/response examples
- Error handling
- Postman testing steps
- Security features

---

## Tech Stack

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, CSS variables
- **Components:** shadcn/ui
- **Routing:** React Router 7

### Backend
- **Framework:** Express 5 (ESM)
- **Database:** PostgreSQL + Prisma 7 ORM
- **Language:** TypeScript
- **Authentication:** JWT (access + refresh tokens)
- **Email:** Nodemailer
- **OAuth:** Google Auth Library

---

## Contributing

1. Follow the structure in [CLAUDE.md](./CLAUDE.md)
2. Backend: Always use `.js` extensions in imports (ESM)
3. Frontend: Use path alias `@/` for src imports
4. Test your changes before pushing

---

## License

MIT

---

## Support

For issues or questions:
1. Check [CLAUDE.md](./CLAUDE.md) for codebase guidance
2. See [AUTH_TESTING_GUIDE.md](./AUTH_TESTING_GUIDE.md) for API testing
3. Check backend logs: `npm run dev` output
4. Verify `.env` files are properly configured
