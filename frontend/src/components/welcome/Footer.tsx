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
          <div className="flex items-center gap-3 self-end max-sm:self-center sm:self-auto">
            {/* The PNG is tightly cropped (551x481), so the footer is exactly as tall as the logo
                and the logo's base sits on the page's bottom edge. */}
            <img
              src={logo}
              alt="Gymodoro"
              className="pointer-events-none block h-[151px] w-auto flex-none max-md:h-[96px]"
            />

            <span className="font-heading text-xl font-extrabold tracking-tight">Gymodoro</span>
            <span className="ml-2 hidden text-xs text-white/70 sm:inline">— Work. Move. Repeat.</span>
          </div>

          <div className="text-center text-xs text-white/70">
            © {new Date().getFullYear()} Gymodoro. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-white/80 max-md:gap-x-4 max-md:pb-4">
            <a href="#problem" className="transition-colors hover:text-white">The problem</a>
            <a href="#solution" className="transition-colors hover:text-white">The fix</a>
            <a href="#facts" className="transition-colors hover:text-white">The science</a>
            <a href="#gallery" className="transition-colors hover:text-white">The app</a>
            <Link to="/signin" className="transition-colors md:hover:text-white">Sign in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
