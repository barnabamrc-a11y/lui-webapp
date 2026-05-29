"use client";

import Link from "next/link";
import { useState } from "react";
import { User, Mail, Lock, Phone, Eye, EyeOff, Loader2, Store, ShoppingBag } from "lucide-react";
import { api } from "@/app/_lib/api";
import { saveUserTokens } from "@/app/_lib/user-api";

type Step = "form" | "otp";
type Role = "buyer" | "seller";

interface VerifyResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; role: string; email: string | null; phone: string | null };
}

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("buyer");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "", businessName: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [otp, setOtp] = useState("");

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
        email: form.email.trim().toLowerCase() || undefined,
        phone: form.phone.trim() || undefined,
        password: form.password,
        role,
        ...(role === "seller" && form.businessName.trim()
          ? { businessName: form.businessName.trim() }
          : {}),
      });
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<VerifyResponse>("/api/v1/auth/verify-otp", {
        email: form.email.trim().toLowerCase(),
        code: otp,
        purpose: "verify_phone",
      });
      saveUserTokens(res.accessToken, res.refreshToken, res.user);
      window.location.href = role === "seller" ? "/app/seller" : "/app/buyer";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Verify your email</h1>
          <p className="text-slate-500 text-sm">
            We sent a 6-digit code to <strong>{form.email}</strong>
          </p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}
        <form onSubmit={handleOtp} className="space-y-4">
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
          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full h-11 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold rounded-lg flex items-center justify-center transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activate Account"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">
          Didn&apos;t receive it?{" "}
          <button
            onClick={async () => {
              try { await api.post("/api/v1/auth/send-otp", { email: form.email, purpose: "verify_phone" }); }
              catch {}
            }}
            className="text-[#4361EE] hover:underline"
          >
            Resend code
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
        <p className="text-slate-500 text-sm">Join LUI and transact with confidence</p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {(["buyer", "seller"] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              role === r
                ? "border-[#4361EE] bg-[#4361EE]/5"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {r === "buyer"
              ? <ShoppingBag className={`w-6 h-6 ${role === r ? "text-[#4361EE]" : "text-slate-400"}`} />
              : <Store       className={`w-6 h-6 ${role === r ? "text-[#4361EE]" : "text-slate-400"}`} />
            }
            <span className={`text-sm font-semibold ${role === r ? "text-[#4361EE]" : "text-slate-600"}`}>
              {r === "buyer" ? "I'm a Buyer" : "I'm a Seller"}
            </span>
            <span className="text-xs text-slate-400 text-center">
              {r === "buyer" ? "Pay securely via escrow" : "Sell & get paid safely"}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full Name" icon={<User className="w-4 h-4" />}>
          <input type="text" value={form.name} onChange={update("name")} placeholder="Amina Hassan"
            required autoFocus className="input-field" />
        </FormField>

        {role === "seller" && (
          <FormField label="Business Name" icon={<Store className="w-4 h-4" />}>
            <input type="text" value={form.businessName} onChange={update("businessName")}
              placeholder="Your Shop Name" className="input-field" />
          </FormField>
        )}

        <FormField label="Email Address" icon={<Mail className="w-4 h-4" />}>
          <input type="email" value={form.email} onChange={update("email")} placeholder="you@example.com"
            required className="input-field" />
        </FormField>

        <FormField label="Phone (optional)" icon={<Phone className="w-4 h-4" />}>
          <input type="tel" value={form.phone} onChange={update("phone")} placeholder="+255 712 345 678"
            className="input-field" />
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
