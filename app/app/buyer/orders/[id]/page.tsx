"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, MessageCircle, Loader2, Package, Truck, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { userApi } from "@/app/_lib/user-api";
import { fmt, fmtDate } from "@/app/app/_lib/fmt";

interface Order {
  id: string; order_number: string; product: string; description: string | null;
  quantity: number; price: string; delivery_fee: string; total: string; lui_fee: string;
  status: string; created_at: string; delivered_at: string | null; auto_release_at: string | null;
  seller_name: string; seller_business_name: string | null; buyer_name: string | null;
  buyer_location: string | null;
}

const TIMELINE = [
  { key: "pending",       label: "Order placed",   icon: Clock      },
  { key: "in_transit",    label: "Shipped",         icon: Truck      },
  { key: "delivered",     label: "Delivered",       icon: Package    },
  { key: "completed",     label: "Completed",       icon: CheckCircle2 },
];

const STATUS_ORDER = ["pending", "ready_to_ship", "in_transit", "delivered", "completed"];

export default function BuyerOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    userApi.get<Order>(`/api/v1/orders/${id}`)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  const confirmDelivery = async () => {
    setActing(true); setError("");
    try {
      await userApi.post(`/api/v1/orders/${id}/confirm-delivery`);
      const refreshed = await userApi.get<Order>(`/api/v1/orders/${id}`);
      setOrder(refreshed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setActing(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-6 h-6 text-[#4f8eff] animate-spin" />
    </div>
  );
  if (!order) return <p className="text-[#8b9ab4]">Order not found</p>;

  const stepIdx     = STATUS_ORDER.indexOf(order.status);
  const timelineIdx = TIMELINE.findIndex((t) => t.key === order.status);

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/app/buyer/orders" className="text-[#8b9ab4] hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white">{order.order_number}</h1>
          <p className="text-[#8b9ab4] text-xs">{fmtDate(order.created_at)}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      {/* Timeline */}
      <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-5">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#1a3060] mx-10" />
          {TIMELINE.map(({ key, label, icon: Icon }, i) => {
            const done    = STATUS_ORDER.indexOf(key) <= stepIdx;
            const current = key === order.status || (order.status === "ready_to_ship" && key === "pending");
            return (
              <div key={key} className="flex flex-col items-center gap-2 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  done ? "bg-[#4361EE] border-[#4361EE]" : "bg-[#07101e] border-[#1a3060]"
                }`}>
                  <Icon className={`w-4 h-4 ${done ? "text-white" : "text-[#4f8eff]/40"}`} />
                </div>
                <span className={`text-xs text-center font-medium ${done ? "text-white" : "text-[#8b9ab4]"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product details */}
      <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-5 space-y-3">
        <h3 className="text-white font-semibold">Order Details</h3>
        <Row label="Product"    value={order.product} />
        {order.description && <Row label="Description" value={order.description} />}
        <Row label="Seller"     value={order.seller_business_name ?? order.seller_name} />
        {order.buyer_location && <Row label="Delivery to" value={order.buyer_location} />}
        <div className="border-t border-[#1a3060] pt-3 space-y-2">
          <Row label="Subtotal"     value={`TZS ${fmt(order.price)} × ${order.quantity}`} />
          <Row label="Delivery fee" value={`TZS ${fmt(order.delivery_fee)}`} />
          <Row label="Total"        value={`TZS ${fmt(order.total)}`} bold />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {order.status === "delivered" && (
          <button onClick={confirmDelivery} disabled={acting}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Confirm Delivery & Release Payment</>}
          </button>
        )}
        {order.status === "delivered" && (
          <Link href={`/app/buyer/dispute/${order.id}`}
            className="w-full h-11 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors">
            <AlertTriangle className="w-4 h-4" /> Open Dispute
          </Link>
        )}
        <Link href={`/app/chat/${order.id}`}
          className="w-full h-11 bg-[#0d1f35] border border-[#1a3060] text-[#4f8eff] hover:bg-[#1a3060] font-medium rounded-xl flex items-center justify-center gap-2 transition-colors">
          <MessageCircle className="w-4 h-4" /> Chat with Seller
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#8b9ab4] text-sm">{label}</span>
      <span className={`text-sm ${bold ? "text-white font-bold" : "text-white"}`}>{value}</span>
    </div>
  );
}
