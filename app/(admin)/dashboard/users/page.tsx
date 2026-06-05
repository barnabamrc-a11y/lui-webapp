"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, UserCheck, UserX, Loader2, AlertCircle,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { api } from "../../../_lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
  available_balance?: number;
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

const STATUS_BADGE: Record<string, string> = {
  active:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  suspended: "bg-red-50 text-red-700 border-red-200",
};
const ROLE_BADGE: Record<string, string> = {
  seller: "bg-purple-50 text-purple-700 border-purple-200",
  buyer:  "bg-blue-50 text-blue-700 border-blue-200",
  admin:  "bg-indigo-50 text-indigo-700 border-indigo-200",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suspending, setSuspending] = useState<string | null>(null);

  const limit = 20;
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (pg = page, q = search, r = role) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(pg), limit: String(limit) });
      if (q) params.set("search", q);
      if (r) params.set("role", r);
      const res = await api.get<PagedResponse<User>>(`/api/v1/admin/users?${params}`);
      setUsers(res.data ?? []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => { load(page, search, role); }, [page, role]); // eslint-disable-line

  // Debounce search
  const handleSearch = (v: string) => {
    setSearch(v);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setPage(1); load(1, v, role); }, 400);
  };

  const handleRoleChange = (v: string) => {
    setRole(v);
    setPage(1);
    load(1, search, v);
  };

  const handleSuspendToggle = async (u: User) => {
    setSuspending(u.id);
    const endpoint = u.is_active
      ? `/api/v1/admin/users/${u.id}/suspend`
      : `/api/v1/admin/users/${u.id}/reinstate`;
    try {
      await api.patch(endpoint);
      // Optimistic update
      setUsers((prev) =>
        prev.map((x) =>
          x.id === u.id ? { ...x, is_active: !x.is_active } : x
        )
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setSuspending(null);
    }
  };

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm mt-1">{total.toLocaleString("en-TZ")} registered users</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={() => load()} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]"
          />
        </div>
        <select
          value={role}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30"
        >
          <option value="">All Roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["User", "Phone", "Role", "Status", "Wallet Balance", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const statusKey = u.is_active ? "active" : "suspended";
                  const roleKey = u.role?.toLowerCase() ?? "";
                  const isActive = u.is_active;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#4361EE]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#4361EE] text-xs font-bold">
                              {(u.name ?? "?")[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{u.phone ?? "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${ROLE_BADGE[roleKey] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_BADGE[statusKey] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {statusKey}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-900 whitespace-nowrap">
                        TZS {fmtTZS(u.available_balance)}
                      </td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-xs">
                        {fmtDate(u.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleSuspendToggle(u)}
                          disabled={suspending === u.id}
                          title={isActive ? "Suspend" : "Reinstate"}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
                            isActive
                              ? "text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                              : "text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                          }`}
                        >
                          {suspending === u.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isActive ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          {isActive ? "Suspend" : "Reinstate"}
                        </button>
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
            {total > 0 ? `Showing ${from}–${to} of ${total.toLocaleString("en-TZ")} users` : "No users"}
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
