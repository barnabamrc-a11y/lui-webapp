"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield, UserPlus, Loader2, AlertCircle, CheckCircle2,
} from "lucide-react";
import { api } from "../../../_lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
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
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-TZ", { day: "2-digit", month: "short", year: "numeric" });

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadAdmins = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      // Fetch unfiltered (safe on every backend version) and pick out admins client-side —
      // the server-side role filter triggers a parameter bug on older deploys.
      const res = await api.get<PagedResponse<AdminUser>>("/api/v1/admin/users?limit=200");
      setAdmins((res.data ?? []).filter((u) => u.role === "admin"));
    } catch (e: unknown) {
      setListError(e instanceof Error ? e.message : "Failed to load admins");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    // Validation
    if (!name.trim()) { setFormError("Name is required."); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/v1/admin/users", { name: name.trim(), email: email.trim(), password });
      setFormSuccess(true);
      setName("");
      setEmail("");
      setPassword("");
      await loadAdmins();
      // Auto-clear success after 4s
      setTimeout(() => setFormSuccess(false), 4000);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admins</h1>
        <p className="text-slate-500 text-sm mt-1">Manage administrator accounts</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* ---------------------------------------------------------------- */}
        {/* Admin List                                                         */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#4361EE]" />
              <h2 className="font-semibold text-slate-900">Existing Admins</h2>
            </div>
            <span className="text-xs text-slate-400">{admins.length} total</span>
          </div>

          {listError && (
            <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {listError}
              <button onClick={loadAdmins} className="ml-auto text-xs underline">Retry</button>
            </div>
          )}

          {loadingList ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : admins.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">No admins found</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {admins.map((a) => {
                const isActive = a.is_active;
                return (
                  <div key={a.id} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#4361EE]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#4361EE] text-sm font-bold">
                        {(a.name ?? "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{a.name}</p>
                      <p className="text-xs text-slate-400 truncate">{a.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {isActive ? "active" : "suspended"}
                      </span>
                      <span className="text-[10px] text-slate-400">Joined {fmtDate(a.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Add Admin Form                                                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#4361EE]" />
            <h2 className="font-semibold text-slate-900">Add New Admin</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2 text-emerald-700 text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Admin account created successfully!
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Msangi"
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@luipayment.com"
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Password <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1">(min 8 characters)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]"
              />
              {password.length > 0 && password.length < 8 && (
                <p className="text-xs text-red-500 mt-1">
                  {8 - password.length} more character{8 - password.length !== 1 ? "s" : ""} needed
                </p>
              )}
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-10 rounded-lg bg-[#4361EE] hover:bg-[#3451D1] text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Admin Account
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center">
              The new admin will receive full dashboard access. Ensure credentials are shared securely.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
