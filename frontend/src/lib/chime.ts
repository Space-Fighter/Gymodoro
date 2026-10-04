const SOUND_EFFECTS_KEY = "gymodoro-sound-effects";
const RING_SOUND_KEY = "gymodoro-timer-ring-sound";
const RING_SECONDS_KEY = "gymodoro-timer-ring-seconds";

// Defaults to "on" — this toggle exists so a user who explicitly wants
// silence can turn decorative sounds off; it just shouldn't be off by default.
export function getSoundEffectsEnabled(): boolean {
  try {
    const v = localStorage.getItem(SOUND_EFFECTS_KEY);
    return v === null ? true : v === "true";
  } catch {
    return true;
  }
}

export function setSoundEffectsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_EFFECTS_KEY, String(enabled));
  } catch {
    // localStorage unavailable (private browsing, etc.) — setting just won't persist
  }
}

// ---------------------------------------------------------------------------
// Timer ring sounds: recorded clips in assets/sounds/timer-rings/. The file
// name (slugged) is the id, so dropping another .wav/.mp3 in that folder adds
// an option automatically; give it a nicer label in RING_LABELS if wanted.
// ---------------------------------------------------------------------------

const RING_FILES = import.meta.glob("../assets/sounds/timer-rings/*.{wav,mp3,ogg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const RING_LABELS: Record<string, string> = {
  "tick-tock-clock-close-up": "Tick tock clock",
  "bell-tick-tock-timer": "Bell tick tock",
  "long-clock-gong": "Long clock gong",
  "old-big-clock": "Old big clock",
};

export interface RingSound {
  id: string;
  label: string;
  url: string;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const RING_SOUNDS: RingSound[] = Object.entries(RING_FILES)
  .map(([path, url]) => {
    const id = slug((path.split("/").pop() ?? path).replace(/\.[^.]+$/, ""));
    return { id, label: RING_LABELS[id] ?? id.replace(/-/g, " "), url };
  })
  .sort((a, b) => a.label.localeCompare(b.label));

export const DEFAULT_RING_SOUND_ID = "tick-tock-clock-close-up";

// Default first in the picker, the rest alphabetical.
RING_SOUNDS.sort((a, b) => Number(b.id === DEFAULT_RING_SOUND_ID) - Number(a.id === DEFAULT_RING_SOUND_ID));

export function getRingSoundId(): string {
  try {
    const v = localStorage.getItem(RING_SOUND_KEY);
    if (v && RING_SOUNDS.some((s) => s.id === v)) return v;
  } catch {
    // fall through to the default
  }
  return DEFAULT_RING_SOUND_ID;
}

export function setRingSoundId(id: string): void {
  try {
    localStorage.setItem(RING_SOUND_KEY, id);
  } catch {
    // localStorage unavailable (private browsing, etc.) — setting just won't persist
  }
}

/** Choices offered in Settings for how long the timer rings. */
export const RING_SECONDS_OPTIONS = [5, 10, 15, 30, 60] as const;
export const DEFAULT_RING_SECONDS = 15;

export function getRingSeconds(): number {
  try {
    const n = Number(localStorage.getItem(RING_SECONDS_KEY));
    if (RING_SECONDS_OPTIONS.some((o) => o === n)) return n;
  } catch {
    // fall through to the default
  }
  return DEFAULT_RING_SECONDS;
}

export function setRingSeconds(seconds: number): void {
  try {
    localStorage.setItem(RING_SECONDS_KEY, String(seconds));
  } catch {
    // localStorage unavailable (private browsing, etc.) — setting just won't persist
  }
}

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedAudioContext) sharedAudioContext = new Ctor();
  return sharedAudioContext;
}

const bufferCache = new Map<string, Promise<AudioBuffer>>();

function loadBuffer(ctx: AudioContext, id: string): Promise<AudioBuffer> | null {
  const sound = RING_SOUNDS.find((s) => s.id === id);
  if (!sound) return null;
  let pending = bufferCache.get(id);
  if (!pending) {
    pending = fetch(sound.url)
      .then((r) => r.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data));
    pending.catch(() => bufferCache.delete(id)); // allow a retry after a failed fetch
    bufferCache.set(id, pending);
  }
  return pending;
}

/** Fetches and decodes the selected ring up front so it can start the instant the timer ends. */
export function preloadRingSound(id: string = getRingSoundId()): void {
  const ctx = getAudioContext();
  if (ctx) loadBuffer(ctx, id)?.catch(() => {});
}

const FADE_OUT_SECONDS = 0.3;

/**
 * Plays ring `id` for `ringSeconds` (looping a short clip, cutting a long one
 * with a brief fade), starting `delaySeconds` from now, on the audio clock.
 * Scheduling on the audio clock (rather than from a setTimeout) is what lets
 * it ring on time even when the tab is backgrounded and JS timers are
 * throttled or frozen. Returns a function that stops it (cancelling it if it
 * hasn't started yet), or null if audio is unavailable.
 */
function scheduleRing(
  id: string,
  delaySeconds: number,
  ringSeconds: number,
  onEnded?: () => void
): (() => void) | null {
  const ctx = getAudioContext();
  const loading = ctx && loadBuffer(ctx, id);
  if (!ctx || !loading) return null;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const requestedAt = ctx.currentTime + Math.max(0, delaySeconds);
  let cancelled = false;
  let source: AudioBufferSourceNode | null = null;

  loading
    .then((buffer) => {
      if (cancelled) return;
      const src = ctx.createBufferSource();
      source = src;
      src.buffer = buffer;
      src.loop = buffer.duration < ringSeconds;
      const gain = ctx.createGain();
      src.connect(gain);
      gain.connect(ctx.destination);
      src.onended = () => onEnded?.();
      // If decoding finished after the requested instant, start right away.
      const start = Math.max(requestedAt, ctx.currentTime);
      const end = start + Math.min(ringSeconds, src.loop ? ringSeconds : buffer.duration);
      gain.gain.setValueAtTime(1, start);
      gain.gain.setValueAtTime(1, Math.max(start, end - FADE_OUT_SECONDS));
      gain.gain.linearRampToValueAtTime(0, end);
      src.start(start);
      src.stop(end);
    })
    .catch(() => onEnded?.());

  return () => {
    cancelled = true;
    if (!source) return;
    source.onended = null;
    try {
      source.stop();
    } catch {
      // already finished — nothing to stop
    }
  };
}

/** Schedules the selected timer ring (for the chosen duration) `delaySeconds` from now. Returns a cancel function, or null. */
export function scheduleAlarmChime(delaySeconds = 0): (() => void) | null {
  return scheduleRing(getRingSoundId(), delaySeconds, getRingSeconds());
}

/** Rings the selected timer ring immediately. Thin wrapper over {@link scheduleAlarmChime}. */
export function playAlarmChime(): (() => void) | null {
  return scheduleAlarmChime(0);
}

/** Plays ring `id` right now, for the chosen duration, for the Settings preview. `onEnded` fires when it finishes or can't play. */
export function previewRingSound(id: string, onEnded?: () => void): (() => void) | null {
  const stop = scheduleRing(id, 0, getRingSeconds(), onEnded);
  if (!stop) onEnded?.();
  return stop;
}
