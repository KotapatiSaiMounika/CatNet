import { CatLogo, PawPrint } from "../sections/CatIllustrations";
import { Heart, Instagram, Twitter, Facebook, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden">
      <div className="gradient-soft pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-6">
          {/* Sleeping cat illustration */}
          <div className="mb-12 flex justify-center">
            <div className="relative">
              <div className="grid h-28 w-28 place-items-center rounded-full bg-white/70 shadow-soft">
                <CatLogo size={84} sleeping />
              </div>
              <span className="absolute -top-2 right-0 animate-bounce-soft text-2xl">💤</span>
            </div>
          </div>

          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2">
                <CatLogo size={32} />
                <span className="font-display text-xl font-bold">
                  Cat<span className="text-gradient">Net</span>
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Helping every cat find their way home — one whisker at a time.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold">Explore</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Lost Cats</li>
                <li>Found Cats</li>
                <li>Adoption</li>
                <li>AI Match</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold">Community</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Stories</li>
                <li>Volunteers</li>
                <li>Events</li>
                <li>Leaderboard</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold">Stay in the loop</h4>
              <form className="mt-4 flex items-center gap-2 rounded-full bg-white p-1.5 shadow-soft">
                <Mail className="ml-2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                <button
                  type="button"
                  className="btn-bounce rounded-full gradient-primary px-4 py-1.5 text-xs font-bold text-primary-foreground"
                >
                  Join
                </button>
              </form>
              <div className="mt-4 flex gap-2">
                {[Instagram, Twitter, Facebook].map((Icon, i) => (
                  <button
                    key={i}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/80 text-muted-foreground hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row">
            <p>© {new Date().getFullYear()} CatNet. All rights purr-served.</p>
            <p className="flex items-center gap-1.5">
              Made with <Heart className="h-3 w-3 fill-coral text-coral" /> for every cat.
            </p>
          </div>
        </div>

        {/* floating paws */}
        <PawPrint className="pointer-events-none absolute bottom-6 left-10 animate-paw opacity-50" />
        <PawPrint
          className="pointer-events-none absolute bottom-12 right-16 animate-paw opacity-40"
          color="#D8C7FF"
        />
      </div>
    </footer>
  );
}
