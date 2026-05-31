"use client";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.luipayment.com";

const TOKEN_KEY   = "lui_token";
const REFRESH_KEY = "lui_refresh";
const USER_KEY    = "lui_user";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function saveUserTokens(access: string, refresh: string, user: object) {
  localStorage.setItem(TOKEN_KEY,   access);
  localStorage.setItem(REFRESH_KEY, refresh);
  localStorage.setItem(USER_KEY,    JSON.stringify(user));
}

export function clearUserTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function updateStoredUser(patch: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(USER_KEY);
  const current = raw ? JSON.parse(raw) : {};
  localStorage.setItem(USER_KEY, JSON.stringify({ ...current, ...patch }));
}

export function getStoredUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

// Single shared refresh so parallel 401s don't each trigger a refresh.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;
    if (!refreshToken) return null;
    try {
      const res = await fetch(`${BASE}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.accessToken) return null;
      localStorage.setItem(TOKEN_KEY, json.data.accessToken);
      if (json.data.refreshToken) localStorage.setItem(REFRESH_KEY, json.data.refreshToken);
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

  // Access token expired → refresh once and retry.
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(path, init, newToken);
    } else {
      // Refresh failed → session is over. Send the user to login.
      clearUserTokens();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
      throw new Error("Session expired. Please sign in again.");
    }
  }

  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `Request failed: ${res.status}`);
  return json.data as T;
}

export const userApi = {
  get:    <T>(path: string)                => request<T>(path),
  post:   <T>(path: string, body?: unknown) => request<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: <T>(path: string)                => request<T>(path, { method: "DELETE" }),
};
