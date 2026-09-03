import { useState, useEffect, useRef, useCallback } from "react";
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
import { playChime, scheduleChime } from "@/lib/chime";
import { useTimerPopout } from "@/hooks/useTimerPopout";
import logo from "@/assets/gymodoro-logo.png";

const BACKGROUND_STORAGE_KEY = "gymodoro-background";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type TabType = "timer" | "workout" | "background" | "stats" | "settings";
type TimerMode = "focus" | "short" | "long";

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

  const modes = [
    { id: "focus" as const, label: "Focus", duration: focusMinutes },
    { id: "short" as const, label: "Short Break", duration: shortBreakMinutes },
    { id: "long" as const, label: "Long Break", duration: longBreakMinutes },
  ];

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
    if (!running) {
      deadlineRef.current = null;
      cancelScheduledChime();
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

    // Pre-schedule the end-of-phase chime on the audio clock so it rings at
    // the right instant even if this tab is backgrounded and JS timers freeze.
    if (deadlineRef.current !== null) {
      const secsLeft = Math.max(0, (deadlineRef.current - Date.now()) / 1000);
      cancelChimeRef.current = scheduleChime(isFocusMode, secsLeft);
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
    // Stopping because the countdown reached zero, not a derived render
    // computation — legitimate external (timer) sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRunning(false);
    // Rising tone when focus ends ("time to move"), falling tone when a
    // break ends ("back to focus") — gated by the Sound Effects setting.
    // If a chime was pre-scheduled on the audio clock it has already rung
    // (or is about to), so only play here when nothing was scheduled.
    if (!cancelChimeRef.current) playChime(isFocusMode);
    if (isFocusMode) {
      beginBreakForActiveSession();
    } else {
      completeActiveSession();
    }
  }, [remaining, running, isFocusMode, beginBreakForActiveSession, completeActiveSession]);

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
      cancelChimeRef.current = scheduleChime(isFocusMode, secsLeft);
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
        onClick={async () => {
          await logout();
          navigate("/welcome");
        }}
        className={cn(
          "absolute top-3 right-3 z-30 h-9 px-3 rounded-lg",
          "border border-white/15 bg-black/40 backdrop-blur-md",
          "flex items-center justify-center gap-1.5 text-white/70 text-sm font-semibold font-poppins",
          "hover:bg-black/60 hover:text-white transition-colors"
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
          onClick={() => setSidebarOpen(true)}
          className={cn(
            "absolute z-20 w-14 h-14 rounded-lg border border-white/15 backdrop-blur-md",
            "bg-transparent hover:bg-black/60 flex items-center justify-center",
            "text-white/70 transition-colors"
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
