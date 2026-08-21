export interface ExerciseType {
  id: string;
  name: string;
  description: string;
  difficulty: "light" | "easy" | "normal" | "hard" | "advanced" | "untagged";
  bodyArea: string | null;
  muscleGroups: string[];
  equipment: string[];
  exerciseTypes: string[];
  videoUrl?: string;
  gifUrl?: string;
  muscleDiagramUrl?: string;
}
