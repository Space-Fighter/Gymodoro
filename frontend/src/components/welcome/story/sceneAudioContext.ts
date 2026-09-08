import { createContext, useContext } from "react";

export interface SceneAudio {
  enabled: boolean;
  toggle: () => void;
  available: boolean;
}

export const SceneAudioContext = createContext<SceneAudio>({
  enabled: false,
  toggle: () => {},
  available: false,
});

export function useSceneAudio() {
  return useContext(SceneAudioContext);
}
