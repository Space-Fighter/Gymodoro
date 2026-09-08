import { createContext, useContext } from "react";

export interface SceneAudio {
  enabled: boolean;
  toggle: () => void;
  available: boolean;
  getContext: () => AudioContext | null;
  getMaster: () => GainNode | null;
}

export const SceneAudioContext = createContext<SceneAudio>({
  enabled: false,
  toggle: () => {},
  available: false,
  getContext: () => null,
  getMaster: () => null,
});

export function useSceneAudio() {
  return useContext(SceneAudioContext);
}
