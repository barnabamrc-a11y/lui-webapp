"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { api } from "@/app/_lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/v1/auth/send-otp", { email: email.trim().toLowerCase(), purpose: "reset" });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-7 h-7 text-[#4361EE]" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Check your inbox</h2>
        <p className="text-slate-500 text-sm mb-6">
          We sent a password reset link to <strong>{email}</strong>. It expires in 10 minutes.
        </p>
        <Link href="/auth/reset-password"
          className="inline-flex items-center justify-center w-full h-11 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold rounded-lg transition-colors mb-3">
          Enter Reset Code
        </Link>
        <Link href="/auth/login" className="block text-sm text-slate-500 hover:text-slate-700">
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Forgot password?</h1>
        <p className="text-slate-500 text-sm">
          Enter your email and we&apos;ll send you a reset code.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required autoFocus
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full h-11 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Code"}
        </button>
      </form>

      <Link href="/auth/login"
        className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4" /> Back to sign in
      </Link>
    </div>
  );
}
