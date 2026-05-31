"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, AlertTriangle, Loader2, Lock, ShieldCheck } from "lucide-react";
import { userApi } from "@/app/_lib/user-api";

interface OrderMeta { order_number: string; product: string; }

const REASONS: { label: string; value: string }[] = [
  { label: "Wrong product received", value: "wrong_item" },
  { label: "Item damaged",           value: "damaged" },
  { label: "Not as described",       value: "not_as_described" },
  { label: "Item not delivered",     value: "not_received" },
  { label: "Other",                  value: "other" },
];

const STEPS = [
  { step: 1, label: "Level 1: Self-Resolution", duration: "24 hours", desc: "Buyer and seller resolve between themselves." },
  { step: 2, label: "Level 2: LUI Review",      duration: "48 hours", desc: "A LUI mediator reviews the evidence and decides." },
  { step: 3, label: "Level 3: Investigation",   duration: "72 hours", desc: "Formal investigation with full evidence review." },
];

export default function BuyerDispute({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderMeta | null>(null);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    userApi.get<OrderMeta>(`/api/v1/orders/${orderId}`).then(setOrder).catch(() => {});
  }, [orderId]);

  const submit = async () => {
    if (!reason) { setError("Please choose a reason."); return; }
    if (!description.trim()) { setError("Please describe what went wrong."); return; }
    setSubmitting(true); setError("");
    try {
      await userApi.post("/api/v1/disputes", { orderId, reason, description: description.trim() });
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not raise dispute");
    } finally { setSubmitting(false); }
  };

  if (submitted) return (
    <div className="max-w-md mx-auto text-center space-y-5 pt-6">
      <div className="w-20 h-20 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
      </div>
      <h1 className="text-xl font-bold text-white">Dispute Raised</h1>
      <p className="text-[#8b9ab4] text-sm">Funds for {order?.order_number} are now frozen. Neither party can access them until resolved.</p>
      <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-4 text-left space-y-3">
        <p className="text-white font-semibold">What happens next?</p>
        {STEPS.map((s) => (
          <div key={s.step} className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#4361EE]/20 text-[#4f8eff] text-xs font-bold flex items-center justify-center flex-shrink-0">{s.step}</div>
            <div>
              <p className="text-white text-sm font-medium">{s.label} <span className="text-[#8b9ab4] font-normal">· {s.duration}</span></p>
              <p className="text-[#8b9ab4] text-xs">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => router.push(`/app/buyer/orders/${orderId}`)} className="w-full h-12 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold rounded-xl">Back to Order</button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[#8b9ab4] hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold text-white">Raise Dispute</h1>
      </div>

      {order && (
        <div className="bg-[#0d1f35] border border-[#1a3060] rounded-xl p-4">
          <p className="text-[#8b9ab4] text-xs font-mono">{order.order_number}</p>
          <p className="text-white font-semibold">{order.product}</p>
        </div>
      )}

      <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
        <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-amber-300/90 text-xs leading-relaxed">Once you raise a dispute, funds stay frozen until resolved. Neither party can access them.</p>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}

      <div>
        <p className="text-xs font-bold tracking-widest text-[#8b9ab4] mb-2">SELECT REASON</p>
        <div className="flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <button key={r.value} onClick={() => setReason(r.value)}
              className={`px-3 py-2 rounded-full border text-sm font-medium transition-colors ${reason === r.value ? "bg-red-500 border-red-500 text-white" : "border-[#1a3060] text-[#8b9ab4] bg-[#07101e]"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold tracking-widest text-[#8b9ab4] mb-2">DESCRIBE THE PROBLEM</p>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
          placeholder="Explain what went wrong in detail…"
          className="w-full px-4 py-3 rounded-xl bg-[#07101e] border border-[#1a3060] text-white text-sm focus:outline-none focus:border-[#4361EE] resize-none" />
      </div>

      <button onClick={submit} disabled={submitting}
        className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Submit Dispute</>}
      </button>
    </div>
  );
}
