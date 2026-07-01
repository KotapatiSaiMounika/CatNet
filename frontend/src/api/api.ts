// Central API service — all requests go through here.
// Cookies (JWT httpOnly) are sent automatically via credentials: 'include'.

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore?: boolean;
}

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

export interface PostLocation {
  address: string;
  lat: number | null;
  lng: number | null;
}

export interface Post {
  _id: string;
  title: string;
  description: string;
  category: 'Lost' | 'Found' | 'Adoption';
  catImage: string;
  location: PostLocation;
  contactInfo: string;
  createdBy: Pick<User, '_id' | 'name' | 'profileImage' | 'location' | 'bio'>;
  likes: string[];
  savedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: Pick<User, '_id' | 'name' | 'profileImage'>;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: Pick<User, '_id' | 'name' | 'profileImage'>;
  type: 'like' | 'comment';
  post: Pick<Post, '_id' | 'title' | 'catImage'> | null;
  commentSnippet?: string;
  read: boolean;
  createdAt: string;
}

// ─── Request helper ───────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    credentials: 'include', // send httpOnly JWT cookie
    headers: {
      ...(options.body instanceof FormData
        ? {} // let browser set Content-Type with boundary
        : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    const msg = json?.message || `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return json as ApiResponse<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  signup: (body: { name: string; email: string; password: string }) =>
    request<{ user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  logout: () =>
    request<null>('/auth/logout', { method: 'POST' }),

  getMe: () =>
    request<{ user: User }>('/auth/me'),
};

// ─── Posts ───────────────────────────────────────────────────────────────────

export interface GetPostsParams {
  search?: string;
  category?: 'Lost' | 'Found' | 'Adoption';
  location?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const postsApi = {
  getAll: (params: GetPostsParams = {}) => {
    const q = new URLSearchParams();
    if (params.search)   q.set('search',   params.search);
    if (params.category) q.set('category', params.category);
    if (params.location) q.set('location', params.location);
    if (params.page)     q.set('page',     String(params.page));
    if (params.limit)    q.set('limit',    String(params.limit));
    if (params.sort)     q.set('sort',     params.sort);
    return request<{ posts: Post[]; pagination: PaginationMeta }>(
      `/posts${q.toString() ? '?' + q.toString() : ''}`
    );
  },

  getById: (id: string) =>
    request<{ post: Post }>(`/posts/${id}`),

  create: (formData: FormData) =>
    request<{ post: Post }>('/posts', {
      method: 'POST',
      body: formData,
    }),

  update: (id: string, formData: FormData) =>
    request<{ post: Post }>(`/posts/${id}`, {
      method: 'PUT',
      body: formData,
    }),

  delete: (id: string) =>
    request<null>(`/posts/${id}`, { method: 'DELETE' }),

  like: (id: string) =>
    request<{ liked: boolean; likesCount: number }>(`/posts/${id}/like`, {
      method: 'POST',
    }),

  save: (id: string) =>
    request<{ saved: boolean }>(`/posts/${id}/save`, {
      method: 'POST',
    }),
};

// ─── Comments ────────────────────────────────────────────────────────────────

export const commentsApi = {
  getAll: (postId: string, page = 1) =>
    request<{ comments: Comment[]; pagination: PaginationMeta }>(
      `/posts/${postId}/comments?page=${page}`
    ),

  add: (postId: string, text: string) =>
    request<{ comment: Comment }>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  edit: (postId: string, commentId: string, text: string) =>
    request<{ comment: Comment }>(`/posts/${postId}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    }),

  delete: (postId: string, commentId: string) =>
    request<null>(`/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    }),
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const usersApi = {
  getProfile: (id: string) =>
    request<{ user: User; postCount: number }>(`/users/${id}`),

  getPosts: (id: string, page = 1, category?: string) => {
    const q = new URLSearchParams({ page: String(page) });
    if (category) q.set('category', category);
    return request<{ posts: Post[]; pagination: PaginationMeta }>(
      `/users/${id}/posts?${q.toString()}`
    );
  },

  updateProfile: (body: Partial<Pick<User, 'name' | 'bio' | 'location'>>) =>
    request<{ user: User }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  updateProfileImage: (formData: FormData) =>
    request<{ profileImage: string }>('/users/profile/image', {
      method: 'POST',
      body: formData,
    }),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<null>('/users/password', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  getSavedPosts: (page = 1) =>
    request<{ posts: Post[]; pagination: PaginationMeta }>(
      `/users/saved?page=${page}`
    ),
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const notificationsApi = {
  getAll: (page = 1) =>
    request<{ notifications: Notification[]; unreadCount: number; pagination: PaginationMeta }>(
      `/notifications?page=${page}`
    ),

  markAsRead: (id: string) =>
    request<{ notification: Notification }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllAsRead: () =>
    request<null>('/notifications/read-all', { method: 'PUT' }),

  delete: (id: string) =>
    request<null>(`/notifications/${id}`, { method: 'DELETE' }),
};