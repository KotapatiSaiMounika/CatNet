import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  Heart,
  MapPin,
  Phone,
  Sparkles,
  Trash2,
  Pencil,
  Loader2,
  Send,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getPostById,
  deletePost,
  toggleLike,
  toggleSave,
  getComments,
  addComment,
  deleteComment,
} from "@/lib/posts";
import { ApiClientError } from "@/lib/api";

export const Route = createFileRoute("/posts/$postId")({
  component: PostDetail,
});

const categoryBadge: Record<string, { label: string; color: string }> = {
  Lost: { label: "Missing", color: "bg-coral/90 text-white" },
  Found: { label: "Found", color: "bg-mint text-emerald-900" },
  Adoption: { label: "Adopt me", color: "bg-lavender text-purple-900" },
};

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.345, "w"],
    [12, "mo"],
    [Infinity, "y"],
  ];
  let value = seconds;
  for (const [size, label] of units) {
    if (value < size) return `${Math.max(1, Math.floor(value))}${label} ago`;
    value /= size;
  }
  return "just now";
}

function PostDetail() {
  const { postId } = Route.useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
  });

  const {
    data: commentsData,
    isLoading: commentsLoading,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getComments(postId),
    enabled: Boolean(post),
  });

  const comments = commentsData?.comments ?? [];

  const liked = Boolean(user && post?.likes?.includes(user._id));
  const saved = Boolean(user && post?.savedBy?.includes(user._id));
  const isOwner = Boolean(user && post && post.createdBy?._id === user._id);

  const invalidatePost = () =>
    queryClient.invalidateQueries({ queryKey: ["post", postId] });

  const handleLike = async () => {
    if (!isAuthenticated) return;
    try {
      await toggleLike(postId);
      invalidatePost();
    } catch {
      /* non-critical — ignore */
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) return;
    try {
      await toggleSave(postId);
      invalidatePost();
    } catch {
      /* non-critical — ignore */
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    setIsDeleting(true);
    try {
      await deletePost(postId);
      navigate({ to: "/" });
    } catch (err) {
      setActionError(
        err instanceof ApiClientError ? err.message : "Couldn't delete this post."
      );
      setIsDeleting(false);
    }
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsCommenting(true);
    try {
      await addComment(postId, commentText.trim());
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    } catch {
      /* surfaced inline via disabled state; keep it lightweight */
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(postId, commentId);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    } catch {
      /* non-critical — ignore */
    }
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Post not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This report may have been removed or the link is incorrect.
        </p>
        <Link
          to="/"
          className="btn-bounce mt-6 inline-flex rounded-full gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft"
        >
          Take me home
        </Link>
      </div>
    );
  }

  const badge = categoryBadge[post.category] ?? categoryBadge.Lost;

  return (
    <section className="mx-auto max-w-5xl px-6 py-12 pb-24">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-card">
          {post.catImage ? (
            <img
              src={post.catImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-8xl">
              🐱
            </div>
          )}
          <div
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold shadow-soft ${badge.color}`}
          >
            {badge.label}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <h1 className="font-display text-3xl font-bold">{post.title}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Posted {timeAgo(post.createdAt)}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-foreground/90">
            {post.description}
          </p>

          {post.location?.address && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {post.location.address}
            </div>
          )}

          {post.contactInfo && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {post.contactInfo}
            </div>
          )}

          {/* Author */}
          {post.createdBy && (
            <Link
              to="/profile/$userId"
              params={{ userId: post.createdBy._id }}
              className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3 hover:bg-muted"
            >
              <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full gradient-warm text-sm font-bold text-primary-foreground">
                {post.createdBy.profileImage ? (
                  <img
                    src={post.createdBy.profileImage}
                    alt={post.createdBy.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  post.createdBy.name?.slice(0, 1).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm font-bold">{post.createdBy.name}</p>
                {post.createdBy.location && (
                  <p className="text-xs text-muted-foreground">
                    {post.createdBy.location}
                  </p>
                )}
              </div>
            </Link>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={handleLike}
              disabled={!isAuthenticated}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold shadow-soft transition disabled:opacity-50 ${
                liked ? "bg-coral/15 text-coral" : "bg-card text-muted-foreground hover:text-coral"
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-coral" : ""}`} />
              {post.likes?.length ?? 0}
            </button>
            <button
              onClick={handleSave}
              disabled={!isAuthenticated}
              className={`rounded-full px-4 py-2 text-sm font-bold shadow-soft transition disabled:opacity-50 ${
                saved ? "bg-primary/20 text-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {saved ? "Saved" : "Save"}
            </button>
            {post.category === "Found" && (
              <Link
                to="/ai-match"
                className="btn-bounce inline-flex items-center gap-1.5 rounded-full gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-soft"
              >
                <Sparkles className="h-4 w-4" />
                AI Match
              </Link>
            )}

            {isOwner && (
              <div className="ml-auto flex items-center gap-2">
                <Link
                  to="/edit-post/$postId"
                  params={{ postId }}
                  className="grid h-10 w-10 place-items-center rounded-full bg-secondary/60 text-secondary-foreground hover:scale-110"
                  aria-label="Edit"
                  title="Edit post"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-label="Delete"
                  className="grid h-10 w-10 place-items-center rounded-full bg-destructive/10 text-destructive hover:scale-110 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          {actionError && <p className="text-sm text-coral">{actionError}</p>}
        </div>
      </div>

      {/* Comments */}
      <div className="mt-14">
        <h2 className="font-display text-xl font-bold">
          Comments {commentsData ? `(${comments.length})` : ""}
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={500}
              placeholder="Leave a helpful comment…"
              className="flex-1 rounded-full border border-input bg-transparent px-4 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={isCommenting || !commentText.trim()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full gradient-primary text-primary-foreground disabled:opacity-50"
              aria-label="Post comment"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            <Link to="/login" className="font-semibold underline-offset-4 hover:underline">
              Log in
            </Link>{" "}
            to leave a comment.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {commentsLoading && (
            <p className="text-sm text-muted-foreground">Loading comments…</p>
          )}
          {!commentsLoading && comments.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No comments yet — be the first to help.
            </p>
          )}
          {comments.map((c) => (
            <div key={c._id} className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full gradient-warm text-xs font-bold text-primary-foreground">
                {c.author?.profileImage ? (
                  <img
                    src={c.author.profileImage}
                    alt={c.author.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  c.author?.name?.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1 rounded-2xl bg-muted/50 px-4 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold">{c.author?.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {timeAgo(c.createdAt)}
                    </span>
                    {(user?._id === c.author?._id || isOwner) && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        aria-label="Delete comment"
                        className="text-muted-foreground hover:text-coral"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-0.5 text-sm">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}