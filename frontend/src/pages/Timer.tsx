import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/timer/Sidebar";
import FocusView from "@/components/timer/FocusView";
import BreakView from "@/components/timer/BreakView";
import WorkoutLibrary from "@/components/timer/WorkoutLibrary";
import BackgroundView from "@/components/timer/BackgroundView";
import SettingsView from "@/components/timer/SettingsView";
import { useExercises } from "@/hooks/useExercises";
import { getBackgroundById, DEFAULT_BACKGROUND_ID } from "@/components/timer/backgrounds";
import StatsView from "@/components/stats/StatsView";
import { playAlarmChime, scheduleAlarmChime } from "@/lib/chime";
import { getAutoStartBreaksEnabled } from "@/lib/timerSettings";
import { useTimerPopout } from "@/hooks/useTimerPopout";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import logo from "@/assets/gymodoro-logo.png";

const BACKGROUND_STORAGE_KEY = "gymodoro-background";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type TabType = "timer" | "workout" | "background" | "stats" | "settings";
type TimerMode = "focus" | "short" | "long";

// Standard Pomodoro cycle: focus -> short break, repeated, but every 4th
// focus session is followed by a long break instead. Breaks always return
// to focus. `completedFocusCount` is the number of focus sessions finished
// so far (including the one that just ended).
function getNextTimerMode(current: TimerMode, completedFocusCount: number): TimerMode {
  if (current !== "focus") return "focus";
  return completedFocusCount % 4 === 0 ? "long" : "short";
}

interface Props {
  focusMinutes?: number;
  shortBreakMinutes?: number;
  longBreakMinutes?: number;
}

export default function Timer({
  focusMinutes = 25,
  shortBreakMinutes = 5,
  longBreakMinutes = 15,
}: Props) {
  const navigate = useNavigate();
  const { logout, getAccessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("timer");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timerMode, setTimerMode] = useState<TimerMode>("focus");
  const [remaining, setRemaining] = useState(focusMinutes * 60);
  const [running, setRunning] = useState(false);
  const [activityIdx, setActivityIdx] = useState(0);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  // Tracks the backend Session for the pomodoro cycle currently in flight, so
  // the stats endpoint has real data to aggregate instead of always zeros.
  const activeSessionRef = useRef<{ id: string; phase: "focus" | "break" } | null>(null);
  const [backgroundId, setBackgroundId] = useState(() => {
    try {
      return localStorage.getItem(BACKGROUND_STORAGE_KEY) || DEFAULT_BACKGROUND_ID;
    } catch {
      return DEFAULT_BACKGROUND_ID;
    }
  });
  const timerInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  // Wall-clock instant the current run should hit 0, in ms (Date.now() epoch).
  // The countdown is derived from this, not from counting ticks, so background-
  // tab throttling / frozen timers can't make the clock drift.
  const deadlineRef = useRef<number | null>(null);
  // Cancels the chime pre-scheduled on the audio clock for the current run.
  const cancelChimeRef = useRef<(() => void) | null>(null);
  // Number of focus sessions completed so far this cycle — every 4th one
  // triggers a long break instead of a short one (see getNextTimerMode).
  const focusCountRef = useRef(0);

  const { exercises, loading } = useExercises();

  // Randomize the initial activity once exercises finish loading. This has
  // to live in an effect rather than during render: Math.random() is impure,
  // and render must stay pure/idempotent.
  useEffect(() => {
    if (exercises.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActivityIdx(Math.floor(Math.random() * exercises.length));
    }
  }, [exercises.length]);

  useEffect(() => {
    try {
      localStorage.setItem(BACKGROUND_STORAGE_KEY, backgroundId);
    } catch {
      // localStorage unavailable (private browsing, etc.) — selection just won't persist
    }
  }, [backgroundId]);

  // Memoized so the auto-advance effect below (which depends on it) doesn't
  // re-run on every render — only when the configured durations change.
  const modes = useMemo(
    () => [
      { id: "focus" as const, label: "Focus", duration: focusMinutes },
      { id: "short" as const, label: "Short Break", duration: shortBreakMinutes },
      { id: "long" as const, label: "Long Break", duration: longBreakMinutes },
    ],
    [focusMinutes, shortBreakMinutes, longBreakMinutes]
  );

  const currentMode = modes.find((m) => m.id === timerMode)!;
  const currentActivity = exercises[activityIdx] || null;
  const isFocusMode = timerMode === "focus";

  // Session persistence: mirrors the timer's own state into the backend so
  // GET /api/sessions/stats has real data. Best-effort — failures here
  // shouldn't interrupt the (purely client-side) countdown itself.
  const authedFetch = useCallback(
    (path: string, init?: RequestInit) => {
      const token = getAccessToken();
      if (!token) return null;
      return fetch(`${API_URL}${path}`, {
        ...init,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...init?.headers,
        },
      });
    },
    [getAccessToken]
  );

  const startFocusSession = useCallback(async () => {
    const res = authedFetch("/api/sessions", {
      method: "POST",
      body: JSON.stringify({
        workDuration: focusMinutes,
        breakDuration: timerMode === "long" ? longBreakMinutes : shortBreakMinutes,
      }),
    });
    if (!res) return;
    try {
      const response = await res;
      if (!response.ok) return;
      const data = await response.json();
      activeSessionRef.current = { id: data.session.id, phase: "focus" };
    } catch {
      // Best-effort: keep the countdown running even if this failed.
    }
  }, [authedFetch, focusMinutes, longBreakMinutes, shortBreakMinutes, timerMode]);

  const beginBreakForActiveSession = useCallback(() => {
    const active = activeSessionRef.current;
    if (!active || active.phase !== "focus") return;
    const res = authedFetch(`/api/sessions/${active.id}/start-break`, { method: "PATCH" });
    if (res) res.catch(() => {});
    activeSessionRef.current = { id: active.id, phase: "break" };
  }, [authedFetch]);

  const completeActiveSession = useCallback(() => {
    const active = activeSessionRef.current;
    if (!active) return;
    const res = authedFetch(`/api/sessions/${active.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "completed" }),
    });
    if (res) res.catch(() => {});
    activeSessionRef.current = null;
  }, [authedFetch]);

  const abandonActiveSession = useCallback(() => {
    const active = activeSessionRef.current;
    if (!active) return;
    const res = authedFetch(`/api/sessions/${active.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "abandoned" }),
    });
    if (res) res.catch(() => {});
    activeSessionRef.current = null;
  }, [authedFetch]);

  const cancelScheduledChime = useCallback(() => {
    cancelChimeRef.current?.();
    cancelChimeRef.current = null;
  }, []);

  useEffect(() => {
    // Clear any chime left over from the previous transition first — e.g. the
    // end-of-phase alarm can still be ringing when the next phase starts.
    cancelScheduledChime();

    // Every re-run of this effect starts tracking a *new* countdown period
    // (a fresh manual start/resume, or the next auto-advanced phase) and
    // must anchor the deadline fresh from the `remaining` value that was
    // just set for it — never carry over the previous phase's deadline.
    // Without this, when auto-advance keeps `running` true across a
    // transition (isFocusMode still changes, so this effect does re-run,
    // but `running`'s own value doesn't), the old deadline stayed non-null
    // from the phase that just ended, so `syncFromDeadline` below skipped
    // its "anchor fresh" branch and immediately clamped the brand-new
    // phase's countdown back to 0 — instantly completing it again, and
    // again, in a tight loop (the flicker + rapid-fire alarm reported).
    deadlineRef.current = null;

    if (!running) {
      return;
    }

    // Recompute `remaining` from the deadline. Safe to call from a throttled
    // tick, from visibilitychange, or on a fresh start — it always reflects
    // real elapsed time.
    const syncFromDeadline = () => {
      if (deadlineRef.current === null) {
        // First run of this effect (start / resume): anchor the deadline to
        // the value the countdown currently shows.
        deadlineRef.current = Date.now() + remaining * 1000;
        return;
      }
      const secsLeft = Math.max(
        0,
        Math.round((deadlineRef.current - Date.now()) / 1000)
      );
      setRemaining(secsLeft);
    };

    syncFromDeadline();

    // Pre-schedule the end-of-phase alarm on the audio clock so it rings at
    // the right instant (and keeps ringing for a while) even if this tab is
    // backgrounded and JS timers freeze.
    if (deadlineRef.current !== null) {
      const secsLeft = Math.max(0, (deadlineRef.current - Date.now()) / 1000);
      cancelChimeRef.current = scheduleAlarmChime(isFocusMode, secsLeft);
    }

    timerInterval.current = setInterval(syncFromDeadline, 250);
    document.addEventListener("visibilitychange", syncFromDeadline);

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      document.removeEventListener("visibilitychange", syncFromDeadline);
      cancelScheduledChime();
    };
    // `remaining` is intentionally read only to anchor the deadline on the
    // first run; adding it to deps would restart the interval every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, isFocusMode, cancelScheduledChime]);

  // Fires the phase-completion side effect exactly once when the countdown
  // reaches 0 — kept out of the setRemaining updater above, since StrictMode
  // double-invokes updater functions in dev to catch impure ones like that.
  useEffect(() => {
    if (!running || remaining > 0) return;
    // Rising tone when focus ends ("time to move"), falling tone when a
    // break ends ("back to focus") — gated by the Sound Effects setting.
    // If a chime was pre-scheduled on the audio clock it has already rung
    // (or is about to); only start it here when nothing was scheduled. It
    // keeps ringing for ~30s, or until the next phase starts (whichever is
    // first — starting a phase cancels it via the running-effect above).
    if (!cancelChimeRef.current) {
      cancelChimeRef.current = playAlarmChime(isFocusMode);
    }

    if (isFocusMode) {
      beginBreakForActiveSession();
      focusCountRef.current += 1;
    } else {
      completeActiveSession();
    }

    // Auto-advance through the Pomodoro cycle: focus -> short break (long
    // break every 4th focus session) -> focus -> ... Whether the next phase
    // starts counting down immediately is gated by the Auto-start breaks
    // setting; when it's off the countdown just resets to the next phase,
    // paused, same as a manual mode switch.
    const nextId = getNextTimerMode(timerMode, focusCountRef.current);
    const nextModeDef = modes.find((m) => m.id === nextId);
    if (!nextModeDef) {
      setRunning(false);
      return;
    }
    const autoStart = getAutoStartBreaksEnabled();
    setTimerMode(nextId);
    setRemaining(nextModeDef.duration * 60);
    setRunning(autoStart);
    if (autoStart && nextId === "focus") startFocusSession();
  }, [
    remaining,
    running,
    isFocusMode,
    timerMode,
    modes,
    beginBreakForActiveSession,
    completeActiveSession,
    startFocusSession,
  ]);

  const toggleStart = useCallback(() => {
    const next = !running;
    if (
      next &&
      isFocusMode &&
      remaining === currentMode.duration * 60 &&
      !activeSessionRef.current
    ) {
      startFocusSession();
    }
    setRunning(next);
  }, [running, isFocusMode, remaining, currentMode.duration, startFocusSession]);

  const switchMode = (id: TimerMode) => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    // Silence an end-of-phase alarm still ringing from the phase being left —
    // running is already false at that point, so the running-effect above
    // won't fire to cancel it on its own.
    cancelScheduledChime();
    const mode = modes.find((m) => m.id === id);
    if (mode) {
      const activePhase = activeSessionRef.current?.phase;
      if (isFocusMode && id !== "focus" && activePhase === "focus") {
        beginBreakForActiveSession();
      } else if (!isFocusMode && id === "focus" && activePhase === "break") {
        completeActiveSession();
      }
      setTimerMode(id);
      setRemaining(mode.duration * 60);
      setRunning(false);
    }
  };

  const reset = () => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    // Same reasoning as switchMode above — silence any ringing alarm.
    cancelScheduledChime();
    if (activeSessionRef.current) abandonActiveSession();
    setRemaining(currentMode.duration * 60);
    setRunning(false);
  };

  const addTime = (minutes: number) => {
    setRemaining((prev) => prev + minutes * 60);
    // Keep the deadline in sync while running, otherwise the next tick would
    // immediately overwrite the added time.
    if (deadlineRef.current !== null) {
      deadlineRef.current += minutes * 60 * 1000;
      // The pre-scheduled chime is now at the wrong instant — cancel and
      // re-schedule it for the new deadline.
      cancelScheduledChime();
      const secsLeft = Math.max(0, (deadlineRef.current - Date.now()) / 1000);
      cancelChimeRef.current = scheduleAlarmChime(isFocusMode, secsLeft);
    }
  };

  const formatTime = (seconds: number) => {
    const s = Math.max(0, seconds);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const { popOut: popOutTimer } = useTimerPopout({
    remaining,
    running,
    label: currentMode.label,
    backgroundUrl: getBackgroundById(backgroundId).imageUrl,
    formatTime,
    onToggleStart: toggleStart,
    onReset: reset,
  });

  const contentLeft = sidebarOpen ? "260px" : "90px";
  const logoutGlassRef = useLiquidGlass<HTMLButtonElement>({ scale: -60, chroma: 3, blur: 4 });
  const collapsedToggleGlassRef = useLiquidGlass<HTMLButtonElement>({ scale: -60, chroma: 3, blur: 4 });

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          backgroundImage: `url("${getBackgroundById(backgroundId).imageUrl}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Logo */}
      <div className="absolute -top-6 left-0 z-30 flex items-center gap-0 pointer-events-none">
        <img src={logo} alt="Gymodoro" className="w-[135px] h-[135px] object-contain" />
        <span className="text-white font-extrabold tracking-wide text-2xl font-poppins -ml-2">
          GYMODORO
        </span>
      </div>

      {/* Logout Button */}
      <button
        ref={logoutGlassRef}
        onClick={async () => {
          await logout();
          navigate("/welcome");
        }}
        className={cn(
          "glass-tight absolute top-3 right-3 z-30 h-9 px-3 rounded-lg",
          "border border-white/15",
          "flex items-center justify-center gap-1.5 text-white/70 text-sm font-semibold font-poppins",
          "hover:text-white transition-colors"
        )}
        aria-label="Logout"
      >
        <LogOut size={16} className="stroke-2" />
        <span>Logout</span>
      </button>

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
      />

      {/* Collapsed Toggle Button */}
      {!sidebarOpen && (
        <button
          ref={collapsedToggleGlassRef}
          onClick={() => setSidebarOpen(true)}
          className={cn(
            "glass-tight absolute z-20 w-14 h-14 rounded-lg border border-white/15",
            "hover:brightness-125 flex items-center justify-center",
            "text-white/70 transition-[filter]"
          )}
          style={{ left: "16px", top: "116px" }}
        >
          <Menu size={18} className="stroke-2" />
        </button>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 h-screen w-full">
        {/* Timer View */}
        {activeTab === "timer" && (
          <>
            {isFocusMode ? (
              <div className="absolute inset-0 -translate-y-[25px]">
                <FocusView
                  modes={modes}
                  timerMode={timerMode}
                  remaining={remaining}
                  running={running}
                  formatTime={formatTime}
                  onSwitchMode={switchMode}
                  onToggleStart={toggleStart}
                  onReset={reset}
                  onAddTime={addTime}
                  onPopOut={popOutTimer}
                  contentLeft={contentLeft}
                />
              </div>
            ) : (
              <div className="absolute inset-0 -translate-y-[60px]">
                <BreakView
                  modes={modes}
                  timerMode={timerMode}
                  remaining={remaining}
                  running={running}
                  formatTime={formatTime}
                  onSwitchMode={switchMode}
                  onToggleStart={toggleStart}
                  onReset={reset}
                  onPopOut={popOutTimer}
                  contentLeft={contentLeft}
                  activity={currentActivity}
                  onActivityChange={() =>
                    setActivityIdx(
                      Math.floor(Math.random() * exercises.length)
                    )
                  }
                  onActivitySelect={() => setActiveTab("workout")}
                  descriptionOpen={descriptionOpen}
                  onToggleDescription={() => setDescriptionOpen(!descriptionOpen)}
                />
              </div>
            )}
          </>
        )}

        {/* Workout Library View */}
        {activeTab === "workout" && (
          <WorkoutLibrary
            exercises={exercises}
            loading={loading}
            contentLeft={contentLeft}
            onSelectActivity={(idx) => {
              setActivityIdx(idx);
              // Switch to break mode if in focus mode
              if (timerMode === "focus") {
                switchMode("short");
              }
              setActiveTab("timer");
            }}
          />
        )}

        {/* Background View */}
        {activeTab === "background" && (
          <BackgroundView
            contentLeft={contentLeft}
            selectedId={backgroundId}
            onSelect={setBackgroundId}
          />
        )}

        {/* Activities Summary View */}
        {activeTab === "stats" && <StatsView contentLeft={contentLeft} />}

        {/* Settings View */}
        {activeTab === "settings" && (
          <SettingsView contentLeft={contentLeft} />
        )}
      </div>
    </div>
  );
}
