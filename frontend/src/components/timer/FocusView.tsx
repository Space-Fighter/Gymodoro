import { RotateCcw, Play, Pause, Expand } from "lucide-react";
import { cn } from "@/lib/utils";

interface Mode {
  id: "focus" | "short" | "long";
  label: string;
  duration: number;
}

interface Props {
  modes: Mode[];
  timerMode: "focus" | "short" | "long";
  remaining: number;
  running: boolean;
  formatTime: (seconds: number) => string;
  onSwitchMode: (mode: "focus" | "short" | "long") => void;
  onToggleStart: () => void;
  onReset: () => void;
  onAddTime: (minutes: number) => void;
  contentLeft: string;
}

export default function FocusView({
  modes,
  timerMode,
  remaining,
  running,
  formatTime,
  onSwitchMode,
  onToggleStart,
  onReset,
  onAddTime,
  contentLeft,
}: Props) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4 py-20"
      style={{ left: contentLeft, transition: "left 0.25s ease" }}
    >
      {/* Mode Dots */}
      <div className="flex items-center justify-center gap-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSwitchMode(mode.id)}
            className="w-14 h-14 rounded-full border-none cursor-pointer p-0 bg-transparent flex items-center justify-center hover:opacity-80 transition-opacity"
            type="button"
          >
            <span
              className={cn(
                "rounded-full block pointer-events-none transition-all",
                timerMode === mode.id
                  ? "w-7 h-7 bg-white shadow-[0_0_0_3px_rgba(255,255,255,0.9)]"
                  : "w-6 h-6 bg-white/55 shadow-[0_0_0_2px_rgba(0,0,0,0.35)]"
              )}
            />
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="text-9xl leading-none font-bold font-poppins text-white drop-shadow-lg">
        {formatTime(remaining)}
      </div>

      {/* Add Time Buttons */}
      <div className="flex items-center gap-2">
        {[1, 5, 10].map((mins) => (
          <button
            key={mins}
            onClick={() => onAddTime(mins)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-semibold font-poppins",
              "border border-white/30 bg-white/10 backdrop-blur-md",
              "text-white/85 cursor-pointer hover:bg-white/20 transition-colors"
            )}
          >
            +{mins}
          </button>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3.5 mt-2">
        <button
          onClick={onReset}
          aria-label="Reset"
          className={cn(
            "w-12 h-12 rounded-full border border-white/25 bg-white/6",
            "backdrop-blur-md text-white cursor-pointer flex items-center justify-center",
            "hover:bg-white/12 transition-colors"
          )}
        >
          <RotateCcw size={20} className="stroke-2" />
        </button>

        <button
          onClick={onToggleStart}
          className={cn(
            "px-14 py-3.5 rounded-full border-none bg-white text-black",
            "text-lg font-bold cursor-pointer font-poppins",
            "hover:bg-white/90 transition-colors shadow-lg",
            "flex items-center justify-center gap-2"
          )}
        >
          {running ? <Pause size={20} /> : <Play size={20} />}
          {running ? "Pause" : "Start"}
        </button>

        <button
          aria-label="Expand"
          className={cn(
            "w-12 h-12 rounded-full border border-white/25 bg-white/6",
            "backdrop-blur-md text-white cursor-pointer flex items-center justify-center",
            "hover:bg-white/12 transition-colors"
          )}
        >
          <Expand size={18} className="stroke-2" />
        </button>
      </div>

      {/* Mode Label */}
      <div className="text-sm text-white/50 font-semibold font-poppins mt-1">
        {modes.find((m) => m.id === timerMode)?.label}
      </div>
    </div>
  );
}
