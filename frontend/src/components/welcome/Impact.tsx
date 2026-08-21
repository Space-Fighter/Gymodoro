const impacts = [
  { icon: "🎯", title: "Increased focus", desc: "Deep work blocks that actually protect your attention." },
  { icon: "🏃", title: "Stay active", desc: "Movement built into the day you already have, not extra time carved out." },
  { icon: "🧘", title: "Stay focused, naturally", desc: "Active recovery beats the doomscroll — no willpower required." },
  { icon: "📊", title: "Patterns you can act on", desc: "See your focus ratio and best hours, so you can plan around them." },
  { icon: "🙂", title: "A healthier rhythm", desc: "Productive, energized, and happier at the end of the day." },
];

export default function Impact() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            IMPACT OF GYMODORO
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight mt-2 text-foreground">
            Not just another timer.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 mb-16">
          {impacts.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl p-5 bg-card/80 backdrop-blur-md border border-border/60 text-center flex flex-col items-center gap-2"
            >
              <span className="text-3xl">{item.icon}</span>
              <h3 className="font-heading font-bold text-sm text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center rounded-3xl p-8 sm:p-10 bg-background/70 backdrop-blur-xl border border-border/60 shadow-xl">
          <p className="font-heading font-extrabold text-xl sm:text-3xl tracking-tight leading-snug text-foreground">
            "We aren't asking you to change how you work.
            <br className="hidden sm:inline" /> We're transforming how you recover."
          </p>
        </div>
      </div>
    </section>
  );
}
