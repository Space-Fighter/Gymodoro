import { useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  getSoundEffectsEnabled,
  setSoundEffectsEnabled,
  RING_SOUNDS,
  getRingSoundId,
  RING_SECONDS_OPTIONS,
  getRingSeconds,
  setRingSeconds,
  setRingSoundId,
  preloadRingSound,
  previewRingSound,
} from "@/lib/chime";
import { getAutoStartBreaksEnabled, setAutoStartBreaksEnabled } from "@/lib/timerSettings";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { GLASS_PANEL } from "@/lib/glassPresets";

interface Props {
  contentLeft: string;
}

export default function SettingsView({ contentLeft }: Props) {
  const navigate = useNavigate();
  const { logout, deleteAccount, user } = useAuth();
  const [autoStart, setAutoStart] = useState(getAutoStartBreaksEnabled);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(getSoundEffectsEnabled);
  const [ringId, setRingId] = useState(getRingSoundId);
  const [ringSeconds, setRingSecondsState] = useState(getRingSeconds);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const stopPreviewRef = useRef<(() => void) | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const autoStartGlassRef = useLiquidGlass<HTMLDivElement>(GLASS_PANEL);
  const notificationsGlassRef = useLiquidGlass<HTMLDivElement>(GLASS_PANEL);
  const soundGlassRef = useLiquidGlass<HTMLDivElement>(GLASS_PANEL);
  const ringGlassRef = useLiquidGlass<HTMLDivElement>(GLASS_PANEL);
  const userInfoGlassRef = useLiquidGlass<HTMLDivElement>(GLASS_PANEL);

  // Stop any preview still playing when leaving Settings.
  useEffect(() => () => stopPreviewRef.current?.(), []);

  const stopPreview = () => {
    stopPreviewRef.current?.();
    stopPreviewRef.current = null;
    setPreviewingId(null);
  };

  const togglePreview = (id: string) => {
    const wasPlaying = previewingId === id;
    stopPreview();
    if (wasPlaying) return;
    setPreviewingId(id);
    stopPreviewRef.current = previewRingSound(id, () => {
      stopPreviewRef.current = null;
      setPreviewingId((cur) => (cur === id ? null : cur));
    });
  };

  const selectRing = (id: string) => {
    setRingId(id);
    setRingSoundId(id);
    preloadRingSound(id);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/welcome");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(deleteConfirm);
      navigate("/welcome");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Account deletion failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="absolute inset-0 overflow-y-auto p-6 pt-36 max-md:p-4 max-md:pt-6 max-md:pb-24"
      style={{ left: contentLeft, transition: "left 0.25s ease" }}
    >
      <div>
        <h2 className="text-3xl font-bold text-white font-poppins mb-2">
          Settings
        </h2>
        <p className="text-sm text-white/50 mb-6">Customize your experience</p>
      </div>

      <div className="max-w-md space-y-2">
        {/* Auto-start Breaks */}
        <div
          ref={autoStartGlassRef}
          className="glass flex items-center justify-between px-4 py-3.5 rounded-2xl border border-white/10"
        >
          <span className="text-sm text-white/80 font-poppins">
            Auto-start breaks
          </span>
          <button
            onClick={() => {
              const next = !autoStart;
              setAutoStart(next);
              setAutoStartBreaksEnabled(next);
            }}
            className={`w-10 h-6 rounded-full transition-colors ${
              autoStart ? "bg-emerald-500" : "bg-white/20"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform m-0.5 ${
                autoStart ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Notifications */}
        <div
          ref={notificationsGlassRef}
          className="glass flex items-center justify-between px-4 py-3.5 rounded-2xl border border-white/10"
        >
          <span className="text-sm text-white/80 font-poppins">
            Notifications
          </span>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-10 h-6 rounded-full transition-colors ${
              notifications ? "bg-emerald-500" : "bg-white/20"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform m-0.5 ${
                notifications ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Sound Effects */}
        <div
          ref={soundGlassRef}
          className="glass flex items-center justify-between px-4 py-3.5 rounded-2xl border border-white/10"
        >
          <span className="text-sm text-white/80 font-poppins">
            Sound effects
          </span>
          <button
            onClick={() => {
              const next = !soundEffects;
              setSoundEffects(next);
              setSoundEffectsEnabled(next);
            }}
            className={`w-10 h-6 rounded-full transition-colors ${
              soundEffects ? "bg-emerald-500" : "bg-white/20"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform m-0.5 ${
                soundEffects ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Timer ring sound */}
        <div
          ref={ringGlassRef}
          className="glass px-4 py-3.5 rounded-2xl border border-white/10"
        >
          <span className="text-sm text-white/80 font-poppins">Timer ring sound</span>
          <ul className="mt-3 space-y-1.5" role="radiogroup" aria-label="Timer ring sound">
            {RING_SOUNDS.map((sound) => {
              const selected = ringId === sound.id;
              const playing = previewingId === sound.id;
              return (
                <li
                  key={sound.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors ${
                    selected ? "border-emerald-400/60 bg-emerald-500/15" : "border-white/10 bg-white/5"
                  }`}
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => selectRing(sound.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className={`flex h-4 w-4 flex-none items-center justify-center rounded-full border ${
                        selected ? "border-emerald-400" : "border-white/40"
                      }`}
                    >
                      {selected && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                    </span>
                    <span className="text-sm text-white font-poppins">{sound.label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePreview(sound.id)}
                    aria-label={`${playing ? "Stop" : "Preview"} ${sound.label}`}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    {playing ? <Square className="h-3.5 w-3.5" fill="currentColor" /> : <Play className="h-3.5 w-3.5" fill="currentColor" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 border-t border-white/10 pt-3">
            <span className="text-sm text-white/80 font-poppins">Ring for</span>
            <div className="mt-2 grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="How long the timer rings">
              {RING_SECONDS_OPTIONS.map((secs) => {
                const selected = ringSeconds === secs;
                return (
                  <button
                    key={secs}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      stopPreview();
                      setRingSecondsState(secs);
                      setRingSeconds(secs);
                    }}
                    className={`rounded-lg border py-2 text-sm font-poppins transition-colors ${
                      selected
                        ? "border-emerald-400/60 bg-emerald-500/15 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {secs < 60 ? `${secs}s` : "1 min"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div
        ref={userInfoGlassRef}
        className="glass mt-8 p-4 rounded-2xl border border-white/10 max-w-md w-fit"
      >
        <p className="text-xs text-white/50 font-poppins mb-2 uppercase">
          Logged in as
        </p>
        <p className="text-sm text-white font-semibold whitespace-nowrap">{user?.email}</p>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-8 w-full max-w-md px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-semibold transition-colors"
      >
        Sign Out
      </button>

      {/* Danger Zone */}
      <div className="mt-8 max-w-md p-4 rounded-2xl bg-red-950/30 border border-red-500/30">
        <p className="text-xs text-red-300/80 font-poppins mb-1 uppercase font-bold">
          Danger Zone
        </p>
        <p className="text-sm text-white/60 mb-3">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>

        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
          >
            Delete Account
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-red-200 font-semibold">
              Are you sure? This will permanently delete your account.
            </p>
            <input
              type="password"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Your password (Google account: type your email)"
              autoComplete="current-password"
              className="w-full rounded-lg border border-red-500/40 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-red-400"
            />
            {deleteError && <p className="text-sm text-red-300">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setConfirmingDelete(false);
                  setDeleteConfirm("");
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || !deleteConfirm}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
