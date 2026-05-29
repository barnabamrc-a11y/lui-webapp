"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { api } from "@/app/_lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"code" | "password">("code");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/v1/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        purpose: "reset",
      });
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError("");
    setLoading(true);
    try {
      await api.post("/api/v1/users/change-password", {
        email: email.trim().toLowerCase(),
        newPassword: password,
        resetCode: code,
      });
      router.push("/auth/login?reset=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          {step === "code" ? "Enter reset code" : "Set new password"}
        </h1>
        <p className="text-slate-500 text-sm">
          {step === "code"
            ? "Enter the 6-digit code from your email and your email address."
            : "Choose a strong password for your account."}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {step === "code" ? (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required autoFocus
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">6-digit code</label>
            <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000" required
              className="w-full h-14 rounded-lg border border-slate-200 bg-white text-2xl font-bold text-center text-slate-900 tracking-widest placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]" />
          </div>
          <button type="submit" disabled={loading || code.length < 6}
            className="w-full h-11 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-slate-400" />
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters" required autoFocus
                className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm new password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-slate-400" />
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password" required
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-11 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
          </button>
        </form>
      )}

      <Link href="/auth/login"
        className="mt-6 block text-center text-sm text-slate-500 hover:text-slate-700">
        ← Back to sign in
      </Link>
    </div>
  );
}
