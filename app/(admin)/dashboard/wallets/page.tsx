"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Wallet, ArrowUpRight, ArrowDownRight,
  Loader2, AlertCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import { api } from "../../../_lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface WalletRow {
  wallet_id: string;
  user_id?: string;
  owner?: string;
  email?: string;
  role?: string;
  available_balance?: number;
  frozen_balance?: number;
  tx_count?: number;
  is_active?: boolean;
}

interface WalletTotals {
  total_balance: number;
  total_frozen: number;
  total_available: number;
}

interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totals?: WalletTotals;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fmtTZS = (v: number | undefined) =>
  v != null ? Number(v).toLocaleString("en-TZ") : "0";
const fmtDate = (_iso: string) => ""; // wallets don't have dates in the list

const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  frozen: "bg-red-50 text-red-700 border-red-200",
};
const ROLE_STYLE: Record<string, string> = {
  seller: "bg-purple-50 text-purple-700 border-purple-200",
  buyer:  "bg-blue-50 text-blue-700 border-blue-200",
  admin:  "bg-indigo-50 text-indigo-700 border-indigo-200",
  system: "bg-slate-100 text-slate-600 border-slate-200",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [totals, setTotals] = useState<WalletTotals>({ total_balance: 0, total_frozen: 0, total_available: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (pg = page, q = search, st = statusFilter) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(pg), limit: String(limit) });
        if (q) params.set("search", q);
        if (st) params.set("status", st);
        const res = await api.get<PagedResponse<WalletRow>>(`/api/v1/admin/wallets?${params}`);
        setWallets(res.data ?? []);
        setTotal(res.total ?? 0);
        setTotalPages(res.totalPages ?? 1);
        if (res.totals) setTotals(res.totals);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load wallets");
      } finally {
        setLoading(false);
      }
    },
    [page, search, statusFilter]
  );

  useEffect(() => { load(page, search, statusFilter); }, [page, statusFilter]); // eslint-disable-line

  const handleSearch = (v: string) => {
    setSearch(v);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setPage(1); load(1, v, statusFilter); }, 400);
  };

  const handleStatusChange = (v: string) => {
    setStatusFilter(v);
    setPage(1);
    load(1, search, v);
  };

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Wallets</h1>
        <p className="text-slate-500 text-sm mt-1">Escrow wallet balances across all participants</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={() => load()} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Balance", value: totals.total_balance, icon: Wallet,          bg: "bg-indigo-50", ic: "text-indigo-600", sub: "Platform-wide" },
          { label: "Held in Escrow", value: totals.total_frozen, icon: ArrowDownRight,  bg: "bg-amber-50",  ic: "text-amber-600",  sub: "In active escrow" },
          { label: "Available",      value: totals.total_available, icon: ArrowUpRight, bg: "bg-emerald-50",ic: "text-emerald-600",sub: "Withdrawable" },
        ].map(({ label, value, icon: Icon, bg, ic, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${ic}`} />
              </div>
              <span className="text-xs text-slate-400">{sub}</span>
            </div>
            <p className="text-xl font-bold text-slate-900">TZS {fmtTZS(value)}</p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by owner name or email…"
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="frozen">Frozen</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Owner", "Email", "Role", "Total Balance", "Held", "Available", "Tx Count", "Status"].map((h) => (
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
              ) : wallets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">
                    No wallets found
                  </td>
                </tr>
              ) : (
                wallets.map((w) => {
                  const statusKey = w.is_active ? "active" : "frozen";
                  const roleKey = w.role?.toLowerCase() ?? "";
                  const totalBalance = (w.available_balance ?? 0) + (w.frozen_balance ?? 0);
                  const held = w.frozen_balance ?? 0;
                  const available = w.available_balance ?? 0;
                  const ownerName = w.owner ?? "Unknown";
                  return (
                    <tr key={w.wallet_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#4361EE]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#4361EE] text-xs font-bold">
                              {ownerName[0].toUpperCase()}
                            </span>
                          </div>
                          <p className="font-medium text-slate-900 whitespace-nowrap">{ownerName}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                        {w.email ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${ROLE_STYLE[roleKey] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {w.role ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        TZS {fmtTZS(totalBalance)}
                      </td>
                      <td className="px-5 py-4 font-semibold whitespace-nowrap">
                        {held > 0
                          ? <span className="text-amber-600">TZS {fmtTZS(held)}</span>
                          : <span className="text-slate-300">—</span>
                        }
                      </td>
                      <td className="px-5 py-4 font-semibold text-emerald-700 whitespace-nowrap">
                        TZS {fmtTZS(available)}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {(w.tx_count ?? 0).toLocaleString("en-TZ")}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize whitespace-nowrap ${STATUS_STYLE[statusKey] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {statusKey}
                        </span>
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
            {total > 0 ? `Showing ${from}–${to} of ${total.toLocaleString("en-TZ")} wallets` : "No wallets"}
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
