"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, DollarSign, Truck, Hash, Copy, Loader2, ArrowLeft } from "lucide-react";
import { userApi } from "@/app/_lib/user-api";
import { fmt } from "@/app/app/_lib/fmt";

interface CreatedOrder { id: string; order_number: string; total: string; product: string; }

export default function CreateOrder() {
  const router = useRouter();
  const [form, setForm] = useState({ product: "", description: "", quantity: "1", price: "", deliveryFee: "0", buyerLocation: "" });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [created,  setCreated]  = useState<CreatedOrder | null>(null);
  const [copied,   setCopied]   = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const total = (parseFloat(form.price || "0") * parseInt(form.quantity || "1")) + parseFloat(form.deliveryFee || "0");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await userApi.post<CreatedOrder>("/api/v1/orders", {
        product:      form.product.trim(),
        description:  form.description.trim() || undefined,
        quantity:     parseInt(form.quantity),
        price:        parseFloat(form.price),
        deliveryFee:  parseFloat(form.deliveryFee || "0"),
        buyerLocation:form.buyerLocation.trim() || undefined,
      });
      setCreated(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create order");
    } finally { setLoading(false); }
  };

  const copyCode = () => {
    if (!created) return;
    navigator.clipboard.writeText(created.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (created) return (
    <div className="max-w-sm mx-auto space-y-6 pt-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-white text-xl font-bold mb-1">Order Created!</h2>
        <p className="text-[#8b9ab4] text-sm">Share the code below with your buyer</p>
      </div>

      <div className="bg-[#0d1f35] border border-[#4361EE]/40 rounded-2xl p-6 text-center">
        <p className="text-[#8b9ab4] text-xs mb-2 uppercase tracking-widest">Order Code</p>
        <p className="text-white font-mono text-2xl font-bold tracking-widest mb-2">{created.order_number}</p>
        <p className="text-[#8b9ab4] text-sm mb-4">{created.product} · TZS {fmt(created.total)}</p>
        <button onClick={copyCode}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-[#4361EE] hover:bg-[#3451D1] text-white rounded-xl font-semibold text-sm transition-colors">
          <Copy className="w-4 h-4" />
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setCreated(null)}
          className="flex-1 h-11 bg-[#0d1f35] border border-[#1a3060] text-[#8b9ab4] hover:text-white rounded-xl text-sm font-medium transition-colors">
          Create Another
        </button>
        <button onClick={() => router.push(`/app/seller/orders/${created.id}`)}
          className="flex-1 h-11 bg-[#4361EE] text-white rounded-xl text-sm font-semibold transition-colors">
          View Order
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[#8b9ab4] hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Create Order</h1>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Product Name" icon={<Package className="w-4 h-4" />}>
          <input value={form.product} onChange={update("product")} placeholder="e.g. Samsung Galaxy S24"
            required className="app-input" />
        </Field>

        <div>
          <label className="block text-sm font-medium text-[#8b9ab4] mb-1.5">Description (optional)</label>
          <textarea value={form.description} onChange={update("description")}
            placeholder="Product details..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-[#07101e] border border-[#1a3060] text-white placeholder-[#4f8eff]/30 text-sm focus:outline-none focus:border-[#4361EE] resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (TZS)" icon={<DollarSign className="w-4 h-4" />}>
            <input type="number" min="0" step="100" value={form.price} onChange={update("price")}
              placeholder="500000" required className="app-input" />
          </Field>
          <Field label="Quantity" icon={<Hash className="w-4 h-4" />}>
            <input type="number" min="1" value={form.quantity} onChange={update("quantity")}
              required className="app-input" />
          </Field>
        </div>

        <Field label="Delivery Fee (TZS)" icon={<Truck className="w-4 h-4" />}>
          <input type="number" min="0" step="100" value={form.deliveryFee} onChange={update("deliveryFee")}
            placeholder="0" className="app-input" />
        </Field>

        <Field label="Buyer Location (optional)" icon={<Truck className="w-4 h-4" />}>
          <input value={form.buyerLocation} onChange={update("buyerLocation")}
            placeholder="e.g. Dar es Salaam, Kariakoo" className="app-input" />
        </Field>

        {/* Total preview */}
        {parseFloat(form.price || "0") > 0 && (
          <div className="bg-[#07101e] border border-[#1a3060] rounded-xl p-4 flex items-center justify-between">
            <span className="text-[#8b9ab4] text-sm">Total</span>
            <span className="text-white font-bold text-lg">TZS {fmt(total)}</span>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full h-12 bg-[#4361EE] hover:bg-[#3451D1] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Order"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#8b9ab4] mb-1.5">{label}</label>
      <div className="relative flex items-center">
        <span className="absolute left-3 text-[#4f8eff]/60">{icon}</span>
        {children}
      </div>
    </div>
  );
}
