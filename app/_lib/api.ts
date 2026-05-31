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

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("lui_admin_refresh") : null;
    if (!refreshToken) return null;
    try {
      const res = await fetch(`${BASE}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.accessToken) return null;
      localStorage.setItem("lui_admin_token", json.data.accessToken);
      if (json.data.refreshToken) localStorage.setItem("lui_admin_refresh", json.data.refreshToken);
      return json.data.accessToken as string;
    } catch {
      return null;
    }
  })();
  const result = await refreshing;
  refreshing = null;
  return result;
}

async function doFetch(path: string, init: RequestInit, token: string | null): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${BASE}${path}`, { ...init, headers });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await doFetch(path, init, getToken());

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(path, init, newToken);
    } else {
      clearTokens();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
      throw new Error("Session expired. Please sign in again.");
    }
  }

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
