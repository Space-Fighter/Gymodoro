import Tag from "@/components/timer/Tag";
import type { ExerciseType } from "@/types/exercise";

interface Props {
  exercise: Pick<
    ExerciseType,
    "difficulty" | "exerciseTypes" | "bodyArea" | "equipment" | "muscleGroups"
  >;
}

export default function TagList({ exercise }: Props) {
  return (
    <div className="flex flex-wrap" style={{ gap: "6px" }}>
      {exercise.difficulty && exercise.difficulty !== "untagged" && (
        <Tag category="difficulty" value={exercise.difficulty} />
      )}
      {exercise.exerciseTypes?.map((type) => (
        <Tag key={`type-${type}`} category="type" value={type} />
      ))}
      {exercise.bodyArea && <Tag category="bodyArea" value={exercise.bodyArea} />}
      {exercise.equipment?.map((item) => (
        <Tag key={`equipment-${item}`} category="equipment" value={item} />
      ))}
      {exercise.muscleGroups?.map((group) => (
        <Tag key={`muscle-${group}`} category="muscleGroup" value={group} />
      ))}
    </div>
  );
}
