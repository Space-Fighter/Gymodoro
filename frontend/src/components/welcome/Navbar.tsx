import { Link } from "react-router-dom";
import logo from "@/assets/gymodoro-logo.png";
import ModeToggle from "@/components/mode-toggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-200 backdrop-blur-md bg-background/80 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <a
          href="#top"
          className="flex items-center gap-3 font-extrabold text-xl tracking-tight transition-transform duration-200 hover:-translate-y-0.5 text-foreground"
          aria-label="Gymodoro Home"
        >
          <img
            src={logo}
            alt="Gymodoro Logo"
            className="w-10 h-10 object-contain rounded-xl shadow-sm"
          />
          <span className="font-heading font-extrabold text-2xl tracking-tight">
            Gymodoro
          </span>
        </a>

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
          <ModeToggle />
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
  );
}
