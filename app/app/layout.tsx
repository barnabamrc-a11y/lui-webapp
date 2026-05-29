"use client";

import { useEffect, useState } from "react";
import { getStoredUser } from "@/app/_lib/user-api";

interface LuiUser {
  id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getStoredUser<LuiUser>();
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }
    if (user.role === "admin") {
      window.location.href = "/dashboard/overview";
      return;
    }
    setReady(true);
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
