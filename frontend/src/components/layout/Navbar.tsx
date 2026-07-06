import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, LogOut, Menu, Moon, Sun, User as UserIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CatLogo } from "../sections/CatIllustrations";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/", label: "Home" },
  { to: "/lost", label: "Lost Cats" },
  { to: "/found", label: "Found Cats" },
  { to: "/ai-match", label: "AI Match" },
  { to: "/adoption", label: "Adoption" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
            {/* Mobile menu toggle — only visible below the lg breakpoint,
                since the link list above is hidden there */}
            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-white/60 hover:text-foreground lg:hidden"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {isAuthenticated && (
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-white/60 hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
              </Link>
            )}

            <button
              aria-label="Toggle theme"
              onClick={() => setDark((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-white/60 hover:text-foreground"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Account menu"
                    className="ml-1 grid h-9 w-9 place-items-center overflow-hidden rounded-full gradient-warm shadow-soft"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback className="bg-transparent text-xs font-bold text-primary-foreground">
                        {user.name.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile/$userId" params={{ userId: user._id }}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      My profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="ml-1 flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="btn-bounce rounded-full gradient-primary px-3.5 py-1.5 text-sm font-bold text-primary-foreground shadow-soft"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile nav panel */}
        {mobileOpen && (
          <div className="glass mt-2 rounded-3xl p-2 shadow-soft lg:hidden">
            {links.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`block rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-primary/15 text-foreground"
                      : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}