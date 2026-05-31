"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, MessageCircle, Loader2, Truck, Package, CheckCircle2, Copy } from "lucide-react";
import { userApi } from "@/app/_lib/user-api";
import { fmt, fmtDate } from "@/app/app/_lib/fmt";
import { connectSocket } from "@/app/_lib/socket";

interface Order {
  id: string; order_number: string; product: string; description: string | null;
  quantity: number; price: string; delivery_fee: string; total: string; lui_fee: string;
  status: string; created_at: string; buyer_name: string | null; buyer_location: string | null;
  seller_name: string; image_url: string | null; buyer_address: Record<string, string> | null;
  decline_reason: string | null;
}

const NEXT_STATUS: Record<string, { label: string; value: string; icon: React.ElementType }> = {
  paid:          { label: "Mark as Preparing",  value: "ready_to_ship", icon: Package },
  ready_to_ship: { label: "Mark as Dispatched", value: "in_transit",    icon: Truck   },
  in_transit:    { label: "Mark as Delivered",  value: "delivered",     icon: CheckCircle2 },
};

export default function SellerOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(false);
  const [error,   setError]   = useState("");
  const [copied,  setCopied]  = useState(false);

  const load = useCallback(async () => {
    try { setOrder(await userApi.get<Order>(`/api/v1/orders/${id}`)); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const sock = connectSocket();
    if (!sock) return;
    const onUpd = () => load();
    sock.on("order:updated", onUpd);
    return () => { sock.off("order:updated", onUpd); };
  }, [load]);

  const updateStatus = async (newStatus: string) => {
    setActing(true); setError("");
    try {
      await userApi.patch(`/api/v1/orders/${id}/status`, { status: newStatus });
      const refreshed = await userApi.get<Order>(`/api/v1/orders/${id}`);
      setOrder(refreshed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setActing(false); }
  };

  const copyCode = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-6 h-6 text-[#4f8eff] animate-spin" />
    </div>
  );
  if (!order) return <p className="text-[#8b9ab4]">Order not found</p>;

  const next = NEXT_STATUS[order.status];

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/app/seller/orders" className="text-[#8b9ab4] hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white">{order.order_number}</h1>
          <p className="text-[#8b9ab4] text-xs">{fmtDate(order.created_at)}</p>
        </div>
        <button onClick={copyCode}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1f35] border border-[#1a3060] rounded-lg text-[#4f8eff] text-xs hover:bg-[#1a3060] transition-colors">
          <Copy className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Share code"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      {/* Status badge */}
      <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-[#8b9ab4] text-xs mb-1">Current Status</p>
          <p className="text-white font-semibold capitalize">{order.status.replace(/_/g, " ")}</p>
        </div>
        {order.status === "awaiting_acceptance" && (
          <span className="text-xs bg-[#4361EE]/20 text-[#4f8eff] px-3 py-1 rounded-full">Awaiting buyer acceptance</span>
        )}
        {order.status === "accepted" && (
          <span className="text-xs bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full">Buyer setting address</span>
        )}
        {order.status === "paid" && (
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">Paid · funds in escrow</span>
        )}
      </div>

      {order.status === "cancelled" && order.decline_reason && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          Buyer declined: {order.decline_reason}
        </div>
      )}

      {order.image_url && (
        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-[#1a3060]">
          <Image src={order.image_url} alt={order.product} fill className="object-cover" unoptimized />
        </div>
      )}

      {/* Details */}
      <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-5 space-y-3">
        <h3 className="text-white font-semibold">Order Details</h3>
        <Row label="Product"  value={order.product} />
        {order.description && <Row label="Description" value={order.description} />}
        {order.buyer_name && <Row label="Buyer" value={order.buyer_name} />}
        {order.buyer_address && (
          <Row label="Delivery" value={[order.buyer_address.address1, order.buyer_address.city, order.buyer_address.country].filter(Boolean).join(", ")} />
        )}
        <div className="border-t border-[#1a3060] pt-3 space-y-2">
          <Row label="Price"        value={`TZS ${fmt(order.price)} × ${order.quantity}`} />
          <Row label="Delivery fee" value={`TZS ${fmt(order.delivery_fee)}`} />
          <Row label="Total"        value={`TZS ${fmt(order.total)}`} bold />
          {parseFloat(order.lui_fee) > 0 && (
            <Row label="Platform fee" value={`TZS ${fmt(order.lui_fee)}`} />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {next && (
          <button onClick={() => updateStatus(next.value)} disabled={acting}
            className="w-full h-12 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><next.icon className="w-4 h-4" />{next.label}</>}
          </button>
        )}
        {order.buyer_name && (
          <Link href={`/app/chat/${order.id}`}
            className="w-full h-11 bg-[#0d1f35] border border-[#1a3060] text-[#4f8eff] hover:bg-[#1a3060] font-medium rounded-xl flex items-center justify-center gap-2 transition-colors">
            <MessageCircle className="w-4 h-4" /> Chat with Buyer
          </Link>
        )}
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
