"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Loader2, ChevronRight, Plus } from "lucide-react";
import { userApi } from "@/app/_lib/user-api";
import { fmt, fmtDate } from "@/app/app/_lib/fmt";
import { connectSocket } from "@/app/_lib/socket";

interface Order {
  id: string; order_number: string; product: string; total: string;
  status: string; created_at: string; buyer_name: string | null;
}

const TABS = ["all", "awaiting_acceptance", "pending", "ready_to_ship", "in_transit", "delivered", "completed", "disputed"] as const;

const STATUS_COLORS: Record<string, string> = {
  awaiting_acceptance: "bg-[#4361EE]/20 text-[#4f8eff] border-[#4361EE]/30",
  accepted:      "bg-teal-500/20 text-teal-400 border-teal-500/30",
  pending:       "bg-amber-500/20 text-amber-400 border-amber-500/30",
  ready_to_ship: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  in_transit:    "bg-blue-500/20 text-blue-400 border-blue-500/30",
  delivered:     "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed:     "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  disputed:      "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled:     "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export default function SellerOrders() {
  const [filter,  setFilter]  = useState("all");
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const q = filter === "all" ? "" : `&status=${filter}`;
    userApi.get<{ data: Order[] }>(`/api/v1/orders?limit=50${q}`)
      .then((r) => setOrders(r.data))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const sock = connectSocket();
    if (!sock) return;
    const onUpd = () => load();
    sock.on("order:updated", onUpd);
    sock.on("notification:new", onUpd);
    return () => { sock.off("order:updated", onUpd); sock.off("notification:new", onUpd); };
  }, [load]);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <Link href="/app/seller/create-order"
          className="flex items-center gap-2 px-3 py-2 bg-[#4361EE] hover:bg-[#3451D1] text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize ${
              filter === t ? "bg-[#4361EE] text-white" : "bg-[#0d1f35] text-[#8b9ab4] border border-[#1a3060] hover:text-white"
            }`}>
            {t.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 text-[#4f8eff] animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-10 text-center">
          <ShoppingBag className="w-10 h-10 text-[#4f8eff] mx-auto mb-3 opacity-40" />
          <p className="text-[#8b9ab4]">No orders found</p>
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
                <p className="text-white text-sm font-semibold truncate">{o.product}</p>
                <p className="text-[#8b9ab4] text-xs mt-0.5">
                  {o.order_number}{o.buyer_name ? ` · ${o.buyer_name}` : " · awaiting buyer"}
                </p>
                <p className="text-[#8b9ab4] text-xs">{fmtDate(o.created_at)}</p>
              </div>
              <div className="text-right flex-shrink-0 space-y-1">
                <p className="text-white text-sm font-bold">TZS {fmt(o.total)}</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium border ${STATUS_COLORS[o.status] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30"}`}>
                  {o.status.replace(/_/g, " ")}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8b9ab4] flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
