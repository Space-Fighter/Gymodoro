import { Link } from "react-router-dom";
import logo from "@/assets/brand/gymodoro-logo.png";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { GLASS_WELCOME_BAR } from "@/lib/glassPresets";

export default function Footer() {
  const glassRef = useLiquidGlass<HTMLElement>(GLASS_WELCOME_BAR);

  return (
    <footer ref={glassRef} className="glass-clear border-t border-white/10 pt-3 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* The artwork's transparent margins are cropped off (it is 252..779 x 50..532 of a
                1024x581 PNG, shown at 320px wide), so the footer is exactly as tall as the logo
                and the logo's base sits on the page's bottom edge. */}
            <span className="block h-[151px] w-[166px] flex-none overflow-hidden">
              <img
                src={logo}
                alt="Gymodoro"
                className="pointer-events-none ml-[-79px] mt-[-16px] block h-auto w-[320px] max-w-none"
              />
            </span>
            <span className="font-heading text-xl font-extrabold tracking-tight">Gymodoro</span>
            <span className="ml-2 hidden text-xs text-white/70 sm:inline">— Work. Move. Repeat.</span>
          </div>

          <div className="text-center text-xs text-white/70">
            © {new Date().getFullYear()} Gymodoro. All rights reserved.
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-white/80">
            <a href="#problem" className="transition-colors hover:text-white">The problem</a>
            <a href="#solution" className="transition-colors hover:text-white">The fix</a>
            <a href="#gallery" className="transition-colors hover:text-white">The app</a>
            <a href="#facts" className="transition-colors hover:text-white">The science</a>
            <Link to="/signin" className="transition-colors hover:text-white">Sign in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
