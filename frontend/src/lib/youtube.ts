export function extractYoutubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/)|embed\/|v=)([\w-]{11})/
  );
  return match ? match[1] : null;
}

export function getYoutubeThumbnailUrl(url?: string | null): string | null {
  if (!url) return null;
  const videoId = extractYoutubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

export function getYoutubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const videoId = extractYoutubeVideoId(url);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : url;
}

