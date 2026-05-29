"use client";

import Link from "next/link";
import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { api } from "@/app/_lib/api";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError("");
    setLoading(true);
    try {
      await api.post("/api/v1/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: "buyer",
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Account Created!</h2>
        <p className="text-slate-500 text-sm mb-6">
          A verification code has been sent to <strong>{form.email}</strong>. Check your inbox to activate your account.
        </p>
        <Link href="/auth/login"
          className="inline-flex items-center justify-center w-full h-11 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold rounded-lg transition-colors">
          Continue to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
        <p className="text-slate-500 text-sm">Join LUI and transact with confidence</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full Name" icon={<User className="w-4 h-4" />}>
          <input type="text" value={form.name} onChange={update("name")} placeholder="Amina Hassan"
            required autoFocus
            className="input-field" />
        </FormField>
        <FormField label="Email Address" icon={<Mail className="w-4 h-4" />}>
          <input type="email" value={form.email} onChange={update("email")} placeholder="you@example.com"
            required className="input-field" />
        </FormField>
        <FormField label="Password" icon={<Lock className="w-4 h-4" />}>
          <input type={showPass ? "text" : "password"} value={form.password} onChange={update("password")}
            placeholder="At least 8 characters" required className="input-field pr-10" />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </FormField>
        <FormField label="Confirm Password" icon={<Lock className="w-4 h-4" />}>
          <input type="password" value={form.confirm} onChange={update("confirm")}
            placeholder="Repeat password" required className="input-field" />
        </FormField>

        <p className="text-xs text-slate-400">
          By creating an account you agree to our{" "}
          <a href="#" className="text-[#4361EE] hover:underline">Terms of Service</a> and{" "}
          <a href="#" className="text-[#4361EE] hover:underline">Privacy Policy</a>.
        </p>

        <button type="submit" disabled={loading}
          className="w-full h-11 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-[#4361EE] font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

function FormField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative flex items-center">
        <span className="absolute left-3 text-slate-400">{icon}</span>
        {children}
      </div>
    </div>
  );
}
