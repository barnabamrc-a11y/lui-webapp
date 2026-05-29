"use client";

import { useEffect } from "react";
import { getStoredUser } from "@/app/_lib/user-api";

export default function AppRoot() {
  useEffect(() => {
    const user = getStoredUser<{ role: string }>();
    if (!user) { window.location.href = "/auth/login"; return; }
    window.location.href = user.role === "seller" ? "/app/seller" : "/app/buyer";
  }, []);
  return null;
}
