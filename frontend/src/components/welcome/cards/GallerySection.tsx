import GlassArticle from "./GlassArticle";
import PinnedRow from "./PinnedRow";
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
    copy: "When the block ends, your exercise is already on screen with a demo video, difficulty, target muscles and a roll-the-dice button. No deciding, just doing.",
    image: STORY_ASSETS.shotTimerBreak,
  },
  {
    title: "Workout library",
    copy: "Every move Gymodoro can hand you, filterable by difficulty and body area.",
    image: STORY_ASSETS.shotWorkoutLibrary,
  },
  {
    title: "Your stats",
    copy: "Focus time, break streaks, and calories burned: the whole day in one view.",
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
    <GlassArticle className="h-full w-[90vw] !gap-3">
      <div className="flex min-h-0 flex-1 items-center justify-center">
        {/* object-contain: the whole screen is always visible, never cropped. */}
        <img
          src={item.image.src}
          alt={item.image.alt}
          loading="lazy"
          className="block max-h-full max-w-full rounded-[18px] bg-[#141824] object-contain"
        />
      </div>
      <div>
        <h3 className="m-0 mb-1 font-heading text-2xl leading-[1.1] font-bold text-white">{item.title}</h3>
        <p className="m-0 text-[15px] leading-[1.5] text-white">{item.copy}</p>
      </div>
    </GlassArticle>
  );
}

/** Section 03 — the product: pinned row of large, uncropped product screens. */
export default function GallerySection() {
  return (
    <PinnedRow
      kicker="03 — the product"
      kickerColor="#9aa3b5"
      title="See it in the app."
    >
      {GALLERY_ITEMS.map((item) => (
        <GalleryCard key={item.title} item={item} />
      ))}
    </PinnedRow>
  );
}
