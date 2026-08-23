import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { SessionStatsResponse, StatsRange } from "@/types/session";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function useSessionStats(range: StatsRange) {
  const { getAccessToken } = useAuth();
  const [stats, setStats] = useState<SessionStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Rapidly switching ranges (Today -> Week -> Month) fires overlapping
  // requests; without this, a slower earlier request resolving last can
  // silently overwrite fresher data with stale data.
  const requestIdRef = useRef(0);

  const fetchStats = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/sessions/stats?range=${range}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
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
  }, [range, getAccessToken]);

  useEffect(() => {
    // Legitimate external-system sync (network fetch), not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
