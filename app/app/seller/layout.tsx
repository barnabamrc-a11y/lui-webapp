"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, ShoppingBag, Wallet, User, Bell, Plus } from "lucide-react";
import { getStoredUser } from "@/app/_lib/user-api";
import { NotifProvider, useNotifs } from "@/app/app/_lib/notif-context";

const NAV = [
  { href: "/app/seller",                  icon: Home,        label: "Home"   },
  { href: "/app/seller/orders",           icon: ShoppingBag, label: "Orders" },
  { href: "/app/seller/wallet",           icon: Wallet,      label: "Wallet" },
  { href: "/app/seller/profile",          icon: User,        label: "Profile"},
];

function SellerShell({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const { unread } = useNotifs();
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    setUser(getStoredUser<{ name: string }>());
  }, []);

  const initials = user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-[#0a1220] flex">
      {/* ── Sidebar (md+) ─────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-[#07101e] border-r border-[#1a3060] fixed left-0 top-0 bottom-0 z-30">
        <div className="p-5 border-b border-[#1a3060]">
          <div className="bg-white rounded-xl px-3 py-1.5 inline-flex items-center justify-center shadow-sm">
            <Image src="/lui-logo.png" alt="LUI" width={64} height={26} className="object-contain" priority />
          </div>
          <p className="text-xs font-semibold text-[#4f8eff] tracking-widest uppercase mt-3">Seller</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = href === "/app/seller" ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? "bg-[#4361EE] text-white" : "text-[#8b9ab4] hover:bg-[#0d1f35] hover:text-white"
                }`}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}

          <div className="pt-4">
            <Link href="/app/seller/create-order"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-[#4361EE]/10 text-[#4f8eff] hover:bg-[#4361EE]/20 transition-colors border border-[#4361EE]/30">
              <Plus className="w-4 h-4" />
              New Order
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-[#1a3060]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4361EE] flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{user?.name ?? "..."}</p>
              <p className="text-xs text-[#4f8eff]">Seller</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────── */}
      <div className="flex-1 md:ml-60 pb-20 md:pb-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#07101e]/80 backdrop-blur border-b border-[#1a3060] px-4 py-3 flex items-center justify-between md:px-6">
          <div className="md:hidden">
            <Image src="/lui-logo.png" alt="LUI" width={52} height={22} className="object-contain" />
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <Link href="/app/seller/create-order"
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-[#4361EE] text-white text-xs font-semibold rounded-lg">
              <Plus className="w-3.5 h-3.5" />
              New Order
            </Link>
            <Link href="/app/seller/notifications" className="relative p-2 text-[#8b9ab4] hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          </div>
        </div>

        <main className="p-4 md:p-6">{children}</main>
      </div>

      {/* ── Bottom tab bar (mobile) ────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#07101e] border-t border-[#1a3060] flex">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === "/app/seller" ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                active ? "text-[#4361EE]" : "text-[#8b9ab4]"
              }`}>
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotifProvider>
      <SellerShell>{children}</SellerShell>
    </NotifProvider>
  );
}
