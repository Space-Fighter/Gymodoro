export default function ActiveBreakCarousel() {
  const activities = [
    { icon: "🚶", title: "Short Walk", desc: "Get moving for 5 minutes" },
    { icon: "🧘", title: "Stretching", desc: "Reset your posture and muscles" },
    { icon: "🦵", title: "Squats", desc: "A quick lower-body boost" },
    { icon: "💪", title: "Push-ups", desc: "Wake up your upper body" },
    { icon: "🏃", title: "Quick Cardio", desc: "Raise your energy in minutes" },
    { icon: "🧍", title: "Mobility", desc: "Loosen up and move better" },
    { icon: "👀", title: "Eye Relaxation", desc: "Give your eyes a real break" },
    { icon: "🌬️", title: "Breathing", desc: "Slow down and recover" },
  ];

  // Repeat items for seamless continuous looping marquee
  const loopedActivities = [...activities, ...activities];

  return (
    <section id="active-breaks" className="py-20 md:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              ACTIVE BREAKS
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight mt-2 text-foreground">
              Don&apos;t scroll.{" "}
              <span className="text-emerald-500 dark:text-emerald-400 not-italic">
                Move.
              </span>
            </h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-sm">
            Short, science-backed activities designed for the 5-minute break you already take.
          </p>
        </div>
      </div>

      {/* Marquee Window with Gradient Edge Masks */}
      <div className="w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="activity-marquee hover:cursor-grab">
          {loopedActivities.map((act, index) => (
            <article
              key={`${act.title}-${index}`}
              className="w-64 sm:w-72 min-h-[110px] bg-card border border-border rounded-2xl p-5 flex items-center gap-4 flex-shrink-0 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:border-primary/50"
            >
              <span className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl flex-shrink-0">
                {act.icon}
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block font-heading font-bold text-base text-foreground truncate">
                  {act.title}
                </strong>
                <small className="block mt-1 text-xs text-muted-foreground line-clamp-2">
                  {act.desc}
                </small>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
