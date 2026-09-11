import { useEffect, useState } from "react";
import { RotateCcw, Pause, Play, Dice6, PictureInPicture2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExerciseType } from "@/types/exercise";
import GifLoop from "@/components/timer/GifLoop";
import TagList from "@/components/timer/TagList";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

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
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-lg",
        "border border-white/15 bg-black/35 backdrop-blur-md",
        "text-white text-sm font-semibold hover:bg-black/50 transition-colors"
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
  const [muscleDiagramOpen, setMuscleDiagramOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(true);

  // Mirrors the GIF box's actual rendered height onto the video box so the
  // two match exactly. flex-1 alone doesn't do this: the two columns carry
  // different amounts of surrounding content (tags/dropdowns/timer controls
  // on the right vs. just the activity buttons on the left), so they end up
  // with different leftover space. This only reads the GIF box's size via a
  // ref — GifLoop itself and its container are untouched.
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

  // The timer block (digits + controls) below the video needs to visibly
  // shrink on a shorter/laptop screen so the video — which already claims
  // "whatever's left" via flex-1 — gets first claim on the right column's
  // space instead of being squeezed to a sliver by a timer block sized for
  // a tall monitor. A fixed rem/vh size can't know that; this measures the
  // column's actual rendered height and scales the timer down from it
  // directly, the same ref-based approach as the GIF/video height match.
  const [rightColEl, setRightColEl] = useState<HTMLDivElement | null>(null);
  const [rightColHeight, setRightColHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!rightColEl) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setRightColHeight(entry.contentRect.height);
    });
    observer.observe(rightColEl);
    return () => observer.disconnect();
  }, [rightColEl]);

  // 9% of the column's height, floored/ceilinged to stay legible on very
  // short or very tall screens; description-open shrinks it further so it
  // never overlaps the content above (same intent as the old fixed clamp()).
  const timerFontPx =
    rightColHeight !== null
      ? Math.max(22, Math.min(72, rightColHeight * 0.09)) * (descriptionOpen ? 0.65 : 1)
      : null;
  // Controls (Reset/Start/PopOut/Finish) scale down together with the
  // digits — at 72px (the ceiling) they're full size; below that they scale
  // proportionally so a shrunk timer doesn't end up with oversized buttons.
  const timerScale = timerFontPx !== null ? Math.max(0.55, Math.min(1, timerFontPx / 72)) : 1;
  const controlBtnPx = Math.round(48 * timerScale);
  const controlIconPx = Math.round(18 * timerScale);

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

              <div
                ref={setGifBoxEl}
                className="w-full flex-1 min-h-0 rounded-lg overflow-hidden bg-black border border-white/10"
              >
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
                    <div className="flex justify-center rounded-lg overflow-hidden bg-black/20 border border-white/10 p-2">
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
        <div ref={setRightColEl} className="flex flex-col gap-4 overflow-y-auto pl-4">
          {activity && (
            <>
              <TagList exercise={activity} />

              <DropdownToggle
                label="Exercise Video"
                open={videoOpen}
                onToggle={() => setVideoOpen((o) => !o)}
              />
              {videoOpen && (
                <div
                  className="w-full flex-1 min-h-0 rounded-lg overflow-hidden bg-black border border-white/10"
                  style={gifBoxHeight !== null ? { maxHeight: gifBoxHeight } : undefined}
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

              <DropdownToggle
                label="Exercise Description"
                open={descriptionOpen}
                onToggle={onToggleDescription}
              />
              {descriptionOpen && (
                <div className="px-4 py-3 rounded-lg bg-black/30 backdrop-blur-md border border-white/10 text-white text-sm leading-relaxed max-h-40 overflow-y-auto">
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
              never be pushed into overlapping the content above it. Font
              size is driven by timerFontPx (measured off the actual column
              height, see its declaration above) rather than a fixed rem or
              vh guess, so the video above always gets first claim on the
              column's space and the timer visibly gives way on a
              shorter/laptop screen instead of crowding it out. mt-auto (no
              fixed mb-*) claims 100% of whatever's left below the content
              above, instead of stranding a constant chunk of it as dead
              space regardless of how much room actually remains. Buttons
              scale with controlBtnPx/controlIconPx so they shrink together
              with the digits rather than staying full-size next to a
              shrunk clock. */}
          <div className="flex flex-col items-center gap-3 mt-auto shrink-0 rounded-3xl px-8 py-4">
            <div
              className="font-bold text-white font-poppins drop-shadow-lg transition-[font-size]"
              style={{ fontSize: timerFontPx !== null ? `${timerFontPx}px` : "4.5rem" }}
            >
              {formatTime(remaining)}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onReset}
                aria-label="Reset"
                className={cn(
                  "rounded-full border border-white/25 bg-white/6",
                  "backdrop-blur-md text-white cursor-pointer flex items-center justify-center",
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
                  paddingInline: Math.round(36 * timerScale),
                  paddingBlock: Math.round(12 * timerScale),
                  fontSize: Math.round(16 * timerScale),
                }}
              >
                {running ? <Pause size={controlIconPx} /> : <Play size={controlIconPx} />}
                {running ? "Pause" : "Start"}
              </button>

              <button
                onClick={onPopOut}
                aria-label="Pop out timer"
                title="Pop out timer"
                className={cn(
                  "rounded-full border border-white/25 bg-white/6",
                  "backdrop-blur-md text-white cursor-pointer flex items-center justify-center",
                  "hover:bg-white/12 transition-colors"
                )}
                style={{ width: controlBtnPx, height: controlBtnPx }}
              >
                <PictureInPicture2 size={controlIconPx} className="stroke-2" />
              </button>

              <button
                onClick={onFinish}
                aria-label="Finish now"
                title="Finish now"
                className={cn(
                  "rounded-full border border-white/25 bg-white/6",
                  "backdrop-blur-md text-white cursor-pointer flex items-center justify-center",
                  "hover:bg-white/12 transition-colors"
                )}
                style={{ width: controlBtnPx, height: controlBtnPx }}
              >
                <ChevronRight size={controlIconPx + 2} className="stroke-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
