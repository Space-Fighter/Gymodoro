import GlassArticle from "./GlassArticle";
import SectionHeading from "./SectionHeading";
import { usePinnedCardTrack } from "./usePinnedCardTrack";
import { STORY_ASSETS } from "../assets";

const CARDS = [
  {
    title: "Work a ton",
    copy: "Whether you are a student studying or a working professional, most of your day goes on the desk.",
    position: "50% 20%",
  },
  {
    title: "Tired takes a break",
    copy: "The easiest break? Pick up your phone and scroll. Just a few minutes, you say to yourself.",
    position: "50% 45%",
  },
  {
    title: "Your brain is hacked",
    copy: "Oh! You've scrolled a lot — you need to get back to work.",
    position: "50% 70%",
  },
  {
    title: "The doom-scroll aftermath",
    copy: "Oh well, I feel like a piece of crap now. We'll work tomorrow.",
    position: "50% 95%",
  },
];

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
            className="flex items-start gap-[clamp(16px,2vw,28px)] px-[5vw] will-change-transform"
          >
            {CARDS.map((c) => (
              <GlassArticle key={c.title} className="w-[clamp(260px,30vw,360px)]">
                <div
                  className="aspect-4/3 rounded-[10px] bg-[#141824] bg-cover"
                  style={{
                    backgroundImage: STORY_ASSETS.problemPoster.src
                      ? `url(${STORY_ASSETS.problemPoster.src})`
                      : undefined,
                    backgroundPosition: c.position,
                  }}
                  role="img"
                  aria-label={STORY_ASSETS.problemPoster.alt}
                />
                <h3 className="m-0 font-heading text-[27px] leading-[1.05] font-extrabold tracking-[-0.01em] text-white">
                  {c.title}
                </h3>
                <p className="m-0 text-base leading-[1.55] text-white">{c.copy}</p>
                <div className="mt-auto border-t border-[#1b1f2b] pt-3.5 text-[13px] font-bold tracking-[0.04em] text-white">
                  State of body: <span className="text-[#e8734a]">Sedentary</span>
                </div>
              </GlassArticle>
            ))}

            <GlassArticle className="w-[clamp(280px,32vw,400px)] text-white">
              <h3 className="m-0 font-heading text-[31px] leading-none font-extrabold tracking-[-0.02em] uppercase">
                Assessment of the day
              </h3>
              <div className="flex flex-col gap-3 font-heading text-[19px] font-bold tracking-[0.01em]">
                {["Productivity", "Enjoyment", "Satisfaction", "Activeness"].map((row) => (
                  <div
                    key={row}
                    className="flex items-center justify-between gap-3 border-b border-[#1b1f2b] pb-2.5 last:border-0"
                  >
                    <span className="uppercase">{row}</span>
                    <span className="text-[#e8734a]">Low</span>
                  </div>
                ))}
              </div>
              <p className="mt-auto text-[15px] leading-[1.55] text-white">
                Over the long run this can all be detrimental to health, work satisfaction,
                enjoyment and much more.
              </p>
            </GlassArticle>
          </div>
        </div>
      </div>
    </section>
  );
}
