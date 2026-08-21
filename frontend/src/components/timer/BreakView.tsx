import { RotateCcw, Pause, Play, Dice6 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExerciseType } from "@/types/exercise";
import GifLoop from "@/components/timer/GifLoop";
import TagList from "@/components/timer/TagList";

interface Mode {
  id: "focus" | "short" | "long";
  label: string;
  duration: number;
}

// Descriptions come from the DB as one unbroken paragraph — split on
// sentence-ending periods so they can render as a bullet list.
function descriptionToBullets(description: string): string[] {
  return description
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
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
  contentLeft: string;
  activity: ExerciseType | null;
  onActivityChange: () => void;
  onActivitySelect: () => void;
  descriptionOpen: boolean;
  onToggleDescription: () => void;
}

export default function BreakView({
  modes,
  timerMode,
  remaining,
  running,
  formatTime,
  onSwitchMode,
  onToggleStart,
  onReset,
  contentLeft,
  activity,
  onActivityChange,
  onActivitySelect,
  descriptionOpen,
  onToggleDescription,
}: Props) {
  return (
    <div
      className="absolute inset-0 flex flex-col z-10 pt-10 px-6"
      style={{ left: contentLeft, transition: "left 0.25s ease" }}
    >
      {/* Mode Dots */}
      <div className="flex items-center justify-center gap-4 mb-8">
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Left: Activity Selection */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-4">
          <div className="flex gap-3">
            <button
              onClick={onActivityChange}
              className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/15 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
            >
              <Dice6 size={18} /> Roll The Dice
            </button>
            <button
              onClick={onActivitySelect}
              className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/15 text-white font-bold text-sm transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
            >
              Choose Activity
            </button>
          </div>

          {activity && (
            <>
              <div className="text-2xl font-bold text-white font-poppins">
                {activity.name}
              </div>

              <TagList exercise={activity} />

              <div className="rounded-lg overflow-hidden aspect-video bg-black border border-white/10">
                {activity.gifUrl ? (
                  <GifLoop gifUrl={activity.gifUrl} className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50">
                    No preview available
                  </div>
                )}
              </div>

              {activity.muscleDiagramUrl && (
                <div className="flex justify-center rounded-lg overflow-hidden bg-black/20 border border-white/10 p-2">
                  <img
                    src={activity.muscleDiagramUrl}
                    alt={`${activity.name} muscle diagram`}
                    className="max-w-[240px] w-full h-auto object-contain"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Timer and Video */}
        <div className="flex flex-col gap-4 overflow-y-auto pl-4">
          {activity && (
            <>
              <button
                onClick={onToggleDescription}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg",
                  "border border-white/15 bg-black/35 backdrop-blur-md",
                  "text-white text-sm font-semibold hover:bg-black/50 transition-colors"
                )}
              >
                <span>Exercise Description</span>
                <span
                  className={cn(
                    "transition-transform",
                    descriptionOpen ? "rotate-180" : "rotate-0"
                  )}
                >
                  ▼
                </span>
              </button>

              {descriptionOpen && (
                <div className="px-4 py-3 rounded-lg bg-black/30 backdrop-blur-md border border-white/10 text-white text-sm leading-relaxed">
                  {activity.description ? (
                    <ul className="list-disc pl-5 space-y-1.5">
                      {descriptionToBullets(activity.description).map((sentence, i) => (
                        <li key={i}>{sentence}</li>
                      ))}
                    </ul>
                  ) : (
                    "No description available"
                  )}
                </div>
              )}

              <div className="rounded-lg overflow-hidden aspect-video bg-black border border-white/10">
                {activity.videoUrl ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={activity.videoUrl}
                    title="exercise video"
                    frameBorder="0"
                    allow="encrypted-media"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50">
                    No video available
                  </div>
                )}
              </div>
            </>
          )}

          {/* Timer */}
          <div className="flex flex-col items-center gap-4 mt-auto mb-12">
            <div className="text-7xl font-bold text-white font-poppins drop-shadow-lg">
              {formatTime(remaining)}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onReset}
                aria-label="Reset"
                className={cn(
                  "w-12 h-12 rounded-full border border-white/25 bg-white/6",
                  "backdrop-blur-md text-white cursor-pointer flex items-center justify-center",
                  "hover:bg-white/12 transition-colors"
                )}
              >
                <RotateCcw size={18} className="stroke-2" />
              </button>

              <button
                onClick={onToggleStart}
                className="px-9 py-3 rounded-full border-none bg-white text-black font-bold cursor-pointer font-poppins hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                {running ? <Pause size={18} /> : <Play size={18} />}
                {running ? "Pause" : "Start"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
