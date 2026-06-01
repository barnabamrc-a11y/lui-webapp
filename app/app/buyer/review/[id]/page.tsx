"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, Star, CheckCircle2 } from "lucide-react";
import { userApi } from "@/app/_lib/user-api";

interface Order { id: string; order_number: string; product: string; seller_name: string; seller_business_name: string | null; }
interface Review { rating: number; comment: string | null; }

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [existing, setExisting] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [o, r] = await Promise.all([
          userApi.get<Order>(`/api/v1/orders/${id}`),
          userApi.get<Review | null>(`/api/v1/reviews/order/${id}`).catch(() => null),
        ]);
        setOrder(o);
        if (r) { setExisting(r); setRating(r.rating); setComment(r.comment ?? ""); }
      } finally { setLoading(false); }
    })();
  }, [id]);

  const submit = async () => {
    if (rating < 1) { setError("Please choose a star rating."); return; }
    setSubmitting(true); setError("");
    try {
      await userApi.post(`/api/v1/reviews`, { orderId: id, rating, comment: comment.trim() || undefined });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit review");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 text-[#4f8eff] animate-spin" /></div>;

  const sellerLabel = order?.seller_business_name ?? order?.seller_name ?? "";
  const locked = !!existing || done;

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/app/buyer/orders/${id}`} className="text-[#8b9ab4] hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-white">Rate the Seller</h1>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}

      {order && (
        <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-4">
          <p className="text-[#8b9ab4] text-xs font-mono">{order.order_number}</p>
          <p className="text-white font-semibold">{order.product}</p>
          {sellerLabel && <p className="text-[#8b9ab4] text-sm">{sellerLabel}</p>}
        </div>
      )}

      {done ? (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-emerald-400 font-semibold">Thanks for your review!</p>
            <p className="text-[#8b9ab4] text-sm">Your feedback helps other buyers choose trusted sellers.</p>
          </div>
        </div>
      ) : (
        <>
          <div>
            <p className="text-[#8b9ab4] text-xs font-semibold tracking-widest uppercase mb-2">Your Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" disabled={locked}
                  onMouseEnter={() => !locked && setHover(n)} onMouseLeave={() => setHover(0)}
                  onClick={() => !locked && setRating(n)}
                  className="p-1 disabled:cursor-default">
                  <Star className={`w-9 h-9 ${(hover || rating) >= n ? "fill-[#f5a623] text-[#f5a623]" : "text-[#3a4a66]"}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[#8b9ab4] text-xs font-semibold tracking-widest uppercase mb-2">Your Review</p>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} disabled={locked}
              placeholder="Share your experience with this seller…" rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[#07101e] border border-[#1a3060] text-white placeholder-[#4f8eff]/30 text-sm focus:outline-none focus:border-[#4361EE] resize-none disabled:opacity-60" />
          </div>

          {existing ? (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-[#8b9ab4] text-sm">You&apos;ve already reviewed this order.</span>
            </div>
          ) : (
            <button onClick={submit} disabled={submitting}
              className="w-full h-12 bg-[#b8890a] hover:bg-[#a07908] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Star className="w-4 h-4" /> Submit Review</>}
            </button>
          )}
        </>
      )}
    </div>
  );
}
