import { useCallback, useEffect, useRef, useState } from "react";

// The Document Picture-in-Picture API isn't in TS's lib yet.
interface DocumentPictureInPicture {
  requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
  window: Window | null;
}
declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

interface Options {
  remaining: number;
  running: boolean;
  label: string;
  backgroundUrl: string;
  formatTime: (seconds: number) => string;
  onToggleStart: () => void;
  onReset: () => void;
}

/**
 * Pops the timer out into an always-on-top Picture-in-Picture window so it
 * stays visible while the user works in another app. The PiP document is
 * plain DOM (not React) — this hook keeps its contents in sync via an effect.
 *
 * The window is freely resizable; the background sits on a fixed inset:0
 * layer with `background-size: cover`, so it fills the frame at any size /
 * aspect ratio without letterbox gaps, and the timer scales with viewport
 * units so it never overflows.
 */
export function useTimerPopout({
  remaining,
  running,
  label,
  backgroundUrl,
  formatTime,
  onToggleStart,
  onReset,
}: Options) {
  const [active, setActive] = useState(false);
  const pipRef = useRef<Window | null>(null);
  // Latest handlers, so the listeners bound once on the PiP buttons always
  // call through to the current closures.
  const handlersRef = useRef({ onToggleStart, onReset });
  useEffect(() => {
    handlersRef.current = { onToggleStart, onReset };
  });

  const supported =
    typeof window !== "undefined" && "documentPictureInPicture" in window;

  const popOut = useCallback(async () => {
    if (!supported) return;
    if (pipRef.current) {
      pipRef.current.focus();
      return;
    }

    const pip = await window.documentPictureInPicture!.requestWindow({
      width: 340,
      height: 230,
    });
    pipRef.current = pip;

    // The PiP window is a separate document and doesn't inherit the parent's
    // stylesheets — pull in the same Poppins face the app uses.
    const fontLink = pip.document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap";
    pip.document.head.appendChild(fontLink);

    const style = pip.document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { width: 100%; height: 100%; }
      body {
        font-family: Poppins, system-ui, -apple-system, sans-serif;
        color: #fff;
        overflow: hidden;
        background: #0b0b0f;
      }
      .bg {
        position: fixed;
        inset: 0;
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
      }
      .bg::after {
        content: "";
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
      }
      .wrap {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: clamp(6px, 3vh, 16px);
        padding: 4vmin;
        text-align: center;
      }
      .label {
        font-size: clamp(9px, 3.2vw, 13px);
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.6);
      }
      .time {
        font-size: clamp(32px, 17vw, 96px);
        font-weight: 700;
        line-height: 1;
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
      }
      .controls {
        display: flex;
        gap: clamp(6px, 2.5vw, 12px);
        justify-content: center;
        align-items: center;
      }
      button {
        font-family: inherit;
        font-weight: 700;
        border: none;
        border-radius: 999px;
        cursor: pointer;
        transition: opacity 0.15s;
        backdrop-filter: blur(6px);
      }
      button:hover { opacity: 0.85; }
      #toggle {
        padding: clamp(5px, 1.5vh, 9px) clamp(16px, 7vw, 30px);
        font-size: clamp(11px, 3.6vw, 15px);
        background: #fff;
        color: #000;
      }
      #reset {
        width: clamp(30px, 11vw, 40px);
        height: clamp(30px, 11vw, 40px);
        font-size: clamp(13px, 4.5vw, 18px);
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
      }
    `;
    pip.document.head.appendChild(style);

    pip.document.body.innerHTML = `
      <div class="bg"></div>
      <div class="wrap">
        <div class="label"></div>
        <div class="time"></div>
        <div class="controls">
          <button id="reset" aria-label="Reset" title="Reset">&#8635;</button>
          <button id="toggle"></button>
        </div>
      </div>
    `;

    pip.document
      .getElementById("toggle")
      ?.addEventListener("click", () => handlersRef.current.onToggleStart());
    pip.document
      .getElementById("reset")
      ?.addEventListener("click", () => handlersRef.current.onReset());
    pip.addEventListener("pagehide", () => {
      pipRef.current = null;
      setActive(false);
    });

    setActive(true);
  }, [supported]);

  // Keep the PiP window's contents in sync with timer state + background.
  useEffect(() => {
    const pip = pipRef.current;
    if (!pip || !active) return;
    const bg = pip.document.querySelector<HTMLElement>(".bg");
    const time = pip.document.querySelector(".time");
    const labelEl = pip.document.querySelector(".label");
    const toggle = pip.document.getElementById("toggle");
    if (bg) bg.style.backgroundImage = `url("${backgroundUrl}")`;
    if (time) time.textContent = formatTime(remaining);
    if (labelEl) labelEl.textContent = label;
    if (toggle) toggle.textContent = running ? "Pause" : "Start";
  }, [remaining, running, label, backgroundUrl, formatTime, active]);

  // Close the PiP window if the timer page unmounts.
  useEffect(() => {
    return () => pipRef.current?.close();
  }, []);

  return { popOut, active, supported };
}
