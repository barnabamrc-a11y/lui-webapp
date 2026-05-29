"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, CheckCircle, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { api } from "../../../_lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Dispute {
  id: string;
  dispute_number?: string;
  order_id?: string;
  order_number?: string;
  buyer_name?: string;
  seller_name?: string;
  reason?: string;
  amount: number;
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
const fmtTZS = (v: number) => Number(v).toLocaleString("en-TZ");
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-TZ", { day: "2-digit", month: "short", year: "numeric" });

const STATUS_STYLE: Record<string, string> = {
  open:              "bg-red-50 text-red-700 border-red-200",
  under_review:      "bg-amber-50 text-amber-700 border-amber-200",
  resolved_seller:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  resolved_buyer:    "bg-teal-50 text-teal-700 border-teal-200",
};
const statusLabel = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const STATUS_TABS = [
  { label: "All",            value: "" },
  { label: "Open",           value: "open" },
  { label: "Under Review",   value: "under_review" },
  { label: "Resolved (Seller)", value: "resolved_seller" },
  { label: "Resolved (Buyer)",  value: "resolved_buyer" },
];

// ---------------------------------------------------------------------------
// ResolveModal
// ---------------------------------------------------------------------------
interface ResolveModalProps {
  dispute: Dispute;
  onClose: () => void;
  onResolved: () => void;
}

function ResolveModal({ dispute, onClose, onResolved }: ResolveModalProps) {
  const [resolution, setResolution] = useState<"resolved_seller" | "resolved_buyer">("resolved_buyer");
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/api/v1/admin/disputes/${dispute.id}/resolve`, {
        resolution,
        adminNote: adminNote.trim() || undefined,
      });
      onResolved();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to resolve dispute");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Resolve Dispute</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-slate-700">
              {dispute.dispute_number ?? dispute.id}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              {dispute.buyer_name ?? "Buyer"} vs {dispute.seller_name ?? "Seller"} — TZS {fmtTZS(dispute.amount)}
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">{error}</div>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Ruling</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "resolved_buyer" as const, label: "Buyer Wins", sub: "Refund buyer" },
                { value: "resolved_seller" as const, label: "Seller Wins", sub: "Release to seller" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setResolution(opt.value)}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    resolution === opt.value
                      ? "border-[#4361EE] bg-[#4361EE]/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className={`text-sm font-semibold ${resolution === opt.value ? "text-[#4361EE]" : "text-slate-700"}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Admin Note (optional)
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder="Reason for this resolution…"
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE] resize-none"
            />
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 h-9 rounded-lg bg-[#4361EE] hover:bg-[#3451D1] text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Confirm Resolution
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState<Dispute | null>(null);

  // Summary counts
  const [counts, setCounts] = useState({ open: 0, under_review: 0, resolved: 0 });

  const limit = 20;

  const load = useCallback(async (pg = page, q = search, st = statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(pg), limit: String(limit) });
      if (q) params.set("search", q);
      if (st) params.set("status", st);
      const res = await api.get<PagedResponse<Dispute>>(`/api/v1/admin/disputes?${params}`);
      setDisputes(res.data ?? []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  // Load summary counts (always unfiltered)
  const loadCounts = useCallback(async () => {
    try {
      const [open, review, resSeller, resBuyer] = await Promise.all([
        api.get<PagedResponse<Dispute>>("/api/v1/admin/disputes?status=open&limit=1"),
        api.get<PagedResponse<Dispute>>("/api/v1/admin/disputes?status=under_review&limit=1"),
        api.get<PagedResponse<Dispute>>("/api/v1/admin/disputes?status=resolved_seller&limit=1"),
        api.get<PagedResponse<Dispute>>("/api/v1/admin/disputes?status=resolved_buyer&limit=1"),
      ]);
      setCounts({
        open: open.total ?? 0,
        under_review: review.total ?? 0,
        resolved: (resSeller.total ?? 0) + (resBuyer.total ?? 0),
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => { load(page, search, statusFilter); }, [page, statusFilter]); // eslint-disable-line
  useEffect(() => { loadCounts(); }, [loadCounts]);

  const handleTab = (v: string) => {
    setStatusFilter(v);
    setPage(1);
    load(1, search, v);
  };

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      {resolving && (
        <ResolveModal
          dispute={resolving}
          onClose={() => setResolving(null)}
          onResolved={() => { load(page, search, statusFilter); loadCounts(); }}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Disputes</h1>
        <p className="text-slate-500 text-sm mt-1">
          {counts.open} open · {counts.under_review} under review
        </p>
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
          { label: "Open",         count: counts.open,         color: "bg-red-50 border-red-200 text-red-700" },
          { label: "Under Review", count: counts.under_review, color: "bg-amber-50 border-amber-200 text-amber-700" },
          { label: "Resolved",     count: counts.resolved,     color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl border p-4 text-center ${color}`}>
            <p className="text-2xl font-bold">{count.toLocaleString("en-TZ")}</p>
            <p className="text-sm font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => handleTab(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                statusFilter === t.value
                  ? "bg-[#4361EE] text-white border-[#4361EE]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); load(1, e.target.value, statusFilter); }}
            placeholder="Search disputes by ID, buyer, or seller…"
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
                {["Dispute ID", "Order #", "Buyer", "Seller", "Reason", "Amount (TZS)", "Status", "Date", ""].map((h) => (
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
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-400">
                    No disputes found
                  </td>
                </tr>
              ) : (
                disputes.map((d) => {
                  const statusKey = d.status?.toLowerCase() ?? "";
                  const style = STATUS_STYLE[statusKey] ?? "bg-slate-100 text-slate-500 border-slate-200";
                  const isResolved = statusKey.startsWith("resolved");
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-700">
                        {d.dispute_number ?? d.id}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-[#4361EE] font-semibold">
                        {d.order_number ?? d.order_id ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{d.buyer_name ?? "—"}</td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{d.seller_name ?? "—"}</td>
                      <td className="px-5 py-4 max-w-[180px]">
                        <p className="text-slate-600 truncate">{d.reason ?? "—"}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        {fmtTZS(d.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${style}`}>
                          {statusLabel(d.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                        {fmtDate(d.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        {!isResolved && (
                          <button
                            onClick={() => setResolving(d)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Resolve
                          </button>
                        )}
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
            {total > 0 ? `Showing ${from}–${to} of ${total.toLocaleString("en-TZ")} disputes` : "No disputes"}
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
