import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface Props {
  contentLeft: string;
}

export default function SettingsView({ contentLeft }: Props) {
  const navigate = useNavigate();
  const { logout, deleteAccount, user } = useAuth();
  const [autoStart, setAutoStart] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/welcome");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      navigate("/welcome");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="absolute inset-0 overflow-y-auto p-6 pt-20"
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
        <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-black/45 backdrop-blur-lg border border-white/10">
          <span className="text-sm text-white/80 font-poppins">
            Auto-start breaks
          </span>
          <button
            onClick={() => setAutoStart(!autoStart)}
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
        <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-black/45 backdrop-blur-lg border border-white/10">
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
        <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-black/45 backdrop-blur-lg border border-white/10">
          <span className="text-sm text-white/80 font-poppins">
            Sound effects
          </span>
          <button
            onClick={() => setSoundEffects(!soundEffects)}
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
      </div>

      {/* User Info */}
      <div className="mt-8 p-4 rounded-2xl bg-black/45 backdrop-blur-lg border border-white/10">
        <p className="text-xs text-white/50 font-poppins mb-2 uppercase">
          Logged in as
        </p>
        <p className="text-sm text-white font-semibold">{user?.email}</p>
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
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
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
