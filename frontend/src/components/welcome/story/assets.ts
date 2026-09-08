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
  problemComposite: {
    src: assetUrl("problem-composite.webp"),
    alt: "A man at a cluttered desk on a scorched hillside, phone in hand, the top of his head open with his brain in a microwave cabled to a nearby tree",
    fallback: scorch,
  },
  problemSky: {
    src: assetUrl("problem-sky.webp"),
    alt: "Harsh blown-out midday sun over a parched hill",
    fallback: "radial-gradient(circle at 70% 20%,#fffdf0,#e7c94f 40%,#b7a24d)",
  },

  // ── Part 2 — the solution ───────────────────────────────────────────────
  picnicScene: {
    src: assetUrl("picnic-scene.webp"),
    alt: "The same man working happily at a picnic table in a Swiss-style meadow, a cow peeking over his shoulder at his laptop",
    fallback: bliss,
  },
  streamLoopWebm: { src: assetUrl("stream-loop.webm"), alt: "Crystal-clear stream flowing", fallback: bliss },
  streamLoopMp4: { src: assetUrl("stream-loop.mp4"), alt: "Crystal-clear stream flowing", fallback: bliss },
  streamStill: { src: assetUrl("stream-still.webp"), alt: "Crystal-clear stream beside the meadow", fallback: bliss },
  catCow: {
    src: assetUrl("cat-cow.webp"),
    alt: "The man doing a cat-cow yoga stretch on the grass while the cow grazes beside him",
    fallback: bliss,
  },
  pushups: {
    src: assetUrl("pushups.webp"),
    alt: "The man doing push-ups on the grass, cow grazing next to him, stream running past",
    fallback: bliss,
  },
  cloudA: { src: assetUrl("cloud-a.png"), alt: "", fallback: "radial-gradient(ellipse,#ffffff,rgba(255,255,255,0))" },
  cloudB: { src: assetUrl("cloud-b.png"), alt: "", fallback: "radial-gradient(ellipse,#ffffff,rgba(255,255,255,0))" },

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
