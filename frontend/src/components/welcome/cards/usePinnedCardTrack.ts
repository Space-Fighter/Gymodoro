import { useEffect, useRef } from "react";
import { useCalm } from "../useCalm";

/**
 * Drives a "pin while cards travel sideways" section: the outer `sectionRef`
 * is inflated in height so ordinary page scroll has room to run, its sticky
 * child holds in place, and `trackRef` is translated left in proportion to
 * how far the page has scrolled through that inflated height. `fillRef` (an
 * optional progress-bar fill) is kept in sync with the same 0→1 value.
 *
 * Imperative (not framer-motion's `useScroll`) because the travel distance
 * depends on the track's own measured overflow (`scrollWidth`), which isn't
 * known until layout — same approach the original design prototype used,
 * ported from its vanilla-JS scroll listener.
 */
export function usePinnedCardTrack() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const calm = useCalm();

  useEffect(() => {
    let queued = false;

    const overflowOf = (track: HTMLDivElement) =>
      Math.max(0, track.scrollWidth - window.innerWidth);

    const panelHeight = (section: HTMLElement) => {
      const sticky = section.firstElementChild as HTMLElement | null;
      return Math.max(window.innerHeight || 0, sticky ? sticky.offsetHeight : 0, 560);
    };

    const layout = () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return false;
      if (calm) {
        section.style.height = "auto";
        if (track.parentElement) track.parentElement.style.overflowX = "auto";
        return true;
      }
      const panel = panelHeight(section);
      const over = overflowOf(track);
      if (!track.scrollWidth) return false;
      section.style.height = `${panel + over * 1.15 + 120}px`;
      return true;
    };

    const update = () => {
      if (calm) return;
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;
      const panel = panelHeight(section);
      const travel = Math.max(1, section.offsetHeight - panel);
      const p = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / travel));
      const eased = Math.min(1, p / 0.92);
      track.style.transform = `translate3d(${-eased * overflowOf(track)}px,0,0)`;
      if (fillRef.current) fillRef.current.style.width = `${eased * 100}%`;
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        update();
      });
    };
    const onResize = () => {
      layout();
      update();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(onResize);
      if (trackRef.current) ro.observe(trackRef.current);
      if (sectionRef.current) ro.observe(sectionRef.current);
    }
    if (document.fonts?.ready) document.fonts.ready.then(onResize);

    let tries = 0;
    const boot = window.setInterval(() => {
      tries += 1;
      const ok = layout();
      update();
      if (ok || tries > 40) window.clearInterval(boot);
    }, 120);
    layout();
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      ro?.disconnect();
      window.clearInterval(boot);
    };
  }, [calm]);

  return { sectionRef, trackRef, fillRef };
}
