import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { CatCard } from "../components/cards/CatCard";
import { PageHero } from "../components/sections/PageHero";
import { postsApi } from "@/lib/posts";

export const Route = createFileRoute("/lost")({
  head: () => ({
    meta: [
      { title: "Lost Cats — CatNet" },
      {
        name: "description",
        content:
          "Browse cats reported missing in your area and help reunite them with their families.",
      },
    ],
  }),
  component: LostCats,
});

const filters = [
  { label: "Location", icon: "📍" },
  { label: "Breed", icon: "🐈" },
  { label: "Age", icon: "🎂" },
  { label: "Gender", icon: "⚥" },
  { label: "Color", icon: "🎨" },
  { label: "Status", icon: "🔔" },
];

function LostCats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", "Lost"],
    queryFn: () => postsApi.getPosts({ category: "Lost" }),
  });

  const posts = data?.posts ?? [];

  return (
    <>
      <PageHero
        eyebrow="Lost cats"
        title={
          <>
            Have you seen this{" "}
            <span className="text-gradient">whiskered friend?</span>
          </>
        }
        description="Browse cats reported missing in your area. Every set of eyes brings someone closer to home."
      >
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-full bg-card p-2 shadow-soft">
          <Search className="ml-3 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by name, neighborhood, or breed…"
            className="flex-1 bg-transparent px-2 py-1 text-sm outline-none"
          />
          <button className="btn-bounce rounded-full gradient-primary px-5 py-2 text-sm font-bold text-primary-foreground">
            Search
          </button>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-bold shadow-soft">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </span>

          {filters.map((f) => (
            <button
              key={f.label}
              className="rounded-full bg-card/70 px-4 py-1.5 text-xs font-semibold text-foreground shadow-soft hover:bg-card"
            >
              <span className="mr-1.5">{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-10">
            Loading...
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-red-500">
            Failed to load posts.
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <CatCard
              key={post._id}
              cat={post}
            />
          ))}
        </div>
      </section>
    </>
  );
}