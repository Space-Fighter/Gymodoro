import { useState } from "react";
import { RotateCcw, Pause, Play, Dice6, PictureInPicture2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExerciseType } from "@/types/exercise";
import GifLoop from "@/components/timer/GifLoop";
import TagList from "@/components/timer/TagList";
import { getYoutubeEmbedUrl } from "@/lib/youtube";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";

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

function DropdownToggle({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  const glassRef = useLiquidGlass<HTMLButtonElement>({ scale: -60, chroma: 4, blur: 4 });

  return (
    <button
      ref={glassRef}
      onClick={onToggle}
      className={cn(
        "glass-tight w-full flex items-center justify-between px-4 py-3 rounded-lg",
        "border border-white/15",
        "text-white text-sm font-semibold hover:brightness-125 transition-[filter]"
      )}
    >
      <span>{label}</span>
      <span className={cn("transition-transform", open ? "rotate-180" : "rotate-0")}>
        ▼
      </span>
    </button>
  );
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
  onPopOut?: () => void;
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
  onPopOut,
  contentLeft,
  activity,
  onActivityChange,
  onActivitySelect,
  descriptionOpen,
  onToggleDescription,
}: Props) {
  const [muscleDiagramOpen, setMuscleDiagramOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(true);

  const diceGlassRef = useLiquidGlass<HTMLButtonElement>({ scale: -70, chroma: 5, blur: 4 });
  const chooseGlassRef = useLiquidGlass<HTMLButtonElement>({ scale: -70, chroma: 5, blur: 4 });
  const muscleDiagramGlassRef = useLiquidGlass<HTMLDivElement>({ scale: -80, chroma: 5, blur: 4 });
  const descriptionGlassRef = useLiquidGlass<HTMLDivElement>({ scale: -80, chroma: 5, blur: 4 });
  const controlDeckGlassRef = useLiquidGlass<HTMLDivElement>({
    scale: -100,
    chroma: 5,
    mapBlur: 18,
    blur: 5,
    saturate: 1.4,
  });
  const resetGlassRef = useLiquidGlass<HTMLButtonElement>({ scale: -60, chroma: 4, blur: 3 });
  const popOutGlassRef = useLiquidGlass<HTMLButtonElement>({ scale: -60, chroma: 4, blur: 3 });

  return (
    <div
      className="absolute inset-0 flex flex-col z-10 pt-36 px-6"
      style={{ left: contentLeft, transition: "left 0.25s ease" }}
    >
      {/* Mode Dots */}
      <div className="absolute top-[60px] left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-20">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSwitchMode(mode.id)}
            className="w-8 h-8 rounded-full border-none cursor-pointer p-0 bg-transparent flex items-center justify-center hover:opacity-80 transition-opacity"
            type="button"
          >
            <span
              className={cn(
                "rounded-full block pointer-events-none transition-all",
                timerMode === mode.id
                  ? "w-4 h-4 bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.9)]"
                  : "w-3.5 h-3.5 bg-white/55 shadow-[0_0_0_1.5px_rgba(0,0,0,0.35)]"
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
              ref={diceGlassRef}
              onClick={onActivityChange}
              className="glass-tight flex-1 px-4 py-3 rounded-lg border border-white/20 hover:brightness-125 text-white font-bold text-sm transition-[filter] flex items-center justify-center gap-2"
            >
              <Dice6 size={18} /> Roll The Dice
            </button>
            <button
              ref={chooseGlassRef}
              onClick={onActivitySelect}
              className="glass-tight flex-1 px-4 py-3 rounded-lg border border-white/20 hover:brightness-125 text-white font-bold text-sm transition-[filter]"
            >
              Choose Activity
            </button>
          </div>

          {activity && (
            <>
              <div className="text-2xl font-bold text-white font-poppins">
                {activity.name}
              </div>

              <div className="w-full flex-1 min-h-0 rounded-lg overflow-hidden bg-black border border-white/10">
                {activity.gifUrl ? (
                  <GifLoop gifUrl={activity.gifUrl} className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50">
                    No preview available
                  </div>
                )}
              </div>

              {activity.muscleDiagramUrl && (
                <div className="mt-auto shrink-0 flex flex-col gap-2">
                  <DropdownToggle
                    label="Muscle Diagram"
                    open={muscleDiagramOpen}
                    onToggle={() => setMuscleDiagramOpen((o) => !o)}
                  />
                  {muscleDiagramOpen && (
                    <div
                      ref={muscleDiagramGlassRef}
                      className="glass-tight flex justify-center rounded-lg overflow-hidden border border-white/10 p-2"
                    >
                      <img
                        src={activity.muscleDiagramUrl}
                        alt={`${activity.name} muscle diagram`}
                        className="max-w-[180px] w-full h-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Timer and Video */}
        <div className="flex flex-col gap-4 overflow-y-auto pl-4">
          {activity && (
            <>
              <TagList exercise={activity} />

              <DropdownToggle
                label="Exercise Video"
                open={videoOpen}
                onToggle={() => setVideoOpen((o) => !o)}
              />
              {videoOpen && (
                <div className="rounded-lg overflow-hidden aspect-video bg-black border border-white/10">
                  {activity.videoUrl ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={getYoutubeEmbedUrl(activity.videoUrl) || ""}
                      title="exercise video"
                      frameBorder="0"
                      allow="encrypted-media; accelerometer; autoplay; clipboard-write; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50">
                      No video available
                    </div>
                  )}
                </div>
              )}

              <DropdownToggle
                label="Exercise Description"
                open={descriptionOpen}
                onToggle={onToggleDescription}
              />
              {descriptionOpen && (
                <div
                  ref={descriptionGlassRef}
                  className="glass-tight px-4 py-3 rounded-lg border border-white/10 text-white text-sm leading-relaxed max-h-40 overflow-y-auto"
                >
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
            </>
          )}

          {/* Timer — shrinks when the description panel is open so it can
              never be pushed into overlapping the content above it. */}
          <div
            ref={controlDeckGlassRef}
            className={cn(
              "glass flex flex-col items-center gap-4 mt-auto shrink-0 rounded-3xl px-8 py-6 transition-[margin]",
              descriptionOpen ? "mb-6" : "mb-12"
            )}
          >
            <div
              className="font-bold text-white font-poppins drop-shadow-lg transition-[font-size]"
              style={{ fontSize: descriptionOpen ? "3rem" : "4.5rem" }}
            >
              {formatTime(remaining)}
            </div>

            <div className="flex items-center gap-3">
              <button
                ref={resetGlassRef}
                onClick={onReset}
                aria-label="Reset"
                className={cn(
                  "glass-tight w-12 h-12 rounded-full border border-white/25",
                  "text-white cursor-pointer flex items-center justify-center",
                  "hover:brightness-125 transition-[filter]"
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

              <button
                ref={popOutGlassRef}
                onClick={onPopOut}
                aria-label="Pop out timer"
                title="Pop out timer"
                className={cn(
                  "glass-tight w-12 h-12 rounded-full border border-white/25",
                  "text-white cursor-pointer flex items-center justify-center",
                  "hover:brightness-125 transition-[filter]"
                )}
              >
                <PictureInPicture2 size={18} className="stroke-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
