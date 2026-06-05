"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, ShoppingBag, TrendingUp, Scale,
  ArrowUpRight, ArrowDownRight, Loader2, AlertCircle,
} from "lucide-react";
import { api } from "../../../_lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DashboardData {
  users: { total_buyers: number; total_sellers: number; new_this_week: number };
  orders: { total: number; completed: number; disputed: number; in_transit: number; active?: number };
  volume: { total_gmv: number; total_fees: number };
  disputes: { open_disputes: number };
  wallets: { total_frozen: number; total_available: number };
}

interface Order {
  id: string;
  order_number?: string;
  buyer_name?: string;
  seller_name?: string;
  total: number;
  status: string;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface PagedResponse<T> { data: T[]; total: number; page: number; limit: number; totalPages: number; }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fmtTZS = (v: number) => Number(v).toLocaleString("en-TZ");
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-TZ", { day: "2-digit", month: "short", year: "numeric" });

const STATUS_STYLE: Record<string, string> = {
  completed:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_transit: "bg-blue-50 text-blue-700 border-blue-200",
  pending:    "bg-amber-50 text-amber-700 border-amber-200",
  disputed:   "bg-red-50 text-red-700 border-red-200",
  active:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  suspended:  "bg-red-50 text-red-700 border-red-200",
};
const statusLabel = (s?: string | null) =>
  (s ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function OverviewPage() {
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, ordersRes, usersRes] = await Promise.all([
        api.get<DashboardData>("/api/v1/admin/dashboard"),
        api.get<PagedResponse<Order>>("/api/v1/admin/orders?limit=5"),
        api.get<PagedResponse<User>>("/api/v1/admin/users?limit=5"),
      ]);
      setDash(dashRes);
      setOrders(ordersRes.data ?? []);
      setUsers(usersRes.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-700">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{error}</p>
        <button onClick={load} className="ml-auto text-xs underline">Retry</button>
      </div>
    );
  }

  // Postgres COUNT()/SUM() arrive as strings — coerce before arithmetic so we add, not concatenate.
  const totalUsers = Number(dash?.users.total_buyers ?? 0) + Number(dash?.users.total_sellers ?? 0);
  // Active = orders still in the escrow lifecycle (not completed/cancelled/refunded, and disputes are shown separately).
  // Prefer the backend's `active` count; fall back to total − completed − disputed for older deploys.
  const activeOrders = dash?.orders.active != null
    ? Number(dash.orders.active)
    : Math.max(0, Number(dash?.orders.total ?? 0) - Number(dash?.orders.completed ?? 0) - Number(dash?.orders.disputed ?? 0));

  const STATS = [
    { label: "Total Users",     value: totalUsers.toLocaleString("en-TZ"),          icon: Users,       color: "blue",    sub: `+${dash?.users.new_this_week ?? 0} this week` },
    { label: "Active Orders",   value: activeOrders.toLocaleString("en-TZ"),         icon: ShoppingBag, color: "indigo",  sub: `${dash?.orders.in_transit ?? 0} in transit` },
    { label: "Revenue (TZS)",   value: fmtTZS(dash?.volume.total_gmv ?? 0),          icon: TrendingUp,  color: "emerald", sub: `Fees: ${fmtTZS(dash?.volume.total_fees ?? 0)}` },
    { label: "Open Disputes",   value: String(dash?.disputes.open_disputes ?? 0),    icon: Scale,       color: "amber",   sub: "Needs attention" },
  ];

  const ICON_BG: Record<string, string> = {
    blue:    "bg-blue-50 text-blue-600",
    indigo:  "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber:   "bg-amber-50 text-amber-600",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Platform summary</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ICON_BG[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-400">{sub}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-0.5">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Two tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Orders</h2>
            <a href="/dashboard/orders" className="text-xs text-[#4361EE] hover:underline font-medium">View all</a>
          </div>
          <div className="divide-y divide-slate-100">
            {orders.length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-400 text-center">No orders found</p>
            )}
            {orders.map((o) => {
              const statusKey = o.status?.toLowerCase() ?? "";
              const style = STATUS_STYLE[statusKey] ?? "bg-slate-100 text-slate-500 border-slate-200";
              return (
                <div key={o.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {o.order_number ?? o.id}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {o.buyer_name ?? "—"} → {o.seller_name ?? "—"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900">TZS {fmtTZS(o.total)}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style}`}>
                      {statusLabel(o.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Users</h2>
            <a href="/dashboard/users" className="text-xs text-[#4361EE] hover:underline font-medium">View all</a>
          </div>
          <div className="divide-y divide-slate-100">
            {users.length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-400 text-center">No users found</p>
            )}
            {users.map((u) => {
              const statusKey = u.is_active ? "active" : "suspended";
              const style = STATUS_STYLE[statusKey] ?? "bg-slate-100 text-slate-500 border-slate-200";
              return (
                <div key={u.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-600 text-xs font-bold">{(u.name ?? "?")[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style}`}>
                      {statusLabel(statusKey)}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">{u.role}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
