import { useEffect, useState } from "react";
import { RotateCcw, Pause, Play, Dice6, PictureInPicture2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExerciseType } from "@/types/exercise";
import GifLoop from "@/components/timer/GifLoop";
import TagList from "@/components/timer/TagList";
import { getYoutubeEmbedUrl } from "@/lib/youtube";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { GLASS_TIGHT } from "@/lib/glassPresets";

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
  compact = false,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  const glassRef = useLiquidGlass<HTMLButtonElement>(GLASS_TIGHT);
  return (
    <button
      ref={glassRef}
      onClick={onToggle}
      className={cn(
        "glass-tight flex items-center rounded-lg",
        "border border-white/15",
        "text-white font-semibold hover:bg-black/50 transition-colors",
        compact
          ? "w-fit gap-2 px-3 py-1.5 text-xs"
          : "w-full justify-between px-4 py-3 text-sm"
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
  onFinish: () => void;
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
  onFinish,
  onPopOut,
  contentLeft,
  activity,
  onActivityChange,
  onActivitySelect,
  descriptionOpen,
  onToggleDescription,
}: Props) {
  const [gifOpen, setGifOpen] = useState(true);
  const [videoOpen, setVideoOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [muscleDiagramOpen, setMuscleDiagramOpen] = useState(true);

  // Mirrors the GIF box's actual rendered height onto the muscle-diagram
  // image box so the two stay visually proportioned to each other. This only
  // reads the GIF box's size via a ref — GifLoop itself and its container
  // are untouched.
  //
  // A callback ref (state, not useRef) is required here: the GIF box only
  // exists in the DOM once `activity` has loaded, so a plain useRef+useEffect
  // with `[]` deps would run before that div ever mounts, see gifBoxEl stay
  // null forever, and never attach the observer. Using state for the node
  // means this effect re-runs the moment the div actually appears.
  const [gifBoxEl, setGifBoxEl] = useState<HTMLDivElement | null>(null);
  const [gifBoxHeight, setGifBoxHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!gifBoxEl) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setGifBoxHeight(entry.contentRect.height);
    });
    observer.observe(gifBoxEl);
    return () => observer.disconnect();
  }, [gifBoxEl]);

  const controlBtnPx = 48;
  const controlIconPx = 18;

  const rollDiceGlassRef = useLiquidGlass<HTMLButtonElement>(GLASS_TIGHT);
  const chooseActivityGlassRef = useLiquidGlass<HTMLButtonElement>(GLASS_TIGHT);
  const resetGlassRef = useLiquidGlass<HTMLButtonElement>(GLASS_TIGHT);
  const popOutGlassRef = useLiquidGlass<HTMLButtonElement>(GLASS_TIGHT);
  const finishGlassRef = useLiquidGlass<HTMLButtonElement>(GLASS_TIGHT);
  const descriptionGlassRef = useLiquidGlass<HTMLDivElement>(GLASS_TIGHT);

  return (
    <div
      className="absolute inset-0 flex flex-col z-10 pt-36 pl-6"
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
      <div className="grid grid-cols-2 gap-6 flex-1 overflow-y-auto pr-6 [scrollbar-gutter:stable] glass-scrollbar">
        {/* Left: Activity Selection */}
        <div className="flex flex-col gap-4 pr-4">
          <div className="flex gap-3">
            <button
              ref={rollDiceGlassRef}
              onClick={onActivityChange}
              className="glass-tight flex-1 px-4 py-3 rounded-lg border border-white/20 hover:bg-white/15 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Dice6 size={18} /> Roll The Dice
            </button>
            <button
              ref={chooseActivityGlassRef}
              onClick={onActivitySelect}
              className="glass-tight flex-1 px-4 py-3 rounded-lg border border-white/20 hover:bg-white/15 text-white font-bold text-sm transition-colors"
            >
              Choose Activity
            </button>
          </div>

          {activity && (
            <>
              <div className="text-2xl font-bold text-white font-poppins">
                {activity.name}
              </div>

              <div className="shrink-0 flex flex-col gap-2">
                <DropdownToggle
                  label="Exercise GIF"
                  open={gifOpen}
                  onToggle={() => setGifOpen((o) => !o)}
                />
                {gifOpen && (
                  <div
                    ref={setGifBoxEl}
                    className="w-full rounded-lg overflow-hidden bg-black border border-white/10 aspect-video"
                  >
                    {activity.gifUrl ? (
                      <GifLoop gifUrl={activity.gifUrl} className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50">
                        No preview available
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="shrink-0 flex flex-col gap-2">
                <DropdownToggle
                  label="Exercise Video"
                  open={videoOpen}
                  onToggle={() => setVideoOpen((o) => !o)}
                />
                {videoOpen && (
                  <div
                    className="w-full rounded-lg overflow-hidden bg-black border border-white/10 aspect-video"
                  >
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
              </div>
            </>
          )}
        </div>

        {/* Right: Timer and Image */}
        <div className="flex flex-col gap-4 pl-4">
          <div className="flex flex-col items-center gap-3 shrink-0 rounded-3xl px-8 py-4">
            <div
              className="font-bold text-white font-poppins drop-shadow-lg"
              style={{ fontSize: "4.5rem" }}
            >
              {formatTime(remaining)}
            </div>

            <div className="flex items-center gap-3">
              <button
                ref={resetGlassRef}
                onClick={onReset}
                aria-label="Reset"
                className={cn(
                  "glass-tight rounded-full border border-white/25",
                  "text-white cursor-pointer flex items-center justify-center",
                  "hover:bg-white/12 transition-colors"
                )}
                style={{ width: controlBtnPx, height: controlBtnPx }}
              >
                <RotateCcw size={controlIconPx} className="stroke-2" />
              </button>

              <button
                onClick={onToggleStart}
                className="rounded-full border-none bg-white text-black font-bold cursor-pointer font-poppins hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                style={{
                  paddingInline: 36,
                  paddingBlock: 12,
                  fontSize: 16,
                }}
              >
                {running ? <Pause size={controlIconPx} /> : <Play size={controlIconPx} />}
                {running ? "Pause" : "Start"}
              </button>

              <button
                ref={popOutGlassRef}
                onClick={onPopOut}
                aria-label="Pop out timer"
                title="Pop out timer"
                className={cn(
                  "glass-tight rounded-full border border-white/25",
                  "text-white cursor-pointer flex items-center justify-center",
                  "hover:bg-white/12 transition-colors"
                )}
                style={{ width: controlBtnPx, height: controlBtnPx }}
              >
                <PictureInPicture2 size={controlIconPx} className="stroke-2" />
              </button>

              <button
                ref={finishGlassRef}
                onClick={onFinish}
                aria-label="Finish now"
                title="Finish now"
                className={cn(
                  "glass-tight rounded-full border border-white/25",
                  "text-white cursor-pointer flex items-center justify-center",
                  "hover:bg-white/12 transition-colors"
                )}
                style={{ width: controlBtnPx, height: controlBtnPx }}
              >
                <ChevronRight size={controlIconPx + 2} className="stroke-2" />
              </button>
            </div>
          </div>

          {activity && (
            <>
              <div className="shrink-0 flex flex-col gap-2">
                <DropdownToggle
                  label="Tags"
                  open={tagsOpen}
                  onToggle={() => setTagsOpen((o) => !o)}
                  compact
                />
                {tagsOpen && <TagList exercise={activity} />}
              </div>

              <div className="shrink-0 flex flex-col gap-2">
                <DropdownToggle
                  label="Muscle Diagram"
                  open={muscleDiagramOpen}
                  onToggle={() => setMuscleDiagramOpen((o) => !o)}
                />
                {muscleDiagramOpen && (
                  <div
                    className="w-[60%] mx-auto flex-1 min-h-0 rounded-lg overflow-hidden bg-black border border-white/10"
                    style={gifBoxHeight !== null ? { maxHeight: gifBoxHeight * 0.6 } : undefined}
                  >
                    {activity.muscleDiagramUrl ? (
                      <img
                        src={activity.muscleDiagramUrl}
                        alt={`${activity.name} muscle diagram`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50">
                        No image available
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DropdownToggle
                label="Exercise Description"
                open={descriptionOpen}
                onToggle={onToggleDescription}
              />
              {descriptionOpen && (
                <div
                  ref={descriptionGlassRef}
                  className="glass-tight px-4 py-3 rounded-lg border border-white/10 text-white text-sm leading-relaxed"
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
        </div>
      </div>
    </div>
  );
}
