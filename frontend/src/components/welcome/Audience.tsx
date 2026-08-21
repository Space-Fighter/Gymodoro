const audiences = [
  {
    icon: "🎓",
    title: "Students",
    desc: "Optimize study sessions and prevent burnout during exam crunch.",
  },
  {
    icon: "💼",
    title: "Professionals",
    desc: "Stay focused and well through long work hours, without sacrificing your health.",
  },
  {
    icon: "🏠",
    title: "Remote workers",
    desc: "Fight sedentary habits and cabin fever with built-in movement.",
  },
];

export default function Audience() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            WHO IT'S FOR
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight mt-2 text-foreground">
            Built for anyone at a desk.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {audiences.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl p-6 bg-card/80 backdrop-blur-md border border-border/60 text-center flex flex-col items-center gap-3"
            >
              <span className="text-4xl">{item.icon}</span>
              <h3 className="font-heading font-bold text-lg text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
