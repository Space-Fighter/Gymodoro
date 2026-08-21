import { useState } from "react";

export default function TheLoop() {
  const [selectedStep, setSelectedStep] = useState(0);

  const loopItems = [
    {
      num: "01",
      title: "Focus",
      desc: "Pomodoro sessions & AI distraction protection",
      icon: "🧠",
    },
    {
      num: "02",
      title: "Move",
      desc: "Short, achievable activities for your break",
      icon: "🏃",
    },
    {
      num: "03",
      title: "Recover",
      desc: "Reset your body, eyes, and breathing",
      icon: "⚡",
    },
    {
      num: "04",
      title: "Repeat",
      desc: "Build a sustainable rhythm for better work",
      icon: "🔁",
    },
  ];

  return (
    <section id="loop" className="py-20 md:py-28 bg-card/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Interactive Loop Step List */}
          <div>
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              THE GYMODORO LOOP
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight mt-2 text-foreground mb-4">
              Focus that{" "}
              <span className="text-emerald-500 dark:text-emerald-400 not-italic">
                moves
              </span>{" "}
              with you.
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg">
              Your productivity break is already there. Gymodoro makes it active and rewarding.
            </p>

            <div className="space-y-3">
              {loopItems.map((item, index) => {
                const isSelected = selectedStep === index;
                return (
                  <button
                    key={item.num}
                    onClick={() => setSelectedStep(index)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${
                      isSelected
                        ? "bg-card border-primary shadow-md translate-x-1"
                        : "bg-transparent border-transparent hover:bg-card/60 hover:border-border"
                    }`}
                  >
                    <span
                      className={`text-xs font-mono font-bold ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {item.num}
                    </span>
                    <div className="flex-1 min-w-0">
                      <b className="block font-heading font-bold text-lg text-foreground">
                        {item.title}
                      </b>
                      <small className="block text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {item.desc}
                      </small>
                    </div>
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Dynamic Orbit Visualization */}
          <div className="relative flex items-center justify-center min-h-[400px] sm:min-h-[460px]">
            {/* Outer dashed ring */}
            <div className="absolute w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full border border-dashed border-border" />
            
            {/* Middle solid ring */}
            <div className="absolute w-[250px] h-[250px] sm:w-[315px] sm:h-[315px] rounded-full border border-border" />
            
            {/* Inner tinted ring */}
            <div className="absolute w-[170px] h-[170px] sm:w-[215px] sm:h-[215px] rounded-full bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20" />

            {/* Central Hub */}
            <div className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-[#111611] text-white flex flex-col items-center justify-center text-center p-3 shadow-2xl border border-emerald-900/40">
              <small className="text-[8px] font-bold tracking-widest text-emerald-400/80 uppercase">
                GYMODORO
              </small>
              <strong className="font-heading font-extrabold text-lg sm:text-xl text-emerald-300 my-1">
                {loopItems[selectedStep].title.toUpperCase()}
              </strong>
              <small className="text-[7px] tracking-wider text-muted-foreground">
                → MOVE → RECOVER →
              </small>
            </div>

            {/* Floating Orbs positioned around the circle */}
            <div className={`absolute top-6 sm:top-10 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-xl shadow-lg transition-transform duration-300 ${selectedStep === 0 ? "scale-125 border-primary ring-2 ring-primary/20" : ""}`}>
              🧠
            </div>
            <div className={`absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-xl shadow-lg transition-transform duration-300 ${selectedStep === 1 ? "scale-125 border-primary ring-2 ring-primary/20" : ""}`}>
              🏃
            </div>
            <div className={`absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-xl shadow-lg transition-transform duration-300 ${selectedStep === 2 ? "scale-125 border-primary ring-2 ring-primary/20" : ""}`}>
              ⚡
            </div>
            <div className={`absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-xl shadow-lg transition-transform duration-300 ${selectedStep === 3 ? "scale-125 border-primary ring-2 ring-primary/20" : ""}`}>
              🔁
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
