/**
 * Asset manifest for the Welcome story.
 *
 * `src` is resolved automatically from whatever lives in
 * `frontend/src/assets/welcome/` (via `import.meta.glob`). Tiny placeholder
 * files sit at every path today; the real photoreal set is generated externally
 * from `frontend/src/assets/welcome/PROMPTS.md` and dropped in at the SAME
 * filenames — no code change needed, just replace the file.
 *
 * `fallback` is a CSS background shown by `<ParallaxImage>` only if a file is
 * genuinely missing (glob returned nothing for that name).
 */

const FILES = import.meta.glob(
  [
    "../../../assets/welcome/**/*.{webp,png,jpg,jpeg,avif,mp4,webm,ogg,mp3}",
    // character-ref.png is a prompt reference only — never rendered.
    "!../../../assets/welcome/character-ref.png",
  ],
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

/** Resolve a welcome-asset filename (optionally with a subdir) to its URL. */
export function assetUrl(name: string): string | undefined {
  const suffix = `/assets/welcome/${name}`;
  for (const [path, url] of Object.entries(FILES)) {
    if (path.endsWith(suffix)) return url;
  }
  return undefined;
}

export interface StoryAsset {
  src?: string;
  alt: string;
  fallback: string;
}

const scorch = "linear-gradient(160deg,#c9b45e,#8a7a2e 60%,#5c5220)";
const bliss = "linear-gradient(180deg,#4a8fd6,#8fd0a6 55%,#3ba85c)";
const beach = "linear-gradient(180deg,#5aa7e0,#bfe3ff 45%,#e8d6a8)";

export const STORY_ASSETS = {
  // ── Part 1 — the problem ────────────────────────────────────────────────
  // Background is the generated clip, scrubbed by scroll (see PartProblem).
  problemPoster: {
    src: assetUrl("problem-poster.webp"),
    alt: "A man sitting on a scorched hillside scrolling his phone",
    fallback: scorch,
  },

  // ── Part 2 — the solution (background is the transformation clip, scrubbed) ──
  solutionPoster: {
    src: assetUrl("solution-poster.webp"),
    alt: "The same man working happily at a picnic table in a Swiss meadow, a cow peeking over his shoulder",
    fallback: bliss,
  },

  // ── Part 3 — the features walk ──────────────────────────────────────────
  walkGround: { src: assetUrl("walk-ground.webp"), alt: "Continuous grassy path", fallback: "linear-gradient(180deg,#8fd0a6,#3ba85c)" },
  walkGuyCoffee: {
    src: assetUrl("walk-guy-coffee.png"),
    alt: "The man walking his dog on a leash, laptop under one arm, sipping coffee",
    fallback: "transparent",
  },
  walkGuyPlank: {
    src: assetUrl("walk-guy-plank.png"),
    alt: "The man doing a plank on the path while his dog waits patiently",
    fallback: "transparent",
  },
  walkGuyBench: {
    src: assetUrl("walk-guy-bench.png"),
    alt: "The man sitting on a bench reading his stats, dog resting at his feet",
    fallback: "transparent",
  },
  vanBeach: {
    src: assetUrl("van-beach.webp"),
    alt: "The man beside the iconic Volkswagen van at the beach with friends — work done, life intact",
    fallback: beach,
  },

  // ── In-app screenshots (captured live during the build) ─────────────────
  shotTimerFocus: { src: assetUrl("screens/timer-focus.webp"), alt: "Gymodoro focus timer running", fallback: "#12241c" },
  shotTimerBreak: { src: assetUrl("screens/timer-break.webp"), alt: "Gymodoro break timer with an exercise", fallback: "#12241c" },
  shotWorkoutLibrary: { src: assetUrl("screens/workout-library.webp"), alt: "Gymodoro Workout Library", fallback: "#12241c" },
  shotStats: { src: assetUrl("screens/stats.webp"), alt: "Gymodoro productivity and health stats", fallback: "#12241c" },
  shotBackground: { src: assetUrl("screens/background.webp"), alt: "Gymodoro background / wallpaper picker", fallback: "#12241c" },
} satisfies Record<string, StoryAsset>;

export type StoryAssetKey = keyof typeof STORY_ASSETS;

/**
 * Part 1's background clip (1152×648, ~15s, all-keyframe H.264 so `currentTime`
 * seeks are instant) — scrubbed by scroll in `PartProblem`, never `.play()`ed.
 * Plus the one-shot notification "ding" sliced from the clip audio, fired once
 * when the scroll passes the app-open beat (sound-toggle gated).
 */
export const PROBLEM_VIDEO_MP4 = assetUrl("problem-scrub.mp4");
export const PROBLEM_DING_OGG = assetUrl("problem-ding.ogg");
export const PROBLEM_DING_MP3 = assetUrl("problem-ding.mp3");

/** Part 2's background clip (transformation: Swiss work → workout), scrubbed. */
export const SOLUTION_VIDEO_MP4 = assetUrl("solution-scrub.mp4");
