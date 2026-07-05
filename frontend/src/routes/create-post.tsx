import {
  createFileRoute,
  useNavigate,
  useRouterState,
  Link,
} from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { AlertCircle, ImagePlus, Loader2 } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { createPost } from "@/lib/posts";
import { ApiClientError } from "@/lib/api";
import type { PostCategory } from "@/types";

export const Route = createFileRoute("/create-post")({
  head: () => ({
    meta: [
      { title: "Report a Cat — CatNet" },
      {
        name: "description",
        content:
          "Report a lost cat, a cat you found, or list a cat for adoption.",
      },
    ],
  }),
  component: CreatePost,
});

const categories: { value: PostCategory; label: string; hint: string }[] = [
  { value: "Lost", label: "Lost", hint: "My cat is missing" },
  { value: "Found", label: "Found", hint: "I found a cat" },
  { value: "Adoption", label: "Adoption", hint: "This cat needs a home" },
];

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB, matches backend limit

function CreatePost() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const search = useRouterState({ select: (s) => s.location.search }) as {
    category?: PostCategory;
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<PostCategory>(
    search.category && categories.some((c) => c.value === search.category)
      ? search.category
      : "Lost"
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      setError("That photo is too large — please use one under 5MB.");
      return;
    }

    setError(null);
    setPhoto(file);
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);
    setIsSubmitting(true);

    try {
      const post = await createPost({
        title,
        description,
        category,
        contactInfo: contactInfo || undefined,
        location: address ? { address } : undefined,
        catImage: photo,
      });
      navigate({ to: "/posts/$postId", params: { postId: post._id } });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        setFieldErrors(err.errors ?? []);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Wait for the auth check to settle before deciding whether to show the
  // form or the "please log in" prompt — avoids a flash of the wrong state.
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
          Log in to report a cat
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You'll need an account so people can get back in touch with you.
        </p>
        <Link
          to="/login"
          search={{ redirect: "/create-post" }}
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
        eyebrow="Report a cat"
        title={
          <>
            Every report brings a cat{" "}
            <span className="text-gradient">closer to home.</span>
          </>
        }
        description="Fill in as much detail as you can — a clear photo is what makes AI Match actually work."
      />

      <section className="mx-auto max-w-2xl px-6 pb-24">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl bg-card p-6 shadow-card sm:p-8"
        >
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-coral/10 px-3 py-2.5 text-sm text-coral">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>{error}</p>
                {fieldErrors.length > 1 && (
                  <ul className="mt-1 list-disc pl-4">
                    {fieldErrors.map((msg) => (
                      <li key={msg}>{msg}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">What's this about?</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`rounded-2xl border-2 px-3 py-3 text-center text-sm font-bold transition ${
                    category === c.value
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-transparent text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {c.label}
                  <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                    {c.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Photo */}
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
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, or WEBP up to 5MB
                  </p>
                </div>
              )}
            </button>
          </div>

          {/* Title */}
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
              placeholder={
                category === "Lost"
                  ? "e.g. Orange tabby missing near Prospect Park"
                  : category === "Found"
                    ? "e.g. Friendly grey cat found on 5th Ave"
                    : "e.g. Playful kitten looking for a home"
              }
            />
          </div>

          {/* Description */}
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
              placeholder="Distinguishing marks, personality, when/where last seen or found…"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label htmlFor="address" className="text-sm font-semibold">
              Location
            </label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Neighborhood or cross streets"
            />
          </div>

          {/* Contact info */}
          <div className="space-y-1.5">
            <label htmlFor="contactInfo" className="text-sm font-semibold">
              Contact info
            </label>
            <Input
              id="contactInfo"
              maxLength={200}
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Phone, email, or how people should reach you"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Posting…" : "Publish report"}
          </Button>
        </form>
      </section>
    </>
  );
}