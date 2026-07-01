import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Share2, Sparkles, MessageCircle } from "lucide-react";
import { useState } from "react";
import type { Post } from "@/types";
import {
  toggleLike,
  toggleSave,
} from "@/lib/posts";
import { useAuth } from "../../context/AuthContext";

const categoryBadge: Record<Post["category"], { label: string; color: string }> = {
  Lost:     { label: "Missing",  color: "bg-coral/90 text-white" },
  Found:    { label: "Found",    color: "bg-mint text-emerald-900" },
  Adoption: { label: "Adopt me", color: "bg-lavender text-purple-900" },
};

const palettes = [
  "from-pink-200 to-orange-200",
  "from-purple-200 to-pink-200",
  "from-blue-200 to-purple-200",
  "from-green-200 to-blue-200",
  "from-yellow-200 to-pink-200",
  "from-orange-200 to-pink-200",
];

const emojis = ["🐱", "😺", "😸", "😻", "🙀", "😽", "😼", "😹"];

function getPlaceholder(id: string) {
  const idx = id.charCodeAt(id.length - 1) % palettes.length;
  return {
    gradient: palettes[idx],
    emoji: emojis[idx % emojis.length],
  };
}

interface Props {
  post: Post;
  onLikeToggle?: (postId: string, liked: boolean, count: number) => void;
}

export function PostCard({ post, onLikeToggle }: Props) {
  const { isAuthenticated, user } = useAuth();
  const badge =

  categoryBadge[post.category as keyof typeof categoryBadge] ??
  categoryBadge.Lost;
  const placeholder = getPlaceholder(post._id ?? "0");

  const [liked, setLiked] = useState(
  user ? (post.likes ?? []).includes(user._id) : false
);

const [likesCount, setLikesCount] = useState(
  post.likes?.length ?? 0
);

const [saved, setSaved] = useState(
  user ? (post.savedBy ?? []).includes(user._id) : false
);
  const [likeLoading, setSaveLoading] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    try {
      const res = await toggleLike(post._id);
      setLiked(res.liked);
setLikesCount(res.likesCount);
onLikeToggle?.(post._id, res.liked, res.likesCount);
    } catch {}
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSaveLoading(true);
    try {
      const res = await toggleSave(post._id);
      setSaved(res.saved);
    } catch {} finally {
      setSaveLoading(false);
    }
  };

  return (
    <article className="hover-lift group relative overflow-hidden rounded-3xl bg-card shadow-card">
      <div
        className={`relative aspect-[4/5] overflow-hidden ${
          post.catImage ? "bg-muted" : `bg-gradient-to-br ${placeholder.gradient}`
        }`}
      >
        {post.catImage ? (
          <img
            src={post.catImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-[7rem] transition-transform duration-700 group-hover:scale-110">
            <span>{placeholder.emoji}</span>
          </div>
        )}

        <div
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold shadow-soft ${badge.color}`}
        >
          {badge.label}
        </div>

        <button
          aria-label={saved ? "Unsave" : "Save"}
          onClick={handleSave}
          disabled={!isAuthenticated || likeLoading}
          className={`absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-soft backdrop-blur transition hover:scale-110 ${
            saved ? "text-coral" : "text-muted-foreground hover:text-coral"
          }`}
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-coral" : ""}`} />
        </button>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate font-display text-xl font-bold">{post.title}</h3>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {post.description}
        </p>

        {post.location?.address && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{post.location.address}</span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
          <button
            onClick={handleLike}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1 transition hover:text-coral ${liked ? "text-coral" : ""}`}
          >
            <Heart className={`h-3.5 w-3.5 ${liked ? "fill-coral" : ""}`} />
            {likesCount}
          </button>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            comments
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Link
            to="/posts/$postId"
            params={{ postId: post._id }}
            className="btn-bounce flex-1 rounded-full gradient-primary px-4 py-2 text-center text-sm font-bold text-primary-foreground shadow-soft"
          >
            {post.category === "Adoption" ? "Meet me" : "View details"}
          </Link>
          {post.category === "Found" && (
            <Link
              to="/ai-match"
              aria-label="AI Match"
              title="AI Match"
              className="grid h-10 w-10 place-items-center rounded-full bg-lavender/60 text-purple-900 hover:scale-110"
            >
              <Sparkles className="h-4 w-4" />
            </Link>
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