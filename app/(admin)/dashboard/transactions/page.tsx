import type { Metadata } from "next";
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const metadata: Metadata = { title: "Transactions" };

const TRANSACTIONS = [
  { id: "TXN-55821", orderId: "ORD-8821", type: "Escrow Hold", party: "Amina Hassan", amount: "1,200,000", fee: "24,000", net: "1,176,000", status: "Held", date: "29 May 2026", direction: "in" },
  { id: "TXN-55820", orderId: "ORD-8820", type: "Release", party: "Fashion Hub", amount: "441,000", fee: "9,000", net: "441,000", status: "Settled", date: "29 May 2026", direction: "out" },
  { id: "TXN-55819", orderId: "ORD-8819", type: "Escrow Hold", party: "Fatuma Ally", amount: "3,800,000", fee: "76,000", net: "3,724,000", status: "Frozen", date: "28 May 2026", direction: "in" },
  { id: "TXN-55818", orderId: "ORD-8818", type: "Escrow Hold", party: "Ibrahim Said", amount: "780,000", fee: "15,600", net: "764,400", status: "Held", date: "28 May 2026", direction: "in" },
  { id: "TXN-55817", orderId: "ORD-8817", type: "Release", party: "SportZone", amount: "215,600", fee: "4,400", net: "215,600", status: "Settled", date: "27 May 2026", direction: "out" },
  { id: "TXN-55816", orderId: "ORD-8816", type: "Escrow Hold", party: "Baraka Juma", amount: "2,100,000", fee: "42,000", net: "2,058,000", status: "Held", date: "27 May 2026", direction: "in" },
  { id: "TXN-55815", orderId: "ORD-8815", type: "Refund", party: "Lila Kamau", amount: "320,000", fee: "0", net: "320,000", status: "Refunded", date: "26 May 2026", direction: "out" },
  { id: "TXN-55814", orderId: "ORD-8814", type: "Release", party: "AutoParts KE", amount: "568,400", fee: "11,600", net: "568,400", status: "Settled", date: "26 May 2026", direction: "out" },
  { id: "TXN-55813", orderId: "ORD-8813", type: "Platform Fee", party: "System", amount: "11,600", fee: "—", net: "11,600", status: "Settled", date: "26 May 2026", direction: "in" },
  { id: "TXN-55812", orderId: "ORD-8812", type: "Escrow Hold", party: "Rehema Kimani", amount: "960,000", fee: "19,200", net: "940,800", status: "Held", date: "25 May 2026", direction: "in" },
];

const STATUS_STYLE: Record<string, string> = {
  "Held":     "bg-blue-50 text-blue-700 border-blue-200",
  "Frozen":   "bg-red-50 text-red-700 border-red-200",
  "Settled":  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Refunded": "bg-amber-50 text-amber-700 border-amber-200",
};

const TYPE_STYLE: Record<string, string> = {
  "Escrow Hold":  "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Release":      "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Refund":       "bg-amber-50 text-amber-700 border-amber-200",
  "Platform Fee": "bg-slate-100 text-slate-600 border-slate-200",
};

const totalIn  = 9_840_000;
const totalOut = 1_545_000;
const fees     =   172_800;

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500 text-sm mt-1">All escrow movements and platform settlements</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total In</p>
            <p className="text-xl font-bold text-slate-900">TZS {totalIn.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total Out</p>
            <p className="text-xl font-bold text-slate-900">TZS {totalOut.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Platform Fees</p>
            <p className="text-xl font-bold text-slate-900">TZS {fees.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by TXN ID, order, or party…"
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]" />
        </div>
        <select className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none">
          <option>All Types</option>
          <option>Escrow Hold</option>
          <option>Release</option>
          <option>Refund</option>
          <option>Platform Fee</option>
        </select>
        <select className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none">
          <option>All Statuses</option>
          <option>Held</option>
          <option>Frozen</option>
          <option>Settled</option>
          <option>Refunded</option>
        </select>
        <select className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>This month</option>
          <option>Custom range</option>
        </select>
        <button className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
          <Filter className="w-4 h-4" /> More filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["TXN ID", "Order", "Type", "Party", "Amount (TZS)", "Fee (TZS)", "Net (TZS)", "Status", "Date"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TRANSACTIONS.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.direction === "in" ? "bg-blue-500" : "bg-emerald-500"}`} />
                      <span className="font-mono text-xs font-semibold text-slate-700">{t.id}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[#4361EE] font-semibold">{t.orderId}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${TYPE_STYLE[t.type]}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{t.party}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">{t.amount}</td>
                  <td className="px-5 py-4 text-slate-500">{t.fee}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">{t.net}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${STATUS_STYLE[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing 1–10 of 28,419 transactions</p>
          <div className="flex items-center gap-1">
            {["‹", "1", "2", "3", "…", "2842", "›"].map((p, i) => (
              <button key={i}
                className={`min-w-[32px] h-8 px-2 rounded text-sm font-medium transition-colors
                  ${p === "1" ? "bg-[#4361EE] text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
