import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { SessionListResponse, Session } from "@/types/session";

export function useSessions(limit = 20) {
  const { authFetch } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authFetch(`/api/sessions?limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      const data: SessionListResponse = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [limit, authFetch]);

  useEffect(() => {
    // Legitimate external-system sync (network fetch), not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, error, refetch: fetchSessions };
}
