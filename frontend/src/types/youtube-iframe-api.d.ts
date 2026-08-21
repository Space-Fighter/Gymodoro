declare global {
  interface YTPlayerEvent {
    target: YTPlayer;
  }

  interface YTPlayerStateChangeEvent extends YTPlayerEvent {
    data: number;
  }

  interface YTPlayer {
    playVideo(): void;
    seekTo(seconds: number, allowSeekAhead?: boolean): void;
    getDuration(): number;
    getCurrentTime(): number;
    setPlaybackQuality(quality: string): void;
    getPlaybackQuality(): string;
    destroy(): void;
  }

  interface YTPlayerOptions {
    videoId: string;
    playerVars?: Record<string, number | string>;
    events?: {
      onReady?: (event: YTPlayerEvent) => void;
      onStateChange?: (event: YTPlayerStateChangeEvent) => void;
      onPlaybackQualityChange?: (event: YTPlayerEvent) => void;
    };
  }

  interface YTNamespace {
    Player: new (el: HTMLElement, options: YTPlayerOptions) => YTPlayer;
    PlayerState: {
      ENDED: number;
    };
  }

  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export {};
