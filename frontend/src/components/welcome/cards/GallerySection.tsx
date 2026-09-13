import GlassArticle from "./GlassArticle";
import SectionHeading from "./SectionHeading";
import { usePinnedCardTrack } from "./usePinnedCardTrack";
import { STORY_ASSETS, type StoryAsset } from "../assets";

interface GalleryItem {
  title: string;
  copy: string;
  image: StoryAsset;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    title: "The timer",
    copy: "A clean, distraction-free countdown for the twenty-five minutes you actually work.",
    image: STORY_ASSETS.shotTimerFocus,
  },
  {
    title: "The break",
    copy: "When the block ends, your exercise is already on screen — no deciding, just doing.",
    image: STORY_ASSETS.shotTimerBreak,
  },
  {
    title: "Workout library",
    copy: "Every move Gymodoro can hand you, filterable by difficulty and body area.",
    image: STORY_ASSETS.shotWorkoutLibrary,
  },
  {
    title: "Your stats",
    copy: "Focus time, break streaks, and calories burned — the whole day in one view.",
    image: STORY_ASSETS.shotStats,
  },
  {
    title: "Set the scene",
    copy: "Pick a backdrop for your sessions, from a mountain pass to a rainy cafe.",
    image: STORY_ASSETS.shotBackground,
  },
];

function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <GlassArticle className="w-[clamp(280px,34vw,420px)]">
      <span
        role="img"
        aria-label={item.image.alt}
        className="block aspect-video rounded-[18px] bg-[#141824] bg-cover bg-center"
        style={{
          backgroundImage: item.image.src ? `url(${item.image.src})` : undefined,
        }}
      />
      <h3 className="m-0 font-heading text-2xl leading-[1.1] font-bold text-white">{item.title}</h3>
      <p className="m-0 text-base leading-[1.55] text-white">{item.copy}</p>
    </GlassArticle>
  );
}

/** Section 03 — the gallery: pinned horizontal row of real product screens. */
export default function GallerySection() {
  const { sectionRef, trackRef, fillRef } = usePinnedCardTrack();

  return (
    <section ref={sectionRef} className="relative">
      <div className="sticky top-0 flex min-h-screen flex-col">
        <SectionHeading
          kicker="03 — the gallery"
          kickerColor="#9aa3b5"
          fillRef={fillRef}
          fillColor="#9aa3b5"
          subtitle="Every screen you'll actually use, once you're in."
        >
          See it in the app.
        </SectionHeading>

        <div className="flex flex-none items-center overflow-x-hidden overflow-y-visible py-6">
          <div
            ref={trackRef}
            className="relative flex items-start gap-[clamp(16px,2vw,28px)] px-[5vw] will-change-transform"
          >
            {GALLERY_ITEMS.map((item) => (
              <GalleryCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
