import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// The logo (270px) and nav's max width (768px, from max-w-3xl) are fixed
// constants, so the "centered as a pair" position is a deterministic CSS
// formula — no runtime measurement needed:
//   groupWidth = logoWidth + gap + navWidth = 270 + 24 + 768 = 1062
//   navLeft = (100vw - groupWidth) / 2 + logoWidth + gap = 50vw - 237px

export default function Navbar() {
  const [pastLogo, setPastLogo] = useState(false);

  useEffect(() => {
    const logoEl = document.querySelector<HTMLElement>('a[aria-label="Gymodoro Home"]');

    function handleScroll() {
      if (!logoEl) return;
      setPastLogo(logoEl.getBoundingClientRect().bottom <= 0);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed z-40 w-[calc(100%-2rem)] max-w-3xl rounded-full border border-border/40 bg-background/80 backdrop-blur-md shadow-lg transition-all duration-300 ${
          pastLogo ? "top-4 left-1/2 -translate-x-1/2" : "top-[51px] left-[calc(50vw-297px)]"
        }`}
      >
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a
            href="#why"
            className="transition-colors hover:text-foreground hover:-translate-y-0.5 transform duration-150"
          >
            Why Gymodoro
          </a>
          <a
            href="#loop"
            className="transition-colors hover:text-foreground hover:-translate-y-0.5 transform duration-150"
          >
            The Loop
          </a>
          <a
            href="#features"
            className="transition-colors hover:text-foreground hover:-translate-y-0.5 transform duration-150"
          >
            Features
          </a>
        </nav>

        {/* Nav Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/signin"
            className="text-sm font-semibold px-4 py-2 rounded-full text-foreground transition-all duration-200 hover:text-primary hover:-translate-y-0.5"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold bg-foreground text-background px-5 py-2.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
          >
            <span>Start focusing</span>
            <span className="text-primary font-bold">↗</span>
          </Link>
        </div>
        </div>
      </header>
    </>
  );
}
