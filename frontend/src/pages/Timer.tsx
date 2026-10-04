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
import {
  getBackgroundById,
  DEFAULT_BACKGROUND_ID,
  DEFAULT_BACKGROUND_POSITION,
} from "@/components/timer/backgrounds";
import StatsView from "@/components/stats/StatsView";
import { playAlarmChime, preloadRingSound, scheduleAlarmChime } from "@/lib/chime";
import { getAutoStartBreaksEnabled } from "@/lib/timerSettings";
import { useTimerPopout } from "@/hooks/useTimerPopout";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { GLASS_TIGHT } from "@/lib/glassPresets";
import logo from "@/assets/brand/gymodoro-logo.png";

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

  // Fetch + decode the chosen ring now so it can fire the instant a phase ends.
  useEffect(() => {
    preloadRingSound();
  }, []);
  // Number of focus sessions completed so far this cycle — every 4th one
  // triggers a long break instead of a short one (see getNextTimerMode).
  const focusCountRef = useRef(0);
  // Set by finishNow just before it forces `remaining` to 0, so the
  // phase-completion effect below records the time actually spent instead
  // of the full phase duration. Null means "completed naturally in full."
  const finishEarlyMinutesRef = useRef<number | null>(null);
  // Set by the phase-completion effect right before it advances to the next
  // phase, and read (then cleared) by the countdown effect right below it.
  // Distinguishes "the next phase is starting because a phase just legitimately
  // ended" from "the user did something" (pressed Play, paused mid-countdown,
  // switched modes) — only the latter should interrupt the end-of-phase
  // alarm. Without this, auto-start breaks cut the alarm off after a single
  // beep, because advancing to the next phase always changes `isFocusMode`,
  // which the countdown effect treats as a reason to silence it.
  const advancingAfterCompletionRef = useRef(false);
  // Set by finishNow to force the next phase to land paused, ignoring the
  // Auto-start breaks setting — skipping to the end early is itself already
  // a manual override, and shouldn't also auto-launch the next countdown.
  const suppressAutoStartRef = useRef(false);

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

  // `workMinutesOverride` records the actual time spent, not the full phase
  // duration — used when a phase is finished early (see finishNow below).
  const beginBreakForActiveSession = useCallback(
    (workMinutesOverride?: number) => {
      const active = activeSessionRef.current;
      if (!active || active.phase !== "focus") return;
      if (workMinutesOverride !== undefined) {
        const workRes = authedFetch(`/api/sessions/${active.id}`, {
          method: "PATCH",
          body: JSON.stringify({ workDuration: workMinutesOverride }),
        });
        if (workRes) workRes.catch(() => {});
      }
      const res = authedFetch(`/api/sessions/${active.id}/start-break`, { method: "PATCH" });
      if (res) res.catch(() => {});
      activeSessionRef.current = { id: active.id, phase: "break" };
    },
    [authedFetch]
  );

  // `breakMinutesOverride` records the actual time spent, not the full phase
  // duration — used when a phase is finished early (see finishNow below).
  const completeActiveSession = useCallback(
    (breakMinutesOverride?: number) => {
      const active = activeSessionRef.current;
      if (!active) return;
      const body: Record<string, unknown> = { status: "completed" };
      if (breakMinutesOverride !== undefined) body.breakDuration = breakMinutesOverride;
      const res = authedFetch(`/api/sessions/${active.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      if (res) res.catch(() => {});
      activeSessionRef.current = null;
    },
    [authedFetch]
  );

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
    // Only silence a still-ringing/pre-scheduled chime when this re-run is a
    // genuine user action (pressing Play, pausing mid-countdown, switching
    // modes) — not when it's an auto-started next phase immediately
    // following a completion. See advancingAfterCompletionRef's declaration.
    const isPhaseCompletionAdvance = advancingAfterCompletionRef.current;
    advancingAfterCompletionRef.current = false;
    if (!isPhaseCompletionAdvance) {
      cancelScheduledChime();
    }

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
      cancelChimeRef.current = scheduleAlarmChime(secsLeft);
    }

    timerInterval.current = setInterval(syncFromDeadline, 250);
    document.addEventListener("visibilitychange", syncFromDeadline);

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      document.removeEventListener("visibilitychange", syncFromDeadline);
      // Deliberately not cancelling the chime here — this cleanup fires on
      // every deps change, including the auto-start transition this effect
      // is specifically trying to let ring through. See the cancellation
      // logic (and advancingAfterCompletionRef) at the top of this effect,
      // and the unmount-only effect below for tearing it down on navigation.
    };
    // `remaining` is intentionally read only to anchor the deadline on the
    // first run; adding it to deps would restart the interval every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, isFocusMode, cancelScheduledChime]);

  // Stops any pending/ringing chime when the Timer page itself unmounts.
  // Separate from the per-transition logic above, which deliberately leaves
  // the chime alone on most re-runs.
  useEffect(() => {
    return () => {
      cancelScheduledChime();
    };
  }, [cancelScheduledChime]);

  // Fires the phase-completion side effect exactly once when the countdown
  // reaches 0 — kept out of the setRemaining updater above, since StrictMode
  // double-invokes updater functions in dev to catch impure ones like that.
  useEffect(() => {
    if (!running || remaining > 0) return;
    // Rising tone when focus ends ("time to move"), falling tone when a
    // break ends ("back to focus") — gated by the Sound Effects setting.
    // If a chime was pre-scheduled on the audio clock it has already rung
    // (or is about to); only start it here when nothing was scheduled. It
    // rings for its full ~30s regardless of what happens next — including
    // Auto-start immediately beginning the next phase (advancingAfterCompletionRef
    // below tells the countdown effect not to cut it off for that reason). A
    // later genuine user action (Play, pause, switch mode, reset) still ends
    // it early, same as before.
    if (!cancelChimeRef.current) {
      cancelChimeRef.current = playAlarmChime();
    }

    // finishNow (the ">" skip-to-end button) forces `remaining` to 0 to
    // reuse this exact completion path, so it behaves identically to a
    // natural 00:00 — but the session should record actual time spent, not
    // the full phase duration.
    const earlyMinutes = finishEarlyMinutesRef.current;
    finishEarlyMinutesRef.current = null;

    if (isFocusMode) {
      beginBreakForActiveSession(earlyMinutes ?? undefined);
      focusCountRef.current += 1;
    } else {
      completeActiveSession(earlyMinutes ?? undefined);
    }

    // Auto-advance through the Pomodoro cycle: focus -> short break (long
    // break every 4th focus session) -> focus -> ... Whether the next phase
    // starts counting down immediately is gated by the Auto-start breaks
    // setting; when it's off (or finishNow suppressed it) the countdown just
    // resets to the next phase, paused, same as a manual mode switch.
    const nextId = getNextTimerMode(timerMode, focusCountRef.current);
    const nextModeDef = modes.find((m) => m.id === nextId);
    if (!nextModeDef) {
      setRunning(false);
      return;
    }
    const suppressAutoStart = suppressAutoStartRef.current;
    suppressAutoStartRef.current = false;
    const autoStart = !suppressAutoStart && getAutoStartBreaksEnabled();
    advancingAfterCompletionRef.current = true;
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

  // Ends the current phase early — e.g. the user finished their workout
  // before the break timer ran out, or wants to force a 00:00 completion to
  // check for regressions in the auto-advance flow without waiting it out.
  // Stashes the actual elapsed time, then forces `remaining` to 0 (with
  // `running` true) so the real phase-completion effect above fires — this
  // deliberately reuses that exact path rather than duplicating it, so the
  // ring, cycle advance, and time-recording all behave exactly like a real
  // 00:00. The one deliberate difference: it always lands the next phase
  // paused (suppressAutoStartRef), regardless of Auto-start breaks — this is
  // already a manual override, so it shouldn't also auto-launch a countdown.
  const finishNow = useCallback(() => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    cancelScheduledChime();
    // Play the chime synchronously here, inside the click handler, rather
    // than leaving it to the completion effect below (which only runs after
    // this handler returns). Browsers require audio playback to start
    // within the direct call stack of a user gesture; deferring it into a
    // useEffect can fall outside that window and get silently blocked. The
    // completion effect's own `if (!cancelChimeRef.current)` guard then sees
    // this is already set and skips re-triggering it.
    cancelChimeRef.current = playAlarmChime();
    finishEarlyMinutesRef.current = (currentMode.duration * 60 - remaining) / 60;
    suppressAutoStartRef.current = true;
    // If the timer was paused, this call's own setRunning(true) below flips
    // `running` immediately, which would make the countdown effect re-run
    // (and cancel the chime just scheduled above) in this same render, before
    // the completion effect gets a chance to set this flag itself. Setting
    // it here too covers that ordering gap; the completion effect setting it
    // again afterward is what protects the *next* transition, into the
    // paused next phase.
    advancingAfterCompletionRef.current = true;
    setRemaining(0);
    setRunning(true);
  }, [currentMode.duration, remaining, cancelScheduledChime]);

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
      cancelChimeRef.current = scheduleAlarmChime(secsLeft);
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
  const logoutGlassRef = useLiquidGlass<HTMLButtonElement>(GLASS_TIGHT);
  const collapsedToggleGlassRef = useLiquidGlass<HTMLButtonElement>(GLASS_TIGHT);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          backgroundImage: `url("${getBackgroundById(backgroundId).imageUrl}")`,
          backgroundSize: "cover",
          backgroundPosition:
            getBackgroundById(backgroundId).position ?? DEFAULT_BACKGROUND_POSITION,
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
                  onFinish={finishNow}
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
                  onFinish={finishNow}
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
