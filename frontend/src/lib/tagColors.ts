export type TagCategory = "difficulty" | "type" | "bodyArea" | "equipment" | "muscleGroup";

export interface TagColor {
  background: string;
  color: string;
}

const NEUTRAL: TagColor = { background: "rgba(255,255,255,.14)", color: "#ffffff" };

// Per-value lookups for categories where individual values carry meaning.
const DIFFICULTY_COLORS: Record<string, TagColor> = {
  light: { background: "rgba(76,175,80,.25)", color: "#7be495" },
  easy: { background: "rgba(102,187,106,.25)", color: "#9be6a8" },
  normal: { background: "rgba(255,193,7,.25)", color: "#ffd54f" },
  hard: { background: "rgba(255,112,67,.25)", color: "#ff9466" },
  advanced: { background: "rgba(244,67,54,.28)", color: "#ff8a80" },
};

const TYPE_COLORS: Record<string, TagColor> = {
  strength: { background: "rgba(66,133,244,.25)", color: "#8ab4f8" },
  cardio: { background: "rgba(239,83,80,.25)", color: "#ff8a80" },
  stretching: { background: "rgba(0,188,212,.25)", color: "#84e3f0" },
  combat: { background: "rgba(255,87,34,.25)", color: "#ffab91" },
  metcon: { background: "rgba(63,81,181,.25)", color: "#9fa8da" },
  yoga: { background: "rgba(0,150,136,.25)", color: "#80cbc4" },
};

// Categories where every value shares one uniform look.
const UNIFORM_COLORS: Partial<Record<TagCategory, TagColor>> = {
  bodyArea: NEUTRAL,
  equipment: { background: "rgba(90,140,170,.3)", color: "#9cd4ea" },
  muscleGroup: { background: "rgba(120,90,170,.3)", color: "#c9b8ef" },
};

export function getTagColor(category: TagCategory, value: string): TagColor {
  const uniform = UNIFORM_COLORS[category];
  if (uniform) return uniform;

  const key = value.toLowerCase();
  switch (category) {
    case "difficulty":
      return DIFFICULTY_COLORS[key] ?? NEUTRAL;
    case "type":
      return TYPE_COLORS[key] ?? NEUTRAL;
    default:
      return NEUTRAL;
  }
}
