import { Link } from "react-router-dom";
import logo from "@/assets/brand/gymodoro-logo.png";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { GLASS_WELCOME_BAR } from "@/lib/glassPresets";

export default function Footer() {
  const glassRef = useLiquidGlass<HTMLElement>(GLASS_WELCOME_BAR);

  return (
    <footer ref={glassRef} className="glass-clear border-t border-white/10 py-10 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-3">
            {/* The logo is oversized and absolutely positioned so it floats over the page
                instead of stretching the footer strip. */}
            <span className="relative block h-8 w-8">
              <img
                src={logo}
                alt="Gymodoro"
                className="pointer-events-none absolute top-1/2 left-1/2 h-[320px] w-[320px] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
              />
            </span>
            <span className="ml-40 font-heading text-xl font-extrabold tracking-tight">Gymodoro</span>
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
