# Revamp the Welcome page as a 3-part photoreal scroll story

## Context

`/welcome` (`frontend/src/pages/Welcome.tsx`) is a conventional stack of 10 static
sections over one fixed Unsplash photo. It reads like a template.

The `glass-scroll-3d` skill vendored: liquid-glass panels (`useLiquidGlass` +
`.glass` CSS in `index.css`), an R3F canvas wrapper (`components/three/Scene3D.tsx`),
and a scroll-motion vocabulary (pin / reveal / pan / parallax / scrub). `three`,
`@react-three/fiber` ^9, `@react-three/drei` ^10 are installed and idle.

Goal: replace the whole page with one cinematic, scroll-choreographed narrative in
**three explicit parts**, carrying a peaceful, enriching, "you could have this life"
feeling that makes the visitor want to sign up:

1. **The Problem** — Windows-XP-"Bliss" hill turned surreal and grim, told as a
   mini-story in this exact order:
   a) He works like hell at a **simple desk on the hillside, cluttered like hell**
      (papers, mugs, sticky notes, cables) beside the tree — **shirt untucked, tie
      loose** — and **gets chewed out by his boss**.
   b) He opens his phone; the **Instagram / Facebook / YouTube apps load** (splash
      screens).
   c) He **flips the top of his head open like a lid** (funny, casual) and **sets his
      brain in the microwave cabled to the tree.**
   d) He **keeps scrolling** — the sky moves **day → dusk → night**, one normal
      day slipping away while he doesn't move.
   e) Camera **zooms into his eye / iris** (screen glow in it). Lines land one at a
      time inside the dark iris: **"Ahh I did it again."** → **"I feel like a piece
      of crap now."** → **"I guess I'll work tomorrow."**
   f) **ASSESSMENT OF THE DAY** — PRODUCTIVITY / ENJOYMENT / SATISFACTION /
      ACTIVENESS all tick to **LOW**.
   Dread, absurdity, recognition.
2. **The Solution** — same guy, life fixed, in three rising beats:
   a) **Swiss work** — working happily at a **picnic table in a Switzerland-like
      meadow**, a **cow peeking over his shoulder** at his laptop, a **crystal-clear
      stream flowing** beside him.
   b) **Swiss workout** — on the grass doing **cat-cow pose, then push-ups**, the
      cow grazing next to him, water running.
   c) **The payoff** — cut to him **ripped, Greek-statue aesthetic**, at the beach by
      the **VW van near the rainforest**, **a few of his best friends having the time
      of their lives** — he's healthy, wealthy, productive, and *living*. This is the
      emotional peak of the whole page.
3. **The Features** — below the story: the same guy **walking his dog on a leash,
   laptop under one arm**, in **one continuous left→right stroll** across **real
   in-app screenshots** — sipping coffee while the focus timer runs, dropping into
   **planks** when the break timer starts, picking a move in the **Workout Library**,
   reading his **productivity + health stats** on a bench, happily swapping his
   **wallpaper**. Screenshots are the real app, not stock.

**Locked with the user:**
- Full replace of the Welcome page.
- Add `framer-motion` for scroll choreography.
- **No playable mini-timer** — the product is conveyed through the illustrated story
  + the real-screenshot feature walkthrough only.
- **Photoreal imagery**, not vector/flat. A single consistent character based on the
  user-supplied face `frontend/src/assets/man.png` (young athletic man, dark wavy
  hair, blue-grey eyes — likeness only, lighting matches each scene) who
  **transforms across the story**: stressed office-worker
  (untucked shirt, loose tie) in Part 1 → calm and healthy in Part 2 Swiss scenes →
  **ripped, Greek-statue aesthetic** at the beach payoff. Recurring settings: the
  scorched XP hill + tree (Part 1), the Swiss meadow/picnic/stream (Part 2), and the
  **VW van + rainforest + beach with friends** (Part 2 payoff).
- Real in-app screenshots for Part 3 — **captured live** by me during
  implementation.

## Art / asset pipeline (photoreal, consistent character)

Photoreal, character-consistent images can't be produced from code. Split into a
prompt-authoring step (mine) + a generation step (external) + an integration step
(mine):

**Character reference:** the user supplied a face — `frontend/src/assets/man.png`
(255×282, PNG): a young man, ~mid-20s, athletic, tousled dark wavy hair,
blue-grey eyes, light stubble. Use it for **likeness only** — the lighting on him
in every shot must match that scene's light (harsh flat midday in P1, warm golden
hour in P2, bright beach sun at the payoff), not the reference photo's light.
`agent-assets` moves it to
`frontend/src/assets/welcome/character-ref.png` and every image prompt in
`PROMPTS.md` references it (Midjourney `--cref` / IP-adapter) so the same person
appears in all shots — stressed office worker in Part 1, calm in Part 2, then
visibly ripped/Greek-statue at the beach payoff.

1. **`frontend/src/assets/welcome/PROMPTS.md`** — I author a detailed shot list +
   prompt sheet: one **character sheet** locking the `man.png` likeness (face,
   hair, eyes, build) plus wardrobe per act, used as a character reference in every
   later prompt. Then one prompt per shot:
   - P1: grind at a cluttered-like-hell simple desk by the tree (untucked shirt /
     loose tie) + boss scolding;
     phone splash screens (Instagram / Facebook / YouTube); unscrew-head + brain-in-
     microwave-cabled-to-tree composite; parched sky plate.
   - P2: picnic-table work + cow peeking; cat-cow stretch; push-ups w/ grazing cow;
     stream loop clip; drifting-cloud alpha PNGs.
   - P2 payoff: ripped / Greek-aesthetic guy + friends + VW van + rainforest + beach.
   - P3: walking-guy-with-dog cut-outs (coffee / plank / bench poses), transparent
     background for compositing over screenshots; continuous ground strip.
   Each specifies framing, light (harsh midday for P1, golden hour for P2–3), aspect
   ratio, and transparent background where it composites over a screenshot.
2. **Generation (external, user runs)** — user generates the set with a
   character-reference-capable tool (e.g. Midjourney `--cref`, or any img model
   with an IP-adapter), exports PNG/WebP, drops them in
   `frontend/src/assets/welcome/`. Filenames fixed by `PROMPTS.md` so integration
   doesn't wait on delivery.
3. **Integration (mine)** — I scaffold every scene against **placeholder images**
   (solid-color WebPs at the right dimensions) committed now, wired by the final
   filenames, then the real assets drop in with no code change. Motion: `framer-
   motion` parallax (layered `translateY`/`scale` Ken-Burns, never `top`/`width`),
   `clip-path` reveals, pinned sections.

Optional 3D accent: a single R3F moment at the Part 2→3 seam or the peak (drifting
volumetric clouds / god-rays via drei) — only if it doesn't fight the photoreal
look. Default is **no R3F on this page**; photoreal image parallax + liquid-glass
panels carry it. `Scene3D.tsx` stays available but unused unless the accent lands.

## Art direction

- The page **commits to one bright daytime look** regardless of the app's dark
  ThemeProvider (the skill permits a deliberate single-look design). Don't touch
  `ThemeProvider` or global tokens — scope new color to a `.welcome-daylight`
  wrapper class on the story root.
- Palette: XP-Bliss sky blue (`#4a8fd6`→`#bfe3ff`), saturated grass green reusing
  brand emerald (`--primary #22c55e`, `--brand-g #4be277`), warm sun gold,
  off-white text with soft shadow over imagery. No gradient text, no neon, no
  zero-offset glow (skill rules).
- Part 1 is the single **hot / wrong** deviation — oversaturated sun, sickly
  yellow-green grass, wrong shadows — so the wipe into lush Part-2 green lands.
- Parts 2–3 are calm, airy, generous whitespace, unhurried motion.
- Fonts already loaded: `--font-heading` (Manrope) headings, `--font-poppins`
  numerals, `--font-sans` (DM Sans) body.

### Living motion (required for the photoreal feel)

The scenes must breathe even when the visitor stops scrolling — this is what sells
photorealism:
- **Stream** — real flowing water, not a still. Asset: a 6–10s **seamless loop
  clip** (`.webm` + `.mp4` fallback) of the crystal stream, played as
  `<video autoplay muted loop playsinline>` layered into the picnic scene. Fallback
  if a clip can't be sourced: the still water plate under an animated `fe
  DisplacementMap`/`feTurbulence` SVG filter with an animated `baseFrequency`/seed
  to fake flow.
- **Clouds** — fat cumulus that **drift continuously**, independent of scroll:
  2–3 alpha cloud PNG layers as `motion.div`s with `animate={{ x: [...] }}`,
  `repeat: Infinity`, long slow durations (60–120s), different speeds per layer for
  depth. (Also get a gentle scroll-linked parallax `y` on top.)
- **Grass / trees** — a subtle continuous sway: a small-amplitude `rotate`/`skewX`
  loop on the foreground grass layer, or a looping clip for the hero plate.
- All looping motion pauses under `prefers-reduced-motion: reduce` (video gets no
  `autoplay`, poster shown; cloud/grass loops disabled).
- Keep clips short, compressed, and lazy (`preload="none"` until the section nears
  the viewport) to protect load time.

Asset pipeline additions: `PROMPTS.md` also specifies the loop clips (stream, and
optionally a sky/cloud plate) and the alpha cloud PNGs alongside the still shots.

## Scene music & sound

Each of the three parts gets its own music bed, crossfading on scroll position, so
the score tracks the emotion: Part 1 = tense/claustrophobic pad that degrades as it
goes to night; the Turn = a bright resolve stinger; Part 2 = warm acoustic/folk;
the beach payoff = an uplifting swell; Part 3 = light, walking-tempo groove.

- **Existing audio in the app:** `frontend/src/lib/chime.ts` synthesizes the
  end-of-timer alarm via the Web Audio API (shared `AudioContext`, no asset files).
  There is **no music system** and no bundled audio assets. Reuse its
  shared-`AudioContext` pattern, not its synthesis.
- **Tracks:** short, seamless-looping royalty-free instrumentals (~30–60s loops,
  compressed `.ogg` + `.mp3` fallback, ~1–2 min combined budget) under
  `frontend/src/assets/welcome/audio/`. Sources: user-provided, or CC0/CC-BY from
  Pixabay Music / FreePD / incompetech (attribution noted in `PROMPTS.md` if CC-BY).
  `agent-audio` sources and trims these.
- **Director:** a `useSceneAudio` hook / `SceneAudioProvider` — creates
  `HTMLAudioElement`s routed through Web Audio `GainNode`s, and on
  `scrollYProgress` change crossfades gains between the current part's bed and the
  next. One `requestAnimationFrame`-throttled listener, not per-scene.
- **Autoplay policy:** browsers block audio until a user gesture. Page loads
  **muted**; a small **sound toggle** (speaker icon) sits in the `Navbar`; first
  click resumes the `AudioContext` and fades music in. Preference persisted to
  `localStorage` (`gymodoro-welcome-sound`). No audio ever plays unprompted.
- Honor `prefers-reduced-motion` for visuals only; audio is gated purely by the
  explicit toggle.

## UPDATE — Part 1 is driven by the generated clip, SCRUBBED to scroll

The user generated a Veo/Flow clip (`Man_scrolling_phone_on_hill…mp4`, 10s 1080p
24fps, with real audio incl. a **notification "ding" when he opens each app** —
matches the story). The still `problem-composite.webp` "did not look nice" and is
dropped. Part 1's background becomes this footage — **but the page stays fully
scroll-choreographed, not a video you scroll past**:

- **Scroll = the clip's transport.** `video.currentTime = scrollYProgress ×
  duration`, set from a `useMotionValueEvent` / rAF-throttled listener; the
  `<video>` is **paused** the whole time (never `.play()`), we only seek it. As you
  scroll down he picks up the phone, thumbs it, opens apps — as you scroll back up
  it reverses. Every existing overlay stays scroll-driven **on top**: deck cards,
  roast-meter ring, iris zoom, day→night grade, the clip-path Turn wipe.
- **Encode for instant seeking.** Re-encode the (already produced) **1.5×-slowed
  15s** clip **all-keyframe** (`-g 1 -bf 0`, H.264 all-I `yuv420p` +faststart, and
  VP9 all-I webm), downscaled to **1280×720** to keep each ~5–9 MB. `preload="auto"
  muted playsInline`. If size/stutter is unacceptable on the target devices, fall
  back to an **ambient muted loop** (same as Part 2's stream) — scroll still drives
  every overlay either way.
- **Audio can't follow a scrub.** Slice the notification **ding** out of the clip
  audio as a one-shot SFX (`problem-ding.*`); fire it once at each scroll threshold
  where Instagram / Facebook / YouTube appear (dedupe so scroll-up / re-entry
  doesn't machine-gun it). Keep the full **slowed+pitch-preserved** clip audio
  (`audio/problem.*`, already produced via `atempo=0.66667` — no pitch drop) as the
  Part-1 ambient bed at **low gain**, looped by `SceneAudioProvider`. All of it
  gated by the existing top-right **`SoundToggle`** (user's choice) — nothing plays
  unprompted.
- **Day→night** stays: the CSS `sky` gradient becomes a `mix-blend-multiply` /
  low-opacity **grade overlay on top of the video** (clip is all-daylight).
- **Reduced motion:** don't scrub — hold a single extracted poster frame
  (`problem-poster.webp`), keep dings gated by the toggle only.

### Files / wiring for this change
- **Produced already (pre-plan):** `assets/welcome/problem-loop.mp4` (2.35 MB,
  slowed, silent), `problem-loop.webm` (2.48 MB), `audio/problem.ogg` (211 KB) +
  `.mp3` (240 KB, slowed clip audio incl. dings). TODO in build: re-encode the
  video all-keyframe @720p as `problem-scrub.mp4/.webm`; extract `problem-ding.*`
  from the audio; extract `problem-poster.webp`.
- `story/assets.ts`: add `problemVideoMp4` / `problemVideoWebm` / `problemPoster`
  via `assetUrl(...)`; **delete** `problemComposite` + `problemSky` entries and
  their placeholder files. Add a `problemDing` SFX url.
- `story/PartProblem.tsx`: replace the `<ParallaxImage asset={problemComposite}>`
  inside the iris-zoom wrapper with the `<video>` (seek-on-scroll), keep the
  wrapper `scale`/`transformOrigin` iris zoom, add the grade overlay, wire the
  ding one-shots off `scrollYProgress` thresholds + `useSceneAudio().enabled`.
- `story/SceneAudioProvider.tsx`: lower the `problem` bed gain; add a tiny
  one-shot SFX play path (or fire the ding as a bare `new Audio()` — it's outside
  the crossfade mix).
- Move the raw `frontend/src/assets/videos/` original OUT of `src/` (it would be
  bundled) — gitignore `src/assets/videos/` or relocate to a scratch dir.

### Verify
Scroll Part 1 slowly then fast: his motion tracks the scrollbar 1:1, overlays land
on their beats, no seek stutter; scroll back up → reverses cleanly, ding does not
re-fire; enable sound → ding punches at each app-open point + faint ambient bed;
`prefers-reduced-motion` → static poster, no scrub; `npm run build` + `npm run
lint` clean; note the JS/asset bundle-size delta.

## Branch & work already done

Branch `new-welcome-page` is already created; `framer-motion` is installed
(`frontend/package.json`). Partial Phase-A scaffolding is on disk, uncommitted, and
matches this plan: `index.css` `.welcome-daylight` tokens + `cloud-drift` /
`grass-sway` / `water-shimmer` keyframes; `story/motion.tsx` (`StoryScrollProvider`,
`useStoryScroll`, `useCalm`, `GlassPanel`); `story/assets.ts` (filename manifest);
`story/ParallaxImage.tsx`. Execution resumes by finishing Phase A (the shell + stub
parts), then Phase B. Reset these files freely if the approach shifts.

## Narrative / feeling curve

| Beat | Part | Device | On screen | Feeling |
|---|---|---|---|---|
| 1. Grind & scolding | 1 | `pin` + **video scrub** | Scorched XP hill — **the generated clip, `currentTime` scrubbed by scroll**: he sits on the hill with the phone. A **boss speech-bubble telling-off** slides in on scroll. Deck card: **Work a ton** (State of body: Sedentary). | pressure |
| 2. Phone opens | 1 | **video scrub** (continues the pin) | Scrubbing the clip forward, he **thumbs the phone and opens the apps**; a **ding** SFX fires at each app-open scroll point (sound-toggle gated). Deck card: **Tired takes a break**. | numb |
| 3. Head-lid → microwave | 1 | `pin` peak of Part 1 | He **flips his head open like a lid** and **sets his brain into the microwave cabled to the tree**; a **roast-meter ring** starts filling. Deck card: **Your brain is hacked** (Productivity: Dipped). | absurd dread |
| 4. Keep scrolling, day→dusk→night | 1 | `scrub` | He scrolls on; the sky moves once through **day → dusk → night** (one day gone), roast-meter climbing. Deck: **The Doom Scroll Aftermath**. | time lost |
| 5. Zoom to iris | 1 | `scrub` → `pin` | Camera **pushes into his eye / iris** (screen glow in it). Lines appear one-by-one inside the dark iris: **"Ahh I did it again."** → **"I feel like a piece of crap now."** → **"I guess I'll work tomorrow."** | sinking |
| 6. Assessment | 1 | `pin` | Deck's **ASSESSMENT OF THE DAY** — PRODUCTIVITY / ENJOYMENT / SATISFACTION / ACTIVENESS animate to **LOW**. Line: *"Your breaks are cooking you."* | the low point |
| 7. The Turn | 1→2 | `reveal` (clip-path wipe) | Clouds sweep, sun calms, scorched ground wipes to lush Swiss green. *"Let's fix the break."* | relief |
| 8. Swiss work | 2 | `pin` + parallax | Guy at the **picnic table**, **cow peeking over his shoulder**, **stream flowing** beside him (looping video). Deck solution copy: keep the Pomodoro framework, turn every break into movement. | pleasant, hopeful |
| 9. Swiss workout | 2 | `parallax` | Same meadow: **cat-cow pose, then push-ups**, cow grazing, water running. Deck's **IMPACT OF GYMODORO** stats roll up via `useInView` counters. | alive, healthy |
| 10. The payoff (emotional peak) | 2 | `pin` | Wide hero: guy **ripped, Greek-statue aesthetic**, at the beach by the **VW van near the rainforest**, **best friends having the time of their lives**. One large `.glass` line: *"This is what recovered looks like."* **Most vertical space on the page.** | aspiration, joy |
| 11. A day with it | 3 | `pan` (L→R travel) | **One continuous unbroken walk**, not a feature grid. Guy strolls his **dog on a leash, laptop under one arm**, left→right; the real app screens are stations he passes *through*: focus timer running → **sips coffee** walking → timer flips to break → **drops into planks** while the dog waits → thumbs the **Workout Library** → reads **Stats** on a bench (focus + health trending up) → grins, swaps his **wallpaper** → walks on. Continuous parallax ground; one `.glass` caption travels with him, text per station. | "I want this day" |
| 12. Resolve & hold | 3 | static hold, no fade | `.glass` sign-in card over a calm frame: *"Start your first cycle."* — **GYMODORO — Work. Move. Repeat.** Google + email, real auth. Ends resolved. | ready |

Hard rules: no "scroll to explore" cue; alternate devices, avoid the same one
twice adjacent where the content allows; animate only
`transform`/`opacity`/`clip-path`; **beat 10 (the beach payoff) is the single
engineered peak and gets the most space**; ends resolved on the CTA, not a fade.

### Seams between the three parts (must feel continuous, never a hard cut)

- **Problem → Solution** (beat 7, the Turn): a single continuous `clip-path` wipe —
  the scorched plate is *revealed away* to the lush Swiss plate underneath as one
  gesture tied to scroll, with the music crossfading across the same range. No blank
  frame between; the guy's silhouette can hold position across the wipe so it reads
  as the *same place* healing.
- **Solution → Features** (beat 10 → 11): the beach-payoff camera **pulls back and
  the horizon line carries straight into the Part-3 ground strip** — the beach sand
  becomes the path he starts walking on, dog already at his side. Continuous ground
  layer, continuous sky gradient; only the motion device changes (pin → pan).
- Both seams share one scroll-progress driver (from `StoryScrollProvider`), so
  there is no scroll-snap, no layout jump, and the parallax layers of the outgoing
  scene ease out over the same range the incoming scene eases in.
- `SceneAudioProvider` crossfades beds over the exact same scroll ranges as these
  visual seams.

## Implementation

### 1. Deps + scaffolding
- `cd frontend && npm install framer-motion` (React 19 compatible). Add to
  `package.json`.
- `frontend/src/components/welcome/story/` — new scene components.
- `frontend/src/assets/welcome/` — `PROMPTS.md`, placeholder images, later the real
  photoreal set, and the captured app screenshots.

### 2. Rewrite `frontend/src/pages/Welcome.tsx`
- Keep the guard exactly: `useAuth()` → `isLoading` spinner → `isAuthenticated`
  `<Navigate to="/" replace/>`.
- Replace `<main>` with `<StoryWelcome/>` inside a `.welcome-daylight` scope.
- Slim sticky brand mark + minimal `Navbar` (reuse `Navbar.tsx`; repoint/trim
  anchors to `#problem`, `#solution`, `#features`).
- Keep `Footer.tsx`, restyled to daylight tokens.

### 3. New components — `frontend/src/components/welcome/story/`
- `StoryWelcome.tsx` — orchestrator; `framer-motion` `useScroll` on the container;
  renders the three part-sections in order **with overlapping scroll ranges** (each
  part's exit range overlaps the next part's entry range) so the seams are
  continuous — see "Seams between the three parts".
- `PartProblem.tsx` — beats 1–7. One tall pinned scroll container stepping through:
  grind + boss scolding → phone apps loading → flip-head-open + brain-in-microwave
  (roast-meter ring via `useTransform` on scroll) → keep-scrolling as the sky goes
  day→dusk→night → zoom-to-iris with the 3 aftermath lines → assessment panel with animated LOW
  readouts → `clip-path` Turn wipe. Deck cards crossfade per sub-beat.
- `PartSolution.tsx` — beats 8–10. Swiss picnic/cow/stream parallax scene (looping
  `<video>` stream) + deck solution copy in `.glass` cards → cat-cow + push-up beat
  with impact-stat counters (`useInView` + `useMotionValue` + `animate`) → the
  **beach payoff**: ripped guy + friends + VW van + rainforest, pinned, the page's
  biggest section, one large `.glass` line.
- `PartFeatures.tsx` — beats 11–12, told as **one continuous story-walk**, not a
  feature list. A sticky viewport; an inner track translated on `scrollYProgress`;
  the walking-guy-with-dog layer drifts across at its own rate over a continuous
  ground layer, so it reads as a single unbroken stroll. The real screenshots are
  "stations" fixed along the track that he passes through; a single `.glass`
  caption travels with him and its text swaps per station (coffee while focusing →
  planks on break → Workout Library pick → Stats on a bench → wallpaper swap).
  Resolves into `ActCTA`.
- `ActCTA.tsx` — beat 12. `.glass` sign-in card; see §5.
- `ParallaxImage.tsx` — small helper: an `<img>` (or `<picture>` webp) wrapped in a
  `motion.div` whose `y`/`scale` bind to a passed `MotionValue`. Reused by every
  scene. Guards `prefers-reduced-motion` (renders static).

### 4. Screenshot capture (mine, during build)
- Run `cd backend && npm run dev` (+ `npm run db:seed`) and `cd frontend && npm run
  dev`; sign in with a seeded/test account.
- Capture at a fixed clean size (e.g. 1440×900, 2x): **Timer focus running**,
  **Timer break running**, **Workout Library grid**, **Stats / Analytics**,
  **Background picker**. Save as WebP under `frontend/src/assets/welcome/screens/`.
- Use the `run` skill's browser flow for consistent captures.

### 5. `ActCTA.tsx` — real auth handoff
- `.glass` card. Both paths already exist:
  - **Google**: mirror `SignIn.tsx` — `useGoogleSignIn()` +
    `AuthContext.googleLogin(idToken, "signup")`. Success → the `Welcome.tsx` guard
    re-renders → `<Navigate to="/"/>` fires.
  - **Email**: `<Link to="/signup">` primary + `<Link to="/signin">` secondary.
- Copy from `FinalCTA.tsx` → "Start your first cycle".

### 6. `index.css`
- `.glass` / `.glass-tight` / `.lg-fallback` already exist — reuse for panels.
- Add `.welcome-daylight { … }` block: bright sky/grass/sun CSS vars overriding the
  app's dark tokens only inside the Welcome subtree.
- Add `@keyframes` only where a wipe / slow cloud drift can't be inline in
  `framer-motion`. Never `transition: all`.
- `@media (prefers-reduced-motion: reduce)`: parallax settles to end state, panning
  becomes a plain vertical stack, images static.
- Remove `activity-marquee` / `activity-scroll` (grep first — only
  `ActiveBreakCarousel` used them).

### 7. Cleanup
- Migrate needed copy, then delete: `Hero.tsx`, `TheProblem.tsx`,
  `ActiveBreakCarousel.tsx`, `TheLoop.tsx`, `ThreePillars.tsx`, `Impact.tsx`,
  `VideoDemo.tsx`, `Audience.tsx`, `FinalCTA.tsx`, plus dead `Header.tsx`,
  `Narrative.tsx`. Keep `Navbar.tsx`, `Footer.tsx`; `backgrounds.ts` only if still
  referenced elsewhere (grep).

## Critical files

| File | Change |
|---|---|
| `frontend/package.json` | add `framer-motion` |
| `frontend/src/pages/Welcome.tsx` | rewrite body → `<StoryWelcome/>`, keep guard, daylight scope |
| `frontend/src/components/welcome/story/*` | new: orchestrator + `PartProblem` + `PartSolution` + `PartFeatures` + `ActCTA` + `ParallaxImage` |
| `frontend/src/assets/welcome/PROMPTS.md` | new: character sheet + per-shot prompts |
| `frontend/src/assets/welcome/**` | placeholder images now; real photoreal set + screenshots later |
| `frontend/src/components/welcome/Navbar.tsx` / `Footer.tsx` | trim links, daylight restyle |
| `frontend/src/hooks/useLiquidGlass.ts` + `index.css` `.glass` | reuse for panels |
| `frontend/src/index.css` | `.welcome-daylight` tokens, keyframes, reduced-motion; drop dead marquee CSS |
| delete | `Hero/TheProblem/ActiveBreakCarousel/TheLoop/ThreePillars/Impact/VideoDemo/Audience/FinalCTA/Header/Narrative.tsx` |

## Reused existing code (don't reinvent)

- `useLiquidGlass<T>()` + `.glass` CSS — every caption / CTA panel.
- `framer-motion` `useScroll`/`useTransform`/`useInView`/`useMotionValue` — all
  choreography.
- `useGoogleSignIn()` + `AuthContext.googleLogin` — Act CTA auth (mirror `SignIn.tsx`).
- `Navbar.tsx` scroll-state pill logic — keep.
- Deck copy (`GYMODORO.pdf`) — problem cards, solution framing, impact statements,
  feature names.
- `run` skill — live screenshot capture.
- `Scene3D.tsx` + drei — only if the optional cloud/god-ray accent is used.

## Execution: agent team

Run as a small team with one integrator (the main session) and parallel builders.
Shared primitives and assets must land before the scene builders start.

**Phase A — foundation (main session, solo, sequential):** _(branch + install +
`motion.tsx` + `assets.ts` + `ParallaxImage.tsx` + `index.css` tokens already done)_
- Finish: `StoryWelcome.tsx` shell (outer `useScroll` container + `StoryScrollProvider`
  + `SceneAudioProvider` mount point), `story/audio.ts` manifest, 3 stub
  part-sections, `ActCTA` stub, and rewrite `Welcome.tsx` to render `<StoryWelcome/>`
  inside `.welcome-daylight` (keep the auth guard). Commit. Everything downstream
  imports the Phase-A primitives read-only.

**Phase B — parallel subagents.** All spawned with `subagent_type: "general-purpose"`
and `isolation: "worktree"` (parallel edits can't collide); each owns a disjoint
file set and imports the Phase-A primitives read-only. Spawned only after Phase A is
committed and only on user approval of this plan.

| Agent | `subagent_type` | Owns (only these files) | Scope |
|---|---|---|---|
| `agent-assets` | general-purpose | `frontend/src/assets/welcome/**` (incl. `PROMPTS.md`, `screens/`, `audio/`) | Author `PROMPTS.md` (character sheet + per-shot image prompts + loop-clip + audio specs). Generate placeholder WebPs at the final filenames in `story/assets.ts`. **Capture live in-app screenshots** via the `run` skill (Timer focus, Timer break, Workout Library, Stats, Background picker). Runs first / longest; publishes nothing other agents block on except the already-fixed `assets.ts` manifest. |
| `agent-problem` | general-purpose | `story/PartProblem.tsx` | Beats 1–7: grind + boss scolding → phone apps loading → flip-head-open + brain-in-microwave + roast-meter ring → keep-scrolling as sky goes day→dusk→night → zoom-to-iris + 3 aftermath lines → assessment LOW readouts → `clip-path` Turn wipe. |
| `agent-solution` | general-purpose | `story/PartSolution.tsx` | Beats 8–10: Swiss picnic/cow/stream **living motion** (looping `<video>` stream, drifting clouds, SVG-turbulence water fallback, grass sway), cat-cow + push-ups + impact counters, and the **beach payoff peak** (ripped guy + friends + VW van + rainforest) — the page's biggest section. |
| `agent-features` | general-purpose | `story/PartFeatures.tsx`, `story/ActCTA.tsx` | Beats 11–12: one continuous horizontal story-walk, screenshot "stations", traveling `.glass` caption, then the `.glass` CTA card wired to real Google (`useGoogleSignIn` + `AuthContext.googleLogin`) / email (`<Link>` to `/signup`,`/signin`). |
| `agent-audio` | general-purpose | `story/SceneAudioProvider.tsx`, `story/useSceneAudio.ts`, sound-toggle in `Navbar.tsx` | Source/trim royalty-free loop tracks into `assets/welcome/audio/` (coordinate filenames with `agent-assets`), build the scroll-crossfade director + the muted-by-default toggle + `localStorage` pref. |

Coordination: filenames are pre-frozen in `story/assets.ts` and an `audio.ts`
manifest committed in Phase A, so no agent blocks on another. `Navbar.tsx` is
touched only by `agent-audio` (sound toggle); `agent-features` must not edit it.

**Phase C — integration (main session, solo):**
- Merge branches/worktrees, wire the three parts into `StoryWelcome`, delete the 11
  legacy components, remove dead marquee CSS, reconcile `Navbar`/`Footer` restyle.
- Full-page scroll pass, `npm run build` + `npm run lint`, run the verification
  checklist. Swap real photoreal assets when the user delivers them (no code change).

5 Phase-B agents, `isolation: "worktree"`, up to 4 concurrent (audio can follow).
Spawn only after Phase A is committed.

## Verification

1. `cd frontend && npm install`; run backend (`npm run db:seed` first) + frontend.
2. Logged out, visit `/` → redirected to `/welcome`.
3. Scroll top→bottom: Part 1 runs its 5 grim sub-beats (grind → scolding → phone
   splash screens → brain in microwave → LOW assessment) and feels wrong/hot; the
   Turn wipe flips convincingly to lush green; Part 2 rises to the beach-payoff peak
   (the biggest section); Part 3's horizontal walk `pan` scrubs smoothly and reverses
   cleanly; no horizontal page scroll anywhere.
4. Part 3 shows the **real** app screenshots (Timer/Workout/Stats/Background), not
   placeholders, with the walking-guy layer drifting across them.
5. CTA: "Continue with Google" completes `googleLogin` → auto-redirect to `/`; email
   buttons route to `/signup` and `/signin`.
6. Swap in the real photoreal assets → no code change needed (filenames pre-wired);
   placeholders fully replaced.
7. `npm run build` (`tsc -b`) passes — watch `verbatimModuleSyntax` (`import type`)
   and dangling imports after deletions. `npm run lint` clean.
8. Audio: page loads silent; clicking the `Navbar` sound toggle fades music in;
   scrolling between parts crossfades the beds (tense → resolve → warm → uplift →
   groove); no console autoplay warning; refresh remembers the toggle state.
9. `prefers-reduced-motion: reduce` → parallax/pan degrade to a static vertical
   stack, page still legible and complete (audio unaffected — gated by the toggle).
10. 375px width → scenes reflow, screenshots scale, text readable; Firefox/Safari →
    glass falls back to frosted blur (expected).

## Open items for the user

- The photoreal image/video set is generated externally from `PROMPTS.md`
  (character reference + per-shot prompts `agent-assets` will write) and dropped
  into `frontend/src/assets/welcome/`. The build ships with placeholders until then.
- Music: `agent-audio` will source CC0/CC-BY loops, but you may prefer to supply
  your own five short instrumental beds (Part 1 / Turn / Part 2 / beach payoff /
  Part 3) — drop them in `frontend/src/assets/welcome/audio/` at the manifest names.
