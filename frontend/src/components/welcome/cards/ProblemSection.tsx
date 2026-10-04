import GlassArticle from "./GlassArticle";
import SectionHeading from "./SectionHeading";
import { usePinnedCardTrack } from "./usePinnedCardTrack";
import { STORY_ASSETS, type StoryAsset } from "../assets";

interface Beat {
  title: string;
  copy: string;
  image: StoryAsset;
}

const BEATS: Beat[] = [
  {
    title: "Work a ton",
    copy: "Student or professional, most of your day goes on the desk.",
    image: STORY_ASSETS.problemWorkATon,
  },
  {
    title: "Tired takes a break",
    copy: "The easiest break? Your phone. Just a few minutes, you tell yourself.",
    image: STORY_ASSETS.problemTiredBreak,
  },
  {
    title: "Your brain is hacked",
    copy: "You've scrolled a lot. Time to get back to work.",
    image: STORY_ASSETS.problemBrainHacked,
  },
  {
    title: "The doom-scroll aftermath",
    copy: "I feel awful now. We'll work tomorrow.",
    image: STORY_ASSETS.problemDoomscroll,
  },
];

const ASSESSMENT_ROWS = ["Productivity", "Enjoyment", "Satisfaction", "Activeness"];

function BeatCard({ beat }: { beat: Beat }) {
  return (
    <GlassArticle className="w-[clamp(260px,30vw,360px)]">
      <span
        role="img"
        aria-label={beat.image.alt}
        className="block aspect-video rounded-[18px] bg-[#141824] bg-cover bg-center"
        style={{
          backgroundImage: beat.image.src ? `url(${beat.image.src})` : undefined,
        }}
      />
      <h3 className="m-0 font-heading text-[40px] leading-[1.05] font-extrabold tracking-[-0.01em] text-white">
        {beat.title}
      </h3>
      <p className="m-0 text-[24px] leading-[1.35] text-white">{beat.copy}</p>
    </GlassArticle>
  );
}

function AssessmentCard() {
  return (
    <GlassArticle className="w-[clamp(280px,32vw,400px)] text-white">
      <h3 className="m-0 font-heading text-[46px] leading-none font-extrabold tracking-[-0.02em] uppercase">
        Assessment of the day
      </h3>
      <dl className="m-0 flex flex-col gap-3 font-heading text-[28px] font-bold tracking-[0.01em]">
        {ASSESSMENT_ROWS.map((label) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5 last:border-0"
          >
            <dt className="uppercase">{label}</dt>
            <dd className="m-0 text-[#e8734a]">Low</dd>
          </div>
        ))}
      </dl>
      <p className="mt-auto text-[22px] leading-[1.35] text-white">
        Over time this hurts your health, satisfaction and enjoyment.
      </p>
    </GlassArticle>
  );
}

/** Section 01 — the problem: pinned horizontal card row, ends on a stat-summary card. */
export default function ProblemSection() {
  const { sectionRef, trackRef, fillRef } = usePinnedCardTrack();

  return (
    <section ref={sectionRef} className="relative">
      <div className="sticky top-0 flex min-h-screen flex-col">
        <SectionHeading kicker="01 — the problem" fillRef={fillRef}>
          The problem
        </SectionHeading>

        <div className="flex flex-none items-center overflow-x-hidden overflow-y-visible py-6">
          <div
            ref={trackRef}
            className="relative flex items-start gap-[clamp(16px,2vw,28px)] px-[5vw] will-change-transform"
          >
            {BEATS.map((beat) => (
              <BeatCard key={beat.title} beat={beat} />
            ))}
            <AssessmentCard />
          </div>
        </div>
      </div>
    </section>
  );
}
