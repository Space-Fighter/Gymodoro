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
// JS/TS: `import 'x'` with no name just runs the module for its side effects —
// here, dotenv/config reads backend/.env and copies its values into
// process.env. The other imports pull named exports out of Node's built-in
// fs/path modules and our own curated.ts file (note the `.js` extension even
// though the source is .ts — required by this project's ESM setup).
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { WANTED_EXERCISES } from './curated.js';

const WGER_API = 'https://wger.de/api/v2/exerciseinfo/?language=2&limit=100';

// wger has no difficulty/mechanic/force data of its own, so we cross-reference
// this second, independent, public-domain exercise catalog by name. It's a
// single ~1MB JSON file (no per-exercise API calls, no key/quota needed),
// fetched once and matched against in memory.
const FREE_EXERCISE_DB_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

// videoUrl is restricted to these two trusted channels — Leap Fitness ("Home
// Workout") and Howcast — tried in order. Anything neither covers is left
// null and handed off to fill-missing-videos.ts rather than falling back
// silently here.
const LEAP_FITNESS_CHANNEL_ID = 'UCiFMiTjklR2FHfRLt04ywyA';
const HOWCAST_CHANNEL_ID = 'UCSpVHeDGr9UbREhRca0qwsA';

// JS: this is an array of plain objects (object literal syntax: { key: value }).
// TS: `as const` tells TypeScript to treat this as a fixed, read-only tuple of
// exact string literals ('leap-fitness' | 'howcast') instead of the wider,
// mutable type `{ id: string; channelId: string }[]` it would normally infer.
// That's what lets VideoMatch below reuse the exact 'id' values as a type.
const VIDEO_SOURCES = [
  { id: 'leap-fitness', channelId: LEAP_FITNESS_CHANNEL_ID },
  { id: 'howcast', channelId: HOWCAST_CHANNEL_ID },
] as const;

// TS concept: `interface` declares the *shape* of an object — which
// properties it must have and what type each one is. It's a compile-time-only
// construct (it produces no JavaScript at all); it just lets the TypeScript
// compiler catch mistakes like a missing field or a typo'd property name.
// `string | null` is a "union type" — meaning this value is either a string
// or exactly `null`, nothing else. `'easy' | 'medium' | 'hard'` is a union of
// specific string literals, so only those three exact strings are allowed
// (unlike plain `string`, which would allow any string). `export` makes this
// interface importable from other files.
//
// Shape of one row written to exercise-seed-data.json — this is what
// seed.ts reads back in, so it's also effectively the DB seed schema.
export interface SeedExercise {
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  // From free-exercise-db (see FreeExerciseMatch below); null when no match
  // was found for this exercise's name, since there's no sane heuristic
  // fallback for these two (unlike difficulty).
  mechanic: 'compound' | 'isolation' | null;
  force: 'push' | 'pull' | 'static' | null;
  videoUrl: string | null;
  videoSource: 'leap-fitness' | 'howcast' | null;
  gifUrl: string | null;
  muscleDiagramUrl: string | null;
  muscleGroups: string[];
  equipment: string[];
  exerciseTypes: string[];
  source: { wgerId: number; wgerUuid: string };
}

// One row per curated exercise that got no video from either trusted
// channel — written to missing-video-exercises.json for
// fill-missing-videos.ts to pick up separately.
export interface MissingVideoExercise {
  name: string;
  wgerId: number;
}

// JS concept: `.replace(pattern, replacement)` is a String method. Each
// pattern here is a "regular expression" (regex) — a mini pattern-matching
// language written between slashes, e.g. `/<[^>]*>/g` means "match a `<`,
// then any characters that aren't `>`, then a `>`" (i.e. an HTML tag); the
// trailing `g` flag means "replace every match, not just the first". Methods
// are chained one after another (`.replace(...).replace(...)`) because each
// call returns a new string, letting the next `.replace` run on that result.
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

// JS concepts packed into one line here:
// - `values.filter((v) => v && v.trim().length > 0)` — `.filter` walks the
//   array and keeps only the elements where the "arrow function" (a compact
//   function: `(params) => expression`) returns something truthy. `v &&
//   v.trim().length > 0` first checks `v` isn't an empty string/undefined,
//   then checks it isn't just whitespace.
// - `new Set(...)` builds a Set — a collection like an array but where every
//   value can only appear once, so constructing one from an array
//   automatically removes duplicates.
// - `[...someSet]` is the "spread operator": it unpacks the Set's values back
//   out into a normal array, since a Set isn't itself an array.
//
// De-dupes and drops empty/blank strings — used to clean up muscle,
// equipment, and category lists pulled from the wger API.
function unique(values: string[]): string[] {
  return [...new Set(values.filter((v) => v && v.trim().length > 0))];
}

// The `?` after `name_en` in the parameter type means that property is
// optional — the object may or may not have it. `muscle.name_en && ...` is
// the common JS "short-circuit" pattern: if `name_en` is missing/undefined
// (falsy), JS stops right there and the `&&` expression evaluates to that
// falsy value, skipping the `.trim()` call that would otherwise throw on
// undefined.
/** wger muscles carry both a latin `name` and a friendlier `name_en`. */
function muscleName(muscle: { name: string; name_en?: string }): string {
  return muscle.name_en && muscle.name_en.trim().length > 0 ? muscle.name_en : muscle.name;
}

// Difficulty comes entirely from free-exercise-db's human-assigned `level`
// now — no more name/equipment guessing. `'medium'` is just a neutral default
// for the exercises that dataset doesn't have (no sane way to guess those).
function inferDifficulty(match: FreeExerciseMatch | null): 'easy' | 'medium' | 'hard' {
  return match ? levelToDifficulty(match.level) : 'medium';
}

// `.find(...)` scans the array and returns the *first* element for which the
// callback returns true, or `undefined` if none match (unlike `.filter`,
// which returns every match as a new array). `?? null` is the "nullish
// coalescing" operator: if the left side is `undefined` (or `null`), use the
// right side instead — this normalizes `.find`'s `undefined` result to a
// plain `null`, matching this function's declared return type `string | null`.
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

// What one free-exercise-db entry gives us for a matched exercise name.
interface FreeExerciseMatch {
  level: 'beginner' | 'intermediate' | 'expert';
  mechanic: 'compound' | 'isolation' | null;
  force: 'push' | 'pull' | 'static' | null;
}

// Shared by both sides of the match: lowercase, turn hyphens/underscores into
// spaces (so "Push-Up" and "Push Up" compare equal), then collapse repeated
// whitespace down to single spaces.
function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// JS/TS concepts here:
// - `async function` / `await`: network calls take time, so `fetch()`
//   returns a `Promise` (a placeholder for a value that arrives later)
//   instead of the response itself. `await` pauses this function until that
//   promise resolves, so the code below reads top-to-bottom like synchronous
//   code even though it's really asynchronous. A function marked `async`
//   always itself returns a `Promise` — that's why the return type here is
//   `Promise<any[]>` rather than plain `any[]`.
// - `any` is TypeScript's escape hatch meaning "don't type-check this — trust
//   me." It's used for the raw wger JSON since we don't have a formal type
//   for that external API's response shape.
// - `while (url)` is a loop that keeps running as long as `url` is truthy;
//   setting `url = page.next ?? null` at the bottom means the loop naturally
//   ends once the API stops returning a "next page" link.
//
// Pages through the wger API (it returns 100 results per page with a `next`
// link) collecting every exercise entry, until either the pages run out or
// every curated name in WANTED_EXERCISES has been matched at least once.
async function fetchWgerExercises(): Promise<any[]> {
  const all: any[] = [];
  let url: string | null = WGER_API;

  while (url) {
    // Template literal: backtick strings that let you embed expressions with
    // `${...}`, instead of string-concatenating with `+`.
    console.log(`📡 Fetching ${url}`);
    const res: Response = await fetch(url);
    if (!res.ok) {
      throw new Error(`wger request failed: ${res.status} ${res.statusText}`);
    }
    const page: any = await res.json();
    // `...` here (inside the array literal) is the spread operator again —
    // it unpacks `page.results` into individual elements before pushing, so
    // `all` stays a flat array of exercises rather than an array of arrays.
    all.push(...(page.results ?? []));
    url = page.next ?? null;

    // Stop early once every curated name has at least one candidate.
    // `.flatMap` is `.map` immediately followed by flattening one level of
    // nesting — useful because the inner `.filter().map().filter()` chain
    // produces an array *per entry*, and flatMap merges all of those into one
    // flat array instead of an array-of-arrays. `.filter(Boolean)` is a
    // common shorthand: `Boolean` is used as the filtering function itself,
    // so it keeps only truthy values (drops `null`/`undefined`/`''`).
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

// Fetches free-exercise-db's full exercise list once and builds a lookup Map
// keyed by normalized name, so later per-exercise lookups are just a Map
// `.get()` instead of another network request.
async function fetchFreeExerciseIndex(): Promise<Map<string, FreeExerciseMatch>> {
  const index = new Map<string, FreeExerciseMatch>();

  try {
    const res = await fetch(FREE_EXERCISE_DB_URL);
    if (!res.ok) {
      console.warn(`⚠️  free-exercise-db fetch failed: ${res.status} ${res.statusText}`);
      return index;
    }
    const entries: any[] = await res.json();
    for (const entry of entries) {
      if (!entry.name || !entry.level) continue;
      index.set(normalizeExerciseName(entry.name), {
        level: entry.level,
        mechanic: entry.mechanic ?? null,
        force: entry.force ?? null,
      });
    }
  } catch (error) {
    console.warn('⚠️  free-exercise-db fetch errored:', error);
  }

  return index;
}

// Tries an exact normalized-name match first, then falls back to a substring
// match in either direction (same style as matchWantedName above) — e.g. our
// curated "Push Up" against free-exercise-db's "Clock Push-Up".
function findFreeExerciseMatch(
  name: string,
  index: Map<string, FreeExerciseMatch>,
): FreeExerciseMatch | null {
  const target = normalizeExerciseName(name);

  const exact = index.get(target);
  if (exact) return exact;

  for (const [candidateName, match] of index) {
    if (candidateName.includes(target) || target.includes(candidateName)) {
      return match;
    }
  }

  return null;
}

function levelToDifficulty(level: FreeExerciseMatch['level']): 'easy' | 'medium' | 'hard' {
  if (level === 'beginner') return 'easy';
  if (level === 'intermediate') return 'medium';
  return 'hard';
}

// `(typeof VIDEO_SOURCES)[number]['id']` is TypeScript "type-level" code, not
// runtime code — it reads as "the type of the `id` property, on whichever
// element type the `VIDEO_SOURCES` array/tuple contains". Combined with the
// `as const` on VIDEO_SOURCES above, that resolves to exactly
// `'leap-fitness' | 'howcast'`, so if you add a third channel to
// VIDEO_SOURCES, this type updates automatically instead of needing to be
// edited by hand in two places.
//
// What findYoutubeVideo() returns on a hit: the embeddable URL plus which of
// the two trusted channels it came from (stored as videoSource).
interface VideoMatch {
  url: string;
  source: (typeof VIDEO_SOURCES)[number]['id'];
}

/**
 * Top YouTube result for the exercise from a single channel. Returns null
 * (rather than throwing) on any failure so one bad lookup can't sink the
 * whole import.
 */
async function findYoutubeVideoOnChannel(
  name: string,
  channelId: string,
  apiKey: string,
): Promise<string | null> {
  // try/catch: if anything inside `try` throws an error (e.g. the network
  // request fails outright), execution jumps straight to `catch` instead of
  // crashing the whole script — that's how one bad lookup is prevented from
  // sinking the entire import run.
  try {
    // `new URL(...)` gives a structured object for building a URL instead of
    // string-concatenating query params by hand. `.searchParams.set(key,
    // value)` adds `?key=value`, automatically handling encoding of special
    // characters (spaces, etc).
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', `${name} exercise tutorial`);
    url.searchParams.set('type', 'video');
    url.searchParams.set('channelId', channelId);
    url.searchParams.set('maxResults', '1');
    url.searchParams.set('key', apiKey);

    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ⚠️  YouTube lookup failed for "${name}": ${res.status} ${res.statusText}`);
      return null;
    }
    const data: any = await res.json();
    // `?.` is "optional chaining": normally `data.items[0].id.videoId` would
    // throw if `items` were empty or any step along the way were
    // missing/undefined. `?.` instead short-circuits to `undefined` the
    // moment it hits a missing link, so this whole expression is safe even
    // when the search returned zero results.
    const videoId = data.items?.[0]?.id?.videoId;
    // Ternary operator: `condition ? valueIfTrue : valueIfFalse`, a compact
    // one-line if/else used here to build the embed URL only if a video was
    // actually found.
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch (error) {
    console.warn(`  ⚠️  YouTube lookup errored for "${name}":`, error);
    return null;
  }
}

// `for (const { id, channelId } of VIDEO_SOURCES)` combines two things:
// `for...of` iterates over each element of an array (unlike a plain `for`
// loop, you don't manage an index yourself), and `{ id, channelId }` is
// "destructuring" — it pulls the `id` and `channelId` properties straight out
// of each object into their own local variables instead of writing
// `source.id` / `source.channelId`.
/** Tries each trusted channel in order (Leap Fitness, then Howcast) and returns the first hit. */
async function findYoutubeVideo(name: string, apiKey: string): Promise<VideoMatch | null> {
  for (const { id, channelId } of VIDEO_SOURCES) {
    const url = await findYoutubeVideoOnChannel(name, channelId, apiKey);
    if (url) return { url, source: id };
  }
  return null;
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
  // Step 1: load API keys. Missing keys aren't fatal — the script still runs
  // and just leaves videoUrl/gifUrl null for every exercise.
  const youtubeKey = process.env.YOUTUBE_API_KEY;
  const giphyKey = process.env.GIPHY_API_KEY;

  if (!youtubeKey) console.warn('⚠️  YOUTUBE_API_KEY not set — every videoUrl will be null.');
  if (!giphyKey) console.warn('⚠️  GIPHY_API_KEY not set — every gifUrl will be null.');

  // Step 2: pull every wger exercise page (see fetchWgerExercises above).
  const raw = await fetchWgerExercises();
  console.log(`📦 Fetched ${raw.length} wger entries; filtering to the curated list.`);

  // Step 2.5: pull free-exercise-db's full list once too, indexed by name,
  // for the difficulty/mechanic/force enrichment in Step 4 below.
  const freeExerciseIndex = await fetchFreeExerciseIndex();
  console.log(`📚 Indexed ${freeExerciseIndex.size} free-exercise-db entries for difficulty/mechanic/force matching.`);

  // Step 3: reduce the raw wger dump down to one entry per curated name.
  // wger entries carry translations in many languages; language === 2 is
  // English. First wger match for a given curated name wins.
  //
  // `Map<KeyType, ValueType>` is JS's key-value dictionary type (like a plain
  // `{}` object, but keys can be any type and it has clearer methods:
  // `.set(key, value)`, `.get(key)`, `.has(key)`). The `<...>` here are TS
  // "generics" — they tell TypeScript exactly what type of keys/values this
  // particular Map will hold, so `.get()` results are typed instead of `any`.
  const picked = new Map<string, { entry: any; translation: any }>();

  for (const entry of raw) {
    const english = (entry.translations ?? []).find((t: any) => t.language === 2 && t.name);
    if (!english) continue;

    const wanted = matchWantedName(english.name);
    if (!wanted || picked.has(wanted)) continue;

    picked.set(wanted, { entry, translation: english });
  }

  // Curated names wger had nothing for — just a warning, not an error.
  const missingFromWger = WANTED_EXERCISES.filter((n) => !picked.has(n));
  if (missingFromWger.length > 0) {
    console.warn(`⚠️  No wger match for: ${missingFromWger.join(', ')}`);
  }

  const exercises: SeedExercise[] = [];
  const missingVideos: MissingVideoExercise[] = [];
  // Names that got no free-exercise-db match — difficulty falls back to the
  // heuristic for these, and mechanic/force stay null. Tracked just for the
  // coverage log below, not written to any file.
  const unmatchedInFreeExerciseDb: string[] = [];

  // Step 4: for each matched exercise, normalize its wger fields and enrich
  // it with a video (YouTube) and a gif (Giphy) lookup.
  //
  // Iterating `for...of picked` over a Map yields `[key, value]` pairs, so
  // `[wantedName, { entry, translation }]` destructures both at once: array
  // destructuring pulls out the key/value pair, and the nested `{ entry,
  // translation }` object destructuring immediately unpacks that value's two
  // properties into their own variables.
  for (const [wantedName, { entry, translation }] of picked) {
    const muscleGroups = unique([
      ...(entry.muscles ?? []).map(muscleName),
      ...(entry.muscles_secondary ?? []).map(muscleName),
    ]);
    const equipment = unique((entry.equipment ?? []).map((e: any) => e.name));
    const exerciseTypes = unique([entry.category?.name].filter(Boolean));

    console.log(`🏋️  ${wantedName} (wger #${entry.id})`);

    // findYoutubeVideo tries Leap Fitness first, then Howcast, returning the
    // first hit; null if neither channel has a matching video.
    const video = youtubeKey ? await findYoutubeVideo(wantedName, youtubeKey) : null;
    const gifUrl = giphyKey ? await findGiphyGif(wantedName, giphyKey) : null;
    const freeExerciseMatch = findFreeExerciseMatch(wantedName, freeExerciseIndex);

    if (!video) {
      missingVideos.push({ name: wantedName, wgerId: entry.id });
    }
    if (!freeExerciseMatch) {
      unmatchedInFreeExerciseDb.push(wantedName);
    }

    // Object shorthand: writing `gifUrl,` instead of `gifUrl: gifUrl,` is
    // just shorter syntax for "use the existing local variable's name as the
    // property key too" — `muscleGroups`, `equipment`, and `exerciseTypes`
    // below do the same thing. `video?.url ?? null` chains optional chaining
    // (in case `video` itself is null) with nullish coalescing (fall back to
    // `null` if the result is undefined), matching SeedExercise's declared
    // `string | null` type.
    exercises.push({
      name: wantedName,
      description: stripHtml(translation.description ?? '') || `${wantedName} exercise.`,
      difficulty: inferDifficulty(freeExerciseMatch),
      mechanic: freeExerciseMatch?.mechanic ?? null,
      force: freeExerciseMatch?.force ?? null,
      videoUrl: video?.url ?? null,
      videoSource: video?.source ?? null,
      gifUrl,
      muscleDiagramUrl: entry.images?.[0]?.image ?? null,
      muscleGroups,
      equipment,
      exerciseTypes,
      source: { wgerId: entry.id, wgerUuid: entry.uuid },
    });
  }

  // Step 5: write the final snapshot (consumed by seed.ts) plus a separate
  // list of exercises still missing a video (consumed by
  // fill-missing-videos.ts).
  // `import.meta.dirname` is the folder this file lives in (ESM's
  // replacement for the older CommonJS `__dirname`); `join(...)` combines it
  // with a filename into a proper OS-correct path. `JSON.stringify(value,
  // null, 2)` turns a JS object into a JSON-formatted string — the `2` means
  // "indent nested content with 2 spaces" so the written file is
  // human-readable instead of one long line.
  const dataPath = join(import.meta.dirname, 'exercise-seed-data.json');
  const missingPath = join(import.meta.dirname, 'missing-video-exercises.json');

  writeFileSync(dataPath, `${JSON.stringify(exercises, null, 2)}\n`);
  writeFileSync(missingPath, `${JSON.stringify(missingVideos, null, 2)}\n`);

  console.log(`\n✅ Wrote ${exercises.length} exercises to ${dataPath}`);
  console.log(`   ${exercises.filter((e) => e.videoUrl).length} with a video, ${exercises.filter((e) => e.gifUrl).length} with a gif.`);
  console.log(
    `   ${exercises.length - unmatchedInFreeExerciseDb.length}/${exercises.length} matched free-exercise-db (real difficulty/mechanic/force); ${unmatchedInFreeExerciseDb.length} fell back to the heuristic.`,
  );
  if (missingVideos.length > 0) {
    console.log(`   ${missingVideos.length} missing a video → ${missingPath} (run npm run db:fill-missing-videos)`);
  }
  console.log('   Spot-check the generated videoUrl/gifUrl values before committing.');
}

// This file is a script, not a library, so it calls its own `main()` at the
// bottom instead of waiting to be imported and called elsewhere. `main()`
// returns a Promise (because it's `async`); `.catch(...)` attaches an error
// handler to that promise so that if anything inside `main` throws (and
// isn't already caught, like the try/catches above are), it's reported here
// with a non-zero exit code instead of Node printing an unhandled-rejection
// warning and hanging.
main().catch((e) => {
  console.error('❌ Import failed:', e);
  process.exit(1);
});
