"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { api, saveTokens } from "@/app/_lib/api";
import { saveUserTokens } from "@/app/_lib/user-api";

type Step = "credentials" | "otp";

interface LoginResponse {
  requiresOtp: boolean;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: { id: string; name: string; role: string; email: string | null; phone: string | null };
}

interface OtpResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; role: string; email: string | null; phone: string | null };
}

function redirectForRole(role: string) {
  // replace() so the login page is dropped from history — back can't return to auth
  if (role === "admin")        window.location.replace("/dashboard/overview");
  else if (role === "seller")  window.location.replace("/app/seller");
  else                         window.location.replace("/app/buyer");
}

export default function LoginPage() {
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>("/api/v1/auth/login", {
        phoneOrEmail: email.trim().toLowerCase(),
        password,
      });

      if (res.requiresOtp === false && res.accessToken && res.refreshToken && res.user) {
        // Admin: tokens issued immediately, no OTP needed
        saveTokens(res.accessToken, res.refreshToken, res.user);
        redirectForRole(res.user.role);
      } else {
        // Use the canonical email the server stored the OTP against (not what the user typed)
        if (res.email) setEmail(res.email);
        setStep("otp");
        setLoading(false); // re-enable the verify button on the OTP step
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<OtpResponse>("/api/v1/auth/verify-login-otp", {
        email,
        code: otp,
      });
      if (res.user.role === "admin") {
        saveTokens(res.accessToken, res.refreshToken, res.user);
      } else {
        saveUserTokens(res.accessToken, res.refreshToken, res.user);
      }
      redirectForRole(res.user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          {step === "credentials" ? "Welcome back" : "Check your email"}
        </h1>
        <p className="text-slate-500 text-sm">
          {step === "credentials"
            ? "Sign in to your LUI account"
            : `We sent a 6-digit code to ${email}`}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {step === "credentials" ? (
        <form onSubmit={handleCredentials} className="space-y-4">
          <Field label="Email or phone" icon={<Mail className="w-4 h-4" />}>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]"
            />
          </Field>
          <Field label="Password" icon={<Lock className="w-4 h-4" />}>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </Field>
          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-xs text-[#4361EE] hover:underline">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">6-digit code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              required
              autoFocus
              className="w-full h-14 rounded-lg border border-slate-200 bg-white text-2xl font-bold text-center text-slate-900 tracking-widest placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]"
            />
          </div>
          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full h-11 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Sign In"}
          </button>
          <button
            type="button"
            onClick={() => { setStep("credentials"); setOtp(""); setError(""); }}
            className="w-full h-10 text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-[#4361EE] font-semibold hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
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
