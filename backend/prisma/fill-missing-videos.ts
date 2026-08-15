/**
 * Fallback maintenance script — run only if import-wger.ts left gaps.
 *
 * import-wger.ts restricts video search to the Leap Fitness channel, so some
 * exercises come out with videoUrl: null. This script reads the small
 * missing-video-exercises.json list it leaves behind and re-queries YouTube
 * *without* the channel restriction for just those exercises.
 *
 * Kept separate from import-wger.ts on purpose: the trusted single-channel
 * search and the best-effort broad search stay distinguishable, and each
 * filled entry records videoSource: "youtube-search" so anyone reading the
 * data later can tell where a video came from.
 *
 * Run with: npm run db:fill-missing-videos
 */
import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MissingVideoExercise, SeedExercise } from './import-wger.js';

const dataPath = join(import.meta.dirname, 'exercise-seed-data.json');
const missingPath = join(import.meta.dirname, 'missing-video-exercises.json');

/** Unrestricted YouTube search — best-effort, null on any failure. */
async function findYoutubeVideo(name: string, apiKey: string): Promise<string | null> {
  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', `${name} exercise tutorial`);
    url.searchParams.set('type', 'video');
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

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not set in backend/.env — nothing to search with.');
  }

  const missing: MissingVideoExercise[] = JSON.parse(readFileSync(missingPath, 'utf8'));
  if (missing.length === 0) {
    console.log('✅ missing-video-exercises.json is empty — nothing to fill.');
    return;
  }

  const exercises: SeedExercise[] = JSON.parse(readFileSync(dataPath, 'utf8'));
  // Built once so each fill is an O(1) lookup rather than a re-scan per item.
  const byName = new Map(exercises.map((e) => [e.name, e]));

  const stillMissing: MissingVideoExercise[] = [];
  let filled = 0;

  for (const item of missing) {
    console.log(`🔎 ${item.name} (wger #${item.wgerId})`);
    const exercise = byName.get(item.name);
    if (!exercise) {
      console.warn(`  ⚠️  "${item.name}" is not in exercise-seed-data.json — skipping.`);
      continue;
    }

    const videoUrl = await findYoutubeVideo(item.name, apiKey);
    if (videoUrl) {
      exercise.videoUrl = videoUrl;
      exercise.videoSource = 'youtube-search';
      filled += 1;
      console.log(`  ✅ ${videoUrl}`);
    } else {
      stillMissing.push(item);
      console.log('  ❌ still no match');
    }
  }

  writeFileSync(dataPath, `${JSON.stringify(exercises, null, 2)}\n`);
  writeFileSync(missingPath, `${JSON.stringify(stillMissing, null, 2)}\n`);

  console.log(`\n✅ Filled ${filled} video(s); ${stillMissing.length} still missing.`);
  console.log('   Spot-check the new videoUrl values before committing.');
}

main().catch((e) => {
  console.error('❌ Fill failed:', e);
  process.exit(1);
});
