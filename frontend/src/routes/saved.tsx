import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Loader2 } from "lucide-react";

import { CatCard } from "../components/cards/CatCard";
import { PageHero } from "../components/sections/PageHero";
import { getSavedPosts } from "@/lib/posts";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Posts — CatNet" },
      {
        name: "description",
        content: "Posts you've saved to check back on later.",
      },
    ],
  }),
  component: SavedPosts,
});

function SavedPosts() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", "saved"],
    queryFn: () => getSavedPosts(),
    enabled: isAuthenticated,
  });

  const posts = data?.posts ?? [];

  if (authLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">
          Log in to see your saved posts
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You'll need an account to save and revisit posts.
        </p>
        <Link
          to="/login"
          search={{ redirect: "/saved" }}
          className="btn-bounce mt-6 inline-flex rounded-full gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Saved"
        title={
          <>
            Posts you've{" "}
            <span className="text-gradient">saved for later.</span>
          </>
        }
        description="Everything you've bookmarked, in one place."
      />

      <section className="mx-auto max-w-7xl px-6 pb-24">
        {isLoading && (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="py-10 text-center text-red-500">
            Failed to load saved posts.
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="mx-auto max-w-sm py-16 text-center text-muted-foreground">
            <Bookmark className="mx-auto mb-3 h-8 w-8 opacity-50" />
            <p className="text-sm">
              Nothing saved yet — tap the save icon on any post to keep it
              here.
            </p>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <CatCard key={post._id} cat={post} />
          ))}
        </div>
      </section>
    </>
  );
}