import ComparisonClips from "./ComparisonClips";
import ProblemSection from "./ProblemSection";
import SolutionSection from "./SolutionSection";
import GallerySection from "./GallerySection";
import FactsSection from "./FactsSection";
import ClosingCta from "./ClosingCta";

/**
 * The /welcome page body: hero (tagline + the two clips), the problem, the
 * fix, the facts, the product, then a closing call to action.
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
      <div id="facts">
        <FactsSection />
      </div>
      <div id="gallery">
        <GallerySection />
      </div>
      <ClosingCta />
    </div>
  );
}
