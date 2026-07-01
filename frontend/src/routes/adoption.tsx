import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { CatCard } from "@/components/cards/CatCard";
import { PageHero } from "@/components/sections/PageHero";
import { postsApi } from "@/lib/posts";

export const Route = createFileRoute("/adoption")({
  head: () => ({
    meta: [
      { title: "Adoption — CatNet" },
      {
        name: "description",
        content:
          "Browse cats waiting for a forever home. Filter by personality, age, and more.",
      },
    ],
  }),
  component: Adoption,
});

const tags = [
  "All",
  "Kittens",
  "Adult",
  "Senior",
  "Indoor",
  "Good with kids",
  "Lap cats",
  "Adventurous",
];

function Adoption() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", "Adoption"],
    queryFn: () => postsApi.getPosts({ category: "Adoption" }),
  });

  const posts = data?.posts ?? [];

  return (
    <>
      <PageHero
        eyebrow="Adopt me"
        title={
          <>
            Soft hearts looking for{" "}
            <span className="text-gradient">a forever home.</span>
          </>
        }
        description="Each of these cats has a story and is ready to start the next chapter — with you."
      >
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
          {tags.map((t, i) => (
            <button
              key={t}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold shadow-soft transition ${
                i === 0
                  ? "gradient-primary text-primary-foreground"
                  : "bg-white text-foreground hover:bg-white/80"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        {isLoading && (
          <div className="py-10 text-center">
            Loading...
          </div>
        )}

        {error && (
          <div className="py-10 text-center text-red-500">
            Failed to load adoption posts.
          </div>
        )}

        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
          {posts.map((post, i) => (
            <div
              key={post._id}
              className="mb-6 break-inside-avoid"
              style={{ marginTop: i % 3 === 1 ? "1.5rem" : undefined }}
            >
              <CatCard cat={post} />
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <button className="btn-bounce inline-flex items-center gap-2 rounded-full gradient-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-soft">
            <Heart className="h-4 w-4" />
            Load more sweet faces
          </button>
        </div>
      </section>
    </>
  );
}