import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { User } from "@/types/auth";
import { AuthContext } from "@/context/auth-context-value";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface RegisterResult {
  message: string;
  emailSent: boolean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Access token lives in memory only (never localStorage) — a page reload
  // loses it on purpose, which is why checkAuth() re-derives it via the
  // httpOnly refresh cookie below.
  const accessTokenRef = useRef<string | null>(null);
  const getAccessToken = useCallback(() => accessTokenRef.current, []);
  // Single in-flight refresh shared by every caller in this tab. Refresh
  // tokens rotate and a reused one revokes *all* the user's sessions, so two
  // concurrent refreshes would log the user out.
  const refreshInFlightRef = useRef<Promise<string | null> | null>(null);

  // Mints a new access token from the httpOnly refresh cookie. The Web Lock
  // also serializes refreshes across tabs, which share the same cookie.
  const refreshAccessToken = useCallback((): Promise<string | null> => {
    if (refreshInFlightRef.current) return refreshInFlightRef.current;
    const doRefresh = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) return null;
        const data = await response.json();
        accessTokenRef.current = data.accessToken ?? null;
        return accessTokenRef.current;
      } catch {
        return null;
      }
    };
    const promise = (
      typeof navigator !== "undefined" && navigator.locks
        ? navigator.locks.request("gymodoro-token-refresh", doRefresh)
        : doRefresh()
    ).finally(() => {
      refreshInFlightRef.current = null;
    });
    refreshInFlightRef.current = promise;
    return promise;
  }, []);

  // fetch() against the API with the Bearer token attached. The access token
  // only lives 15 minutes — shorter than a focus period — so on a 401 this
  // refreshes once and retries instead of silently failing.
  const authFetch = useCallback(
    async (path: string, init?: RequestInit): Promise<Response> => {
      const send = (token: string | null) =>
        fetch(`${API_URL}${path}`, {
          ...init,
          credentials: "include",
          headers: {
            ...(init?.body ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...init?.headers,
          },
        });
      const token = accessTokenRef.current ?? (await refreshAccessToken());
      const response = await send(token);
      if (response.status !== 401) return response;
      const fresh = await refreshAccessToken();
      return fresh ? send(fresh) : response;
    },
    [refreshAccessToken]
  );
  // StrictMode double-invokes the mount effect below in dev, firing two
  // concurrent checkAuth() calls; without this guard the second (redundant)
  // refresh-token round trip can lose the race and null out a token the
  // first call just set. Production only ever calls this once anyway.
  const checkAuthInFlightRef = useRef(false);

  const fetchMe = useCallback(async (token: string) => {
    const response = await fetch(`${API_URL}/api/auth/get-me`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.user as User;
  }, []);

  const checkAuth = useCallback(async () => {
    if (checkAuthInFlightRef.current) return;
    checkAuthInFlightRef.current = true;
    try {
      setIsLoading(true);
      setError(null);

      // No access token in memory (fresh load / navigation) — try to mint
      // one from the httpOnly refresh cookie before giving up.
      const token = await refreshAccessToken();
      if (!token) {
        accessTokenRef.current = null;
        setUser(null);
        return;
      }

      const me = await fetchMe(token);
      setUser(me);
    } catch (err) {
      console.error("Auth check failed:", err);
      accessTokenRef.current = null;
      setUser(null);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
      checkAuthInFlightRef.current = false;
    }
  }, [fetchMe, refreshAccessToken]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      accessTokenRef.current = data.accessToken;
      setUser(data.user || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string): Promise<RegisterResult> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }

        // Registration never logs the user in — the backend withholds
        // tokens until the email link is clicked. Caller shows this message.
        return { message: data.message as string, emailSent: data.emailSent as boolean };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const resendVerification = useCallback(async (email: string): Promise<{ message: string }> => {
    try {
      setError(null);

      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification email");
      }

      return { message: data.message as string };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resend verification email";
      setError(message);
      throw err;
    }
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<{ message: string }> => {
    try {
      setError(null);

      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send password reset email");
      }

      return { message: data.message as string };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send password reset email";
      setError(message);
      throw err;
    }
  }, []);

  const resetPassword = useCallback(
    async (token: string, password: string): Promise<{ message: string }> => {
      try {
        setError(null);

        const response = await fetch(`${API_URL}/api/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to reset password");
        }

        return { message: data.message as string };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to reset password";
        setError(message);
        throw err;
      }
    },
    []
  );

  const googleLogin = useCallback(async (idToken: string, mode: "login" | "signup") => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken, mode }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Google sign-in failed");
      }

      accessTokenRef.current = data.accessToken;
      setUser(data.user || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      accessTokenRef.current = null;
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // `confirm` is the account password (or the email, for Google-only accounts);
  // the backend refuses to delete without it. State is cleared only on success,
  // so a wrong password doesn't log the user out.
  const deleteAccount = useCallback(async (confirm: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/account`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessTokenRef.current}`,
        },
        body: JSON.stringify({ confirm }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || data.error || "Account deletion failed");
      }
      accessTokenRef.current = null;
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Legitimate external-system sync (network auth check on mount), not a
    // derived-state computation, so this can't be rewritten as a render-phase
    // state adjustment the way a pure calculation could be.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        login,
        register,
        resendVerification,
        forgotPassword,
        resetPassword,
        googleLogin,
        logout,
        deleteAccount,
        checkAuth,
        getAccessToken,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
