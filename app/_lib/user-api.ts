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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
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
