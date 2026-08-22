import { useEffect, useRef } from "react";
import { extractYoutubeVideoId } from "@/lib/youtube";

interface Props {
  gifUrl: string;
  className?: string;
}

let apiReadyPromise: Promise<void> | null = null;

function loadYouTubeIframeAPI(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiReadyPromise) return apiReadyPromise;

  apiReadyPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
  });

  return apiReadyPromise;
}

export default function GifLoop({ gifUrl, className }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  useEffect(() => {
    const videoId = extractYoutubeVideoId(gifUrl);
    if (!videoId || !mountRef.current) return;

    let cancelled = false;
    let loopInterval: number | undefined;

    loadYouTubeIframeAPI().then(() => {
      if (cancelled || !mountRef.current || !window.YT) return;

      playerRef.current = new window.YT.Player(mountRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          // Legacy quality hint — ignored by current YouTube embeds but
          // harmless to include; setPlaybackQuality below does the real work.
          vq: "hd1080",
        },
        events: {
          onReady: (event) => {
            // YT.Player replaces the mount div with a real <iframe>, so any
            // style set on the div beforehand is discarded — the crop that
            // hides the title bar/logo/end-card only takes effect if applied
            // directly to the actual iframe once it exists.
            Object.assign(event.target.getIframe().style, {
              position: "absolute",
              top: "-15%",
              left: "-10%",
              width: "120%",
              height: "130%",
              border: "0",
              pointerEvents: "none",
            });
            event.target.setPlaybackQuality("hd1080");
            event.target.playVideo();
            // Belt-and-braces: onStateChange's ENDED fires the restart
            // immediately, but if a frame is ever missed, this poll catches
            // it a beat later so playback never sits on the replay screen.
            loopInterval = window.setInterval(() => {
              const player = playerRef.current;
              if (!player) return;
              const duration = player.getDuration();
              const currentTime = player.getCurrentTime();
              if (duration > 0 && currentTime >= duration - 0.1) {
                player.seekTo(0);
                player.playVideo();
              }
            }, 50);
          },
          onStateChange: (event) => {
            // YouTube shows a replay overlay the instant it reaches ENDED —
            // restarting only on the next poll tick lets that overlay flash
            // on screen, so handle it here first for an instant restart.
            if (event.data === window.YT?.PlayerState.ENDED) {
              event.target.seekTo(0);
              event.target.playVideo();
            }
          },
          onPlaybackQualityChange: (event) => {
            // Adaptive streaming can silently drop quality after playback
            // starts (e.g. buffering) — re-assert 1080p whenever it changes.
            if (event.target.getPlaybackQuality() !== "hd1080") {
              event.target.setPlaybackQuality("hd1080");
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (loopInterval) clearInterval(loopInterval);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [gifUrl]);

  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden", background: "#000" }}
    >
      <div ref={mountRef} />
    </div>
  );
}
