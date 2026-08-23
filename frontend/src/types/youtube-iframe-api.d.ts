declare global {
  interface YTPlayerEvent {
    target: YTPlayer;
  }

  interface YTPlayerStateChangeEvent extends YTPlayerEvent {
    data: number;
  }

  interface YTPlayer {
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    seekTo(seconds: number, allowSeekAhead?: boolean): void;
    getDuration(): number;
    getCurrentTime(): number;
    getPlayerState(): number;
    setPlaybackQuality(quality: string): void;
    getPlaybackQuality(): string;
    getIframe(): HTMLIFrameElement;
    destroy(): void;
  }

  interface YTPlayerOptions {
    videoId: string;
    playerVars?: Record<string, number | string>;
    events?: {
      onReady?: (event: YTPlayerEvent) => void;
      onStateChange?: (event: YTPlayerStateChangeEvent) => void;
      onPlaybackQualityChange?: (event: YTPlayerEvent) => void;
      onError?: (event: YTPlayerEvent) => void;
    };
  }

  interface YTNamespace {
    Player: new (el: HTMLElement, options: YTPlayerOptions) => YTPlayer;
    PlayerState: {
      UNSTARTED: number;
      ENDED: number;
      PLAYING: number;
      PAUSED: number;
      BUFFERING: number;
      CUED: number;
    };
  }

  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export {};

