import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/gymodoro-logo.png";

const LINKS = [
  { href: "#problem", label: "The problem" },
  { href: "#solution", label: "The fix" },
  { href: "#features", label: "Inside the app" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-black/25 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          aria-label="Gymodoro Home"
          className="flex items-center gap-2 text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]"
        >
          <img src={logo} alt="" className="h-9 w-9 object-contain" />
          <span className="font-poppins text-lg font-extrabold tracking-wide">GYMODORO</span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-white/75 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/signin"
            className="rounded-full px-4 py-2 text-sm font-semibold text-white/90 transition hover:text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Start focusing
            <span className="text-emerald-500">↗</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
