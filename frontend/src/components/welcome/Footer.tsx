import { Link } from "react-router-dom";
import logo from "@/assets/gymodoro-logo.png";

export default function Footer() {
  return (
    <footer className="bg-[#2f9e52] py-10 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Gymodoro" className="h-8 w-8 rounded-lg object-contain" />
            <span className="font-heading text-xl font-extrabold tracking-tight">Gymodoro</span>
            <span className="ml-2 hidden text-xs text-white/70 sm:inline">
              — Work. Move. Repeat.
            </span>
          </div>

          <div className="text-center text-xs text-white/70">
            © {new Date().getFullYear()} Gymodoro. All rights reserved.
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-white/80">
            <a href="#problem" className="transition-colors hover:text-white">The problem</a>
            <a href="#solution" className="transition-colors hover:text-white">The fix</a>
            <Link to="/signin" className="transition-colors hover:text-white">Sign in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
