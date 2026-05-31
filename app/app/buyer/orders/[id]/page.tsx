"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, MessageCircle, Loader2, CheckCircle2, AlertTriangle,
  XCircle, MapPin, CreditCard,
} from "lucide-react";
import { userApi } from "@/app/_lib/user-api";
import { fmt, fmtDate } from "@/app/app/_lib/fmt";
import { connectSocket } from "@/app/_lib/socket";

interface Order {
  id: string; order_number: string; product: string; description: string | null;
  quantity: number; price: string; delivery_fee: string; total: string; lui_fee: string;
  status: string; created_at: string;
  seller_name: string; seller_business_name: string | null; buyer_name: string | null;
  image_url: string | null; buyer_address: Record<string, string> | null; decline_reason: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  awaiting_acceptance: "Awaiting your acceptance",
  accepted:            "Accepted — set delivery address",
  pending:             "Awaiting payment",
  paid:                "Paid — held in escrow",
  ready_to_ship:       "Preparing",
  in_transit:          "On the way",
  delivered:           "Delivered",
  completed:           "Completed",
  disputed:            "Disputed",
  cancelled:           "Cancelled",
};

export default function BuyerOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState(false);
  const [error, setError]     = useState("");

  // sub-views
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [showAddress, setShowAddress] = useState(false);
  const [addr, setAddr] = useState({ address1: "", address2: "", city: "", country: "Tanzania", zipCode: "", lat: "", lng: "" });

  const load = useCallback(async () => {
    try { setOrder(await userApi.get<Order>(`/api/v1/orders/${id}`)); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // realtime
  useEffect(() => {
    const sock = connectSocket();
    if (!sock) return;
    const onUpd = () => load();
    sock.on("order:updated", onUpd);
    return () => { sock.off("order:updated", onUpd); };
  }, [load]);

  const run = async (fn: () => Promise<unknown>) => {
    setActing(true); setError("");
    try { await fn(); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Action failed"); }
    finally { setActing(false); }
  };

  const accept = () => run(async () => {
    await userApi.post(`/api/v1/orders/${id}/accept`);
    setShowAddress(true);
  });

  const decline = () => run(async () => {
    await userApi.post(`/api/v1/orders/${id}/decline`, { reason: declineReason });
    setShowDecline(false);
  });

  const submitAddress = () => {
    if (!addr.address1.trim() || !addr.city.trim()) { setError("Street address and city are required."); return; }
    run(async () => {
      await userApi.patch(`/api/v1/orders/${id}/delivery-address`, addr);
      setShowAddress(false);
    });
  };

  const pay = () => run(() => userApi.post(`/api/v1/orders/${id}/pay`));
  const confirmDelivery = () => run(() => userApi.post(`/api/v1/orders/${id}/confirm-delivery`));

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 text-[#4f8eff] animate-spin" /></div>;
  if (!order) return <p className="text-[#8b9ab4]">Order not found</p>;

  const st = order.status;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/app/buyer/orders" className="text-[#8b9ab4] hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white">{order.order_number}</h1>
          <p className="text-[#8b9ab4] text-xs">{fmtDate(order.created_at)} · {STATUS_LABEL[st] ?? st}</p>
        </div>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}

      {order.image_url && (
        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-[#1a3060]">
          <Image src={order.image_url} alt={order.product} fill className="object-cover" unoptimized />
        </div>
      )}

      {st === "cancelled" && order.decline_reason && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-[#8b9ab4] text-sm">Declined: {order.decline_reason}</span>
        </div>
      )}

      {/* Details */}
      <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-5 space-y-3">
        <h3 className="text-white font-semibold">Order Details</h3>
        <Row label="Product" value={order.product} />
        {order.description && <Row label="Description" value={order.description} />}
        <Row label="Seller" value={order.seller_business_name ?? order.seller_name} />
        {order.buyer_address && (
          <Row label="Delivery to" value={[order.buyer_address.address1, order.buyer_address.city, order.buyer_address.country].filter(Boolean).join(", ")} />
        )}
        <div className="border-t border-[#1a3060] pt-3 space-y-2">
          <Row label="Subtotal" value={`TZS ${fmt(order.price)} × ${order.quantity}`} />
          <Row label="Delivery fee" value={`TZS ${fmt(order.delivery_fee)}`} />
          <Row label="Total" value={`TZS ${fmt(order.total)}`} bold />
        </div>
      </div>

      {/* ── Actions ────────────────────────────────────────── */}

      {/* awaiting_acceptance */}
      {st === "awaiting_acceptance" && !showDecline && !showAddress && (
        <div className="space-y-2">
          <button onClick={accept} disabled={acting}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Accept Order</>}
          </button>
          <button onClick={() => setShowDecline(true)}
            className="w-full h-11 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors">
            <XCircle className="w-4 h-4" /> Decline Order
          </button>
        </div>
      )}

      {/* decline form */}
      {showDecline && (
        <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-4 space-y-3">
          <h3 className="text-white font-semibold">Decline Order</h3>
          <textarea value={declineReason} onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Why are you declining? (optional)" rows={3}
            className="w-full px-4 py-3 rounded-xl bg-[#07101e] border border-[#1a3060] text-white placeholder-[#4f8eff]/30 text-sm focus:outline-none focus:border-[#4361EE] resize-none" />
          <div className="flex gap-2">
            <button onClick={() => setShowDecline(false)} className="flex-1 h-11 bg-[#07101e] border border-[#1a3060] text-[#8b9ab4] rounded-xl text-sm font-medium">Cancel</button>
            <button onClick={decline} disabled={acting} className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center disabled:opacity-60">
              {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Decline"}
            </button>
          </div>
        </div>
      )}

      {/* accepted → address form */}
      {(st === "accepted" || (st === "awaiting_acceptance" && showAddress)) && (
        <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#4f8eff]" /><h3 className="text-white font-semibold">Delivery Address</h3></div>
          <AddrInput label="Street Address *" value={addr.address1} onChange={(v) => setAddr(a => ({ ...a, address1: v }))} />
          <AddrInput label="Apartment / Suite" value={addr.address2} onChange={(v) => setAddr(a => ({ ...a, address2: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <AddrInput label="City *" value={addr.city} onChange={(v) => setAddr(a => ({ ...a, city: v }))} />
            <AddrInput label="Country *" value={addr.country} onChange={(v) => setAddr(a => ({ ...a, country: v }))} />
          </div>
          <AddrInput label="ZIP / Postal" value={addr.zipCode} onChange={(v) => setAddr(a => ({ ...a, zipCode: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <AddrInput label="Latitude (opt)" value={addr.lat} onChange={(v) => setAddr(a => ({ ...a, lat: v }))} />
            <AddrInput label="Longitude (opt)" value={addr.lng} onChange={(v) => setAddr(a => ({ ...a, lng: v }))} />
          </div>
          <button onClick={submitAddress} disabled={acting}
            className="w-full h-12 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Confirm Address</>}
          </button>
        </div>
      )}

      {/* pending → pay */}
      {st === "pending" && (
        <button onClick={pay} disabled={acting}
          className="w-full h-12 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
          {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4" /> Pay TZS {fmt(order.total)}</>}
        </button>
      )}

      {/* delivered → release / dispute */}
      {st === "delivered" && (
        <div className="space-y-2">
          <button onClick={confirmDelivery} disabled={acting}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Confirm Delivery & Release</>}
          </button>
          <Link href={`/app/buyer/dispute/${order.id}`}
            className="w-full h-11 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors">
            <AlertTriangle className="w-4 h-4" /> Open Dispute
          </Link>
        </div>
      )}

      <Link href={`/app/chat/${order.id}`}
        className="w-full h-11 bg-[#0d1f35] border border-[#1a3060] text-[#4f8eff] hover:bg-[#1a3060] font-medium rounded-xl flex items-center justify-center gap-2 transition-colors">
        <MessageCircle className="w-4 h-4" /> Chat with Seller
      </Link>
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

function AddrInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#8b9ab4] mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg bg-[#07101e] border border-[#1a3060] text-white text-sm focus:outline-none focus:border-[#4361EE]" />
    </div>
  );
}
