"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2, AlertCircle, ChevronLeft, ChevronRight, ArrowDownToLine, ArrowUpFromLine,
} from "lucide-react";
import { api } from "../../../_lib/api";

// ---------------------------------------------------------------------------
// Shared list for deposits (type=topup) and withdrawals (type=withdrawal).
// Both read the same admin transactions endpoint, filtered by type.
// ---------------------------------------------------------------------------
interface Movement {
  id: string;
  user_name?: string;
  amount: number;
  fee?: number;
  status?: string;          // pending | completed | failed
  direction?: string;
  external_ref?: string | null;
  description?: string | null;
  created_at: string;
}

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

const fmtTZS = (v: number | undefined) =>
  v != null ? Number(v).toLocaleString("en-TZ") : "0";
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-TZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  failed:    "bg-red-50 text-red-700 border-red-200",
};

export function MoneyMovements({ kind }: { kind: "deposit" | "withdrawal" }) {
  const isDeposit = kind === "deposit";
  const type = isDeposit ? "topup" : "withdrawal";
  const title = isDeposit ? "Deposits" : "Withdrawals";
  const subtitle = isDeposit
    ? "Money into LUI wallets via mobile money & bank"
    : "Disbursements out of LUI wallets to mobile money";
  const Icon = isDeposit ? ArrowDownToLine : ArrowUpFromLine;

  const [rows, setRows] = useState<Movement[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [totals, setTotals] = useState<Totals>({ total_in: 0, total_out: 0, total_fees: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  const load = useCallback(async (pg = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PagedResponse<Movement>>(
        `/api/v1/admin/transactions?type=${type}&page=${pg}&limit=${limit}`,
      );
      setRows(res.data ?? []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
      if (res.totals) setTotals(res.totals);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : `Failed to load ${title.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }, [type, title]);

  useEffect(() => { load(page); }, [page, load]);

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const settledTotal = isDeposit ? totals.total_in : totals.total_out;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={() => load(page)} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDeposit ? "bg-emerald-50" : "bg-blue-50"}`}>
            <Icon className={`w-5 h-5 ${isDeposit ? "text-emerald-600" : "text-blue-600"}`} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
              {isDeposit ? "Total Deposited" : "Total Withdrawn"}
            </p>
            <p className="text-xl font-bold text-slate-900">TZS {fmtTZS(settledTotal)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Records</p>
            <p className="text-xl font-bold text-slate-900">{total.toLocaleString("en-TZ")}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["User", "Amount (TZS)", "Fee (TZS)", "Status", "Reference", "Date"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                    No {title.toLowerCase()} found
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const statusKey = r.status?.toLowerCase() ?? "completed";
                  const style = STATUS_STYLE[statusKey] ?? "bg-slate-100 text-slate-500 border-slate-200";
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{r.user_name ?? "—"}</td>
                      <td className={`px-5 py-4 font-semibold whitespace-nowrap ${isDeposit ? "text-emerald-700" : "text-slate-900"}`}>
                        {isDeposit ? "+" : "−"}{fmtTZS(r.amount)}
                      </td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                        {r.fee != null && Number(r.fee) > 0 ? fmtTZS(r.fee) : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize whitespace-nowrap ${style}`}>
                          {statusKey}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">
                        {r.external_ref ?? r.id.slice(0, 8)}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">{fmtDate(r.created_at)}</td>
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
            {total > 0 ? `Showing ${from}–${to} of ${total.toLocaleString("en-TZ")}` : `No ${title.toLowerCase()}`}
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
