// Shared shapes for the exercise-seed pipeline: import-wger.ts and
// import-darebee.ts both produce SeedExercise[] snapshots; seed.ts reads
// whichever snapshot is on disk with no knowledge of which script wrote it.

/** Shape of one row written to exercise-seed-data.json. */
export interface SeedExercise {
  name: string;
  description: string;
  difficulty: string;
  mechanic: 'compound' | 'isolation' | null;
  force: 'push' | 'pull' | 'static' | null;
  videoUrl: string | null;
  videoSource: 'leap-fitness' | 'howcast' | 'youtube-api-search' | 'yt-dlp-search' | null;
  gifUrl: string | null;
  muscleDiagramUrl: string | null;
  bodyArea: string | null;
  muscleGroups: string[];
  equipment: string[];
  exerciseTypes: string[];
  source: { wgerId: number; wgerUuid: string } | { darebeeUrl: string };
}

/** One row per exercise that got no video from either trusted YouTube channel. */
export interface MissingVideoExercise {
  name: string;
  wgerId?: number;
}
