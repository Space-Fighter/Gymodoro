# Gymodoro Frontend

The frontend for Gymodoro — a modern Pomodoro web app that turns productivity breaks into active breaks.

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **shadcn/ui**.

---

## Getting Started

### 1. Prerequisites
- **Node.js** v18+ (`node --version`)
- **npm** v9+ (`npm --version`)

### 2. Installation & Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server (with HMR)
npm run dev
```

Once running, open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the Vite dev server at `http://localhost:5173` |
| `npm run build` | Runs TypeScript typecheck (`tsc -b`) and bundles for production in `dist/` |
| `npm run lint` | Runs ESLint to check for code quality and syntax issues |
| `npm run preview` | Serves the production build from `dist/` locally |

---

## Application Structure

```
frontend/
├── public/
│   ├── gymodoro-logo.png     # Brand asset & favicon
│   └── favicon.svg
├── src/
│   ├── assets/               # Images and static media
│   ├── components/
│   │   ├── ui/               # shadcn/ui primitives (button, card, etc.)
│   │   ├── welcome/          # Modular Welcome page components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── TheProblem.tsx
│   │   │   ├── ActiveBreakCarousel.tsx
│   │   │   ├── TheLoop.tsx
│   │   │   ├── ThreePillars.tsx
│   │   │   ├── VoiceAI.tsx
│   │   │   ├── FinalCTA.tsx
│   │   │   └── Footer.tsx
│   │   ├── mode-toggle.tsx    # Theme switcher button (Light/Dark)
│   │   └── theme-provider.tsx # Theme context with localStorage sync
│   ├── pages/
│   │   ├── Welcome.tsx       # Landing page
│   │   ├── SignIn.tsx        # Authentication - Sign In
│   │   ├── SignUp.tsx        # Authentication - Sign Up
│   │   └── Home.tsx          # App dashboard / timer view
│   ├── App.tsx               # Main Router and Theme Provider
│   ├── index.css             # Tailwind v4 theme tokens & keyframes
│   └── main.tsx              # React DOM entry point
├── index.html                # SEO metadata, OpenGraph tags & Google Fonts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Features

- **Light & Dark Theme**: Supports full light and dark mode with persistent state stored in `localStorage` under `gymodoro-theme`.
- **Infinite Active Breaks Carousel**: Continuous looping marquee of 8 break exercises with pause-on-hover interaction.
- **Interactive Orbit Loop**: Step through the Gymodoro 4-stage productivity cycle (`Focus`, `Move`, `Recover`, `Repeat`).
- **Voice AI Simulation**: Dynamic 11-bar equalizer sound wave animation and instant plan building preview.
- **SEO Optimized**: Complete OpenGraph, Twitter Card, meta descriptions, and Google Fonts integration (`DM Sans`, `Manrope`, `JetBrains Mono`, `Plus Jakarta Sans`, `Inter`).

