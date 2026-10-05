import { useEffect, useRef, useSyncExternalStore } from "react";
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
const PHONE_QUERY = "(max-width: 767px)";

// On phones the rows are plain vertical stacks (pure CSS, see PinnedRow), so the
// sideways pinning below is skipped entirely.
function subscribePhone(cb: () => void) {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getPhone = () => window.matchMedia(PHONE_QUERY).matches;

export function usePinnedCardTrack() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const calm = useCalm();
  const phone = useSyncExternalStore(subscribePhone, getPhone, () => false);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const viewport = track.parentElement as HTMLElement;

    if (phone) {
      section.style.height = "auto";
      track.style.transform = "";
      viewport.style.overflowX = "";
      viewport.style.overflowY = "";
      if (fillRef.current) fillRef.current.style.transform = "scaleX(1)";
      return;
    }

    if (calm) {
      section.style.height = "auto";
      track.style.transform = "";
      viewport.style.overflowX = "auto";
      viewport.style.overflowY = "hidden";
      const sync = () => {
        const max = viewport.scrollWidth - viewport.clientWidth;
        if (fillRef.current) fillRef.current.style.transform = `scaleX(${max > 0 ? viewport.scrollLeft / max : 0})`;
      };
      viewport.addEventListener("scroll", sync, { passive: true });
      sync();
      return () => viewport.removeEventListener("scroll", sync);
    }
    viewport.style.overflowX = "";
    viewport.style.overflowY = "";

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
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(document.body); // earlier sections growing/shrinking moves our top
    measure();
    document.fonts?.ready.then(measure);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [calm, phone]);

  return { sectionRef, trackRef, fillRef };
}
