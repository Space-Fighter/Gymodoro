/**
 * Scene-music manifest for the Welcome story. Short seamless-looping royalty-free
 * instrumentals live under `frontend/src/assets/welcome/audio/` (`<id>.ogg`
 * primary, `<id>.mp3` fallback) and are resolved automatically. Placeholder
 * files there are 4s of silence — replace them with real tracks at the same
 * names. See `frontend/src/assets/welcome/PROMPTS.md` for the mood brief.
 *
 * Each bed owns a scroll-progress range [start, end] (0→1 over the whole story
 * container). `SceneAudioProvider` crossfades bed gains as `scrollYProgress`
 * moves, so the score tracks the narrative.
 */
import { assetUrl } from "./assets";

export interface AudioBed {
  id: string;
  /** Scroll-progress window this bed is at full volume within. */
  range: [number, number];
  /** Human note on the intended feel (also used in PROMPTS.md). */
  mood: string;
  src?: string;
  fallbackSrc?: string;
  /** Peak gain 0..1 (some beds sit lower in the mix). */
  gain: number;
}

// Ranges deliberately OVERLAP — SceneAudioProvider ramps each bed over a small
// fade at its edges so neighbours crossfade and the score never has a gap.
const BEDS: Omit<AudioBed, "src" | "fallbackSrc">[] = [
  // Part 1: looping wind ambience from the clip (notification burst removed —
  // the sharp ding is a separate scroll-synced one-shot in PartProblem).
  { id: "problem", range: [0.0, 0.34], mood: "clip ambience — wind, low, airless", gain: 0.3 },
  { id: "turn", range: [0.3, 0.42], mood: "short bright resolve stinger", gain: 0.55 },
  // Part 2: looping ambience from the transformation clip (meadow, stream).
  { id: "solution", range: [0.38, 0.62], mood: "clip ambience — meadow, stream, warm", gain: 0.42 },
  { id: "payoff", range: [0.58, 0.72], mood: "uplifting swell, joyful", gain: 0.6 },
  { id: "features", range: [0.7, 1.1], mood: "light walking-tempo groove", gain: 0.5 },
];

export const AUDIO_BEDS: AudioBed[] = BEDS.map((b) => ({
  ...b,
  src: assetUrl(`audio/${b.id}.ogg`),
  fallbackSrc: assetUrl(`audio/${b.id}.mp3`),
}));

export const SOUND_PREF_KEY = "gymodoro-welcome-sound";
