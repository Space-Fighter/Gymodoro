import { useState, useEffect } from "react";
import type { ExerciseType } from "@/types/exercise";

export function useExercises() {
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExercises() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const response = await fetch(`${apiUrl}/api/exercises`);
        if (!response.ok) {
          throw new Error("Failed to fetch exercises");
        }
        const data = await response.json();
        setExercises(data.exercises || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        // Fallback to empty array so app still works
        setExercises([]);
      } finally {
        setLoading(false);
      }
    }

    fetchExercises();
  }, []);

  return { exercises, loading, error };
}
