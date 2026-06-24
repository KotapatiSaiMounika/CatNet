import { Link } from "@tanstack/react-router";
import type { Cat } from "@/lib/cats";
import { Heart, MapPin, Share2, Sparkles } from "lucide-react";

const statusBadge: Record<NonNullable<Cat["status"]>, { label: string; color: string }> = {
  missing: { label: "Missing", color: "bg-coral/90 text-white" },
  found: { label: "Found", color: "bg-mint text-emerald-900" },
  adoption: { label: "Adopt me", color: "bg-lavender text-purple-900" },
};

export function CatCard({ cat }: { cat: Cat }) {
  const badge = statusBadge[cat.status ?? "missing"];
  return (
    <article className="hover-lift group relative overflow-hidden rounded-3xl bg-card shadow-card">
      <div
        className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-br ${cat.gradient}`}
      >
        <div className="absolute inset-0 grid place-items-center text-[7rem] transition-transform duration-700 group-hover:scale-110">
          <span>{cat.emoji}</span>
        </div>

        <div className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold shadow-soft ${badge.color}`}>
          {badge.label}
        </div>

        <button
          aria-label="Save"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-muted-foreground shadow-soft backdrop-blur transition hover:scale-110 hover:text-coral"
        >
          <Heart className="h-4 w-4" />
        </button>

        {cat.reward && (
          <div className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-foreground shadow-soft">
            Reward · {cat.reward}
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate font-display text-xl font-bold">{cat.name}</h3>
          <span className="text-xs font-semibold text-muted-foreground">{cat.age}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {cat.breed} · {cat.color}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{cat.location}</span>
          <span className="mx-1">·</span>
          <span>{cat.distance}</span>
        </div>

        {cat.personality && (
          <div className="flex flex-wrap gap-1.5">
            {cat.personality.map((p) => (
              <span
                key={p}
                className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Link
            to="/"
            className="btn-bounce flex-1 rounded-full gradient-primary px-4 py-2 text-center text-sm font-bold text-primary-foreground shadow-soft"
          >
            {cat.status === "adoption" ? "Meet me" : "Contact"}
          </Link>
          {cat.status === "found" && (
            <button
              aria-label="AI Match"
              title="AI Match"
              className="grid h-10 w-10 place-items-center rounded-full bg-lavender/60 text-purple-900 hover:scale-110"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          )}
          <button
            aria-label="Share"
            className="grid h-10 w-10 place-items-center rounded-full bg-secondary/60 text-secondary-foreground hover:scale-110"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
