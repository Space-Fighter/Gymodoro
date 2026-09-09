import { SceneAudioProvider } from "./SceneAudioProvider";
import SoundToggle from "./SoundToggle";
import PartProblem from "./PartProblem";
import PartSolution from "./PartSolution";
import PartFeatures from "./PartFeatures";
import ActCTA from "./ActCTA";

/**
 * Orchestrator for the scroll story on /welcome. Each Part runs its own
 * `useScroll` off its section, scrubs its clip, and plays its own music bed;
 * the seams overlap so the parts cross-dissolve into each other.
 */
export default function StoryWelcome() {
  return (
    <SceneAudioProvider>
      <SoundToggle />
      <div className="relative bg-black">
        <PartProblem />
        <PartSolution />
        <PartFeatures />
        <ActCTA />
      </div>
    </SceneAudioProvider>
  );
}
