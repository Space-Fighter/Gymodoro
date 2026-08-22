import { useState } from "react";
import { Search, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExerciseType } from "@/types/exercise";
import { getYoutubeThumbnailUrl } from "@/lib/youtube";
import TagList from "@/components/timer/TagList";

interface Props {
  exercises: ExerciseType[];
  loading: boolean;
  contentLeft: string;
  onSelectActivity: (index: number) => void;
}

export default function WorkoutLibrary({
  exercises,
  loading,
  contentLeft,
  onSelectActivity,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    difficulty: [] as string[],
    bodyArea: [] as string[],
    muscleGroups: [] as string[],
    equipment: [] as string[],
    exerciseTypes: [] as string[],
  });

  const toggleFilter = (key: keyof typeof activeFilters, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const filteredExercises = exercises.filter((ex) => {
    const f = activeFilters;
    const checkSingle = (arr: string[], val?: string | null) =>
      !arr.length || (val && arr.includes(val));
    const checkMulti = (arr: string[], vals?: string[]) =>
      !arr.length || !vals || vals.some((v) => arr.includes(v));

    return (
      ex.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) &&
      checkSingle(f.difficulty, ex.difficulty) &&
      checkSingle(f.bodyArea, ex.bodyArea) &&
      checkMulti(f.muscleGroups, ex.muscleGroups) &&
      checkMulti(f.equipment, ex.equipment) &&
      checkMulti(f.exerciseTypes, ex.exerciseTypes)
    );
  });

  const activeFilterCount = Object.values(activeFilters).reduce(
    (n, arr) => n + arr.length,
    0
  );

  if (loading) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ left: contentLeft, transition: "left 0.25s ease" }}
      >
        <div className="text-white">Loading exercises...</div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 overflow-y-auto p-6 pt-36"
      style={{ left: contentLeft, transition: "left 0.25s ease" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold text-white font-poppins mb-2">
            Workout Library
          </h2>
          <p className="text-sm text-white/50">Choose an exercise for your break</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className={cn(
                "w-64 pl-9 pr-3 py-2.5 rounded-lg",
                "border border-white/20 bg-black/40 backdrop-blur-md",
                "text-white text-sm placeholder:text-white/40",
                "outline-none focus:border-white/40 transition-colors"
              )}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg",
                "border border-white/20 bg-black/40 backdrop-blur-md",
                "text-white text-sm font-semibold hover:bg-black/55 transition-colors"
              )}
            >
              <Sliders size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 px-2 py-1 rounded-full bg-orange-500 text-white text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {filtersOpen && (
            <div className="absolute top-12 right-0 w-80 max-h-96 overflow-y-auto bg-black/96 backdrop-blur-xl border border-white/12 rounded-lg p-4 z-20 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white">Filter Exercises</span>
                <button
                  onClick={() =>
                    setActiveFilters({
                      difficulty: [],
                      bodyArea: [],
                      muscleGroups: [],
                      equipment: [],
                      exerciseTypes: [],
                    })
                  }
                  className="text-xs text-white/50 hover:text-white"
                >
                  Clear all
                </button>
              </div>

              {/* Difficulty */}
              <div className="mb-4">
                <div className="text-xs font-bold text-white/45 uppercase mb-2">
                  Difficulty
                </div>
                <div className="flex flex-wrap gap-2">
                  {["light", "easy", "normal", "hard", "advanced"].map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleFilter("difficulty", d)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
                        activeFilters.difficulty.includes(d)
                          ? "bg-white text-black"
                          : "border border-white/20 text-white/60 hover:text-white"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Area */}
              <div className="mb-4">
                <div className="text-xs font-bold text-white/45 uppercase mb-2">
                  Body Area
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ...new Set(exercises.map((e) => e.bodyArea).filter(Boolean)),
                  ].map((area) => (
                    <button
                      key={area}
                      onClick={() => toggleFilter("bodyArea", area!)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
                        activeFilters.bodyArea.includes(area!)
                          ? "bg-white text-black"
                          : "border border-white/20 text-white/60 hover:text-white"
                      )}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {/* Muscle Groups */}
              <div className="mb-4">
                <div className="text-xs font-bold text-white/45 uppercase mb-2">
                  Muscle Groups
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ...new Set(exercises.flatMap((e) => e.muscleGroups)),
                  ].map((group) => (
                    <button
                      key={group}
                      onClick={() => toggleFilter("muscleGroups", group)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
                        activeFilters.muscleGroups.includes(group)
                          ? "bg-white text-black"
                          : "border border-white/20 text-white/60 hover:text-white"
                      )}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div className="mb-4">
                <div className="text-xs font-bold text-white/45 uppercase mb-2">
                  Equipment
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ...new Set(exercises.flatMap((e) => e.equipment)),
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleFilter("equipment", item)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
                        activeFilters.equipment.includes(item)
                          ? "bg-white text-black"
                          : "border border-white/20 text-white/60 hover:text-white"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercise Types */}
              <div className="mb-4">
                <div className="text-xs font-bold text-white/45 uppercase mb-2">
                  Exercise Type
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ...new Set(exercises.flatMap((e) => e.exerciseTypes)),
                  ].map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleFilter("exerciseTypes", type)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
                        activeFilters.exerciseTypes.includes(type)
                          ? "bg-white text-black"
                          : "border border-white/20 text-white/60 hover:text-white"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      <p className="text-xs text-white/40 mb-4">
        {filteredExercises.length}{" "}
        {filteredExercises.length === 1 ? "exercise" : "exercises"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((exercise) => {
          const origIdx = exercises.indexOf(exercise);
          return (
            <button
              key={exercise.id}
              onClick={() => onSelectActivity(origIdx)}
              className={cn(
                "bg-black/45 backdrop-blur-lg border border-white/10 rounded-2xl p-4",
                "hover:border-white/25 transition-all cursor-pointer text-left"
              )}
            >
              <div className="rounded-lg overflow-hidden aspect-video bg-black mb-3 border border-white/5">
                {exercise.gifUrl && getYoutubeThumbnailUrl(exercise.gifUrl) ? (
                  <img
                    src={getYoutubeThumbnailUrl(exercise.gifUrl)!}
                    alt={exercise.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    No preview
                  </div>
                )}
              </div>

              <h3 className="text-base font-bold text-white mb-2">
                {exercise.name}
              </h3>

              <TagList exercise={exercise} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
