import type { Metadata } from "next";
import { Search, Wallet, ArrowUpRight, ArrowDownRight, Eye, MoreHorizontal } from "lucide-react";

export const metadata: Metadata = { title: "Wallets" };

const WALLETS = [
  { id: "WAL-001", owner: "TechStore TZ", email: "tech@techstore.co.tz", role: "Seller", balance: "4,820,000", held: "3,800,000", available: "1,020,000", status: "Active", transactions: 142 },
  { id: "WAL-002", owner: "Fashion Hub", email: "info@fashionhub.co.tz", role: "Seller", balance: "1,230,500", held: "0", available: "1,230,500", status: "Active", transactions: 87 },
  { id: "WAL-003", owner: "Electronics Plus", email: "sales@electronicsplus.co.tz", role: "Seller", balance: "680,000", held: "580,000", available: "100,000", status: "Active", transactions: 53 },
  { id: "WAL-004", owner: "HomeGoods TZ", email: "contact@homegoods.co.tz", role: "Seller", balance: "2,100,000", held: "780,000", available: "1,320,000", status: "Active", transactions: 211 },
  { id: "WAL-005", owner: "AutoParts KE", email: "admin@autoparts.co.ke", role: "Seller", balance: "940,000", held: "0", available: "940,000", status: "Frozen", transactions: 29 },
  { id: "WAL-006", owner: "SportZone", email: "sport@sportzone.co.tz", role: "Seller", balance: "320,000", held: "0", available: "320,000", status: "Active", transactions: 18 },
  { id: "WAL-007", owner: "Platform Reserve", email: "system@luipayment.com", role: "System", balance: "284,500,000", held: "12,340,000", available: "272,160,000", status: "Active", transactions: 28419 },
];

const STATUS_STYLE: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Frozen: "bg-red-50 text-red-700 border-red-200",
};
const ROLE_STYLE: Record<string, string> = {
  Seller: "bg-purple-50 text-purple-700 border-purple-200",
  System: "bg-slate-100 text-slate-600 border-slate-200",
};

const totalBalance   = "294,090,500";
const totalHeld      = "17,500,000";
const totalAvailable = "276,590,500";

export default function WalletsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Wallets</h1>
        <p className="text-slate-500 text-sm mt-1">Escrow wallet balances across all participants</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Balance", value: totalBalance, icon: Wallet, bg: "bg-indigo-50", ic: "text-indigo-600", sub: "Platform-wide" },
          { label: "Funds Held", value: totalHeld, icon: ArrowDownRight, bg: "bg-amber-50", ic: "text-amber-600", sub: "In active escrow" },
          { label: "Available", value: totalAvailable, icon: ArrowUpRight, bg: "bg-emerald-50", ic: "text-emerald-600", sub: "Withdrawable" },
        ].map(({ label, value, icon: Icon, bg, ic, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${ic}`} />
              </div>
              <span className="text-xs text-slate-400">{sub}</span>
            </div>
            <p className="text-xl font-bold text-slate-900">TZS {value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search wallets by owner or email…"
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]" />
        </div>
        <select className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none">
          <option>All Statuses</option>
          <option>Active</option>
          <option>Frozen</option>
        </select>
        <select className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none">
          <option>All Roles</option>
          <option>Seller</option>
          <option>System</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Wallet", "Owner", "Role", "Total Balance", "Held", "Available", "Transactions", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {WALLETS.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-700">{w.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#4361EE]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#4361EE] text-xs font-bold">{w.owner[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 whitespace-nowrap">{w.owner}</p>
                        <p className="text-xs text-slate-400">{w.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ROLE_STYLE[w.role]}`}>
                      {w.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">{w.balance}</td>
                  <td className="px-5 py-4 text-amber-600 font-semibold whitespace-nowrap">
                    {w.held === "0" ? <span className="text-slate-300">—</span> : w.held}
                  </td>
                  <td className="px-5 py-4 text-emerald-700 font-semibold whitespace-nowrap">{w.available}</td>
                  <td className="px-5 py-4 text-slate-600">{w.transactions.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${STATUS_STYLE[w.status]}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-[#4361EE] hover:bg-blue-50 transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
