const AUTO_START_KEY = "gymodoro-auto-start-breaks";

// Defaults to "on" (matches the Settings toggle's default) so a first-time
// visitor who never touched the toggle still gets the auto-advancing cycle.
export function getAutoStartBreaksEnabled(): boolean {
  try {
    const v = localStorage.getItem(AUTO_START_KEY);
    return v === null ? true : v === "true";
  } catch {
    return true;
  }
}

export function setAutoStartBreaksEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(AUTO_START_KEY, String(enabled));
  } catch {
    // localStorage unavailable (private browsing, etc.) — setting just won't persist
  }
}
