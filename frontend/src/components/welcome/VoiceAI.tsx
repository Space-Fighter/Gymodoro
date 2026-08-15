import { useState } from "react";

export default function VoiceAI() {
  const [isPlanBuilt, setIsPlanBuilt] = useState(false);

  const handleBuildPlan = () => {
    setIsPlanBuilt(true);
  };

  return (
    <section className="py-20 md:py-28 bg-card/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Voice Copy & Quote */}
          <div>
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              SPEAK. PLAN. MOVE.
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight mt-2 text-foreground mb-4">
              Let your voice<br />
              start the{" "}
              <span className="text-emerald-500 dark:text-emerald-400 not-italic">
                loop.
              </span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
              Say what needs to get done. Gymodoro extracts your tasks, prioritizes them, and gets you into focus — then knows when it&apos;s time to move.
            </p>

            {/* Try Saying Card */}
            <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <span className="text-2xl flex-shrink-0">🎙️</span>
              <div className="flex-1 min-w-0">
                <small className="block text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1">
                  TRY SAYING
                </small>
                <b className="font-medium text-sm sm:text-base text-foreground leading-snug">
                  “Finish the presentation, review the ML model, and call my teammate.”
                </b>
              </div>
              <span className="text-muted-foreground font-bold">→</span>
            </div>
          </div>

          {/* Right Column: AI Audio Wave Card Mockup */}
          <div>
            <div className="bg-[#111611] text-white border border-[#243524] rounded-3xl p-6 sm:p-8 shadow-2xl">
              
              {/* Header */}
              <div className="flex justify-between items-center text-[10px] tracking-widest text-[#899388] font-bold uppercase mb-6">
                <span>GYMODORO AI</span>
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  LISTENING
                </span>
              </div>

              {/* Sound Wave Equalizer */}
              <div className="h-28 flex items-center justify-center gap-2 mb-6">
                {[30, 48, 70, 36, 62, 85, 42, 68, 52, 38, 55].map((height, i) => (
                  <i
                    key={i}
                    style={{
                      height: `${height}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                    className="w-1.5 bg-emerald-400 rounded-full animate-wave-bar block"
                  />
                ))}
              </div>

              {/* Parsed Response Box */}
              <div className="bg-[#1d251d] border border-[#2b3a2b] rounded-xl p-4 flex items-center gap-3 mb-4">
                <span className="text-emerald-400 font-bold">✓</span>
                <strong className="text-xs sm:text-sm font-medium text-slate-100">
                  {isPlanBuilt
                    ? "Focus session initiated — 3 prioritized tasks locked."
                    : "3 tasks captured — ready to build your focus plan."}
                </strong>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleBuildPlan}
                disabled={isPlanBuilt}
                className={`w-full py-3.5 px-4 rounded-xl font-heading font-extrabold text-sm sm:text-base transition-all duration-200 cursor-pointer ${
                  isPlanBuilt
                    ? "bg-emerald-300 text-emerald-950 shadow-inner"
                    : "bg-emerald-400 hover:bg-emerald-300 text-slate-950 hover:shadow-lg hover:shadow-emerald-500/20"
                }`}
              >
                {isPlanBuilt ? "Plan created ✓" : "Build my plan →"}
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
