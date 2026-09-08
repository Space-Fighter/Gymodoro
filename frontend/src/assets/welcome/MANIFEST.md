# Welcome story asset manifest — wiring map for the integrator

Every file the Welcome scroll-story expects, the manifest key it maps to, and how
to wire it. **Placeholder files (tiny solid-colour / silent) sit at every path
below right now**, so `npm run build` and the page render work today. Dropping a
real asset in at the same path + doing the one-line wiring swaps it in with no
component change.

Frozen manifests: `frontend/src/components/welcome/story/assets.ts` (`STORY_ASSETS`)
and `frontend/src/components/welcome/story/audio.ts` (`AUDIO_BEDS`).

All paths below are relative to `frontend/src/assets/welcome/`.

---

## 1. Character reference

| File | Purpose |
|---|---|
| `character-ref.png` | Copy of `frontend/src/assets/man.png` (255x282). Likeness lock for every prompt in `PROMPTS.md`. Not imported by any component — reference only. |

---

## 2. Photoreal images → `STORY_ASSETS` keys (`assets.ts`)

Wire each by adding an import and setting `.src` on the entry, e.g.:
```ts
import problemComposite from "@/assets/welcome/problem-composite.webp";
// ...
problemComposite: { src: problemComposite, alt: "...", fallback: scorch },
```

| File | `STORY_ASSETS` key | Notes |
|---|---|---|
| `problem-composite.webp` | `problemComposite` | Part 1 surreal hero. 1600x1000, opaque. |
| `problem-sky.webp` | `problemSky` | Parched sky plate. 1600x1000, opaque. |
| `picnic-scene.webp` | `picnicScene` | Swiss work. 1600x1000, opaque. |
| `stream-still.webp` | `streamStill` | Still fallback for the stream loop. 1600x1000, opaque. |
| `stream-loop.webm` | `streamLoopWebm` | 6-10s seamless loop, VP9, no audio, <2 MB. |
| `stream-loop.mp4` | `streamLoopMp4` | Same clip, H.264 `yuv420p` faststart, no audio, <2 MB. |
| `cat-cow.webp` | `catCow` | Swiss workout 1. 1600x1000, opaque. |
| `pushups.webp` | `pushups` | Swiss workout 2. 1600x1000, opaque. |
| `cloud-a.png` | `cloudA` | Alpha cumulus, ~400x260, **transparent bg**. |
| `cloud-b.png` | `cloudB` | Alpha cumulus, ~500x300, **transparent bg**. |
| `walk-ground.webp` | `walkGround` | Continuous tileable path strip, ~1920x600. Transparent above the ground line (deliver as `.webp` w/ alpha or swap to `.png`). |
| `walk-guy-coffee.png` | `walkGuyCoffee` | Walk cut-out, ~700x1100, **transparent bg**. |
| `walk-guy-plank.png` | `walkGuyPlank` | Plank cut-out, ~1000x500, **transparent bg**. |
| `walk-guy-bench.png` | `walkGuyBench` | Bench cut-out (bench included), ~800x900, **transparent bg**. |
| `van-beach.webp` | `vanBeach` | Payoff hero (biggest section). 1920x1080+, opaque. |

---

## 3. In-app screenshots → `STORY_ASSETS` keys (`assets.ts`)

Captured live from the running app. ~1440x900 @2x, WebP q~85.

| File | `STORY_ASSETS` key | Screen / state |
|---|---|---|
| `screens/timer-focus.webp` | `shotTimerFocus` | Timer page, focus mode counting down |
| `screens/timer-break.webp` | `shotTimerBreak` | Timer page, break mode with an exercise shown |
| `screens/workout-library.webp` | `shotWorkoutLibrary` | Workout Library grid, some filters applied |
| `screens/stats.webp` | `shotStats` | Stats -> Analytics tab, tiles + hourly chart w/ data |
| `screens/background.webp` | `shotBackground` | Background / wallpaper picker grid |

---

## 4. Music beds → `AUDIO_BEDS` entries (`audio.ts`)

Wire by setting `.src` (`.ogg`) and `.fallbackSrc` (`.mp3`) on the matching entry:
```ts
import problemOgg from "@/assets/welcome/audio/problem.ogg";
import problemMp3 from "@/assets/welcome/audio/problem.mp3";
// { id: "problem", ..., src: problemOgg, fallbackSrc: problemMp3, gain: 0.5 }
```

| Files | `AUDIO_BEDS` id | Scroll range | Mood |
|---|---|---|---|
| `audio/problem.ogg` + `audio/problem.mp3` | `problem` | 0.00-0.28 | tense, claustrophobic pad; degrades toward night |
| `audio/turn.ogg` + `audio/turn.mp3` | `turn` | 0.28-0.34 | short bright resolve stinger |
| `audio/solution.ogg` + `audio/solution.mp3` | `solution` | 0.34-0.62 | warm acoustic / folk, unhurried |
| `audio/payoff.ogg` + `audio/payoff.mp3` | `payoff` | 0.62-0.74 | uplifting swell, joyful |
| `audio/features.ogg` + `audio/features.mp3` | `features` | 0.74-1.00 | light walking-tempo groove |

Current placeholders are 4s of silence — safe to load, they just play nothing.
CC-BY attribution (if any real track needs it) goes in `PROMPTS.md`.

---

## 5. Full current file tree

```
frontend/src/assets/welcome/
├── PROMPTS.md              production sheet (character + shots + audio)
├── MANIFEST.md             this file
├── character-ref.png       likeness lock (copy of man.png)
├── problem-composite.webp  [placeholder]
├── problem-sky.webp        [placeholder]
├── picnic-scene.webp       [placeholder]
├── stream-still.webp       [placeholder]
├── stream-loop.webm        [placeholder — 8s solid colour]
├── stream-loop.mp4         [placeholder — 8s solid colour]
├── cat-cow.webp            [placeholder]
├── pushups.webp            [placeholder]
├── cloud-a.png             [placeholder — 50% alpha white]
├── cloud-b.png             [placeholder — 50% alpha white]
├── walk-ground.webp        [placeholder]
├── walk-guy-coffee.png     [placeholder — 35% alpha grey]
├── walk-guy-plank.png      [placeholder — 35% alpha grey]
├── walk-guy-bench.png      [placeholder — 35% alpha grey]
├── van-beach.webp          [placeholder]
├── audio/
│   ├── problem.ogg / problem.mp3     [placeholder — 4s silence]
│   ├── turn.ogg / turn.mp3           [placeholder — 4s silence]
│   ├── solution.ogg / solution.mp3   [placeholder — 4s silence]
│   ├── payoff.ogg / payoff.mp3       [placeholder — 4s silence]
│   └── features.ogg / features.mp3   [placeholder — 4s silence]
└── screens/
    ├── timer-focus.webp     [placeholder — capture live]
    ├── timer-break.webp     [placeholder — capture live]
    ├── workout-library.webp [placeholder — capture live]
    ├── stats.webp           [placeholder — capture live]
    └── background.webp      [placeholder — capture live]
```
