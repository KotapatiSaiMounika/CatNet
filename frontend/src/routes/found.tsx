import { createFileRoute } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import { CatCard } from "@/components/cards/CatCard";
import { PageHero } from "@/components/sections/PageHero";
import { generateCats } from "@/lib/cats";

export const Route = createFileRoute("/found")({
  head: () => ({
    meta: [
      { title: "Found Cats — CatNet" },
      {
        name: "description",
        content: "Cats found by kind humans. Could one of them be yours?",
      },
    ],
  }),
  component: FoundCats,
});

function FoundCats() {
  const cats = generateCats(12, "found");

  return (
    <>
      <PageHero
        eyebrow="Found cats"
        title={
          <>
            Could one of these be <span className="text-gradient">your cat?</span>
          </>
        }
        description="These cats were found by caring humans in your area. Tap AI Match to instantly compare with your photo."
      >
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-full bg-white p-2 shadow-soft">
          <Search className="ml-3 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Filter by neighborhood…"
            className="flex-1 bg-transparent px-2 py-1 text-sm outline-none"
          />
          <button className="btn-bounce inline-flex items-center gap-1.5 rounded-full gradient-primary px-5 py-2 text-sm font-bold text-primary-foreground">
            <Sparkles className="h-4 w-4" /> AI Match
          </button>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cats.map((c) => (
            <CatCard key={c.id} cat={c} />
          ))}
        </div>
      </section>
    </>
  );
}
