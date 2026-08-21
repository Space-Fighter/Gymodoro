/**
 * One-time-run maintenance script — NOT part of `db:seed`.
 *
 * Darebee.com is now the primary exercise catalog: it gives us curated
 * name/description, difficulty, muscle-group text, a type/body-area tag pair,
 * a "what it works" image, and a YouTube embed per exercise. This script
 * scrapes it and writes a static snapshot to prisma/exercise-seed-data.json.
 * seed.ts then reads that snapshot with no network access at all, so normal
 * dev setup stays fast and deterministic.
 *
 * Darebee's own YouTube embed is stored as `gifUrl` (the frontend loops it in
 * place of an actual gif); `videoUrl` is a separate, detailed instructional
 * video looked up via the shared Leap Fitness/Howcast yt-dlp search in
 * ./youtube.ts (same lookup import-wger.ts uses, just keyed by Darebee's
 * exercise name instead of wger's).
 *
 * Darebee has no public API or sitemap, but /library.html embeds its entire
 * catalog as an inline JS array (`var items = [...]`) — one fetch gets every
 * exercise's name/url/type/focus/difficulty with no pagination or crawling
 * needed. Per-exercise pages are then scraped individually for description,
 * muscle-group text, the video embed, and the "works" image.
 *
 * Run with: npm run db:import-darebee
 *
 * Video lookup uses a standalone yt-dlp binary (scraping YouTube search, no
 * API key/quota) — see YT_DLP_PATH in ./youtube.ts for how to fetch it.
 */
import 'dotenv/config';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MissingVideoExercise, SeedExercise } from './types.js';
import { findYoutubeVideo, YT_DLP_PATH } from './youtube.js';

const LIBRARY_URL = 'https://darebee.com/library.html';
const BASE_URL = 'https://darebee.com/';

// Politeness delay between per-exercise-page fetches — Darebee has no
// published rate limit, but ~161 sequential requests deserves some spacing.
const REQUEST_DELAY_MS = 0;

/** One row from library.html's embedded catalog. */
interface LibraryItem {
  t: string; // title
  u: string; // relative url, e.g. "exercises/arms-circles.html"
  a: string; // slug
  ty: string; // type: strength | cardio | stretching | combat | metcon | yoga
  f: string; // focus/body area: abs | upper-body | lower-body | full-body | back
  d: string; // difficulty: light | easy | normal | hard | advanced
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetches library.html and pulls out its inline `var items = [...]` catalog. */
async function fetchLibraryItems(): Promise<LibraryItem[]> {
  const res = await fetch(LIBRARY_URL);
  if (!res.ok) {
    throw new Error(`library.html request failed: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();

  const match = html.match(/var items = (\[.*?\]);/s);
  if (!match) {
    throw new Error('Could not find "var items = [...]" catalog array in library.html — page structure may have changed.');
  }

  return JSON.parse(match[1]);
}

interface ExercisePageData {
  description: string;
  muscleDiagramUrl: string | null;
  gifUrl: string | null;
  muscleGroups: string[];
}

/** Scrapes one exercise page for its JSON-LD block and "Works:" muscle list. */
async function fetchExercisePage(url: string): Promise<ExercisePageData> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${url} request failed: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();

  // Darebee embeds one application/ld+json ExercisePlan block per page with
  // description, the "works" image, and (when a demo video exists) a nested
  // VideoObject with an embeddable YouTube URL.
  const ldJsonMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const ldJson = ldJsonMatch ? JSON.parse(ldJsonMatch[1]) : {};

  const worksMatch = html.match(/<strong>Works:<\/strong>\s*([^<]+)</);
  const muscleGroups = worksMatch
    ? worksMatch[1]
      .split(/,| and /i)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    : [];

  return {
    description: ldJson.description ?? '',
    muscleDiagramUrl: ldJson.image ?? null,
    gifUrl: ldJson.video?.embedUrl ?? null,
    muscleGroups,
  };
}

async function main() {
  if (!existsSync(YT_DLP_PATH)) {
    throw new Error(
      `yt-dlp binary not found at ${YT_DLP_PATH}. Download it with:\n` +
      '  curl -L -o .tools/yt-dlp.exe https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe',
    );
  }

  console.log(`📡 Fetching ${LIBRARY_URL}`);
  const items = await fetchLibraryItems();
  console.log(`📦 Found ${items.length} exercises in the Darebee catalog.`);

  const exercises: SeedExercise[] = [];
  const missingVideos: MissingVideoExercise[] = [];

  for (const item of items) {
    const url = `${BASE_URL}${item.u}`;
    console.log(`🏋️  ${item.t} (${item.a})`);

    const page = await fetchExercisePage(url);
    const video = await findYoutubeVideo(item.t);

    if (!video) {
      missingVideos.push({ name: item.t });
    }

    exercises.push({
      name: item.t,
      description: page.description || `${item.t} exercise.`,
      difficulty: item.d,
      mechanic: null,
      force: null,
      videoUrl: video?.url ?? null,
      videoSource: video?.source ?? null,
      gifUrl: page.gifUrl,
      muscleDiagramUrl: page.muscleDiagramUrl,
      bodyArea: item.f,
      muscleGroups: page.muscleGroups,
      equipment: ['Bodyweight'],
      exerciseTypes: [item.ty],
      source: { darebeeUrl: url },
    });

    await sleep(REQUEST_DELAY_MS);
  }

  const dataPath = join(import.meta.dirname, 'exercise-seed-data.json');
  const missingPath = join(import.meta.dirname, 'missing-video-exercises.json');

  writeFileSync(dataPath, `${JSON.stringify(exercises, null, 2)}\n`);
  writeFileSync(missingPath, `${JSON.stringify(missingVideos, null, 2)}\n`);

  console.log(`\n✅ Wrote ${exercises.length} exercises to ${dataPath}`);
  console.log(
    `   ${exercises.filter((e) => e.videoUrl).length} with an instructional video, ${exercises.filter((e) => e.gifUrl).length} with a Darebee demo embed.`,
  );
  if (missingVideos.length > 0) {
    console.log(`   ${missingVideos.length} missing an instructional video → ${missingPath} (run npm run db:fill-missing-videos)`);
  }
  console.log('   Spot-check the generated videoUrl/gifUrl values before committing.');
}

main().catch((e) => {
  console.error('❌ Import failed:', e);
  process.exit(1);
});
