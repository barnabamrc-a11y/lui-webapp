"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { userApi } from "@/app/_lib/user-api";

interface Notif {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}

interface NotifCtx {
  notifs: Notif[];
  unread: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<NotifCtx>({ notifs: [], unread: 0, markRead: async () => {}, markAllRead: async () => {}, refresh: async () => {} });

export function NotifProvider({ children }: { children: React.ReactNode }) {
  const [notifs, setNotifs] = useState<Notif[]>([]);

  const refresh = useCallback(async () => {
    try {
      const res = await userApi.get<{ data: Notif[]; unreadCount: number }>("/api/v1/notifications?limit=30");
      setNotifs(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000); // poll every 30s (WS upgrade below adds push)
    return () => clearInterval(id);
  }, [refresh]);

  const markRead = async (id: string) => {
    await userApi.patch(`/api/v1/notifications/${id}/read`);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await userApi.patch("/api/v1/notifications/read-all");
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unread = notifs.filter((n) => !n.is_read).length;

  return (
    <Ctx.Provider value={{ notifs, unread, markRead, markAllRead, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useNotifs = () => useContext(Ctx);
