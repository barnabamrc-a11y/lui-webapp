"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, Loader2, ArrowRight } from "lucide-react";
import { userApi } from "@/app/_lib/user-api";
import { fmt } from "@/app/app/_lib/fmt";

interface OrderPreview {
  id: string; order_number: string; product: string; total: string;
  seller_name: string; seller_business_name: string | null; status: string;
}

export default function PayPage() {
  const router = useRouter();
  const [code,    setCode]    = useState("");
  const [order,   setOrder]   = useState<OrderPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying,  setPaying]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true); setError(""); setOrder(null);
    try {
      const res = await userApi.get<OrderPreview>(`/api/v1/orders/number/${code.trim().toUpperCase()}`);
      setOrder(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Order not found");
    } finally { setLoading(false); }
  };

  const pay = async () => {
    if (!order) return;
    setPaying(true); setError("");
    try {
      await userApi.post(`/api/v1/orders/${order.id}/pay`);
      setSuccess(true);
      setTimeout(() => router.push(`/app/buyer/orders/${order.id}`), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally { setPaying(false); }
  };

  if (success) return (
    <div className="max-w-sm mx-auto mt-16 text-center">
      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-white text-xl font-bold mb-2">Payment Successful</h2>
      <p className="text-[#8b9ab4] text-sm">Funds are held in escrow. Redirecting…</p>
    </div>
  );

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pay via Order Code</h1>
        <p className="text-[#8b9ab4] text-sm mt-1">Enter the order number shared by the seller</p>
      </div>

      <form onSubmit={lookup} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. LUI-XXXX-XXXX"
          className="flex-1 h-12 px-4 rounded-xl bg-[#0d1f35] border border-[#1a3060] text-white placeholder-[#4f8eff]/40 focus:outline-none focus:border-[#4361EE] font-mono text-sm tracking-wider"
        />
        <button type="submit" disabled={loading || !code.trim()}
          className="h-12 px-4 bg-[#4361EE] hover:bg-[#3451D1] text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-60">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </button>
      </form>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl p-3">{error}</p>
      )}

      {order && (
        <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#4361EE]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-[#4f8eff]" />
            </div>
            <div>
              <p className="text-white font-semibold">{order.product}</p>
              <p className="text-[#8b9ab4] text-xs">{order.order_number}</p>
              <p className="text-[#8b9ab4] text-xs">{order.seller_business_name ?? order.seller_name}</p>
            </div>
          </div>
          <div className="border-t border-[#1a3060] pt-3 flex items-center justify-between">
            <span className="text-[#8b9ab4] text-sm">Amount</span>
            <span className="text-white font-bold text-lg">TZS {fmt(order.total)}</span>
          </div>
          {order.status !== "pending" ? (
            <p className="text-amber-400 text-sm text-center">This order is not available for payment ({order.status})</p>
          ) : (
            <button onClick={pay} disabled={paying}
              className="w-full h-12 bg-[#4361EE] hover:bg-[#3451D1] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Pay TZS {fmt(order.total)}</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
