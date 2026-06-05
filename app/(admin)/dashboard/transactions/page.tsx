"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowUpRight, ArrowDownRight, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, CreditCard,
} from "lucide-react";
import { api } from "../../../_lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Transaction {
  id: string;
  order_id?: string;
  order_number?: string;
  user_name?: string;
  type: string;
  direction?: string; // "credit" | "debit"
  amount: number;
  status?: string; // pending | completed | failed
  description?: string;
  created_at: string;
}

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  failed:    "bg-red-50 text-red-700 border-red-200",
};

interface Totals {
  total_in: number;
  total_out: number;
  total_fees: number;
}

interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totals?: Totals;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fmtTZS = (v: number | undefined) =>
  v != null ? Number(v).toLocaleString("en-TZ") : "0";
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-TZ", { day: "2-digit", month: "short", year: "numeric" });

const TYPE_STYLE: Record<string, string> = {
  escrow_lock:     "bg-indigo-50 text-indigo-700 border-indigo-200",
  escrow_release:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  referral_reward: "bg-purple-50 text-purple-700 border-purple-200",
  withdrawal:      "bg-blue-50 text-blue-700 border-blue-200",
  topup:           "bg-teal-50 text-teal-700 border-teal-200",
  refund:          "bg-amber-50 text-amber-700 border-amber-200",
  lui_fee:         "bg-slate-100 text-slate-600 border-slate-200",
};
const typeLabel = (s?: string | null) =>
  (s ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const TYPE_OPTIONS = [
  { label: "All Types",       value: "" },
  { label: "Escrow Lock",     value: "escrow_lock" },
  { label: "Escrow Release",  value: "escrow_release" },
  { label: "Referral Reward", value: "referral_reward" },
  { label: "Withdrawal",      value: "withdrawal" },
  { label: "Top-up",          value: "topup" },
  { label: "Refund",          value: "refund" },
  { label: "Platform Fee",    value: "lui_fee" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function TransactionsPage() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [totals, setTotals] = useState<Totals>({ total_in: 0, total_out: 0, total_fees: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  const load = useCallback(
    async (pg = page, t = typeFilter, df = dateFrom, dt = dateTo) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(pg), limit: String(limit) });
        if (t) params.set("type", t);
        if (df) params.set("dateFrom", df);
        if (dt) params.set("dateTo", dt);
        const res = await api.get<PagedResponse<Transaction>>(`/api/v1/admin/transactions?${params}`);
        setTxns(res.data ?? []);
        setTotal(res.total ?? 0);
        setTotalPages(res.totalPages ?? 1);
        if (res.totals) setTotals(res.totals);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    },
    [page, typeFilter, dateFrom, dateTo]
  );

  useEffect(() => { load(page, typeFilter, dateFrom, dateTo); }, [page, typeFilter, dateFrom, dateTo]); // eslint-disable-line

  const applyFilters = () => { setPage(1); load(1, typeFilter, dateFrom, dateTo); };

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <p className="text-slate-500 text-sm mt-1">All escrow movements and platform settlements</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={() => load()} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Totals strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total In",
            value: totals.total_in,
            icon: ArrowDownRight,
            bg: "bg-blue-50",
            ic: "text-blue-600",
          },
          {
            label: "Total Out",
            value: totals.total_out,
            icon: ArrowUpRight,
            bg: "bg-emerald-50",
            ic: "text-emerald-600",
          },
          {
            label: "Platform Fees",
            value: totals.total_fees,
            icon: CreditCard,
            bg: "bg-indigo-50",
            ic: "text-indigo-600",
          },
        ].map(({ label, value, icon: Icon, bg, ic }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${ic}`} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
              <p className="text-xl font-bold text-slate-900">TZS {fmtTZS(value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500 font-medium">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30"
          >
            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500 font-medium">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500 font-medium">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30"
          />
        </div>
        <button
          onClick={applyFilters}
          className="h-9 px-4 rounded-lg bg-[#4361EE] hover:bg-[#3451D1] text-white text-sm font-semibold transition-colors"
        >
          Apply
        </button>
        {(typeFilter || dateFrom || dateTo) && (
          <button
            onClick={() => { setTypeFilter(""); setDateFrom(""); setDateTo(""); setPage(1); load(1, "", "", ""); }}
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["ID", "Order #", "User", "Type", "Dir", "Amount (TZS)", "Status", "Date"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
                  </td>
                </tr>
              ) : txns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">
                    No transactions found
                  </td>
                </tr>
              ) : (
                txns.map((t) => {
                  const typeKey = t.type?.toLowerCase() ?? "";
                  const typeStyle = TYPE_STYLE[typeKey] ?? "bg-slate-100 text-slate-600 border-slate-200";
                  const isCredit = t.direction?.toLowerCase() === "credit";
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isCredit ? "bg-blue-500" : "bg-emerald-500"}`} />
                          <span className="font-mono text-xs font-semibold text-slate-700">
                            {t.id.slice(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-[#4361EE] font-semibold">
                        {t.order_number ?? t.order_id ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{t.user_name ?? "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${typeStyle}`}>
                          {typeLabel(t.type)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isCredit ? (
                          <ArrowDownRight className="w-4 h-4 text-blue-500" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        {fmtTZS(t.amount)}
                      </td>
                      <td className="px-5 py-4">
                        {(() => {
                          const statusKey = t.status?.toLowerCase() ?? "completed";
                          const style = STATUS_STYLE[statusKey] ?? "bg-slate-100 text-slate-500 border-slate-200";
                          return (
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize whitespace-nowrap ${style}`}>
                              {statusKey}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                        {fmtDate(t.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-slate-500">
            {total > 0 ? `Showing ${from}–${to} of ${total.toLocaleString("en-TZ")} transactions` : "No transactions"}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="h-8 w-8 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 h-8 flex items-center text-sm font-medium text-slate-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="h-8 w-8 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
