import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { User } from "@/types/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface RegisterResult {
  message: string;
  emailSent: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<RegisterResult>;
  resendVerification: (email: string) => Promise<{ message: string }>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Access token lives in memory only (never localStorage) — a page reload
  // loses it on purpose, which is why checkAuth() re-derives it via the
  // httpOnly refresh cookie below.
  const accessTokenRef = useRef<string | null>(null);

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
    try {
      setIsLoading(true);
      setError(null);

      // No access token in memory (fresh load / navigation) — try to mint
      // one from the httpOnly refresh cookie before giving up.
      const refreshResponse = await fetch(`${API_URL}/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      if (!refreshResponse.ok) {
        accessTokenRef.current = null;
        setUser(null);
        return;
      }

      const refreshData = await refreshResponse.json();
      accessTokenRef.current = refreshData.accessToken;

      const me = await fetchMe(refreshData.accessToken);
      setUser(me);
    } catch (err) {
      console.error("Auth check failed:", err);
      accessTokenRef.current = null;
      setUser(null);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [fetchMe]);

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

  const googleLogin = useCallback(async (idToken: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
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

  const deleteAccount = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/account`, {
        method: "DELETE",
        credentials: "include",
        headers: { Authorization: `Bearer ${accessTokenRef.current}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || data.error || "Account deletion failed");
      }
    } finally {
      accessTokenRef.current = null;
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
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
        googleLogin,
        logout,
        deleteAccount,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
