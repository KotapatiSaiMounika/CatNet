import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type FormEvent } from "react";
import {
  Camera,
  Loader2,
  MapPin,
  Plus,
  Settings,
  X,
} from "lucide-react";
import { CatCard } from "@/components/cards/CatCard";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, getUserPosts, updateProfile, updateProfileImage } from "@/lib/users";
import { ApiClientError } from "@/lib/api";
import type { PostCategory } from "@/types";

export const Route = createFileRoute("/profile/$userId")({
  head: () => ({
    meta: [{ title: "Profile — CatNet" }],
  }),
  component: Profile,
});

const tabs: { value: PostCategory | "All"; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Lost", label: "Lost" },
  { value: "Found", label: "Found" },
  { value: "Adoption", label: "Adoption" },
];

function Profile() {
  const { userId } = Route.useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<PostCategory | "All">("All");
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const isOwnProfile = isAuthenticated && currentUser?._id === userId;

  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getUserProfile(userId),
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["profile-posts", userId, activeTab],
    queryFn: () =>
      getUserPosts(userId, {
        category: activeTab === "All" ? undefined : activeTab,
      }),
    enabled: Boolean(profileData),
  });

  const posts = postsData?.posts ?? [];

  const startEditing = () => {
    if (!profileData) return;
    setName(profileData.user.name);
    setBio(profileData.user.bio ?? "");
    setLocation(profileData.user.location ?? "");
    setSaveError(null);
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateProfile({ name, bio, location });
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      setIsEditing(false);
    } catch (err) {
      setSaveError(
        err instanceof ApiClientError ? err.message : "Couldn't save changes."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      await updateProfileImage(file);
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    } catch {
      /* non-critical — avatar just won't update */
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (profileError || !profileData) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">User not found</h1>
        <Link
          to="/"
          className="btn-bounce mt-6 inline-flex rounded-full gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft"
        >
          Take me home
        </Link>
      </div>
    );
  }

  const { user: profileUser, postCount } = profileData;
  const joined = new Date(profileUser.createdAt).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="mx-auto max-w-5xl px-6 py-12 pb-24">
      {/* Header */}
      <div className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div className="relative shrink-0">
            <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full gradient-warm text-3xl font-bold text-primary-foreground shadow-soft">
              {profileUser.profileImage ? (
                <img
                  src={profileUser.profileImage}
                  alt={profileUser.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                profileUser.name.slice(0, 1).toUpperCase()
              )}
            </div>
            {isOwnProfile && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  aria-label="Change photo"
                  className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full gradient-primary text-primary-foreground shadow-soft"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </button>
              </>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold">{profileUser.name}</h1>
            {profileUser.bio && (
              <p className="mt-1 text-sm text-muted-foreground">{profileUser.bio}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:justify-start">
              {profileUser.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {profileUser.location}
                </span>
              )}
              <span>Joined {joined}</span>
              <span>{postCount} post{postCount === 1 ? "" : "s"}</span>
            </div>
          </div>

          {isOwnProfile && !isEditing && (
            <button
              onClick={startEditing}
              className="btn-bounce inline-flex shrink-0 items-center gap-1.5 rounded-full bg-card px-4 py-2 text-sm font-bold shadow-soft ring-1 ring-border hover:bg-muted"
            >
              <Settings className="h-4 w-4" /> Edit profile
            </button>
          )}
        </div>

        {isOwnProfile && isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 space-y-4 border-t border-border/60 pt-6"
          >
            {saveError && <p className="text-sm text-coral">{saveError}</p>}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold">
                Name
              </label>
              <input
                id="name"
                value={name}
                maxLength={50}
                onChange={(e) => setName(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="bio" className="text-sm font-semibold">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                maxLength={200}
                rows={3}
                onChange={(e) => setBio(e.target.value)}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="location" className="text-sm font-semibold">
                Location
              </label>
              <input
                id="location"
                value={location}
                maxLength={100}
                onChange={(e) => setLocation(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-bounce rounded-full gradient-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-soft disabled:opacity-60"
              >
                {isSaving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Posts */}
      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setActiveTab(t.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold shadow-soft transition ${
                  activeTab === t.value
                    ? "gradient-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {isOwnProfile && (
            <Link
              to="/create-post"
              className="btn-bounce inline-flex items-center gap-1.5 rounded-full gradient-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-soft"
            >
              <Plus className="h-3.5 w-3.5" /> Report a cat
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {postsLoading && (
            <p className="text-sm text-muted-foreground">Loading posts…</p>
          )}
          {!postsLoading && posts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {isOwnProfile
                ? "You haven't posted anything yet."
                : "No posts yet."}
            </p>
          )}
          {posts.map((post) => (
            <CatCard key={post._id} cat={post} />
          ))}
        </div>
      </div>
    </section>
  );
}