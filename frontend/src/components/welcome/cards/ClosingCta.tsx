import { Link } from "react-router-dom";

/** Final beat: resolve the page on one clear action. */
export default function ClosingCta() {
  return (
    <section className="flex flex-col items-center gap-6 px-[5vw] py-28 text-center">
      <h2 className="m-0 max-w-4xl font-heading text-[clamp(36px,6vw,72px)] leading-[0.98] font-extrabold tracking-[-0.03em] text-white [text-shadow:0_4px_30px_rgba(0,0,0,.5)]">
        Your next break could be the best part of your day.
      </h2>
      <p className="m-0 max-w-[48ch] text-lg leading-[1.55] text-white/85">
        Free to start. No gym, no kit, nothing to configure. Just 25 minutes of focus and 5 minutes of movement.
      </p>
      <Link
        to="/signup"
        className="rounded-full bg-white px-9 py-4 text-lg font-bold text-slate-900 shadow-xl transition hover:-translate-y-0.5"
      >
        Start your first cycle
      </Link>
    </section>
  );
}
