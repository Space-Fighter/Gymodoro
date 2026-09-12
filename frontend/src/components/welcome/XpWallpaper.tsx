/**
 * Fixed, full-viewport "Bliss"-style backdrop (Windows XP's default
 * wallpaper: blue sky, rolling green hill) behind the whole scrolling page.
 * Being `fixed` (not absolute) it stays put as the page scrolls, so the
 * glass cards always have real gradient/light behind them to refract.
 */
export default function XpWallpaper() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #2f6cb0 0%, #4a90d9 35%, #7ec8f0 60%, #bfe3ff 78%, #d9f0c9 100%)",
        }}
      />
      <div
        className="absolute left-1/2 top-[10%] h-[240px] w-[240px] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, #fffdf0 0%, #ffe08a 45%, transparent 72%)",
        }}
      />
      <div
        className="absolute inset-x-[-15%] bottom-[-38%] h-[75%] rounded-[50%]"
        style={{
          background: "linear-gradient(180deg, #8ee56f 0%, #4a9e3f 55%, #2f7a2e 100%)",
        }}
      />
      <div
        className="absolute inset-x-[-15%] bottom-[-48%] h-[58%] rounded-[50%] opacity-90"
        style={{
          background: "linear-gradient(180deg, #6fd94f 0%, #2f9e52 100%)",
        }}
      />
    </div>
  );
}
