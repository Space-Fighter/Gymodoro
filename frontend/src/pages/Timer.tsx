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
import logo from "@/assets/gymodoro-logo.png";

const BACKGROUND_STORAGE_KEY = "gymodoro-background";

type TabType = "timer" | "workout" | "background" | "settings";
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
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("timer");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timerMode, setTimerMode] = useState<TimerMode>("focus");
  const [remaining, setRemaining] = useState(focusMinutes * 60);
  const [running, setRunning] = useState(false);
  const [activityIdx, setActivityIdx] = useState(0);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [backgroundId, setBackgroundId] = useState(() => {
    try {
      return localStorage.getItem(BACKGROUND_STORAGE_KEY) || DEFAULT_BACKGROUND_ID;
    } catch {
      return DEFAULT_BACKGROUND_ID;
    }
  });
  const timerInterval = useRef<NodeJS.Timeout>();

  const { exercises, loading, error } = useExercises();

  useEffect(() => {
    if (exercises.length > 0) {
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
  const isBreakMode = timerMode !== "focus";

  useEffect(() => {
    if (!running) return;

    timerInterval.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [running]);

  const toggleStart = useCallback(() => {
    setRunning((prev) => !prev);
  }, []);

  const switchMode = (id: TimerMode) => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    const mode = modes.find((m) => m.id === id);
    if (mode) {
      setTimerMode(id);
      setRemaining(mode.duration * 60);
      setRunning(false);
    }
  };

  const reset = () => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    setRemaining(currentMode.duration * 60);
    setRunning(false);
  };

  const addTime = (minutes: number) => {
    setRemaining((prev) => prev + minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const s = Math.max(0, seconds);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

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
      <div className="absolute top-0 left-0 z-30 flex items-center gap-1 pointer-events-none">
        <img src={logo} alt="Gymodoro" className="w-[135px] h-[135px] object-contain" />
        <span className="text-white font-extrabold tracking-wide text-2xl font-poppins">
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
        onTabChange={setActiveTab}
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
                contentLeft={contentLeft}
              />
            ) : (
              <BreakView
                modes={modes}
                timerMode={timerMode}
                remaining={remaining}
                running={running}
                formatTime={formatTime}
                onSwitchMode={switchMode}
                onToggleStart={toggleStart}
                onReset={reset}
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

        {/* Settings View */}
        {activeTab === "settings" && (
          <SettingsView contentLeft={contentLeft} />
        )}
      </div>
    </div>
  );
}
