import logo from "@/assets/gymodoro-logo.png";

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center pt-24 pb-20 md:pt-12">
      {/* Brand — same position/size it had before, now living in Hero instead of Navbar */}
      <a
        href="#top"
        className="absolute top-10 sm:top-16 lg:top-20 -left-20 z-50 flex flex-col items-center font-extrabold text-xl tracking-tight transition-transform duration-200 hover:-translate-y-0.5 text-foreground"
        aria-label="Gymodoro Home"
      >
        <img
          src={logo}
          alt="Gymodoro Logo"
          className="w-[507px] h-[507px] object-contain"
        />
        <span className="font-heading font-extrabold text-[36px] tracking-tight -mt-32">
          Gymodoro
        </span>
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left Column: Copy & Actions */}
          <div className="flex flex-col items-start z-10">
            
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border bg-card text-muted-foreground text-xs font-bold tracking-wider uppercase mb-6 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Productivity, redesigned for your body
            </div>

            {/* Headline */}
            <h1 className="font-heading font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-foreground mb-6">
              Work.<br />
              <span className="text-emerald-500 dark:text-emerald-400 not-italic">Move.</span><br />
              Repeat.
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed mb-8">
              Gymodoro turns the breaks you already take into opportunities to move — so you can stay focused without sacrificing your health.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto" id="start">
              <a
                href="#loop"
                className="inline-flex items-center justify-center gap-3 bg-foreground text-background px-7 py-4 rounded-full font-bold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20"
              >
                <span>Start your first session</span>
                <span className="text-emerald-400 text-lg">→</span>
              </a>
              <a
                href="#why"
                className="inline-flex items-center justify-center text-sm font-bold text-foreground/80 hover:text-foreground px-5 py-4 transition-colors duration-150"
              >
                See how it works ↓
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Mockup Showcase */}
          <div className="relative flex items-center justify-center min-h-[460px] lg:min-h-[520px]">
            
            {/* Ambient Background Glow */}
            <div className="absolute w-[380px] h-[380px] sm:w-[460px] sm:h-[460px] rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 blur-3xl pointer-events-none -z-10" />

            {/* Floating Streak Badge */}
            <div className="absolute -top-3 left-4 sm:left-8 z-20 bg-card border border-border rounded-full px-4 py-2 text-xs font-semibold shadow-lg text-foreground flex items-center gap-2 backdrop-blur-sm transform -rotate-2 hover:rotate-0 transition-transform duration-200">
              <span className="text-rose-500">♥</span>
              <span>Active break streak</span>
              <b className="font-extrabold text-foreground">07</b>
            </div>

            {/* Main 3D Tilted Pomodoro Timer Card */}
            <div className="w-[320px] sm:w-[380px] bg-background/70 backdrop-blur-xl text-foreground border border-border/60 rounded-3xl p-6 sm:p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300">

              {/* Header */}
              <div className="flex justify-between items-center text-[10px] tracking-widest text-muted-foreground font-bold uppercase mb-12">
                <span>GYMODORO</span>
                <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  ACTIVE
                </span>
              </div>

              {/* Label */}
              <div className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                FOCUS SESSION
              </div>

              {/* Time Display */}
              <div className="font-heading font-extrabold text-6xl sm:text-7xl tracking-tighter my-3 text-foreground">
                24<span className="text-muted-foreground">:37</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-border rounded-full overflow-hidden mb-4">
                <div className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full w-[74%]" />
              </div>

              {/* Bottom Footer */}
              <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                <span>Deep work</span>
                <span>25 min</span>
              </div>
            </div>

            {/* Floating "Next Break" Card */}
            <div className="absolute -bottom-4 right-2 sm:right-6 z-20 w-[240px] sm:w-[260px] bg-card border border-border rounded-2xl p-4 shadow-xl text-foreground flex items-center gap-3.5 transform -rotate-3 hover:rotate-0 transition-transform duration-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-lg flex-shrink-0">
                ↗
              </div>
              <div className="flex-1 min-w-0">
                <small className="block text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  NEXT BREAK
                </small>
                <strong className="block text-xs font-bold truncate">
                  Move for 5 min
                </strong>
              </div>
              <span className="text-muted-foreground font-bold">→</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
