import type { Metadata } from "next";
import { Search, Filter, Eye, MoreHorizontal } from "lucide-react";

export const metadata: Metadata = { title: "Orders" };

const ORDERS = [
  { id: "ORD-8821", buyer: "Amina Hassan", seller: "TechStore TZ", product: "Samsung Galaxy S24", amount: "1,200,000", fee: "24,000", status: "In Transit", date: "29 May 2026" },
  { id: "ORD-8820", buyer: "John Mbwambo", seller: "Fashion Hub", product: "Nike Air Max x2", amount: "450,000", fee: "9,000", status: "Completed", date: "29 May 2026" },
  { id: "ORD-8819", buyer: "Fatuma Ally", seller: "Electronics Plus", product: "MacBook Pro M3", amount: "3,800,000", fee: "76,000", status: "Disputed", date: "28 May 2026" },
  { id: "ORD-8818", buyer: "Ibrahim Said", seller: "HomeGoods TZ", product: "Leather Sofa Set", amount: "780,000", fee: "15,600", status: "Pending", date: "28 May 2026" },
  { id: "ORD-8817", buyer: "Grace Mwangi", seller: "SportZone", product: "Football Boots", amount: "220,000", fee: "4,400", status: "Completed", date: "27 May 2026" },
  { id: "ORD-8816", buyer: "Baraka Juma", seller: "TechStore TZ", product: "iPad Pro 12.9", amount: "2,100,000", fee: "42,000", status: "Ready to Ship", date: "27 May 2026" },
  { id: "ORD-8815", buyer: "Lila Kamau", seller: "Fashion Hub", product: "Dress Collection x5", amount: "320,000", fee: "6,400", status: "Cancelled", date: "26 May 2026" },
  { id: "ORD-8814", buyer: "Moses Osei", seller: "AutoParts KE", product: "Car Brake Kit", amount: "580,000", fee: "11,600", status: "Delivered", date: "26 May 2026" },
];

const STATUS_STYLE: Record<string, string> = {
  "Completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Transit": "bg-blue-50 text-blue-700 border-blue-200",
  "Pending": "bg-amber-50 text-amber-700 border-amber-200",
  "Disputed": "bg-red-50 text-red-700 border-red-200",
  "Ready to Ship": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Cancelled": "bg-slate-100 text-slate-500 border-slate-200",
  "Delivered": "bg-teal-50 text-teal-700 border-teal-200",
};

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">All escrow orders on the platform</p>
        </div>
        <div className="flex gap-2">
          {["All", "Pending", "In Transit", "Disputed", "Completed"].map((s) => (
            <button key={s}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors
                ${s === "All"
                  ? "bg-[#4361EE] text-white border-[#4361EE]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by order ID, buyer, seller, or product…"
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]" />
        </div>
        <select className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none">
          <option>All Dates</option>
          <option>Today</option>
          <option>Last 7 days</option>
          <option>This month</option>
        </select>
        <button className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Order ID", "Product", "Buyer", "Seller", "Amount (TZS)", "Fee (TZS)", "Status", "Date", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ORDERS.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-semibold text-slate-700">{o.id}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900 max-w-[160px] truncate">{o.product}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{o.buyer}</td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{o.seller}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">{o.amount}</td>
                  <td className="px-5 py-4 text-slate-500">{o.fee}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${STATUS_STYLE[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-xs">{o.date}</td>
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
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing 1–8 of 1,234 orders</p>
          <div className="flex items-center gap-1">
            {["‹", "1", "2", "3", "…", "155", "›"].map((p, i) => (
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
