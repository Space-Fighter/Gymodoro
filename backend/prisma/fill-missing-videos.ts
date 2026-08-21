/**
 * Fallback maintenance script — run after import-wger.ts / import-darebee.ts
 * leaves gaps.
 *
 * Those scripts restrict video search to the Leap Fitness/Howcast channels,
 * so plenty of exercises come out with videoUrl: null. This script reads the
 * missing-video-exercises.json list they leave behind and fills every one it
 * can via an unrestricted yt-dlp search (no API key, no quota) — the same
 * scraping approach import-*.ts already use, just with no channel filter.
 *
 * videoUrl must never end up equal to gifUrl (Darebee's own looping demo
 * embed) — findYoutubeVideoUnrestricted() already excludes both the Darebee
 * channel and the gif's own video id, and the result is checked again here
 * before being written.
 *
 * Whatever yt-dlp can't find stays in missing-video-exercises.json,
 * unchanged, for a future run.
 *
 * Run with: npm run db:fill-missing-videos
 */
import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MissingVideoExercise, SeedExercise } from './types.js';
import { extractYoutubeVideoId, findYoutubeVideoUnrestricted } from './youtube.js';

const dataPath = join(import.meta.dirname, 'exercise-seed-data.json');
const missingPath = join(import.meta.dirname, 'missing-video-exercises.json');

async function main() {
  const missing: MissingVideoExercise[] = JSON.parse(readFileSync(missingPath, 'utf8'));
  if (missing.length === 0) {
    console.log('✅ missing-video-exercises.json is empty — nothing to fill.');
    return;
  }

  const exercises: SeedExercise[] = JSON.parse(readFileSync(dataPath, 'utf8'));
  const byName = new Map(exercises.map((e) => [e.name, e]));

  const stillMissing: MissingVideoExercise[] = [];
  let filled = 0;

  // Persists after every single item (not just at the end) so Ctrl-C never
  // loses progress: missingPath always reflects "everything not yet
  // successfully filled" — both confirmed misses so far and whatever hasn't
  // been attempted yet in this run.
  function persist(unprocessed: MissingVideoExercise[]) {
    writeFileSync(dataPath, `${JSON.stringify(exercises, null, 2)}\n`);
    writeFileSync(missingPath, `${JSON.stringify([...stillMissing, ...unprocessed], null, 2)}\n`);
  }

  for (let i = 0; i < missing.length; i++) {
    const item = missing[i];
    console.log(`🔎 ${item.name}${item.wgerId ? ` (wger #${item.wgerId})` : ''}`);
    const exercise = byName.get(item.name);
    if (!exercise) {
      console.warn(`  ⚠️  "${item.name}" is not in exercise-seed-data.json — skipping.`);
      continue;
    }

    // gifUrl already holds Darebee's own demo embed for this exercise —
    // videoUrl must never end up pointing at that same video.
    const gifVideoId = extractYoutubeVideoId(exercise.gifUrl);

    const ytDlpResult = await findYoutubeVideoUnrestricted(item.name, gifVideoId);
    const videoUrl =
      ytDlpResult && extractYoutubeVideoId(ytDlpResult.url) !== gifVideoId ? ytDlpResult.url : null;

    if (videoUrl) {
      exercise.videoUrl = videoUrl;
      exercise.videoSource = 'yt-dlp-search';
      filled += 1;
      console.log(`  ✅ [yt-dlp-search] ${videoUrl}`);
    } else {
      stillMissing.push(item);
      console.log('  ❌ still no match');
    }

    persist(missing.slice(i + 1));
  }

  console.log(`\n✅ Filled ${filled} video(s) via yt-dlp; ${stillMissing.length} still missing.`);
  console.log('   Spot-check the new videoUrl values before committing.');
}

main().catch((e) => {
  console.error('❌ Fill failed:', e);
  process.exit(1);
});
