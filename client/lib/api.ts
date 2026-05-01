import axios, { AxiosError } from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL,
});

/**
 * Type-safe utility to extract a human-readable error message from an
 * unknown catch-block value. Handles Axios errors (including server
 * response bodies), plain Error instances, strings, and anything else.
 *
 * @param error  – the value from a catch block (always `unknown` in strict TS)
 * @param fallback – optional fallback message when no details can be extracted
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
): string {
  // Axios errors carry the server response
  if (axios.isAxiosError(error)) {
    const serverMsg =
      (error.response?.data as Record<string, unknown>)?.error ??
      (error.response?.data as Record<string, unknown>)?.message;
    if (typeof serverMsg === "string") return serverMsg;
    return error.message || fallback;
  }

  // Standard JS errors
  if (error instanceof Error) return error.message;

  // Thrown strings (rare but possible)
  if (typeof error === "string") return error;

  return fallback;
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error?.response?.status === 401
    ) {
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);