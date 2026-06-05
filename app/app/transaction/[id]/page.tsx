"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { userApi } from "@/app/_lib/user-api";
import { fmt, fmtDate } from "@/app/app/_lib/fmt";

interface Tx {
  id: string; type: string; amount: string; fee?: string;
  direction: "credit" | "debit"; description: string | null;
  status: string; created_at: string; order_number: string | null; product: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  topup:          "Deposit",
  escrow_lock:    "Escrow payment",
  escrow_release: "Payment received",
  withdrawal:     "Withdrawal",
  refund:         "Refund",
  lui_fee:        "Platform fee",
  referral_reward:"Referral reward",
};

export default function TransactionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tx, setTx] = useState<Tx | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.get<Tx>(`/api/v1/wallet/transactions/${id}`).then(setTx).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 text-[#4f8eff] animate-spin" /></div>;
  if (!tx) return <p className="text-[#8b9ab4] text-center mt-12">Transaction not found</p>;

  const amount = parseFloat(tx.amount);
  const fee    = parseFloat(tx.fee ?? "0");
  const gross  = amount + fee;
  const credit = tx.direction === "credit";
  const isDeposit = tx.type === "topup";
  const isEscrowPay = tx.type === "escrow_lock";
  const netLabel = isDeposit ? "Added to your wallet" : isEscrowPay ? "Held for seller" : credit ? "Credited" : "Amount";

  const statusColor = tx.status === "completed" ? "text-emerald-400 bg-emerald-500/15"
    : tx.status === "failed" ? "text-red-400 bg-red-500/15" : "text-amber-400 bg-amber-500/15";

  return (
    <div className="max-w-md mx-auto space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-[#8b9ab4] hover:text-white text-sm">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col items-center gap-2 py-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${credit ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
          {credit ? <ArrowDownLeft className="w-6 h-6 text-emerald-400" /> : <ArrowUpRight className="w-6 h-6 text-red-400" />}
        </div>
        <p className={`text-3xl font-bold ${credit ? "text-emerald-400" : "text-white"}`}>
          {credit ? "+" : "−"}TZS {fmt(amount)}
        </p>
        <p className="text-[#8b9ab4]">{TYPE_LABEL[tx.type] ?? tx.type}</p>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${statusColor}`}>{tx.status}</span>
      </div>

      {(isDeposit || isEscrowPay) && (
        <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-4 space-y-3">
          {fee > 0 && (
            <>
              <Row label="Amount processed by LUI" value={`TZS ${fmt(gross)}`} />
              <Row label="LUI fee (2.5%)" value={`TZS ${fmt(fee)}`} />
              <div className="border-t border-[#1a3060]" />
            </>
          )}
          <Row label={netLabel} value={`TZS ${fmt(amount)}`} strong />
        </div>
      )}

      <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-4 space-y-3">
        {tx.description && <Row label="Description" value={tx.description} />}
        {tx.order_number && <Row label="Order" value={tx.order_number} />}
        {tx.product && <Row label="Product" value={tx.product} />}
        <Row label="Date" value={fmtDate(tx.created_at)} />
        <Row label="Reference" value={tx.id.slice(0, 8).toUpperCase()} />
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[#8b9ab4] text-sm">{label}</span>
      <span className={`text-sm text-right ${strong ? "text-[#4f8eff] font-bold" : "text-white font-medium"}`}>{value}</span>
    </div>
  );
}
