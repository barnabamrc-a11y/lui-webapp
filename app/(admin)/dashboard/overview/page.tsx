import type { Metadata } from "next";
import {
  Users, ShoppingBag, TrendingUp, Scale,
  ArrowUpRight, ArrowDownRight, Clock
} from "lucide-react";

export const metadata: Metadata = { title: "Overview" };

const STATS = [
  { label: "Total Users", value: "12,847", change: "+8.2%", up: true, icon: Users, color: "blue" },
  { label: "Active Orders", value: "1,234", change: "+12.5%", up: true, icon: ShoppingBag, color: "indigo" },
  { label: "Revenue (TZS)", value: "284.5M", change: "+4.1%", up: true, icon: TrendingUp, color: "emerald" },
  { label: "Open Disputes", value: "38", change: "-2.3%", up: false, icon: Scale, color: "amber" },
];

const ORDERS = [
  { id: "ORD-8821", buyer: "Amina Hassan", seller: "TechStore TZ", amount: "1,200,000", status: "In Transit", date: "29 May 2026" },
  { id: "ORD-8820", buyer: "John Mbwambo", seller: "Fashion Hub", amount: "450,000", status: "Completed", date: "29 May 2026" },
  { id: "ORD-8819", buyer: "Fatuma Ally", seller: "Electronics Plus", amount: "3,800,000", status: "Disputed", date: "28 May 2026" },
  { id: "ORD-8818", buyer: "Ibrahim Said", seller: "HomeGoods TZ", amount: "780,000", status: "Pending", date: "28 May 2026" },
  { id: "ORD-8817", buyer: "Grace Mwangi", seller: "SportZone", amount: "220,000", status: "Completed", date: "27 May 2026" },
];

const USERS = [
  { name: "Amina Hassan", email: "amina@example.com", role: "Seller", status: "Active", joined: "01 Jan 2026" },
  { name: "John Mbwambo", email: "john@example.com", role: "Buyer", status: "Active", joined: "15 Feb 2026" },
  { name: "Fatuma Ally", email: "fatuma@example.com", role: "Seller", status: "Suspended", joined: "03 Mar 2026" },
  { name: "Ibrahim Said", email: "ibrahim@example.com", role: "Buyer", status: "Active", joined: "20 Apr 2026" },
  { name: "Grace Mwangi", email: "grace@example.com", role: "Buyer", status: "Active", joined: "05 May 2026" },
];

const STATUS_STYLE: Record<string, string> = {
  "Completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Transit": "bg-blue-50 text-blue-700 border-blue-200",
  "Pending": "bg-amber-50 text-amber-700 border-amber-200",
  "Disputed": "bg-red-50 text-red-700 border-red-200",
  "Active": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Suspended": "bg-red-50 text-red-700 border-red-200",
};

const ICON_BG: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
};

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Platform summary for today</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(({ label, value, change, up, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ICON_BG[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}>
                {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-0.5">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Bar Chart (CSS) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-slate-900">Monthly Revenue</h2>
            <p className="text-xs text-slate-400 mt-0.5">TZS — last 7 months</p>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Updated now
          </span>
        </div>
        <div className="flex items-end gap-3 h-32">
          {[
            { m: "Nov", v: 60 }, { m: "Dec", v: 75 }, { m: "Jan", v: 55 },
            { m: "Feb", v: 85 }, { m: "Mar", v: 70 }, { m: "Apr", v: 90 }, { m: "May", v: 100 },
          ].map(({ m, v }) => (
            <div key={m} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full rounded-t-md bg-[#4361EE]/10 hover:bg-[#4361EE]/20 transition-colors relative"
                style={{ height: `${v}%` }}>
                <div className="absolute bottom-0 left-0 right-0 bg-[#4361EE] rounded-t-md"
                  style={{ height: "30%" }} />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{m}</span>
            </div>
          ))}
        </div>
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
            {ORDERS.map((o) => (
              <div key={o.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{o.id}</p>
                  <p className="text-xs text-slate-400 truncate">{o.buyer} → {o.seller}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-900">TZS {o.amount}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[o.status]}`}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Users</h2>
            <a href="/dashboard/users" className="text-xs text-[#4361EE] hover:underline font-medium">View all</a>
          </div>
          <div className="divide-y divide-slate-100">
            {USERS.map((u) => (
              <div key={u.email} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-slate-600 text-xs font-bold">{u.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[u.status]}`}>
                    {u.status}
                  </span>
                  <span className="text-[10px] text-slate-400">{u.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
