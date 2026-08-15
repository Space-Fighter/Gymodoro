/**
 * One-time-run maintenance script — NOT part of `db:seed`.
 *
 * Fetches exercise data from the wger open exercise database
 * (https://wger.de, content licensed CC-BY-SA 3.0), enriches it with a
 * YouTube tutorial link and a Giphy gif, and writes a static snapshot to
 * prisma/exercise-seed-data.json. seed.ts then reads that snapshot with no
 * network access at all, so normal dev setup stays fast and deterministic.
 *
 * Run with: npm run db:import-wger
 *
 * Requires YOUTUBE_API_KEY and GIPHY_API_KEY in backend/.env. Note the free
 * quotas: YouTube gives 10,000 units/day and each search costs 100 units
 * (~100 searches/day), Giphy's beta key allows 100 req/hour. A single ~20
 * exercise run is comfortably inside both — don't loop this script.
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const WGER_API = 'https://wger.de/api/v2/exerciseinfo/?language=2&limit=100';

// The Leap Fitness "Home Workout" channel — videoUrl is restricted to this
// single trusted source. Anything it doesn't cover is left null and handed
// off to fill-missing-videos.ts rather than falling back silently here.
const LEAP_FITNESS_CHANNEL_ID = 'UCiFMiTjklR2FHfRLt04ywyA';

// Curated shortlist: wger has thousands of entries, we want a small catalog
// of well-known moves. Matched case-insensitively against translation names.
const WANTED_EXERCISES = [
  'Push Up',
  'Squat',
  'Deadlift',
  'Bench Press',
  'Plank',
  'Lunge',
  'Pull Up',
  'Bicep Curl',
  'Shoulder Press',
  'Bent Over Row',
  'Burpee',
  'Mountain Climber',
  'Jumping Jack',
  'Russian Twist',
  'Lat Pulldown',
  'Leg Press',
  'Tricep Dip',
  'Kettlebell Swing',
  'Glute Bridge',
  'Calf Raise',
];

// Compound barbell lifts get difficulty "hard" regardless of the generic
// equipment heuristic below.
const COMPOUND_LIFTS = ['deadlift', 'squat', 'bench press', 'shoulder press', 'bent over row'];

const BODYWEIGHT_EQUIPMENT = ['none (bodyweight exercise)', 'none'];

export interface SeedExercise {
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  videoUrl: string | null;
  videoSource: 'leap-fitness' | 'youtube-search' | null;
  gifUrl: string | null;
  muscleDiagramUrl: string | null;
  muscleGroups: string[];
  equipment: string[];
  exerciseTypes: string[];
  source: { wgerId: number; wgerUuid: string };
}

export interface MissingVideoExercise {
  name: string;
  wgerId: number;
}

/** wger descriptions are HTML fragments; the API returns plain strings elsewhere. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((v) => v && v.trim().length > 0))];
}

/** wger muscles carry both a latin `name` and a friendlier `name_en`. */
function muscleName(muscle: { name: string; name_en?: string }): string {
  return muscle.name_en && muscle.name_en.trim().length > 0 ? muscle.name_en : muscle.name;
}

function inferDifficulty(name: string, equipment: string[]): 'easy' | 'medium' | 'hard' {
  const lowerName = name.toLowerCase();
  const realEquipment = equipment.filter((e) => !BODYWEIGHT_EQUIPMENT.includes(e.toLowerCase()));

  if (realEquipment.length === 0) return 'easy';
  if (COMPOUND_LIFTS.some((lift) => lowerName.includes(lift))) return 'hard';
  return 'medium';
}

/** Which curated name (if any) this wger translation name corresponds to. */
function matchWantedName(translationName: string): string | null {
  const lower = translationName.toLowerCase();
  return (
    WANTED_EXERCISES.find((wanted) => {
      const w = wanted.toLowerCase();
      // Also match the un-spaced variant, e.g. "Pushup" for "Push Up".
      return lower.includes(w) || lower.includes(w.replace(/\s+/g, ''));
    }) ?? null
  );
}

async function fetchWgerExercises(): Promise<any[]> {
  const all: any[] = [];
  let url: string | null = WGER_API;

  while (url) {
    console.log(`📡 Fetching ${url}`);
    const res: Response = await fetch(url);
    if (!res.ok) {
      throw new Error(`wger request failed: ${res.status} ${res.statusText}`);
    }
    const page: any = await res.json();
    all.push(...(page.results ?? []));
    url = page.next ?? null;

    // Stop early once every curated name has at least one candidate.
    const covered = new Set(
      all.flatMap((e: any) =>
        (e.translations ?? [])
          .filter((t: any) => t.language === 2)
          .map((t: any) => matchWantedName(t.name))
          .filter(Boolean),
      ),
    );
    if (covered.size >= WANTED_EXERCISES.length) {
      console.log('✅ All curated exercises found — stopping pagination early.');
      break;
    }
  }

  return all;
}

/**
 * Top YouTube result for the exercise, restricted to the Leap Fitness channel.
 * Returns null (rather than throwing) on any failure so one bad lookup can't
 * sink the whole import.
 */
async function findYoutubeVideo(name: string, apiKey: string): Promise<string | null> {
  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', `${name} exercise tutorial`);
    url.searchParams.set('type', 'video');
    url.searchParams.set('channelId', LEAP_FITNESS_CHANNEL_ID);
    url.searchParams.set('maxResults', '1');
    url.searchParams.set('key', apiKey);

    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ⚠️  YouTube lookup failed for "${name}": ${res.status} ${res.statusText}`);
      return null;
    }
    const data: any = await res.json();
    const videoId = data.items?.[0]?.id?.videoId;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch (error) {
    console.warn(`  ⚠️  YouTube lookup errored for "${name}":`, error);
    return null;
  }
}

/** Top Giphy result, kept on Giphy's own CDN (never re-hosted). */
async function findGiphyGif(name: string, apiKey: string): Promise<string | null> {
  try {
    const url = new URL('https://api.giphy.com/v1/gifs/search');
    url.searchParams.set('q', `${name} exercise`);
    url.searchParams.set('limit', '1');
    url.searchParams.set('rating', 'g');
    url.searchParams.set('api_key', apiKey);

    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ⚠️  Giphy lookup failed for "${name}": ${res.status} ${res.statusText}`);
      return null;
    }
    const data: any = await res.json();
    return data.data?.[0]?.images?.original?.url ?? null;
  } catch (error) {
    console.warn(`  ⚠️  Giphy lookup errored for "${name}":`, error);
    return null;
  }
}

async function main() {
  const youtubeKey = process.env.YOUTUBE_API_KEY;
  const giphyKey = process.env.GIPHY_API_KEY;

  if (!youtubeKey) console.warn('⚠️  YOUTUBE_API_KEY not set — every videoUrl will be null.');
  if (!giphyKey) console.warn('⚠️  GIPHY_API_KEY not set — every gifUrl will be null.');

  const raw = await fetchWgerExercises();
  console.log(`📦 Fetched ${raw.length} wger entries; filtering to the curated list.`);

  // One entry per curated name — first wger match wins.
  const picked = new Map<string, { entry: any; translation: any }>();

  for (const entry of raw) {
    const english = (entry.translations ?? []).find((t: any) => t.language === 2 && t.name);
    if (!english) continue;

    const wanted = matchWantedName(english.name);
    if (!wanted || picked.has(wanted)) continue;

    picked.set(wanted, { entry, translation: english });
  }

  const missingFromWger = WANTED_EXERCISES.filter((n) => !picked.has(n));
  if (missingFromWger.length > 0) {
    console.warn(`⚠️  No wger match for: ${missingFromWger.join(', ')}`);
  }

  const exercises: SeedExercise[] = [];
  const missingVideos: MissingVideoExercise[] = [];

  for (const [wantedName, { entry, translation }] of picked) {
    const muscleGroups = unique([
      ...(entry.muscles ?? []).map(muscleName),
      ...(entry.muscles_secondary ?? []).map(muscleName),
    ]);
    const equipment = unique((entry.equipment ?? []).map((e: any) => e.name));
    const exerciseTypes = unique([entry.category?.name].filter(Boolean));

    console.log(`🏋️  ${wantedName} (wger #${entry.id})`);

    const videoUrl = youtubeKey ? await findYoutubeVideo(wantedName, youtubeKey) : null;
    const gifUrl = giphyKey ? await findGiphyGif(wantedName, giphyKey) : null;

    if (!videoUrl) {
      missingVideos.push({ name: wantedName, wgerId: entry.id });
    }

    exercises.push({
      name: wantedName,
      description: stripHtml(translation.description ?? '') || `${wantedName} exercise.`,
      difficulty: inferDifficulty(wantedName, equipment),
      videoUrl,
      videoSource: videoUrl ? 'leap-fitness' : null,
      gifUrl,
      muscleDiagramUrl: entry.images?.[0]?.image ?? null,
      muscleGroups,
      equipment,
      exerciseTypes,
      source: { wgerId: entry.id, wgerUuid: entry.uuid },
    });
  }

  const dataPath = join(import.meta.dirname, 'exercise-seed-data.json');
  const missingPath = join(import.meta.dirname, 'missing-video-exercises.json');

  writeFileSync(dataPath, `${JSON.stringify(exercises, null, 2)}\n`);
  writeFileSync(missingPath, `${JSON.stringify(missingVideos, null, 2)}\n`);

  console.log(`\n✅ Wrote ${exercises.length} exercises to ${dataPath}`);
  console.log(`   ${exercises.filter((e) => e.videoUrl).length} with a video, ${exercises.filter((e) => e.gifUrl).length} with a gif.`);
  if (missingVideos.length > 0) {
    console.log(`   ${missingVideos.length} missing a video → ${missingPath} (run npm run db:fill-missing-videos)`);
  }
  console.log('   Spot-check the generated videoUrl/gifUrl values before committing.');
}

main().catch((e) => {
  console.error('❌ Import failed:', e);
  process.exit(1);
});
