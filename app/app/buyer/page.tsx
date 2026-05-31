"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Wallet, ArrowRight, Loader2, TrendingUp, Clock } from "lucide-react";
import { userApi, getStoredUser } from "@/app/_lib/user-api";
import { fmt } from "@/app/app/_lib/fmt";
import { connectSocket } from "@/app/_lib/socket";

interface WalletData { available_balance: string; frozen_balance: string; pending_balance: string; }
interface Order { id: string; order_number: string; product: string; total: string; status: string; created_at: string; seller_name: string; }

const STATUS_COLORS: Record<string, string> = {
  awaiting_acceptance: "bg-[#4361EE]/20 text-[#4f8eff]",
  pending:      "bg-amber-500/20 text-amber-400",
  paid:         "bg-teal-500/20 text-teal-400",
  in_transit:   "bg-blue-500/20 text-blue-400",
  delivered:    "bg-purple-500/20 text-purple-400",
  completed:    "bg-emerald-500/20 text-emerald-400",
  disputed:     "bg-red-500/20 text-red-400",
  cancelled:    "bg-slate-500/20 text-slate-400",
};

export default function BuyerHome() {
  const [wallet, setWallet]   = useState<WalletData | null>(null);
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser<{ name: string }>();

  const load = useCallback(async () => {
    try {
      const [w, o] = await Promise.all([
        userApi.get<WalletData>("/api/v1/wallet"),
        userApi.get<{ data: Order[] }>("/api/v1/orders?limit=20"),
      ]);
      setWallet(w); setOrders(o.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Real-time updates
  useEffect(() => {
    const sock = connectSocket();
    if (!sock) return;
    const onUpd = () => load();
    sock.on("order:updated", onUpd);
    sock.on("notification:new", onUpd);
    return () => { sock.off("order:updated", onUpd); sock.off("notification:new", onUpd); };
  }, [load]);

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const pendingForYou = orders.filter((o) => o.status === "awaiting_acceptance");
  const others = orders.filter((o) => o.status !== "awaiting_acceptance").slice(0, 5);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-6 h-6 text-[#4f8eff] animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">Hi, {firstName} 👋</h1>
        <p className="text-[#8b9ab4] text-sm mt-1">Here&apos;s your account overview</p>
      </div>

      {/* Wallet card */}
      <div className="bg-gradient-to-br from-[#4361EE] to-[#3451D1] rounded-2xl p-6 shadow-lg">
        <p className="text-blue-200 text-sm font-medium mb-1">Available Balance</p>
        <p className="text-3xl font-bold text-white mb-4">
          TZS {fmt(wallet?.available_balance ?? "0")}
        </p>
        {parseFloat(wallet?.frozen_balance ?? "0") > 0 && (
          <p className="text-blue-200 text-xs mb-4">
            + TZS {fmt(wallet?.frozen_balance ?? "0")} in escrow
          </p>
        )}
        <Link href="/app/buyer/wallet"
          className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Wallet className="w-4 h-4" /> View Wallet <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/app/buyer/pay"
          className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-4 flex flex-col gap-3 hover:border-[#4361EE]/50 transition-colors group">
          <div className="w-10 h-10 bg-[#4361EE]/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#4f8eff]" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Pay via Link</p>
            <p className="text-[#8b9ab4] text-xs mt-0.5">Enter order number to pay</p>
          </div>
        </Link>
        <Link href="/app/buyer/orders"
          className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-4 flex flex-col gap-3 hover:border-[#4361EE]/50 transition-colors group">
          <div className="w-10 h-10 bg-[#4361EE]/10 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-[#4f8eff]" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">My Orders</p>
            <p className="text-[#8b9ab4] text-xs mt-0.5">{orders.length} recent orders</p>
          </div>
        </Link>
      </div>

      {/* Pending for you — awaiting acceptance */}
      {pendingForYou.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#4361EE]" />
            <h2 className="text-white font-semibold">Pending for You</h2>
            <span className="text-xs bg-[#4361EE]/20 text-[#4f8eff] px-2 py-0.5 rounded-full font-bold">{pendingForYou.length}</span>
          </div>
          <div className="space-y-2">
            {pendingForYou.map((o) => (
              <Link key={o.id} href={`/app/buyer/orders/${o.id}`}
                className="bg-[#0d1f35] border border-[#4361EE] rounded-xl p-4 flex items-center gap-4 hover:bg-[#0d1f35]/70 transition-colors block">
                <div className="w-10 h-10 bg-[#4361EE]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[#4f8eff]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{o.product}</p>
                  <p className="text-[#8b9ab4] text-xs">From {o.seller_name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-sm font-semibold">TZS {fmt(o.total)}</p>
                  <span className="text-[#4f8eff] text-xs font-bold">Review →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Recent Orders</h2>
          <Link href="/app/buyer/orders" className="text-[#4f8eff] text-sm hover:underline">See all</Link>
        </div>

        {others.length === 0 ? (
          <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-8 text-center">
            <Clock className="w-8 h-8 text-[#4f8eff] mx-auto mb-2 opacity-50" />
            <p className="text-[#8b9ab4] text-sm">No orders yet</p>
            <Link href="/app/buyer/pay" className="text-[#4f8eff] text-sm hover:underline mt-1 inline-block">
              Make your first payment
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {others.map((o) => (
              <Link key={o.id} href={`/app/buyer/orders/${o.id}`}
                className="bg-[#0d1f35] border border-[#1a3060] rounded-xl p-4 flex items-center gap-4 hover:border-[#4361EE]/40 transition-colors block">
                <div className="w-10 h-10 bg-[#4361EE]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-[#4f8eff]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{o.product}</p>
                  <p className="text-[#8b9ab4] text-xs">{o.order_number} · {o.seller_name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-sm font-semibold">TZS {fmt(o.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status] ?? "bg-slate-500/20 text-slate-400"}`}>
                    {o.status.replace(/_/g, " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
