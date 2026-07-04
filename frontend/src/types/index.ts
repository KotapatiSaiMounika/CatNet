// Shared types mirroring the backend Mongoose models + ApiResponse shape.
// Keep these in sync with backend/models/*.js when the schema changes.

export interface User {
  _id: string;
  name: string;
  email: string;
  profileImage: string;
  bio: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

// Lightweight version returned via populate('createdBy', 'name profileImage location')
export interface PostAuthor {
  _id: string;
  name: string;
  profileImage: string;
  location: string;
  bio?: string;
}

export type PostCategory = "Lost" | "Found" | "Adoption";

export interface PostLocation {
  address: string;
  lat: number | null;
  lng: number | null;
}

export interface Post {
  _id: string;
  title: string;
  description: string;
  category: PostCategory;
  catImage: string;
  location: PostLocation;
  contactInfo: string;
  createdBy: PostAuthor;
  likes: string[];
  savedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: PostAuthor;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = "like" | "comment";

export interface NotificationItem {
  _id: string;
  recipient: string;
  sender: PostAuthor;
  type: NotificationType;
  post: { _id: string; title: string; catImage?: string };
  commentSnippet: string;
  read: boolean;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore?: boolean;
}

// Generic shape returned by backend's ApiResponse class
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorPayload {
  success: false;
  message: string;
  errors?: string[];
}

export interface PostsListData {
  posts: Post[];
  pagination: Pagination;
}

// A post returned by the AI Match photo search, with its visual similarity
// score (0-100) against the uploaded query photo attached.
export interface AiMatchResult extends Post {
  matchScore: number;
}

export interface AiMatchData {
  matches: AiMatchResult[];
  candidatesScanned: number;
}

export interface CommentsListData {
  comments: Comment[];
  pagination: Pagination;
}

export interface NotificationsListData {
  notifications: NotificationItem[];
  unreadCount: number;
  pagination: Pagination;
}

export interface GetPostsParams {
  search?: string;
  category?: PostCategory;
  location?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

// Payload for creating/editing a post (sent as multipart/form-data)
export interface PostFormInput {
  title: string;
  description: string;
  category: PostCategory;
  contactInfo?: string;
  location?: { address: string; lat?: number | null; lng?: number | null };
  catImage?: File | null;
}