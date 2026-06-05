"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Eye, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Copy,
} from "lucide-react";
import { api } from "../../../_lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Order {
  id: string;
  order_number?: string;
  product?: string;
  buyer_name?: string;
  seller_name?: string;
  total: number;
  lui_fee?: number;
  status: string;
  created_at: string;
}

interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fmtTZS = (v: number | undefined) =>
  v != null ? Number(v).toLocaleString("en-TZ") : "—";
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-TZ", { day: "2-digit", month: "short", year: "numeric" });

const STATUS_STYLE: Record<string, string> = {
  completed:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_transit:   "bg-blue-50 text-blue-700 border-blue-200",
  pending:      "bg-amber-50 text-amber-700 border-amber-200",
  disputed:     "bg-red-50 text-red-700 border-red-200",
  cancelled:    "bg-slate-100 text-slate-500 border-slate-200",
  delivered:    "bg-teal-50 text-teal-700 border-teal-200",
  ready_to_ship:"bg-indigo-50 text-indigo-700 border-indigo-200",
};
const statusLabel = (s?: string | null) =>
  (s ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const STATUS_TABS = [
  { label: "All",        value: "" },
  { label: "Pending",    value: "pending" },
  { label: "In Transit", value: "in_transit" },
  { label: "Disputed",   value: "disputed" },
  { label: "Completed",  value: "completed" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const limit = 20;
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (pg = page, q = search, st = status) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(pg), limit: String(limit) });
      if (q) params.set("search", q);
      if (st) params.set("status", st);
      const res = await api.get<PagedResponse<Order>>(`/api/v1/admin/orders?${params}`);
      setOrders(res.data ?? []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { load(page, search, status); }, [page, status]); // eslint-disable-line

  const handleSearch = (v: string) => {
    setSearch(v);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setPage(1); load(1, v, status); }, 400);
  };

  const handleTab = (v: string) => {
    setStatus(v);
    setPage(1);
    load(1, search, v);
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-500 text-sm mt-1">All escrow orders on the platform</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={() => load()} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => handleTab(t.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              status === t.value
                ? "bg-[#4361EE] text-white border-[#4361EE]"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by order ID, buyer, seller, or product…"
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Order #", "Product", "Buyer", "Seller", "Amount (TZS)", "Fee (TZS)", "Status", "Date", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const statusKey = o.status?.toLowerCase() ?? "";
                  const style = STATUS_STYLE[statusKey] ?? "bg-slate-100 text-slate-500 border-slate-200";
                  const displayId = o.order_number ?? o.id;
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-slate-700">{displayId}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900 max-w-[160px] truncate">
                          {o.product ?? "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{o.buyer_name ?? "—"}</td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{o.seller_name ?? "—"}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        {fmtTZS(o.total)}
                      </td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{fmtTZS(o.lui_fee)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${style}`}>
                          {statusLabel(o.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-xs">{fmtDate(o.created_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(o.id)}
                            title="Copy Order ID"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#4361EE] hover:bg-blue-50 transition-colors"
                          >
                            {copied === o.id ? (
                              <Eye className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
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
            {total > 0 ? `Showing ${from}–${to} of ${total.toLocaleString("en-TZ")} orders` : "No orders"}
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
