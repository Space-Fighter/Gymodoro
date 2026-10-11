import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/timer/Sidebar";
import MobileNav from "@/components/timer/MobileNav";
import { useIsMobile } from "@/hooks/useIsMobile";
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
import type { ActiveSession } from "@/types/session";

const BACKGROUND_STORAGE_KEY = "gymodoro-background";

type TabType = "timer" | "workout" | "background" | "stats" | "settings";
type TimerMode = "focus" | "short" | "long";
// The backend Session for the pomodoro cycle in flight. `id` is null until
// its POST resolves; queued updates read it at send time (see enqueueSync).
type SessionHandle = { id: string | null; phase: "focus" | "break" };

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
  const { logout, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("timer");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timerMode, setTimerMode] = useState<TimerMode>("focus");
  const [remaining, setRemaining] = useState(focusMinutes * 60);
  const [running, setRunning] = useState(false);
  const [activityIdx, setActivityIdx] = useState(0);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  // Tracks the backend Session for the pomodoro cycle currently in flight, so
  // the stats endpoint has real data and the timer can be resumed elsewhere.
  const activeSessionRef = useRef<SessionHandle | null>(null);
  // Every session write is chained onto this so they reach the server in
  // the order they happened (e.g. a quick pause -> resume).
  const syncChainRef = useRef<Promise<unknown>>(Promise.resolve());
  // Time added with the +1/+5/+10 buttons during the current phase, so the
  // recorded duration is what was actually spent.
  const phaseAddedSecondsRef = useRef(0);
  // Exercise attached to a resumed break — preferred over a random pick
  // once the exercise list finishes loading.
  const restoredExerciseIdRef = useRef<string | null>(null);
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
  const finishEarlySecondsRef = useRef<number | null>(null);
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
      const restoredIdx = exercises.findIndex((e) => e.id === restoredExerciseIdRef.current);
      setActivityIdx(
        restoredIdx >= 0 ? restoredIdx : Math.floor(Math.random() * exercises.length)
      );
    }
    // Only re-pick when the list itself (re)loads, not on every identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // GET /api/sessions/stats has real data, and so an unfinished session can
  // be resumed (after a reload, or on another device) via
  // GET /api/sessions/active. Every start / pause / resume / add-time is
  // written, so the server always knows the phase's deadline even if the
  // tab is closed without warning. Best-effort — failures here shouldn't
  // interrupt the (purely client-side) countdown itself.
  const enqueueSync = useCallback(
    (handle: SessionHandle, task: (id: string) => Promise<Response>) => {
      syncChainRef.current = syncChainRef.current
        .then(async () => {
          if (!handle.id) return;
          const res = await task(handle.id);
          // 409: the session was already finished elsewhere (another device,
          // or replaced by a newer session) — stop tracking it here.
          if (res.status === 409 && activeSessionRef.current === handle) {
            activeSessionRef.current = null;
          }
        })
        .catch(() => {});
    },
    []
  );

  const patchSession = useCallback(
    (handle: SessionHandle, path: string, body: Record<string, unknown>) =>
      enqueueSync(handle, (id) =>
        authFetch(`/api/sessions/${id}${path}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        })
      ),
    [authFetch, enqueueSync]
  );

  const startFocusSession = useCallback(
    (remainingSeconds: number, running: boolean) => {
      const handle: SessionHandle = { id: null, phase: "focus" };
      activeSessionRef.current = handle;
      syncChainRef.current = syncChainRef.current
        .then(async () => {
          const res = await authFetch("/api/sessions", {
            method: "POST",
            body: JSON.stringify({
              workDuration: focusMinutes,
              breakDuration: shortBreakMinutes,
              remainingSeconds,
              running,
            }),
          });
          if (!res.ok) throw new Error("Failed to start session");
          const data = await res.json();
          handle.id = data.session.id;
        })
        .catch(() => {
          // Best-effort: keep the countdown running even if this failed.
          if (activeSessionRef.current === handle) activeSessionRef.current = null;
        });
    },
    [authFetch, focusMinutes, shortBreakMinutes]
  );

  // Pause / resume / add-time for the session in flight.
  const syncTimerState = useCallback(
    (running: boolean, remainingSeconds: number, extra?: Record<string, unknown>) => {
      const handle = activeSessionRef.current;
      if (!handle) return;
      patchSession(handle, "", { running, remainingSeconds, ...extra });
    },
    [patchSession]
  );

  // `workSeconds` is the time actually spent focusing (shorter when finished
  // early, longer when time was added), not the configured duration.
  const beginBreakForActiveSession = useCallback(
    (opts: {
      workSeconds: number;
      breakMode: "short" | "long";
      breakSeconds: number;
      running: boolean;
      exerciseId?: string;
    }) => {
      const handle = activeSessionRef.current;
      if (!handle || handle.phase !== "focus") return;
      handle.phase = "break";
      patchSession(handle, "/start-break", {
        workDurationSeconds: opts.workSeconds,
        breakDurationSeconds: opts.breakSeconds,
        breakMode: opts.breakMode,
        running: opts.running,
        exerciseId: opts.exerciseId,
      });
    },
    [patchSession]
  );

  // `breakSeconds` is the time actually spent on the break.
  const completeActiveSession = useCallback(
    (breakSeconds: number) => {
      const handle = activeSessionRef.current;
      if (!handle) return;
      activeSessionRef.current = null;
      patchSession(handle, "", { status: "completed", breakDurationSeconds: breakSeconds });
    },
    [patchSession]
  );

  const abandonActiveSession = useCallback(() => {
    const handle = activeSessionRef.current;
    if (!handle) return;
    activeSessionRef.current = null;
    patchSession(handle, "", { status: "abandoned" });
  }, [patchSession]);

  // Seconds left on the clock right now — read from the deadline while
  // running, since `remaining` is only refreshed every 250ms.
  const liveRemaining = useCallback(
    () =>
      deadlineRef.current !== null
        ? Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000))
        : remaining,
    [remaining]
  );
  // Time actually spent in the current phase, given the seconds still left.
  const elapsedSeconds = useCallback(
    (secsLeft: number) =>
      Math.max(0, currentMode.duration * 60 + phaseAddedSecondsRef.current - secsLeft),
    [currentMode.duration]
  );

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
    const earlySeconds = finishEarlySecondsRef.current;
    finishEarlySecondsRef.current = null;
    const phaseSeconds =
      earlySeconds ?? currentMode.duration * 60 + phaseAddedSecondsRef.current;
    phaseAddedSecondsRef.current = 0;

    if (isFocusMode) focusCountRef.current += 1;

    // Auto-advance through the Pomodoro cycle: focus -> short break (long
    // break every 4th focus session) -> focus -> ... Whether the next phase
    // starts counting down immediately is gated by the Auto-start breaks
    // setting; when it's off (or finishNow suppressed it) the countdown just
    // resets to the next phase, paused, same as a manual mode switch.
    const nextId = getNextTimerMode(timerMode, focusCountRef.current);
    const nextModeDef = modes.find((m) => m.id === nextId)!;
    const suppressAutoStart = suppressAutoStartRef.current;
    suppressAutoStartRef.current = false;
    const autoStart = !suppressAutoStart && getAutoStartBreaksEnabled();

    if (isFocusMode) {
      beginBreakForActiveSession({
        workSeconds: phaseSeconds,
        breakMode: nextId === "long" ? "long" : "short",
        breakSeconds: nextModeDef.duration * 60,
        running: autoStart,
        exerciseId: currentActivity?.id,
      });
    } else {
      completeActiveSession(phaseSeconds);
    }

    advancingAfterCompletionRef.current = true;
    setTimerMode(nextId);
    setRemaining(nextModeDef.duration * 60);
    setRunning(autoStart);
    if (autoStart && nextId === "focus") startFocusSession(nextModeDef.duration * 60, true);
  }, [
    remaining,
    running,
    isFocusMode,
    timerMode,
    modes,
    currentMode.duration,
    currentActivity?.id,
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
    finishEarlySecondsRef.current = elapsedSeconds(liveRemaining());
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
  }, [cancelScheduledChime, elapsedSeconds, liveRemaining]);

  const toggleStart = useCallback(() => {
    const next = !running;
    const secsLeft = liveRemaining();
    if (next && isFocusMode && !activeSessionRef.current) {
      startFocusSession(secsLeft, true);
    } else {
      syncTimerState(next, secsLeft);
    }
    setRunning(next);
  }, [running, isFocusMode, liveRemaining, startFocusSession, syncTimerState]);

  const switchMode = (id: TimerMode) => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    // Silence an end-of-phase alarm still ringing from the phase being left —
    // running is already false at that point, so the running-effect above
    // won't fire to cancel it on its own.
    cancelScheduledChime();
    const mode = modes.find((m) => m.id === id);
    if (mode) {
      const activePhase = activeSessionRef.current?.phase;
      const spent = elapsedSeconds(liveRemaining());
      if (isFocusMode && id !== "focus" && activePhase === "focus") {
        beginBreakForActiveSession({
          workSeconds: spent,
          breakMode: id,
          breakSeconds: mode.duration * 60,
          running: false,
          exerciseId: currentActivity?.id,
        });
      } else if (!isFocusMode && id === "focus" && activePhase === "break") {
        completeActiveSession(spent);
      } else if (activePhase) {
        // Same phase (e.g. short <-> long break, or re-tapping the current
        // mode): the clock resets to the new mode's full duration, paused.
        syncTimerState(
          false,
          mode.duration * 60,
          activePhase === "break"
            ? { breakMode: id, breakDurationSeconds: mode.duration * 60 }
            : undefined
        );
      }
      phaseAddedSecondsRef.current = 0;
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
    phaseAddedSecondsRef.current = 0;
    setRemaining(currentMode.duration * 60);
    setRunning(false);
  };

  const addTime = (minutes: number) => {
    setRemaining((prev) => prev + minutes * 60);
    phaseAddedSecondsRef.current += minutes * 60;
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
    const handle = activeSessionRef.current;
    if (handle) {
      const total = currentMode.duration * 60 + phaseAddedSecondsRef.current;
      syncTimerState(
        running,
        deadlineRef.current !== null ? liveRemaining() : remaining + minutes * 60,
        handle.phase === "focus"
          ? { workDurationSeconds: total }
          : { breakDurationSeconds: total }
      );
    }
  };

  // Resuming: adopt the server's copy of the unfinished session — on first
  // load (reload, or opening the app on another device) and whenever this
  // tab comes back into view, since the session may have been paused,
  // advanced or finished on another device meanwhile.
  const applyServerSession = (s: ActiveSession | null) => {
    const local = activeSessionRef.current;
    // This tab's own POST is still in flight; it will replace whatever the
    // server has, so there's nothing to adopt yet.
    if (local && local.id === null) return;

    const goIdle = (mode: TimerMode) => {
      const def = modes.find((m) => m.id === mode)!;
      cancelScheduledChime();
      phaseAddedSecondsRef.current = 0;
      setTimerMode(mode);
      setRemaining(def.duration * 60);
      setRunning(false);
    };

    if (!s) {
      // Finished or reset on another device.
      if (local) {
        activeSessionRef.current = null;
        goIdle("focus");
      }
      return;
    }

    const phase = s.status === "break" ? "break" : "focus";
    const mode: TimerMode =
      phase === "focus"
        ? "focus"
        : s.breakMode ?? (s.breakDuration >= longBreakMinutes * 60 ? "long" : "short");
    const modeDef = modes.find((m) => m.id === mode)!;
    if (s.exerciseId) {
      restoredExerciseIdRef.current = s.exerciseId;
      const idx = exercises.findIndex((e) => e.id === s.exerciseId);
      if (idx >= 0) setActivityIdx(idx);
    }

    if (s.running && s.remainingSeconds === 0) {
      // The phase ran out while the user was away. Record it as finished
      // and land on the next phase, paused — no point ringing an alarm or
      // auto-starting a break for someone who isn't looking.
      const handle: SessionHandle = { id: s.id, phase };
      activeSessionRef.current = handle;
      if (phase === "focus") {
        focusCountRef.current += 1;
        const nextId = getNextTimerMode("focus", focusCountRef.current);
        const nextDef = modes.find((m) => m.id === nextId)!;
        beginBreakForActiveSession({
          workSeconds: s.workDuration,
          breakMode: nextId === "long" ? "long" : "short",
          breakSeconds: nextDef.duration * 60,
          running: false,
          exerciseId: currentActivity?.id,
        });
        goIdle(nextId);
      } else {
        completeActiveSession(s.breakDuration);
        goIdle("focus");
      }
      return;
    }

    // Already showing the same thing — don't nudge a running clock by the
    // second or two of request latency.
    if (
      local?.id === s.id &&
      local.phase === phase &&
      timerMode === mode &&
      running === s.running &&
      Math.abs(liveRemaining() - s.remainingSeconds) <= 2
    ) {
      return;
    }

    activeSessionRef.current = { id: s.id, phase };
    phaseAddedSecondsRef.current = Math.max(
      0,
      (phase === "focus" ? s.workDuration : s.breakDuration) - modeDef.duration * 60
    );
    if (timerMode !== mode || running !== s.running) cancelScheduledChime();
    // If the clock keeps running in the same mode, the countdown effect won't
    // re-run to re-anchor, so move the deadline (and its alarm) here.
    if (deadlineRef.current !== null && s.running && timerMode === mode) {
      deadlineRef.current = Date.now() + s.remainingSeconds * 1000;
      cancelScheduledChime();
      cancelChimeRef.current = scheduleAlarmChime(s.remainingSeconds);
    }
    setTimerMode(mode);
    setRemaining(s.remainingSeconds);
    setRunning(s.running);
  };
  // Latest closure for the listeners below, which subscribe once.
  const applyServerSessionRef = useRef(applyServerSession);
  useEffect(() => {
    applyServerSessionRef.current = applyServerSession;
  });

  useEffect(() => {
    let cancelled = false;
    const loadActiveSession = () => {
      // Wait for this tab's own pending writes so we don't read back state
      // they're about to change.
      syncChainRef.current = syncChainRef.current
        .then(async () => {
          const res = await authFetch("/api/sessions/active");
          if (!res.ok || cancelled) return;
          const data: { session: ActiveSession | null } = await res.json();
          if (!cancelled) applyServerSessionRef.current(data.session);
        })
        .catch(() => {});
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") loadActiveSession();
    };
    loadActiveSession();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", loadActiveSession);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", loadActiveSession);
    };
  }, [authFetch]);

  // Keep the session's exercise in step with what the break view shows
  // (Roll Dice, or picking one from the Workout Library), so calories in
  // stats are for the exercise actually done.
  const currentActivityId = currentActivity?.id;
  useEffect(() => {
    const handle = activeSessionRef.current;
    if (!currentActivityId || !handle || handle.phase !== "break") return;
    patchSession(handle, "", { exerciseId: currentActivityId });
  }, [currentActivityId, patchSession]);

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

  const isMobile = useIsMobile();

  // Mobile: swipe horizontally on the timer view to move between
  // Focus / Short Break / Long Break (same effect as tapping the mode dots).
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeEnabled = isMobile && activeTab === "timer";
  const handleSwipeStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (e.touches.length !== 1 || target.closest("input, iframe, [data-no-swipe]")) {
      swipeStartRef.current = null;
      return;
    }
    swipeStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleSwipeEnd = (e: React.TouchEvent) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const idx = modes.findIndex((m) => m.id === timerMode);
    const next = modes[idx + (dx < 0 ? 1 : -1)];
    if (next) switchMode(next.id);
  };

  const contentLeft = isMobile ? "0px" : sidebarOpen ? "260px" : "90px";
  const logoutGlassRef = useLiquidGlass<HTMLButtonElement>(GLASS_TIGHT);
  const collapsedToggleGlassRef = useLiquidGlass<HTMLButtonElement>(GLASS_TIGHT);

  return (
    <div className="relative min-h-screen max-md:min-h-[100svh] w-full overflow-hidden bg-black">
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
      <div className="absolute top-3 left-3 z-30 flex items-center gap-0 pointer-events-none max-md:hidden">
        <img src={logo} alt="Gymodoro" className="h-auto w-[96px] max-md:w-[52px] object-contain" />
        <span className="text-white font-extrabold tracking-wide text-2xl max-md:text-base font-poppins -ml-2 max-md:ml-0.5">
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
          "glass-tight absolute top-3 right-3 z-30 h-9 px-3 rounded-lg max-md:hidden",
          "border border-white/15",
          "flex items-center justify-center gap-1.5 text-white/70 text-sm font-semibold font-poppins",
          "hover:text-white transition-colors"
        )}
        aria-label="Logout"
      >
        <LogOut size={16} className="stroke-2" />
        <span>Logout</span>
      </button>

      {/* Sidebar (desktop) / bottom bar + explore pane (phones) */}
      {isMobile ? (
        <MobileNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabType)} />
      ) : (
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as TabType)}
        />
      )}

      {/* Collapsed Toggle Button */}
      {!isMobile && !sidebarOpen && (
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
      <div
        className="relative z-10 h-screen w-full max-md:h-[100svh]"
        onTouchStart={swipeEnabled ? handleSwipeStart : undefined}
        onTouchEnd={swipeEnabled ? handleSwipeEnd : undefined}
      >
        {/* Timer View */}
        {activeTab === "timer" && (
          <>
            {isFocusMode ? (
              <div className="absolute inset-0 -translate-y-[25px] max-md:translate-y-0">
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
              <div className="absolute inset-0 -translate-y-[60px] max-md:translate-y-0">
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
