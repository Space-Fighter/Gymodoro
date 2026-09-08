import { useRef } from "react";
import { useScroll } from "framer-motion";
import { StoryScrollProvider } from "./motion";
import { SceneAudioProvider } from "./SceneAudioProvider";
import SoundToggle from "./SoundToggle";
import PartProblem from "./PartProblem";
import PartSolution from "./PartSolution";
import PartFeatures from "./PartFeatures";
import ActCTA from "./ActCTA";

/**
 * Orchestrator for the 3-part photoreal scroll story on /welcome.
 *
 * One scroll container drives everything: `scrollYProgress` (0→1 over the whole
 * story) is shared via <StoryScrollProvider> so every scene scrubs off the same
 * timeline and the seams between parts stay continuous (no scroll-snap, no
 * layout jump). The music director reads the same progress value.
 *
 * The parts deliberately render back-to-back with overlapping scroll ranges —
 * each part fades its exit over the same window the next part fades its entry
 * (see "Seams between the three parts" in the plan).
 */
export default function StoryWelcome() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  return (
    <StoryScrollProvider progress={scrollYProgress}>
      <SceneAudioProvider progress={scrollYProgress}>
        <SoundToggle />
        <div ref={containerRef} className="relative">
          <PartProblem />
          <PartSolution />
          <PartFeatures />
          <ActCTA />
        </div>
      </SceneAudioProvider>
    </StoryScrollProvider>
  );
}
