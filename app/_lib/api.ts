"use client";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.luipayment.com";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lui_admin_token");
}

export function saveTokens(access: string, refresh: string, user: object) {
  localStorage.setItem("lui_admin_token", access);
  localStorage.setItem("lui_admin_refresh", refresh);
  localStorage.setItem("lui_admin_user", JSON.stringify(user));
}

export function clearTokens() {
  localStorage.removeItem("lui_admin_token");
  localStorage.removeItem("lui_admin_refresh");
  localStorage.removeItem("lui_admin_user");
}

export function getStoredUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("lui_admin_user");
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? `Request failed: ${res.status}`);
  }
  return json.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
