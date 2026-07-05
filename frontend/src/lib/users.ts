import { api } from "@/lib/api";
import type { ApiResponse, PostsListData, User } from "@/types";

export interface UserProfileData {
  user: User;
  postCount: number;
}

export async function getUserProfile(id: string): Promise<UserProfileData> {
  const res = await api.get<ApiResponse<UserProfileData>>(`/users/${id}`);
  return res.data.data;
}

export async function getUserPosts(
  id: string,
  params: { page?: number; limit?: number; category?: string } = {}
): Promise<PostsListData> {
  const res = await api.get<ApiResponse<PostsListData>>(`/users/${id}/posts`, {
    params,
  });
  return res.data.data;
}

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  location?: string;
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<User> {
  const res = await api.put<ApiResponse<{ user: User }>>(
    "/users/profile",
    input
  );
  return res.data.data.user;
}

export async function updateProfileImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("profileImage", file);

  const res = await api.post<ApiResponse<{ profileImage: string }>>(
    "/users/profile/image",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data.data.profileImage;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await api.put("/users/password", { currentPassword, newPassword });
}

export const usersApi = {
  getUserProfile,
  getUserPosts,
  updateProfile,
  updateProfileImage,
  changePassword,
};