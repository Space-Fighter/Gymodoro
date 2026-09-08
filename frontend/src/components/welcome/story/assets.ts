/**
 * Filename manifest for the Welcome story's photoreal image set.
 *
 * The real assets are generated externally from
 * `frontend/src/assets/welcome/PROMPTS.md` (character sheet + per-shot prompts)
 * and dropped into `frontend/src/assets/welcome/`. Until a file exists, its
 * entry here stays `undefined` and `<ParallaxImage>` renders a labelled
 * gradient placeholder in its place — so layout/motion can be built now and the
 * real art swapped in with no code change.
 *
 * To wire a delivered asset: add e.g.
 *   import problemComposite from "@/assets/welcome/problem-composite.webp";
 * and set the field below to it.
 */

export interface StoryAsset {
  /** Resolved image URL, or undefined until the asset is delivered. */
  src?: string;
  /** Alt text / placeholder caption. */
  alt: string;
  /** Placeholder gradient (CSS) shown until `src` lands. */
  fallback: string;
}

const scorch = "linear-gradient(160deg,#c9b45e,#8a7a2e 60%,#5c5220)";
const bliss = "linear-gradient(180deg,#4a8fd6,#8fd0a6 55%,#3ba85c)";
const beach = "linear-gradient(180deg,#5aa7e0,#bfe3ff 45%,#e8d6a8)";

export const STORY_ASSETS = {
  // ── Part 1 — the problem ────────────────────────────────────────────────
  problemComposite: {
    src: undefined,
    alt: "A man sits on a scorched hillside, laptop in his lap, phone in hand, the top of his head open with his brain in a microwave cabled to a nearby tree",
    fallback: scorch,
  },
  problemSky: {
    src: undefined,
    alt: "Harsh blown-out midday sun over a parched hill",
    fallback: "radial-gradient(circle at 70% 20%,#fffdf0,#e7c94f 40%,#b7a24d)",
  },

  // ── Part 2 — the solution ───────────────────────────────────────────────
  picnicScene: {
    src: undefined,
    alt: "The same man working happily at a picnic table in a Swiss-style meadow, a cow peeking over his shoulder at his laptop",
    fallback: bliss,
  },
  streamLoopWebm: { src: undefined, alt: "Crystal-clear stream flowing", fallback: bliss },
  streamLoopMp4: { src: undefined, alt: "Crystal-clear stream flowing", fallback: bliss },
  streamStill: { src: undefined, alt: "Crystal-clear stream beside the meadow", fallback: bliss },
  catCow: {
    src: undefined,
    alt: "The man doing a cat-cow yoga stretch on the grass while the cow grazes beside him",
    fallback: bliss,
  },
  pushups: {
    src: undefined,
    alt: "The man doing push-ups on the grass, cow grazing next to him, stream running past",
    fallback: bliss,
  },
  cloudA: { src: undefined, alt: "", fallback: "radial-gradient(ellipse,#ffffff,rgba(255,255,255,0))" },
  cloudB: { src: undefined, alt: "", fallback: "radial-gradient(ellipse,#ffffff,rgba(255,255,255,0))" },

  // ── Part 3 — the features walk ──────────────────────────────────────────
  walkGround: { src: undefined, alt: "Continuous grassy path", fallback: "linear-gradient(180deg,#8fd0a6,#3ba85c)" },
  walkGuyCoffee: {
    src: undefined,
    alt: "The man walking his dog on a leash, laptop under one arm, sipping coffee",
    fallback: "transparent",
  },
  walkGuyPlank: {
    src: undefined,
    alt: "The man doing a plank on the path while his dog waits patiently",
    fallback: "transparent",
  },
  walkGuyBench: {
    src: undefined,
    alt: "The man sitting on a bench reading his stats, dog resting at his feet",
    fallback: "transparent",
  },
  vanBeach: {
    src: undefined,
    alt: "The man beside the iconic Volkswagen van at the beach, laptop closed, dog asleep — work done, life intact",
    fallback: beach,
  },

  // ── In-app screenshots (captured live during the build) ─────────────────
  shotTimerFocus: { src: undefined, alt: "Gymodoro focus timer running", fallback: "#12241c" },
  shotTimerBreak: { src: undefined, alt: "Gymodoro break timer with an exercise", fallback: "#12241c" },
  shotWorkoutLibrary: { src: undefined, alt: "Gymodoro Workout Library", fallback: "#12241c" },
  shotStats: { src: undefined, alt: "Gymodoro productivity and health stats", fallback: "#12241c" },
  shotBackground: { src: undefined, alt: "Gymodoro background / wallpaper picker", fallback: "#12241c" },
} satisfies Record<string, StoryAsset>;

export type StoryAssetKey = keyof typeof STORY_ASSETS;
