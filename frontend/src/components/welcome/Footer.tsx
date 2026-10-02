import logo from "@/assets/gymodoro-logo.png";

export default function Footer() {
  return (
    <footer className="relative bg-transparent py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Brand — the logo is oversized and absolutely positioned so it
              floats over the page instead of stretching the footer strip. */}
          <div className="flex items-center gap-3">
            <span className="relative block w-8 h-8">
              <img
                src={logo}
                alt="Gymodoro Logo"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none w-[320px] h-[320px] object-contain pointer-events-none"
              />
            </span>
            <span className="relative font-heading font-extrabold text-xl tracking-tight text-foreground ml-40">
              Gymodoro
            </span>
            <span className="hidden sm:inline text-xs text-muted-foreground ml-2">
              — Work. Move. Repeat.
            </span>
          </div>

          {/* Center / Rights */}
          <div className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Gymodoro. All rights reserved.
          </div>

          {/* Legal / Quick Links */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
            <a href="#why" className="hover:text-foreground transition-colors">
              About
            </a>
            <a href="#active-breaks" className="hover:text-foreground transition-colors">
              Active Breaks
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
