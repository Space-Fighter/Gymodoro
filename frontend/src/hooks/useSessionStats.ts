import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { SessionStatsResponse, StatsRange } from "@/types/session";

export function useSessionStats(range: StatsRange) {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState<SessionStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Rapidly switching ranges (Today -> Week -> Month) fires overlapping
  // requests; without this, a slower earlier request resolving last can
  // silently overwrite fresher data with stale data.
  const requestIdRef = useRef(0);

  const fetchStats = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError(null);
      // tzOffset lets the server bucket hours / "today" in the user's own
      // timezone rather than the server's (UTC in production).
      const tzOffset = new Date().getTimezoneOffset();
      const response = await authFetch(
        `/api/sessions/stats?range=${range}&tzOffset=${tzOffset}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch session stats");
      }
      const data = await response.json();
      if (requestId !== requestIdRef.current) return;
      setStats(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Unknown error");
      setStats(null);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [range, authFetch]);

  useEffect(() => {
    // Legitimate external-system sync (network fetch), not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
