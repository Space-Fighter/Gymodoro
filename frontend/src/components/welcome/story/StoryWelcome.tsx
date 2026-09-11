import PartProblem from "./PartProblem";
import PartSolution from "./PartSolution";
import PartFeatures from "./PartFeatures";
import ActCTA from "./ActCTA";

/**
 * Orchestrator for the scroll story on /welcome. Each Part runs its own
 * `useScroll` off its section, scrubs its clip; the seams overlap so the
 * parts cross-dissolve into each other.
 */
export default function StoryWelcome() {
  return (
    <div className="relative bg-black">
      <PartProblem />
      <PartSolution />
      <PartFeatures />
      <ActCTA />
    </div>
  );
}
