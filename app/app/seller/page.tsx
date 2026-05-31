"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Wallet, ArrowRight, Loader2, Plus, TrendingUp, Lock, Clock } from "lucide-react";
import { userApi, getStoredUser } from "@/app/_lib/user-api";
import { fmt } from "@/app/app/_lib/fmt";
import { connectSocket } from "@/app/_lib/socket";
import { useI18n } from "@/app/_lib/i18n";

interface WalletData { available_balance: string; frozen_balance: string; pending_balance: string; }
interface Order { id: string; order_number: string; product: string; total: string; status: string; created_at: string; buyer_name: string | null; }

const STATUS_COLORS: Record<string, string> = {
  pending:      "bg-amber-500/20 text-amber-400",
  paid:         "bg-teal-500/20 text-teal-400",
  ready_to_ship:"bg-sky-500/20 text-sky-400",
  in_transit:   "bg-blue-500/20 text-blue-400",
  delivered:    "bg-purple-500/20 text-purple-400",
  completed:    "bg-emerald-500/20 text-emerald-400",
  disputed:     "bg-red-500/20 text-red-400",
};

export default function SellerHome() {
  const [wallet,   setWallet]   = useState<WalletData | null>(null);
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const user = getStoredUser<{ name: string }>();
  const { t } = useI18n();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const load = useCallback(async () => {
    try {
      const [w, o] = await Promise.all([
        userApi.get<WalletData>("/api/v1/wallet"),
        userApi.get<{ data: Order[] }>("/api/v1/orders?limit=5"),
      ]);
      setWallet(w); setOrders(o.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const sock = connectSocket();
    if (!sock) return;
    const onUpd = () => load();
    sock.on("order:updated", onUpd);
    sock.on("notification:new", onUpd);
    return () => { sock.off("order:updated", onUpd); sock.off("notification:new", onUpd); };
  }, [load]);

  const active    = orders.filter((o) => !["completed", "cancelled", "refunded"].includes(o.status)).length;
  const completed = orders.filter((o) => o.status === "completed").length;

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-6 h-6 text-[#4f8eff] animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("hi")}, {firstName} 👋</h1>
          <p className="text-[#8b9ab4] text-sm mt-1">{t("sellerDashboard")}</p>
        </div>
        <Link href="/app/seller/create-order"
          className="flex items-center gap-2 px-4 py-2 bg-[#4361EE] hover:bg-[#3451D1] text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> {t("newOrder")}
        </Link>
      </div>

      {/* Wallet card */}
      <div className="bg-gradient-to-br from-[#4361EE] to-[#3451D1] rounded-2xl p-6 shadow-lg">
        <p className="text-blue-200 text-sm font-medium mb-1">{t("availableBalance")}</p>
        <p className="text-3xl font-bold text-white mb-4">TZS {fmt(wallet?.available_balance ?? "0")}</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Lock className="w-3 h-3 text-blue-200" />
              <span className="text-blue-200 text-xs">{t("inEscrow")}</span>
            </div>
            <p className="text-white font-bold text-sm">TZS {fmt(wallet?.frozen_balance ?? "0")}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3 h-3 text-blue-200" />
              <span className="text-blue-200 text-xs">{t("pending")}</span>
            </div>
            <p className="text-white font-bold text-sm">TZS {fmt(wallet?.pending_balance ?? "0")}</p>
          </div>
        </div>
        <Link href="/app/seller/wallet"
          className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Wallet className="w-4 h-4" /> {t("viewWallet")} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-4">
          <ShoppingBag className="w-5 h-5 text-[#4f8eff] mb-2" />
          <p className="text-2xl font-bold text-white">{active}</p>
          <p className="text-[#8b9ab4] text-xs">{t("activeOrders")}</p>
        </div>
        <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-4">
          <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">{completed}</p>
          <p className="text-[#8b9ab4] text-xs">{t("completed")}</p>
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">{t("recentOrders")}</h2>
          <Link href="/app/seller/orders" className="text-[#4f8eff] text-sm hover:underline">{t("seeAll")}</Link>
        </div>
        {orders.length === 0 ? (
          <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-8 text-center">
            <ShoppingBag className="w-8 h-8 text-[#4f8eff] mx-auto mb-2 opacity-50" />
            <p className="text-[#8b9ab4] text-sm">{t("noOrdersYet")}</p>
            <Link href="/app/seller/create-order" className="text-[#4f8eff] text-sm hover:underline mt-1 inline-block">
              Create your first order
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <Link key={o.id} href={`/app/seller/orders/${o.id}`}
                className="bg-[#0d1f35] border border-[#1a3060] rounded-xl p-4 flex items-center gap-4 hover:border-[#4361EE]/40 transition-colors block">
                <div className="w-10 h-10 bg-[#4361EE]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-[#4f8eff]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{o.product}</p>
                  <p className="text-[#8b9ab4] text-xs">{o.order_number}{o.buyer_name ? ` · ${o.buyer_name}` : " · awaiting buyer"}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-sm font-bold">TZS {fmt(o.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status] ?? "bg-slate-500/20 text-slate-400"}`}>
                    {o.status.replace("_", " ")}
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
