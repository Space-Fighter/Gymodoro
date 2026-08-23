const SOUND_EFFECTS_KEY = "gymodoro-sound-effects";

export function getSoundEffectsEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_EFFECTS_KEY) === "true";
  } catch {
    return false;
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

/**
 * Plays a short two-tone chime synthesized via the Web Audio API — no audio
 * asset/network dependency. `rising` distinguishes the focus-end chime (low
 * -> high, "time to move") from the break-end chime (high -> low, "back to
 * focus") without needing separate sound files.
 */
export function playChime(rising: boolean): void {
  if (!getSoundEffectsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const notes = rising ? [523.25, 783.99] : [659.25, 523.25]; // C5->G5, or E5->C5
  const noteDuration = 0.18;
  const gap = 0.14;

  for (const [i, freq] of notes.entries()) {
    const start = ctx.currentTime + i * gap;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gainNode.gain.setValueAtTime(0, start);
    gainNode.gain.linearRampToValueAtTime(0.25, start + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + noteDuration);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + noteDuration + 0.02);
  }
}
