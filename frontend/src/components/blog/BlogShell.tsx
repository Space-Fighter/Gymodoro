import { type ReactNode } from "react";
import Navbar from "@/components/welcome/Navbar";
import Footer from "@/components/welcome/Footer";
import { assetUrl } from "@/components/welcome/assets";

const SCENERY = assetUrl("hero/solution-poster.webp");

/**
 * Page frame for the blog: the welcome page's navbar and footer over a fixed
 * scenic still (the alpine meadow from the welcome story, like the Timer's
 * wallpapers). A still, not the welcome video reel, so reading pages stay
 * light and fast to load.
 */
export default function BlogShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col bg-transparent font-sans text-[#f6efe7] selection:bg-emerald-500/30">
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-[linear-gradient(160deg,#0d1f17,#08090d_60%,#10161f)] bg-cover bg-center"
        style={SCENERY ? { backgroundImage: `url(${SCENERY})` } : undefined}
      />
      <div aria-hidden className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_20%,rgba(0,0,0,.35),rgba(0,0,0,.78))]" />

      <Navbar />
      <main className="flex-1 px-[5vw] pt-28 pb-20 max-md:pt-24">{children}</main>
      <Footer />
    </div>
  );
}

/** Mono kicker + hairline rule, the section label style used across the welcome page. */
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="font-mono text-[11px] tracking-[0.2em] text-[#4be277] uppercase">{children}</div>
      <div className="h-px min-w-[60px] flex-1 bg-gradient-to-r from-[#4be277]/60 to-white/10" />
    </div>
  );
}
