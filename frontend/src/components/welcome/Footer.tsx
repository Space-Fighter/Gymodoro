import logo from "@/assets/gymodoro-logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Gymodoro Logo"
              className="w-8 h-8 object-contain rounded-lg"
            />
            <span className="font-heading font-extrabold text-xl tracking-tight text-foreground">
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
