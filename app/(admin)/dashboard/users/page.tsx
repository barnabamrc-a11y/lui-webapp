import type { Metadata } from "next";
import { Search, Filter, MoreHorizontal, UserCheck, UserX } from "lucide-react";

export const metadata: Metadata = { title: "Users" };

const USERS = [
  { id: "u1", name: "Amina Hassan", email: "amina@example.com", phone: "+255712345678", role: "Seller", status: "Active", orders: 48, joined: "01 Jan 2026" },
  { id: "u2", name: "John Mbwambo", email: "john@example.com", phone: "+255723456789", role: "Buyer", status: "Active", orders: 12, joined: "15 Feb 2026" },
  { id: "u3", name: "Fatuma Ally", email: "fatuma@example.com", phone: "+255734567890", role: "Seller", status: "Suspended", orders: 7, joined: "03 Mar 2026" },
  { id: "u4", name: "Ibrahim Said", email: "ibrahim@example.com", phone: "+255745678901", role: "Buyer", status: "Active", orders: 23, joined: "20 Apr 2026" },
  { id: "u5", name: "Grace Mwangi", email: "grace@example.com", phone: "+255756789012", role: "Buyer", status: "Active", orders: 5, joined: "05 May 2026" },
  { id: "u6", name: "Baraka Juma", email: "baraka@example.com", phone: "+255767890123", role: "Seller", status: "Active", orders: 31, joined: "10 Jan 2026" },
  { id: "u7", name: "Lila Kamau", email: "lila@example.com", phone: "+255778901234", role: "Buyer", status: "Active", orders: 9, joined: "22 Mar 2026" },
  { id: "u8", name: "Moses Osei", email: "moses@example.com", phone: "+255789012345", role: "Seller", status: "Suspended", orders: 2, joined: "14 Apr 2026" },
];

const STATUS_BADGE: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Suspended: "bg-red-50 text-red-700 border-red-200",
};
const ROLE_BADGE: Record<string, string> = {
  Seller: "bg-purple-50 text-purple-700 border-purple-200",
  Buyer: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm mt-1">{USERS.length.toLocaleString()} registered users</p>
        </div>
        <button className="flex items-center gap-2 bg-[#4361EE] hover:bg-[#3451D1] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <UserCheck className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search users by name, email or phone…"
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]" />
        </div>
        <select className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30">
          <option value="">All Roles</option>
          <option>Buyer</option>
          <option>Seller</option>
          <option>Admin</option>
        </select>
        <select className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30">
          <option value="">All Statuses</option>
          <option>Active</option>
          <option>Suspended</option>
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
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Orders</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {USERS.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#4361EE]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#4361EE] text-xs font-bold">{u.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{u.phone}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ROLE_BADGE[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_BADGE[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900">{u.orders}</td>
                  <td className="px-5 py-4 text-slate-500">{u.joined}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {u.status === "Active" ? (
                        <button title="Suspend" className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : (
                        <button title="Activate" className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
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

        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing 1–8 of 12,847 users</p>
          <div className="flex items-center gap-1">
            {["‹", "1", "2", "3", "…", "1285", "›"].map((p, i) => (
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
