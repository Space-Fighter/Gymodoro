import { Volume2, VolumeX } from "lucide-react";
import { useSceneAudio } from "./sceneAudioContext";

/**
 * Fixed sound toggle for the story's scene music. Audio is off until the
 * visitor presses this (browsers block autoplay); the choice persists to
 * localStorage. Hidden entirely when no audio files are present.
 */
export default function SoundToggle() {
  const { enabled, toggle, available } = useSceneAudio();
  if (!available) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Mute scene music" : "Play scene music"}
      title={enabled ? "Mute scene music" : "Play scene music"}
      className="glass-tight fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full text-white backdrop-blur-md transition hover:scale-105"
    >
      {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}
