const SOUND_EFFECTS_KEY = "gymodoro-sound-effects";

// Defaults to "on" — the end-of-phase alarm is core functionality (you'd
// otherwise have no idea a focus/break period ended), not an optional
// decoration, so it should ring out of the box. This toggle exists so a user
// who explicitly wants silence can still turn it off; it just shouldn't be
// off by default.
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

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedAudioContext) sharedAudioContext = new Ctor();
  return sharedAudioContext;
}

const NOTE_DURATION = 0.18;
const NOTE_GAP = 0.14;
const ALARM_DURATION_SECONDS = 15;
// Old-style mechanical alarm clock: a clapper trilling rapidly back and
// forth between two closely-pitched bells, continuously — not spaced-out
// beeps (which read as a reversing-vehicle horn).
const BELL_PULSE_INTERVAL = 0.09;
const BELL_NOTE_DURATION = 0.075;

/**
 * Schedules one two-tone chime ring on `ctx`'s clock starting at `start`
 * (an absolute `ctx.currentTime`-relative instant). `rising` distinguishes
 * the focus-end chime (low -> high, "time to move") from the break-end
 * chime (high -> low, "back to focus"). Returns the oscillators so callers
 * can stop them early.
 */
function scheduleRing(ctx: AudioContext, rising: boolean, start: number): OscillatorNode[] {
  const notes = rising ? [523.25, 783.99] : [659.25, 523.25]; // C5->G5, or E5->C5
  const oscs: OscillatorNode[] = [];

  for (const [i, freq] of notes.entries()) {
    const noteStart = start + i * NOTE_GAP;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gainNode.gain.setValueAtTime(0, noteStart);
    gainNode.gain.linearRampToValueAtTime(0.25, noteStart + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + NOTE_DURATION);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(noteStart);
    osc.stop(noteStart + NOTE_DURATION + 0.02);
    oscs.push(osc);
  }

  return oscs;
}

function cancelOscillators(oscs: OscillatorNode[]): void {
  for (const osc of oscs) {
    try {
      osc.stop();
    } catch {
      // already stopped / finished — nothing to cancel
    }
  }
}

/**
 * Schedules a short two-tone chime synthesized via the Web Audio API, to play
 * `delaySeconds` from now — no audio asset/network dependency.
 *
 * Scheduling on the audio clock (rather than firing from a setTimeout) is what
 * lets the chime ring on time even when the tab is backgrounded and JS timers
 * are throttled or frozen. Returns a function that cancels the pending chime
 * (for pause / reset / add-time), or null if nothing was scheduled.
 */
export function scheduleChime(rising: boolean, delaySeconds = 0): (() => void) | null {
  if (!getSoundEffectsEnabled()) return null;
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const base = ctx.currentTime + Math.max(0, delaySeconds);
  const oscs = scheduleRing(ctx, rising, base);
  return () => cancelOscillators(oscs);
}

/** Plays the chime immediately. Thin wrapper over {@link scheduleChime}. */
export function playChime(rising: boolean): void {
  scheduleChime(rising, 0);
}

/**
 * Schedules the end-of-phase alarm: a continuous rapid trill between two
 * bell tones — the clapper-between-two-bells sound of an old wind-up alarm
 * clock — for `durationSeconds` (default 15s) starting `delaySeconds` from
 * now. This is deliberately distinct from the "Sound effects" setting
 * ({@link getSoundEffectsEnabled}), which is for optional decorative sounds
 * (e.g. a countdown tick) — the alarm itself is core functionality (you'd
 * otherwise have no idea a focus/break period ended) and always rings. All
 * pulses are pre-scheduled on the audio clock up front (same background-tab
 * -safe reasoning as {@link scheduleChime}). Returns a function that stops
 * every not-yet-finished pulse, or null if audio is unavailable.
 */
export function scheduleAlarmChime(
  rising: boolean,
  delaySeconds = 0,
  durationSeconds = ALARM_DURATION_SECONDS
): (() => void) | null {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const base = ctx.currentTime + Math.max(0, delaySeconds);
  const oscs: OscillatorNode[] = [];

  // Two closely-pitched bell tones the clapper alternates between; rising
  // (focus ending) pitched a bit higher than falling (break ending).
  const freqA = rising ? 1500 : 1200;
  const freqB = rising ? 1800 : 1450;
  const pulseCount = Math.max(1, Math.ceil(durationSeconds / BELL_PULSE_INTERVAL));

  for (let i = 0; i < pulseCount; i++) {
    const noteStart = base + i * BELL_PULSE_INTERVAL;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = i % 2 === 0 ? freqA : freqB;
    gainNode.gain.setValueAtTime(0, noteStart);
    gainNode.gain.linearRampToValueAtTime(0.16, noteStart + 0.006);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + BELL_NOTE_DURATION);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(noteStart);
    osc.stop(noteStart + BELL_NOTE_DURATION + 0.01);
    oscs.push(osc);
  }

  return () => cancelOscillators(oscs);
}

/** Starts the alarm immediately. Thin wrapper over {@link scheduleAlarmChime}. */
export function playAlarmChime(rising: boolean, durationSeconds = ALARM_DURATION_SECONDS): (() => void) | null {
  return scheduleAlarmChime(rising, 0, durationSeconds);
}
