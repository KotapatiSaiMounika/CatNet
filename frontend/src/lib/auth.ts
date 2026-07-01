import { api } from "@/lib/api";
import type { ApiResponse, User } from "@/types";

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function signupRequest(input: SignupInput): Promise<User> {
  const res = await api.post<ApiResponse<{ user: User }>>(
    "/auth/signup",
    input
  );
  return res.data.data.user;
}

export async function loginRequest(input: LoginInput): Promise<User> {
  const res = await api.post<ApiResponse<{ user: User }>>(
    "/auth/login",
    input
  );
  return res.data.data.user;
}

export async function logoutRequest(): Promise<void> {
  await api.post("/auth/logout");
}

// Returns null (instead of throwing) when there's no valid session, since
// this is called on every app load to check "am I logged in?".
export async function getMeRequest(): Promise<User | null> {
  try {
    const res = await api.get<ApiResponse<{ user: User }>>("/auth/me");
    return res.data.data.user;
  } catch {
    return null;
  }
}