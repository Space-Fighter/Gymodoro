import ComparisonClips from "./ComparisonClips";
import ProblemSection from "./ProblemSection";
import SolutionSection from "./SolutionSection";
import GallerySection from "./GallerySection";

/**
 * The /welcome page body: a render comparison of the two hero clips, then
 * three pinned horizontal card rows (the problem, the fix, the gallery) —
 * the first two end on a real sign-up card. Replaces the old full-bleed
 * video-scrub story.
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
      <div id="gallery">
        <GallerySection />
      </div>
    </div>
  );
}
