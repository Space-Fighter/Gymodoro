import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const LINKS = [
  { href: "#problem", label: "The problem" },
  { href: "#solution", label: "The fix" },
  { href: "#features", label: "Inside the app" },
];

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
    <header
      className={`glass-tight fixed z-40 w-[calc(100%-2rem)] max-w-3xl rounded-full text-white backdrop-blur-md transition-all duration-300 ${
        pastLogo ? "left-1/2 top-4 -translate-x-1/2" : "left-4 top-4 sm:left-6"
      }`}
    >
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <nav className="hidden items-center gap-7 text-sm font-medium text-white/80 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/signin"
            className="rounded-full px-4 py-2 text-sm font-semibold text-white/90 transition hover:text-white"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="hidden items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-900 transition hover:-translate-y-0.5 sm:inline-flex"
          >
            Start focusing
            <span className="text-emerald-500">↗</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
