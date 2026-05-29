"use client";

import { io, Socket } from "socket.io-client";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.luipayment.com";

let socket: Socket | null = null;

export function connectSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("lui_token");
  if (!token) return null;
  if (socket?.connected) return socket;

  socket = io(BASE, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
