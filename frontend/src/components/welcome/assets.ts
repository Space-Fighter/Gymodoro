/**
 * Asset manifest for the Welcome story. `src` is resolved automatically from
 * whatever lives in `frontend/src/assets/welcome/` (via `import.meta.glob`) —
 * drop a real file at the named path and it's picked up, no code change.
 */

const FILES = import.meta.glob(
  [
    "../../assets/welcome/**/*.{webp,png,jpg,jpeg,avif,mp4,webm}",
    "!../../assets/welcome/character-ref.png",
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
const steel = "linear-gradient(160deg,#2a3142,#181c26 60%,#0d0f16)";

/** Poster stills — used as card imagery in the welcome cards sections. */
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
  problemWorkATon: {
    src: assetUrl("problem-work-a-ton.jpg"),
    alt: "A stressed man rubbing his head while staring at a monitor full of charts",
    fallback: scorch,
  },
  problemTiredBreak: {
    src: assetUrl("problem-tired-break.jpg"),
    alt: "Hands scrolling a grid of photos on a phone",
    fallback: scorch,
  },
  problemBrainHacked: {
    src: assetUrl("problem-brain-hacked.jpg"),
    alt: "A young man lying in bed at night, smiling at his phone",
    fallback: scorch,
  },
  problemDoomscroll: {
    src: assetUrl("problem-doomscroll-meme.jpg"),
    alt: "Comic of a stick figure at a desk captioned 'Me trying to work but my dopamine receptors are fried beyond repair'",
    fallback: scorch,
  },
  shotTimerFocus: {
    src: assetUrl("screens/timer-focus.webp"),
    alt: "Gymodoro timer screen, focus mode counting down",
    fallback: steel,
  },
  shotTimerBreak: {
    src: assetUrl("screens/timer-break.webp"),
    alt: "Gymodoro timer screen, break mode showing an assigned exercise",
    fallback: steel,
  },
  shotWorkoutLibrary: {
    src: assetUrl("screens/workout-library.webp"),
    alt: "Gymodoro Workout Library grid with difficulty and body-area filters applied",
    fallback: steel,
  },
  shotStats: {
    src: assetUrl("screens/stats.webp"),
    alt: "Gymodoro Stats screen with tiles and an hourly activity chart",
    fallback: steel,
  },
  shotBackground: {
    src: assetUrl("screens/background.webp"),
    alt: "Gymodoro background picker with scenic wallpaper options",
    fallback: steel,
  },
} satisfies Record<string, StoryAsset>;

export type StoryAssetKey = keyof typeof STORY_ASSETS;

/**
 * Hero clips used by the comparison strip at the top of the welcome cards
 * page. Undefined until the file is dropped in.
 */
export const PROBLEM_VIDEO_MP4 = assetUrl("problem-scrub.mp4");
export const SOLUTION_VIDEO_MP4 = assetUrl("solution-scrub.mp4");
