import type { Metadata } from "next";
import { Search, Eye, MessageSquare, CheckCircle } from "lucide-react";

export const metadata: Metadata = { title: "Disputes" };

const DISPUTES = [
  { id: "DSP-221", order: "ORD-8819", reporter: "Fatuma Ally", against: "Electronics Plus", reason: "Item not as described", amount: "3,800,000", status: "Open", priority: "High", date: "28 May 2026" },
  { id: "DSP-220", order: "ORD-8791", reporter: "John Mbwambo", against: "AutoParts KE", reason: "Item not delivered", amount: "580,000", status: "Under Review", priority: "Medium", date: "25 May 2026" },
  { id: "DSP-219", order: "ORD-8755", reporter: "Grace Mwangi", against: "TechStore TZ", reason: "Wrong item sent", amount: "1,100,000", status: "Open", priority: "High", date: "22 May 2026" },
  { id: "DSP-218", order: "ORD-8740", reporter: "Ibrahim Said", against: "HomeGoods TZ", reason: "Damaged goods on delivery", amount: "780,000", status: "Resolved", priority: "Low", date: "20 May 2026" },
  { id: "DSP-217", order: "ORD-8721", reporter: "Baraka Juma", against: "Fashion Hub", reason: "Seller unresponsive", amount: "320,000", status: "Resolved", priority: "Low", date: "18 May 2026" },
];

const STATUS_STYLE: Record<string, string> = {
  "Open": "bg-red-50 text-red-700 border-red-200",
  "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
  "Resolved": "bg-emerald-50 text-emerald-700 border-emerald-200",
};
const PRIORITY_STYLE: Record<string, string> = {
  "High": "text-red-600",
  "Medium": "text-amber-600",
  "Low": "text-slate-400",
};

export default function DisputesPage() {
  const open = DISPUTES.filter(d => d.status === "Open").length;
  const reviewing = DISPUTES.filter(d => d.status === "Under Review").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Disputes</h1>
        <p className="text-slate-500 text-sm mt-1">{open} open · {reviewing} under review</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Open", count: open, color: "bg-red-50 border-red-200 text-red-700" },
          { label: "Under Review", count: reviewing, color: "bg-amber-50 border-amber-200 text-amber-700" },
          { label: "Resolved", count: DISPUTES.filter(d => d.status === "Resolved").length, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl border p-4 text-center ${color}`}>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-sm font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search disputes…"
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]" />
        </div>
        <select className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none">
          <option>All Statuses</option>
          <option>Open</option>
          <option>Under Review</option>
          <option>Resolved</option>
        </select>
        <select className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none">
          <option>All Priorities</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Dispute ID", "Order", "Reporter", "Against", "Reason", "Amount (TZS)", "Priority", "Status", "Date", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DISPUTES.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-700">{d.id}</td>
                  <td className="px-5 py-4 font-mono text-xs text-[#4361EE] font-semibold">{d.order}</td>
                  <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{d.reporter}</td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{d.against}</td>
                  <td className="px-5 py-4 max-w-[180px]">
                    <p className="text-slate-600 truncate">{d.reason}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">{d.amount}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold ${PRIORITY_STYLE[d.priority]}`}>● {d.priority}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${STATUS_STYLE[d.status]}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">{d.date}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-[#4361EE] hover:bg-blue-50 transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="Message">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      {d.status !== "Resolved" && (
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Resolve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
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
