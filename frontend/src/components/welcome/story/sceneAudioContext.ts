import { createContext, useContext } from "react";

export interface SceneAudio {
  enabled: boolean;
  /** Bumps on each gesture that unlocks/resumes the context — a re-run signal. */
  unlocked: number;
  toggle: () => void;
  available: boolean;
  getContext: () => AudioContext | null;
  getMaster: () => GainNode | null;
}

export const SceneAudioContext = createContext<SceneAudio>({
  enabled: false,
  unlocked: 0,
  toggle: () => {},
  available: false,
  getContext: () => null,
  getMaster: () => null,
});

export function useSceneAudio() {
  return useContext(SceneAudioContext);
}
