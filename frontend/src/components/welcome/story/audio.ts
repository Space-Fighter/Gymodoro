import { assetUrl } from "./assets";

/**
 * Welcome-story audio. Each Part owns one looping music bed; Part 1 also fires a
 * one-shot notification "ding" when the scrub reaches the app-open moment in the
 * footage. Everything is gated by the sound toggle.
 *
 * Music: Kevin MacLeod (incompetech.com), CC BY 4.0 — see CREDITS.md.
 *   Part 1 "Anxiety"  · Part 2 "Inspired"  · Part 3 "Cheery Monday"
 */
export const PART1_TRACK = { ogg: assetUrl("audio/part1.ogg"), mp3: assetUrl("audio/part1.mp3") };
export const PART2_TRACK = { ogg: assetUrl("audio/part2.ogg"), mp3: assetUrl("audio/part2.mp3") };
export const PART3_TRACK = { ogg: assetUrl("audio/part3.ogg"), mp3: assetUrl("audio/part3.mp3") };

export const PROBLEM_DING = { ogg: assetUrl("problem-ding.ogg"), mp3: assetUrl("problem-ding.mp3") };

/** Scroll-progress point (within Part 1) where the phone app pops on screen. */
export const DING_AT = 0.17;

export const SOUND_PREF_KEY = "gymodoro-welcome-sound";

export function pickSrc(t: { ogg?: string; mp3?: string }): string | undefined {
  if (typeof Audio !== "undefined") {
    const a = new Audio();
    if (t.ogg && a.canPlayType("audio/ogg")) return t.ogg;
  }
  return t.mp3 || t.ogg;
}
