import axios, { type AxiosError } from "axios";
import type { ApiErrorPayload } from "@/types";

// Backend uses httpOnly cookies for the JWT, so every request must send credentials.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  withCredentials: true,
});

// Normalized error shape that UI code can rely on, regardless of where the
// failure happened (network vs. validation vs. server error).
export class ApiClientError extends Error {
  status: number;
  errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    if (error.response) {
      const { message, errors } = error.response.data ?? {
        message: "Something went wrong. Please try again.",
      };
      return Promise.reject(
        new ApiClientError(message, error.response.status, errors)
      );
    }

    if (error.request) {
      return Promise.reject(
        new ApiClientError(
          "Couldn't reach the server. Check your connection and try again.",
          0
        )
      );
    }

    return Promise.reject(new ApiClientError(error.message, 0));
  }
);

export default api;