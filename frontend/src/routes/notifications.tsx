import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Heart, Loader2, MessageCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/lib/notifications";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [{ title: "Notifications — CatNet" }],
  }),
  component: Notifications,
});

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

function Notifications() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    enabled: isAuthenticated,
  });

  const notifications = data?.notifications ?? [];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      invalidate();
    } catch {
      /* non-critical */
    }
  };

  const handleClick = async (id: string, read: boolean) => {
    if (read) return;
    try {
      await markAsRead(id);
      invalidate();
    } catch {
      /* non-critical */
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      invalidate();
    } catch {
      /* non-critical */
    }
  };

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
        <h1 className="font-display text-2xl font-bold">Log in to see notifications</h1>
        <Link
          to="/login"
          search={{ redirect: "/notifications" }}
          className="btn-bounce mt-6 inline-flex rounded-full gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-12 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="grid place-items-center rounded-3xl bg-card p-12 text-center shadow-card">
            <Bell className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              You're all caught up — nothing here yet.
            </p>
          </div>
        )}

        {notifications.map((n) => (
          <div
            key={n._id}
            onClick={() => handleClick(n._id, n.read)}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl p-4 shadow-soft transition ${
              n.read ? "bg-card" : "bg-primary/10"
            }`}
          >
            <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/60 text-secondary-foreground">
              {n.type === "like" ? (
                <Heart className="h-4 w-4" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-bold">{n.sender?.name ?? "Someone"}</span>{" "}
                {n.type === "like" ? "liked" : "commented on"} your post
                {n.post?.title ? ` "${n.post.title}"` : ""}
                {n.type === "comment" && n.commentSnippet && (
                  <span className="block text-muted-foreground">
                    "{n.commentSnippet}"
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {timeAgo(n.createdAt)}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(n._id);
              }}
              aria-label="Delete notification"
              className="shrink-0 text-muted-foreground hover:text-coral"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}