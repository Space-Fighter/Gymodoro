/**
 * Shared "trusted channel" YouTube lookup used by both import-wger.ts and
 * import-darebee.ts to fill Exercise.videoUrl with a detailed instructional
 * video, independent of whichever catalog (wger or Darebee) a given
 * exercise's name/description came from.
 *
 * Uses a standalone yt-dlp binary (scraping YouTube search, no API
 * key/quota) — see YT_DLP_PATH below for how to fetch it.
 */
import { execFile } from 'node:child_process';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// Standalone yt-dlp binary, downloaded separately (not checked in — see
// backend/.gitignore) via:
//   curl -L -o .tools/yt-dlp.exe https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe
export const YT_DLP_PATH = join(import.meta.dirname, '..', '.tools', 'yt-dlp.exe');

// Neither trusted channel exposes a "search within channel" tab, so there's
// no way to search *scoped* to just Leap Fitness or Howcast. Instead this
// runs a normal search and filters the results down to those two channel
// IDs — hence a generous result count, to give an unrelated top result room
// to not crowd out a trusted-channel video further down.
const YT_SEARCH_RESULT_COUNT = 20;

// videoUrl is restricted to these two trusted channels — Leap Fitness ("Home
// Workout") and Howcast — tried in order. Anything neither covers is left
// null and handed off to fill-missing-videos.ts rather than falling back
// silently here.
const LEAP_FITNESS_CHANNEL_ID = 'UCiFMiTjklR2FHfRLt04ywyA';
const HOWCAST_CHANNEL_ID = 'UCSpVHeDGr9UbREhRca0qwsA';

// Darebee's own channel — already used as gifUrl's source (the looping demo
// embed), so it must never also end up as videoUrl's "separate instructional
// video". Exported so fill-missing-videos.ts's YouTube Data API search can
// filter it out too.
export const DAREBEE_CHANNEL_ID = 'UCzxSaF_E3mVGeFkRWMCyvQQ';

const VIDEO_SOURCES = [
  { id: 'leap-fitness', channelId: LEAP_FITNESS_CHANNEL_ID },
  { id: 'howcast', channelId: HOWCAST_CHANNEL_ID },
] as const;

export interface VideoMatch {
  url: string;
  source: (typeof VIDEO_SOURCES)[number]['id'];
}

interface YtDlpSearchResult {
  id: string;
  channel_id: string;
  title: string;
}

/** Pulls the video id out of a `.../embed/<id>` URL, e.g. for de-dup checks. */
export function extractYoutubeVideoId(embedUrl: string | null | undefined): string | null {
  if (!embedUrl) return null;
  const match = embedUrl.match(/\/embed\/([^/?]+)/);
  return match ? match[1] : null;
}

/**
 * Scrapes YouTube search results via the yt-dlp binary (no API key, no
 * quota) instead of the YouTube Data API. Returns null (rather than
 * throwing) on any failure so one bad lookup can't sink the whole import.
 */
export async function findYoutubeVideo(name: string): Promise<VideoMatch | null> {
  try {
    const { stdout } = await execFileAsync(
      YT_DLP_PATH,
      [`ytsearch${YT_SEARCH_RESULT_COUNT}:${name} exercise tutorial`, '--flat-playlist', '-j', '--no-warnings'],
      { maxBuffer: 10 * 1024 * 1024 },
    );

    const results: YtDlpSearchResult[] = stdout
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));

    for (const { id, channelId } of VIDEO_SOURCES) {
      const hit = results.find((r) => r.channel_id === channelId);
      if (hit) return { url: `https://www.youtube.com/embed/${hit.id}`, source: id };
    }
    return null;
  } catch (error) {
    console.warn(`  ⚠️  yt-dlp search failed for "${name}":`, error);
    return null;
  }
}

/**
 * Unrestricted yt-dlp lookup — takes YouTube's own top search result with no
 * channel filtering. Used as a quota-free fallback (fill-missing-videos.ts)
 * for whatever findYoutubeVideo() didn't match to a trusted channel.
 */
export async function findYoutubeVideoUnrestricted(
  name: string,
  excludeVideoId?: string | null,
): Promise<{ url: string } | null> {
  try {
    const { stdout } = await execFileAsync(
      YT_DLP_PATH,
      // Pull a generous result page, not just the top few — Darebee's own
      // channel ranks highly for these queries (it's the source of the
      // exercise name itself), so a shallow pool made the
      // DAREBEE_CHANNEL_ID/excludeVideoId exclusion below exhaust every
      // candidate too often. 20 matches findYoutubeVideo()'s pool size above.
      [`ytsearch${YT_SEARCH_RESULT_COUNT}:${name} exercise tutorial`, '--flat-playlist', '-j', '--no-warnings'],
      { maxBuffer: 10 * 1024 * 1024 },
    );

    const results: YtDlpSearchResult[] = stdout
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));

    // The channel_id check catches Darebee's channel by name; the id check
    // is the real invariant — videoUrl must never end up equal to gifUrl no
    // matter which channel metadata claims the video came from.
    const hit = results.find((r) => r.channel_id !== DAREBEE_CHANNEL_ID && r.id !== excludeVideoId);
    return hit ? { url: `https://www.youtube.com/embed/${hit.id}` } : null;
  } catch (error) {
    console.warn(`  ⚠️  yt-dlp unrestricted search failed for "${name}":`, error);
    return null;
  }
}
