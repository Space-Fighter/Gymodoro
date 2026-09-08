/**
 * Scene-music manifest for the Welcome story. `agent-audio` sources short
 * seamless-looping royalty-free instrumentals and drops them at these paths
 * (`.ogg` primary, `.mp3` fallback) under `frontend/src/assets/welcome/audio/`.
 * Until a file exists, `src`/`fallbackSrc` stay undefined and `SceneAudioProvider`
 * simply has nothing to play for that bed.
 *
 * Each bed owns a scroll-progress range [start, end] (0→1 over the whole story
 * container). `SceneAudioProvider` crossfades bed gains as `scrollYProgress`
 * moves, so the score tracks the narrative.
 */

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

export const AUDIO_BEDS: AudioBed[] = [
  { id: "problem", range: [0.0, 0.28], mood: "tense, claustrophobic pad; degrades toward night", gain: 0.5 },
  { id: "turn", range: [0.28, 0.34], mood: "short bright resolve stinger", gain: 0.6 },
  { id: "solution", range: [0.34, 0.62], mood: "warm acoustic / folk, unhurried", gain: 0.55 },
  { id: "payoff", range: [0.62, 0.74], mood: "uplifting swell, joyful", gain: 0.65 },
  { id: "features", range: [0.74, 1.0], mood: "light walking-tempo groove", gain: 0.5 },
];

export const SOUND_PREF_KEY = "gymodoro-welcome-sound";
