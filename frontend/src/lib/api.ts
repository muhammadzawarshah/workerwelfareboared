import type { ApiEnvelope } from "@/src/types";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/** Server origin without the trailing /api — used for static assets like uploaded images. */
export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

/** Build a full URL for an uploaded file path stored in the DB (e.g. /uploads/users/x.jpg). */
export function mediaUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Thin fetch wrapper that talks to the NestJS backend.
 * - Adds JSON / auth headers (skips Content-Type for FormData uploads).
 * - Unwraps the standard `{ success, message, data }` envelope when present.
 */
export async function apiRequest<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const json = (await res.json()) as ApiEnvelope<T> | T;
  if (typeof json === "object" && json && "data" in json) {
    return (json as ApiEnvelope<T>).data;
  }
  return json as T;
}
