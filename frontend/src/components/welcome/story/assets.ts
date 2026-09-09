/**
 * Asset manifest for the Welcome story. `src` is resolved automatically from
 * whatever lives in `frontend/src/assets/welcome/` (via `import.meta.glob`) —
 * drop a real file at the named path and it's picked up, no code change.
 */

const FILES = import.meta.glob(
  [
    "../../../assets/welcome/**/*.{webp,png,jpg,jpeg,avif,mp4,webm,ogg,mp3}",
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

/** Poster stills — shown before/behind each Part's scrubbed clip. */
export const STORY_ASSETS = {
  problemPoster: {
    src: assetUrl("problem-poster.webp"),
    alt: "A man at a cluttered desk on a scorched hillside, scrolling his phone",
    fallback: scorch,
  },
  solutionPoster: {
    src: assetUrl("solution-poster.webp"),
    alt: "The same man working at a picnic table in a Swiss meadow, a cow peeking over his shoulder",
    fallback: bliss,
  },
  featuresPoster: {
    src: assetUrl("features-poster.webp"),
    alt: "The same man walking his dog, laptop under one arm, using the app",
    fallback: bliss,
  },
  ctaBg: {
    src: assetUrl("cta-bg.webp"),
    alt: "",
    fallback: beach,
  },
} satisfies Record<string, StoryAsset>;

export type StoryAssetKey = keyof typeof STORY_ASSETS;

/**
 * Per-part background clips — encoded with a short keyframe interval and
 * scrubbed by scroll (paused <video>, only `currentTime` is set). Undefined
 * until the file is dropped in; the component falls back to the poster still.
 */
export const PROBLEM_VIDEO_MP4 = assetUrl("problem-scrub.mp4");
export const SOLUTION_VIDEO_MP4 = assetUrl("solution-scrub.mp4");
export const FEATURES_VIDEO_MP4 = assetUrl("features-scrub.mp4");

/** One-shot notification "ding" (sliced from the Part 1 clip audio). */
export const PROBLEM_DING_OGG = assetUrl("problem-ding.ogg");
export const PROBLEM_DING_MP3 = assetUrl("problem-ding.mp3");
