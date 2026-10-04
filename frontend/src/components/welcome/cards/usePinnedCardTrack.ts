import { useEffect, useRef } from "react";
import { useCalm } from "../useCalm";

/**
 * Drives a "pin while cards travel sideways" section: the outer `sectionRef`
 * is inflated in height so ordinary page scroll has room to run, its sticky
 * child holds in place, and `trackRef` is translated left in proportion to
 * how far the page has scrolled through that inflated height. `fillRef` (an
 * optional progress rule) tracks the same 0→1 value.
 *
 * Geometry (section top, panel height, horizontal overflow) is measured only
 * on layout events and cached, so the per-frame scroll handler does nothing
 * but arithmetic and one transform write — no forced layout while scrolling.
 */
export function usePinnedCardTrack() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const calm = useCalm();

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const viewport = track.parentElement as HTMLElement;

    if (calm) {
      section.style.height = "auto";
      viewport.style.overflowX = "auto";
      return;
    }
    viewport.style.overflowX = "";

    let top = 0;
    let travel = 1;
    let overflow = 0;
    let frame = 0;

    const measure = () => {
      const panel = Math.max(window.innerHeight, 560);
      overflow = Math.max(0, track.scrollWidth - window.innerWidth);
      travel = Math.max(1, overflow * 1.15);
      section.style.height = `${panel + travel}px`;
      top = section.getBoundingClientRect().top + window.scrollY;
      update();
    };

    const update = () => {
      frame = 0;
      const p = Math.min(1, Math.max(0, (window.scrollY - top) / travel));
      track.style.transform = `translate3d(${-p * overflow}px,0,0)`;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(document.body); // earlier sections growing/shrinking moves our top
    measure();
    document.fonts?.ready.then(measure);

    return () => {
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [calm]);

  return { sectionRef, trackRef, fillRef };
}
