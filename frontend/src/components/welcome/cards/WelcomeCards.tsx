import ComparisonClips from "./ComparisonClips";
import ProblemSection from "./ProblemSection";
import SolutionSection from "./SolutionSection";

/**
 * The /welcome page body: a render comparison of the two hero clips, then two
 * pinned horizontal card rows (the problem, the fix) that end on a real
 * sign-up card. Replaces the old full-bleed video-scrub story.
 */
export default function WelcomeCards() {
  return (
    <div className="relative overflow-x-clip font-sans text-[#f6efe7]">
      <ComparisonClips />
      <div id="problem">
        <ProblemSection />
      </div>
      <div id="solution">
        <SolutionSection />
      </div>
    </div>
  );
}
