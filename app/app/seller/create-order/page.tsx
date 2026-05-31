"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Package, DollarSign, Hash, Truck, Phone, Copy, Loader2, ArrowLeft, Camera, X, CheckCircle2 } from "lucide-react";
import { userApi } from "@/app/_lib/user-api";
import { fmt } from "@/app/app/_lib/fmt";
import { useI18n } from "@/app/_lib/i18n";

interface BuyerInfo { id: string; name: string; email: string | null; phone: string }
interface CreatedOrder { id: string; order_number: string; total: string; product: string; buyer_name: string }

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.luipayment.com";

export default function CreateOrder() {
  const router = useRouter();
  const { t } = useI18n();

  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyer, setBuyer]           = useState<BuyerInfo | null>(null);
  const [lookingUp, setLookingUp]   = useState(false);
  const [notFound, setNotFound]     = useState(false);

  const [form, setForm] = useState({ product: "", description: "", quantity: "1", price: "", deliveryFee: "0" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl]   = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [created, setCreated] = useState<CreatedOrder | null>(null);
  const [copied, setCopied]   = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const phoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // Amount fields: store digits only, display with thousands separators.
  const updateNum = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value.replace(/[^\d]/g, "") }));
  const commas = (v: string) => (v ? Number(v.replace(/[^\d]/g, "")).toLocaleString("en-US") : "");

  const total = (parseFloat(form.price || "0") * parseInt(form.quantity || "1")) + parseFloat(form.deliveryFee || "0");

  // ── Buyer phone lookup (debounced) ──────────────────────────
  const onPhoneChange = (v: string) => {
    setBuyerPhone(v);
    setBuyer(null);
    setNotFound(false);
    if (phoneTimer.current) clearTimeout(phoneTimer.current);
    if (v.trim().length < 10) return;
    phoneTimer.current = setTimeout(async () => {
      setLookingUp(true);
      try {
        const res = await userApi.get<BuyerInfo>(`/api/v1/users/lookup?phone=${encodeURIComponent(v.trim())}`);
        setBuyer(res);
      } catch {
        setNotFound(true);
      } finally {
        setLookingUp(false);
      }
    }, 600);
  };

  // ── Photo upload ────────────────────────────────────────────
  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const token = localStorage.getItem("lui_token");
      const res = await fetch(`${BASE}/api/v1/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setImageUrl(json.data.url);
    } catch {
      setError("Image upload failed — order can still be created without a photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyer) { setError("Enter a valid LUI buyer phone number."); return; }
    setError(""); setLoading(true);
    try {
      const res = await userApi.post<CreatedOrder>("/api/v1/orders", {
        buyerPhone:  buyer.phone,
        product:     form.product.trim(),
        description: form.description.trim() || undefined,
        quantity:    parseInt(form.quantity),
        price:       parseFloat(form.price),
        deliveryFee: parseFloat(form.deliveryFee || "0"),
        imageUrl:    imageUrl ?? undefined,
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
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-white text-xl font-bold mb-1">Order Created!</h2>
        <p className="text-[#8b9ab4] text-sm">Sent to {created.buyer_name} — they&apos;ll see it instantly</p>
      </div>

      <div className="bg-[#0d1f35] border border-[#4361EE]/40 rounded-2xl p-6 text-center">
        <p className="text-[#8b9ab4] text-xs mb-2 uppercase tracking-widest">Order Code</p>
        <p className="text-white font-mono text-2xl font-bold tracking-widest mb-2">{created.order_number}</p>
        <p className="text-[#8b9ab4] text-sm mb-4">{created.product} · TZS {fmt(created.total)}</p>
        <button onClick={copyCode}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-[#4361EE] hover:bg-[#3451D1] text-white rounded-xl font-semibold text-sm transition-colors">
          <Copy className="w-4 h-4" />{copied ? "Copied!" : "Copy Code"}
        </button>
      </div>

      <div className="flex gap-3">
        <button onClick={() => { setCreated(null); setBuyer(null); setBuyerPhone(""); setForm({ product: "", description: "", quantity: "1", price: "", deliveryFee: "0" }); setImagePreview(null); setImageUrl(null); }}
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
        <h1 className="text-xl font-bold text-white">{t("newOrder")}</h1>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Buyer phone lookup */}
        <Field label={t("buyerPhone")} icon={<Phone className="w-4 h-4" />}>
          <input value={buyerPhone} onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+255 7XX XXX XXX" type="tel" required
            className="app-input" style={{ borderColor: buyer ? "#22c55e" : undefined }} />
          {lookingUp && <Loader2 className="absolute right-3 w-4 h-4 text-[#4f8eff] animate-spin" />}
          {buyer && !lookingUp && <CheckCircle2 className="absolute right-3 w-5 h-5 text-emerald-400" />}
        </Field>

        {buyer && (
          <div className="flex items-center gap-3 bg-[#0d1f35] border border-emerald-500/40 rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-[#4361EE] flex items-center justify-center text-white text-sm font-bold">
              {buyer.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">{buyer.name}</p>
              {buyer.email && <p className="text-[#8b9ab4] text-xs truncate">{buyer.email}</p>}
            </div>
            <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-medium">LUI user</span>
          </div>
        )}
        {notFound && !lookingUp && (
          <p className="text-red-400 text-sm -mt-2">No LUI account found with this number</p>
        )}

        {/* Photo upload */}
        <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()}
          className="w-full h-32 rounded-xl border-2 border-dashed border-[#1a3060] hover:border-[#4361EE]/50 flex flex-col items-center justify-center gap-2 transition-colors relative overflow-hidden">
          {imagePreview ? (
            <>
              <Image src={imagePreview} alt="preview" fill className="object-cover" unoptimized />
              {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>}
              <span onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageUrl(null); }}
                className="absolute top-2 right-2 bg-black/50 rounded-full p-1"><X className="w-4 h-4 text-white" /></span>
            </>
          ) : (
            <>
              <Camera className="w-7 h-7 text-[#4f8eff]/60" />
              <span className="text-[#8b9ab4] text-sm">{t("addPhoto")}</span>
            </>
          )}
        </button>

        <Field label={`${t("productName")} *`} icon={<Package className="w-4 h-4" />}>
          <input value={form.product} onChange={update("product")} placeholder="e.g. Samsung Galaxy S24" required className="app-input" />
        </Field>

        <div>
          <label className="block text-sm font-medium text-[#8b9ab4] mb-1.5">Description (optional)</label>
          <textarea value={form.description} onChange={update("description")} placeholder="Product details..." rows={2}
            className="w-full px-4 py-3 rounded-xl bg-[#07101e] border border-[#1a3060] text-white placeholder-[#4f8eff]/30 text-sm focus:outline-none focus:border-[#4361EE] resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (TZS) *" icon={<DollarSign className="w-4 h-4" />}>
            <input type="text" inputMode="numeric" value={commas(form.price)} onChange={updateNum("price")} placeholder="500,000" required className="app-input" />
          </Field>
          <Field label="Quantity" icon={<Hash className="w-4 h-4" />}>
            <input type="number" min="1" value={form.quantity} onChange={update("quantity")} required className="app-input" />
          </Field>
        </div>

        <Field label="Delivery Fee (TZS)" icon={<Truck className="w-4 h-4" />}>
          <input type="text" inputMode="numeric" value={commas(form.deliveryFee)} onChange={updateNum("deliveryFee")} placeholder="0" className="app-input" />
        </Field>

        {parseFloat(form.price || "0") > 0 && (
          <div className="bg-[#07101e] border border-[#1a3060] rounded-xl p-4 flex items-center justify-between">
            <span className="text-[#8b9ab4] text-sm">Total</span>
            <span className="text-white font-bold text-lg">TZS {fmt(total)}</span>
          </div>
        )}

        <button type="submit" disabled={loading || !buyer}
          className="w-full h-12 bg-[#4361EE] hover:bg-[#3451D1] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
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
        <span className="absolute left-3 text-[#4f8eff]/60 z-10">{icon}</span>
        {children}
      </div>
    </div>
  );
}
