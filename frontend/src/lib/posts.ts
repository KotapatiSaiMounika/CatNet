import { api } from "@/lib/api";
import type {
  AiMatchData,
  ApiResponse,
  Comment,
  CommentsListData,
  GetPostsParams,
  Post,
  PostFormInput,
  PostsListData,
} from "@/types";

export async function getPosts(
  params: GetPostsParams = {}
): Promise<PostsListData> {
  const res = await api.get<ApiResponse<PostsListData>>("/posts", { params });
  return res.data.data;
}

export async function getPostById(id: string): Promise<Post> {
  const res = await api.get<ApiResponse<{ post: Post }>>(`/posts/${id}`);
  return res.data.data.post;
}

// Builds the multipart form the backend's `upload.single('catImage')` expects.
function buildPostFormData(input: PostFormInput): FormData {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("description", input.description);
  formData.append("category", input.category);
  if (input.contactInfo) formData.append("contactInfo", input.contactInfo);
  if (input.location) formData.append("location", JSON.stringify(input.location));
  if (input.catImage) formData.append("catImage", input.catImage);
  return formData;
}

export async function createPost(input: PostFormInput): Promise<Post> {
  const res = await api.post<ApiResponse<{ post: Post }>>(
    "/posts",
    buildPostFormData(input),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data.data.post;
}

export async function updatePost(
  id: string,
  input: PostFormInput
): Promise<Post> {
  const res = await api.put<ApiResponse<{ post: Post }>>(
    `/posts/${id}`,
    buildPostFormData(input),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data.data.post;
}

export async function deletePost(id: string): Promise<void> {
  await api.delete(`/posts/${id}`);
}

// Upload a photo and get back the closest Lost/Found posts by visual
// similarity (AI Match). `category` narrows the search — e.g. pass "Found"
// when someone lost their cat and wants to search posts *other people*
// found, or omit it to search both.
export async function matchByPhoto(
  photo: File,
  category?: "Lost" | "Found"
): Promise<AiMatchData> {
  const formData = new FormData();
  formData.append("photo", photo);

  const res = await api.post<ApiResponse<AiMatchData>>(
    "/posts/ai-match",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      params: category ? { category } : undefined,
    }
  );
  return res.data.data;
}

export async function toggleLike(
  id: string
): Promise<{ liked: boolean; likesCount: number }> {
  const res = await api.post<
    ApiResponse<{ liked: boolean; likesCount: number }>
  >(`/posts/${id}/like`);
  return res.data.data;
}

export async function toggleSave(
  id: string
): Promise<{ saved: boolean }> {
  const res = await api.post<ApiResponse<{ saved: boolean }>>(
    `/posts/${id}/save`
  );
  return res.data.data;
}

export async function getSavedPosts(
  params: { page?: number; limit?: number } = {}
): Promise<PostsListData> {
  const res = await api.get<ApiResponse<PostsListData>>("/users/saved", {
    params,
  });
  return res.data.data;
}

export async function getComments(
  postId: string,
  params: { page?: number; limit?: number } = {}
): Promise<CommentsListData> {
  const res = await api.get<ApiResponse<CommentsListData>>(
    `/posts/${postId}/comments`,
    { params }
  );
  return res.data.data;
}

export async function addComment(
  postId: string,
  text: string
): Promise<Comment> {
  const res = await api.post<ApiResponse<{ comment: Comment }>>(
    `/posts/${postId}/comments`,
    { text }
  );
  return res.data.data.comment;
}

export async function editComment(
  postId: string,
  commentId: string,
  text: string
): Promise<Comment> {
  const res = await api.put<ApiResponse<{ comment: Comment }>>(
    `/posts/${postId}/comments/${commentId}`,
    { text }
  );
  return res.data.data.comment;
}

export async function deleteComment(
  postId: string,
  commentId: string
): Promise<void> {
  await api.delete(`/posts/${postId}/comments/${commentId}`);
}
export const postsApi = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  toggleSave,
  getSavedPosts,
  getComments,
  addComment,
  editComment,
  deleteComment,
  matchByPhoto,
};