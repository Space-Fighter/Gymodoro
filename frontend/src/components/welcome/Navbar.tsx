import { Link } from "react-router-dom";
import logo from "@/assets/gymodoro-logo.png";

export default function Navbar() {
  return (
    <>
      {/* Brand — separated from the nav bar, pinned to the extreme top-left */}
      <a
        href="#top"
        className="absolute top-10 sm:top-16 lg:top-20 -left-20 z-50 flex flex-col items-center font-extrabold text-xl tracking-tight transition-transform duration-200 hover:-translate-y-0.5 text-foreground"
        aria-label="Gymodoro Home"
      >
        <img
          src={logo}
          alt="Gymodoro Logo"
          className="w-[507px] h-[507px] object-contain"
        />
        <span className="font-heading font-extrabold text-[36px] tracking-tight -mt-32">
          Gymodoro
        </span>
      </a>

      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl rounded-full border border-border/40 bg-background/80 backdrop-blur-md shadow-lg transition-all duration-200">
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
