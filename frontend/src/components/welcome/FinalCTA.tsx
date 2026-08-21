import { Link } from "react-router-dom";

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto rounded-[32px] sm:rounded-[40px] bg-background/70 backdrop-blur-xl text-foreground py-16 sm:py-24 px-6 sm:px-12 text-center relative overflow-hidden shadow-2xl border border-border/60">

        {/* Ambient Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-400/90 uppercase block mb-4">
            A BETTER WAY TO BE PRODUCTIVE
          </span>

          <h2 className="font-heading font-extrabold text-4xl sm:text-6xl tracking-tight leading-tight mb-6">
            Don&apos;t just take a break.<br />
            <span className="text-emerald-500 dark:text-emerald-400 not-italic">Move.</span>
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-10">
            We&apos;re not trying to make you work more.<br className="hidden sm:inline" />
            We&apos;re helping you work sustainably and feel energized all day.
          </p>

          <Link
            to="/signup"
            className="inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 rounded-full font-heading font-extrabold text-base transition-all duration-200 hover:bg-emerald-500 dark:hover:bg-emerald-400 hover:scale-105 shadow-xl hover:shadow-emerald-500/20"
          >
            <span>Enter Gymodoro</span>
            <b className="text-lg">→</b>
          </Link>
        </div>

      </div>
    </section>
  );
}
