export default function TheProblem() {
  const steps = [
    {
      num: "01",
      title: "Work",
      desc: "Deep focus",
    },
    {
      num: "02",
      title: "Exhaustion",
      desc: "Need a break",
    },
    {
      num: "03",
      title: "Scroll",
      desc: "“Just 5 minutes”",
    },
    {
      num: "04",
      title: "Sit more",
      desc: "Back to work",
    },
  ];

  return (
    <section
      id="why"
      className="py-20 md:py-28 border-y border-border bg-card/40 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            THE PROBLEM
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight mt-3 text-foreground">
            We&apos;re trying to become{" "}
            <span className="text-emerald-500 dark:text-emerald-400 not-italic">
              more productive
            </span>{" "}
            while sitting more.
          </h2>
        </div>

        {/* 4-Step Visual Flow */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => (
            <div
              key={step.num}
              className="relative p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  {step.num}
                </span>
                <strong className="block font-heading font-bold text-xl sm:text-2xl text-foreground mt-3 mb-1">
                  {step.title}
                </strong>
                <small className="text-sm text-muted-foreground">
                  {step.desc}
                </small>
              </div>

              {/* Connecting indicator */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/60 font-bold text-sm">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Impact Callout */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            People don&apos;t necessarily need <b className="text-foreground font-bold">more</b> breaks.
            <br />
            <strong className="block font-heading font-extrabold text-2xl sm:text-4xl text-foreground mt-2">
              They need better breaks.
            </strong>
          </p>
        </div>

      </div>
    </section>
  );
}
