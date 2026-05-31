"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowUpRight, ArrowDownLeft, Lock, Clock, Share2 } from "lucide-react";
import { userApi, getStoredUser } from "@/app/_lib/user-api";
import { connectSocket } from "@/app/_lib/socket";
import { fmt, fmtDate } from "@/app/app/_lib/fmt";

interface Wallet { available_balance: string; frozen_balance: string; pending_balance: string; }
interface Tx { id: string; type: string; amount: string; direction: "credit" | "debit"; description: string | null; created_at: string; }

const TYPE_LABELS: Record<string, string> = {
  escrow_lock:    "Escrow hold",
  escrow_release: "Escrow release",
  topup:          "Top-up",
  withdrawal:     "Withdrawal",
  refund:         "Refund",
  lui_fee:        "Platform fee",
  referral_reward:"Referral reward",
};

export default function SellerWallet() {
  const [wallet,  setWallet]  = useState<Wallet | null>(null);
  const [txs,     setTxs]     = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser<{ referral_code?: string }>();

  const load = useCallback(async () => {
    const [w, t] = await Promise.all([
      userApi.get<Wallet>("/api/v1/wallet"),
      userApi.get<{ data: Tx[] }>("/api/v1/wallet/transactions?limit=30"),
    ]);
    setWallet(w); setTxs(t.data);
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  useEffect(() => {
    const sock = connectSocket();
    if (!sock) return;
    const onChange = () => load();
    sock.on("wallet:updated", onChange);
    sock.on("notification:new", onChange);
    return () => { sock.off("wallet:updated", onChange); sock.off("notification:new", onChange); };
  }, [load]);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-6 h-6 text-[#4f8eff] animate-spin" />
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Wallet</h1>

      <div className="bg-gradient-to-br from-[#4361EE] to-[#3451D1] rounded-2xl p-6">
        <p className="text-blue-200 text-sm mb-1">Available Balance</p>
        <p className="text-3xl font-bold text-white mb-4">TZS {fmt(wallet?.available_balance ?? "0")}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Lock className="w-3 h-3 text-blue-200" />
              <span className="text-blue-200 text-xs">In Escrow</span>
            </div>
            <p className="text-white font-bold text-sm">TZS {fmt(wallet?.frozen_balance ?? "0")}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3 h-3 text-blue-200" />
              <span className="text-blue-200 text-xs">Pending</span>
            </div>
            <p className="text-white font-bold text-sm">TZS {fmt(wallet?.pending_balance ?? "0")}</p>
          </div>
        </div>
      </div>

      {user?.referral_code && (
        <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[#8b9ab4] text-xs mb-1">Your Referral Code</p>
            <p className="text-white font-bold text-lg tracking-widest">{user.referral_code}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(user.referral_code!)}
            className="p-3 bg-[#4361EE]/10 border border-[#4361EE]/30 rounded-xl text-[#4f8eff] hover:bg-[#4361EE]/20 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <div>
        <h2 className="text-white font-semibold mb-3">Transaction History</h2>
        {txs.length === 0 ? (
          <p className="text-[#8b9ab4] text-sm text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {txs.map((tx) => (
              <Link key={tx.id} href={`/app/transaction/${tx.id}`} className="bg-[#0d1f35] border border-[#1a3060] rounded-xl p-4 flex items-center gap-3 hover:border-[#4361EE]/40 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tx.direction === "credit" ? "bg-emerald-500/10" : "bg-red-500/10"
                }`}>
                  {tx.direction === "credit"
                    ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    : <ArrowUpRight  className="w-4 h-4 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{TYPE_LABELS[tx.type] ?? tx.type}</p>
                  {tx.description && <p className="text-[#8b9ab4] text-xs truncate">{tx.description}</p>}
                  <p className="text-[#8b9ab4] text-xs">{fmtDate(tx.created_at)}</p>
                </div>
                <p className={`text-sm font-bold flex-shrink-0 ${tx.direction === "credit" ? "text-emerald-400" : "text-red-400"}`}>
                  {tx.direction === "credit" ? "+" : "-"}TZS {fmt(tx.amount)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
