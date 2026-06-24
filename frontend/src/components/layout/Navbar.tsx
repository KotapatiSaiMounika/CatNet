import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Moon, Search, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { CatLogo } from "../sections/CatIllustrations";

const links = [
  { to: "/", label: "Home" },
  { to: "/lost", label: "Lost Cats" },
  { to: "/found", label: "Found Cats" },
  { to: "/ai-match", label: "AI Match" },
  { to: "/adoption", label: "Adoption" },
  { to: "/community", label: "Community" },
  { to: "/map", label: "Map" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <nav className="glass relative flex items-center gap-2 rounded-full px-3 py-2 shadow-soft">
          {/* Sleeping cat on navbar */}
          <div className="pointer-events-none absolute -top-6 right-24 hidden md:block">
            <div className="animate-peek">
              <CatLogo size={42} sleeping />
            </div>
          </div>

          <Link to="/" className="flex items-center gap-2 rounded-full px-3 py-1.5">
            <CatLogo size={32} />
            <span className="font-display text-xl font-bold tracking-tight">
              Cat<span className="text-gradient">Net</span>
            </span>
          </Link>

          <div className="mx-auto hidden items-center gap-0.5 lg:flex">
            {links.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 -z-10 rounded-full bg-primary/40" />
                  )}
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button
              aria-label="Search"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-white/60 hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              aria-label="Notifications"
              className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-white/60 hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-coral" />
            </button>
            <button
              aria-label="Toggle theme"
              onClick={() => setDark((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-white/60 hover:text-foreground"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="ml-1 grid h-9 w-9 place-items-center overflow-hidden rounded-full gradient-warm shadow-soft">
              <CatLogo size={26} />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
