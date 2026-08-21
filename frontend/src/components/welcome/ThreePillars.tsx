import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ThreePillars() {
  const pillars = [
    {
      num: "01",
      icon: "🧠",
      title: "FOCUS",
      desc: "Protect your attention and make every work session count.",
      features: [
        "Customizable Pomodoro work blocks",
        "Focus, short-break & long-break modes",
        "Quick add-time (+1/+5/+10), pause/resume/reset",
      ],
    },
    {
      num: "02",
      icon: "🏃",
      title: "MOVE",
      desc: "Turn five minutes of downtime into five minutes of movement.",
      features: [
        "Personalized active break suggestions",
        "Guided desk stretches & mobility sets",
        "Activity streaks and break logs",
      ],
    },
    {
      num: "03",
      icon: "📊",
      title: "ADAPT",
      desc: "Understand your patterns and build a rhythm that fits you.",
      features: [
        "Focus ratio and distraction analytics",
        "Daily energy & active hours pattern",
        "AI-driven scheduling recommendations",
      ],
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            THREE PILLARS
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight mt-2 text-foreground">
            Everything works toward<br />
            <span className="text-emerald-500 dark:text-emerald-400 not-italic">
              a healthier rhythm.
            </span>
          </h2>
        </div>

        {/* 3 Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar) => (
            <Card
              key={pillar.num}
              className="rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between border bg-card/80 backdrop-blur-md text-card-foreground border-border/60"
            >
              <div>
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    {pillar.num}
                  </span>
                  <span className="text-4xl">{pillar.icon}</span>
                </div>

                <CardHeader className="p-0 mb-3">
                  <CardTitle className="font-heading font-extrabold text-2xl tracking-tight">
                    {pillar.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                  <p className="text-sm leading-relaxed mb-8 text-muted-foreground">
                    {pillar.desc}
                  </p>
                </CardContent>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-3 pt-6 border-t border-border/40">
                {pillar.features.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-xs sm:text-sm flex items-start gap-2.5 text-foreground"
                  >
                    <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
