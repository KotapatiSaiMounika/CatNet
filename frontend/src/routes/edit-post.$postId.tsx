import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, ImagePlus, Loader2 } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { getPostById, updatePost } from "@/lib/posts";
import { ApiClientError } from "@/lib/api";
import type { PostCategory } from "@/types";

export const Route = createFileRoute("/edit-post/$postId")({
  head: () => ({
    meta: [{ title: "Edit Post — CatNet" }],
  }),
  component: EditPost,
});

const categories: { value: PostCategory; label: string }[] = [
  { value: "Lost", label: "Lost" },
  { value: "Found", label: "Found" },
  { value: "Adoption", label: "Adoption" },
];

function EditPost() {
  const { postId } = Route.useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
  });

  const [category, setCategory] = useState<PostCategory>("Lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill the form once the post loads.
  useEffect(() => {
    if (!post) return;
    setCategory(post.category);
    setTitle(post.title);
    setDescription(post.description);
    setAddress(post.location?.address ?? "");
    setContactInfo(post.contactInfo ?? "");
    setPreviewUrl(post.catImage || null);
  }, [post]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreviewUrl((old) => {
      if (old && old.startsWith("blob:")) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await updatePost(postId, {
        title,
        description,
        category,
        contactInfo: contactInfo || undefined,
        location: address ? { address } : undefined,
        catImage: photo,
      });
      navigate({ to: "/posts/$postId", params: { postId: updated._id } });
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || postLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Post not found</h1>
        <Link
          to="/"
          className="btn-bounce mt-6 inline-flex rounded-full gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft"
        >
          Take me home
        </Link>
      </div>
    );
  }

  if (!isAuthenticated || user?._id !== post.createdBy?._id) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">
          You can't edit this post
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only the person who posted it can make changes.
        </p>
        <Link
          to="/posts/$postId"
          params={{ postId }}
          className="btn-bounce mt-6 inline-flex rounded-full gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft"
        >
          Back to post
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHero eyebrow="Edit post" title="Update the details" />

      <section className="mx-auto max-w-2xl px-6 pb-24">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl bg-card p-6 shadow-card sm:p-8"
        >
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-coral/10 px-3 py-2.5 text-sm text-coral">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`rounded-2xl border-2 px-3 py-2.5 text-center text-sm font-bold transition ${
                    category === c.value
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-transparent text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Photo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative grid aspect-video w-full cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/40 bg-gradient-to-br from-pink-50 to-purple-50 transition hover:border-primary dark:from-pink-400/10 dark:to-purple-400/10"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Selected cat"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-card shadow-soft">
                    <ImagePlus className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-2 text-sm font-bold">Add a photo</p>
                </div>
              )}
            </button>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-semibold">
              Title
            </label>
            <Input
              id="title"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-semibold">
              Description
            </label>
            <textarea
              id="description"
              required
              maxLength={1000}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="address" className="text-sm font-semibold">
              Location
            </label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contactInfo" className="text-sm font-semibold">
              Contact info
            </label>
            <Input
              id="contactInfo"
              maxLength={200}
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </section>
    </>
  );
}