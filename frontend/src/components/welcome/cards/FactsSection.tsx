import GlassArticle from "./GlassArticle";
import PinnedRow from "./PinnedRow";
import { assetUrl } from "../assets";

interface Fact {
  stat: string;
  title: string;
  fact: string;
  gymodoro: string;
  source?: string;
  photo: string;
  alt: string;
}

const FACTS: Fact[] = [
  {
    stat: "10,000",
    photo: "fact-steps.jpg",
    alt: "White sneakers climbing outdoor steps",
    title: "The famous step goal was a slogan",
    fact: "Born from a 1965 Japanese pedometer ad. Real gains start near 7,000 steps.",
    gymodoro: "A few active breaks a day beat a still desk.",
    source: "Japan, 1965 · Lancet Public Health, 2025",
  },
  {
    stat: "66 days",
    photo: "fact-calendar.jpg",
    alt: "A hand marking dates on a wall calendar",
    title: "How long a habit really takes",
    fact: "About 66 days to feel automatic, and one missed day changed nothing.",
    gymodoro: "Within months, your break turns from scroll to squat.",
    source: "Lally et al., 2009",
  },
  {
    stat: "37×",
    photo: "fact-stairs.jpg",
    alt: "A person climbing a long staircase, one step at a time",
    title: "The power of 1% better",
    fact: "Get 1% better daily and you're 37 times better in a year.",
    gymodoro: "One five-minute exercise is a 1% move.",
    source: "James Clear, Atomic Habits",
  },
  {
    stat: "23 min",
    photo: "fact-phone.jpg",
    alt: "A man at his work desk distracted by his phone",
    title: "What one scroll really costs",
    fact: "It can take 23 minutes to fully refocus after a distraction.",
    gymodoro: "A timed exercise ends on schedule. You return ready.",
    source: "Gloria Mark, UC Irvine",
  },
  {
    stat: "+60%",
    photo: "fact-walk.jpg",
    alt: "A happy woman walking through a park",
    title: "Walking makes you more creative",
    fact: "Stanford: people had about 60% more creative ideas while walking.",
    gymodoro: "Stuck? Let your body work while your brain rests.",
    source: "Oppezzo & Schwartz, Stanford, 2014",
  },
  {
    stat: "150 min",
    photo: "fact-class.jpg",
    alt: "A group stretching together in a fitness studio",
    title: "The weekly movement target",
    fact: "The WHO advises 150 minutes of moderate activity a week.",
    gymodoro: "Six active breaks a day, five days a week, is exactly 150.",
    source: "World Health Organization",
  },
  {
    stat: "1980s",
    photo: "fact-tomato.jpg",
    alt: "Ripe red tomatoes",
    title: "A tomato started it all",
    fact: "The Pomodoro method began with a tomato-shaped kitchen timer.",
    gymodoro: "We kept the timer and changed what happens at the bell.",
    source: "Francesco Cirillo",
  },
];

function FactCard({ f }: { f: Fact }) {
  return (
    <GlassArticle className="h-full w-[min(84vw,400px)] max-md:h-auto !gap-3 !p-3.5">
      <div className="relative h-[27%] min-h-[110px] max-md:h-[170px] flex-none overflow-hidden rounded-[18px] bg-[#141824]">
        <img src={assetUrl(`science/${f.photo}`)} alt={f.alt} loading="lazy" className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3.5 pt-8 pb-2">
          <div className="font-heading text-[clamp(34px,4.4vw,48px)] leading-[0.95] font-extrabold tracking-[-0.04em] text-[#4be277]">
            {f.stat}
          </div>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-1.5 max-md:overflow-visible">
        <h3 className="m-0 font-heading text-[30px] leading-[1.08] max-md:text-[22px] font-bold text-white">{f.title}</h3>
        <p className="m-0 text-[21px] leading-[1.4] max-md:text-[17px] text-white">{f.fact}</p>
        <p className="m-0 rounded-2xl border border-[#4be277]/30 bg-[#4be277]/10 p-3 text-[20px] leading-[1.35] max-md:text-[16px] text-white">
          <b className="text-[#4be277]">With Gymodoro: </b>
          {f.gymodoro}
        </p>
        {f.source && <footer className="mt-auto text-[16px] tracking-wide max-md:text-[13px] text-white/55">{f.source}</footer>}
      </div>
    </GlassArticle>
  );
}

/** Section 04 — facts that make the case, each tied back to what Gymodoro does. */
export default function FactsSection() {
  return (
    <PinnedRow
      kicker="03 — the science"
      title="Small moves. Big payoff."
    >
      {FACTS.map((f) => (
        <FactCard key={f.title} f={f} />
      ))}
    </PinnedRow>
  );
}
