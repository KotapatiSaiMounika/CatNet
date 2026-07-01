import type { Post } from "@/types";
import { PostCard } from "./PostCard";

interface CatCardProps {
  cat: Post;
  onLikeToggle?: (
    postId: string,
    liked: boolean,
    count: number
  ) => void;
}

export function CatCard({
  cat,
  onLikeToggle,
}: CatCardProps) {
  return (
    <PostCard
      post={cat}
      onLikeToggle={onLikeToggle}
    />
  );
}