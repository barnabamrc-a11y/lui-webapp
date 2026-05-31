"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, LogOut, ChevronRight, ArrowLeftRight, Loader2, Store, Pencil, Check, X, Globe } from "lucide-react";
import { getStoredUser, clearUserTokens, userApi, updateStoredUser } from "@/app/_lib/user-api";
import { LangSwitch } from "@/app/_components/lang-switch";

function formatTzPhone(raw: string): string {
  const p = raw.replace(/[^\d]/g, "");
  if (p.startsWith("255")) return p;
  if (p.startsWith("0")) return "255" + p.slice(1);
  if (p.length === 9) return "255" + p;
  return p;
}

export default function BuyerProfile() {
  const router = useRouter();
  const user   = getStoredUser<{ id: string; name: string; email: string | null; phone: string | null; referral_code?: string }>();
  const [loggingOut, setLoggingOut] = useState(false);
  const [switching, setSwitching]   = useState(false);

  const [phone, setPhone]       = useState(user?.phone ?? "");
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput]     = useState(user?.phone ?? "");
  const [savingPhone, setSavingPhone]   = useState(false);
  const [phoneError, setPhoneError]     = useState("");

  const savePhone = async () => {
    const formatted = formatTzPhone(phoneInput);
    if (!/^255[67]\d{8}$/.test(formatted)) { setPhoneError("Enter a valid Tanzanian phone number"); return; }
    setSavingPhone(true); setPhoneError("");
    try {
      const res = await userApi.patch<{ phone: string }>("/api/v1/users/me", { phone: formatted });
      setPhone(res.phone);
      updateStoredUser({ phone: res.phone });
      setEditingPhone(false);
    } catch (e) {
      setPhoneError(e instanceof Error ? e.message : "Could not update phone");
    } finally {
      setSavingPhone(false);
    }
  };

  const logout = async () => {
    setLoggingOut(true);
    clearUserTokens();
    window.location.href = "/auth/login";
  };

  const switchToSeller = async () => {
    if (!confirm("Switch to a Seller account? You'll be signed out and need to sign in again.")) return;
    setSwitching(true);
    try {
      await userApi.post("/api/v1/users/me/switch-role", { role: "seller" });
      clearUserTokens();
      window.location.href = "/auth/login";
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not switch role");
      setSwitching(false);
    }
  };

  const initials = user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "?";

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-20 h-20 rounded-full bg-[#4361EE] flex items-center justify-center text-white text-2xl font-bold">
          {initials}
        </div>
        <div className="text-center">
          <p className="text-white text-lg font-bold">{user?.name}</p>
          <span className="text-xs bg-[#4361EE]/20 text-[#4f8eff] px-2 py-0.5 rounded-full font-medium">Buyer</span>
        </div>
      </div>

      {/* Info */}
      <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl overflow-hidden">
        {user?.email && (
          <div className="flex items-center gap-3 p-4 border-b border-[#1a3060]">
            <Mail className="w-4 h-4 text-[#4f8eff] flex-shrink-0" />
            <div>
              <p className="text-[#8b9ab4] text-xs">Email</p>
              <p className="text-white text-sm">{user.email}</p>
            </div>
          </div>
        )}
        <div className="p-4 border-b border-[#1a3060]">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-[#4f8eff] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[#8b9ab4] text-xs">Phone</p>
              {editingPhone ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="07XX XXX XXX"
                    autoFocus
                    className="flex-1 h-9 px-3 rounded-lg bg-[#07101e] border border-[#1a3060] text-white text-sm focus:outline-none focus:border-[#4361EE]"
                  />
                  <button onClick={savePhone} disabled={savingPhone}
                    className="w-9 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    {savingPhone ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Check className="w-4 h-4 text-white" />}
                  </button>
                  <button onClick={() => { setEditingPhone(false); setPhoneInput(phone); setPhoneError(""); }}
                    className="w-9 h-9 rounded-lg bg-[#1a3060] flex items-center justify-center flex-shrink-0">
                    <X className="w-4 h-4 text-[#8b9ab4]" />
                  </button>
                </div>
              ) : (
                <p className="text-white text-sm">{phone || "Not set"}</p>
              )}
            </div>
            {!editingPhone && (
              <button onClick={() => { setEditingPhone(true); setPhoneInput(phone); }}
                className="text-[#4f8eff] hover:text-white transition-colors flex-shrink-0">
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
          {phoneError && <p className="text-red-400 text-xs mt-2 ml-7">{phoneError}</p>}
        </div>
        {user?.referral_code && (
          <div className="flex items-center gap-3 p-4">
            <User className="w-4 h-4 text-[#4f8eff] flex-shrink-0" />
            <div>
              <p className="text-[#8b9ab4] text-xs">Referral Code</p>
              <p className="text-white text-sm font-mono">{user.referral_code}</p>
            </div>
          </div>
        )}
      </div>

      {/* Language */}
      <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#4361EE]/15 flex items-center justify-center"><Globe className="w-4 h-4 text-[#4f8eff]" /></div>
          <span className="text-white text-sm font-medium">Language</span>
        </div>
        <LangSwitch dark />
      </div>

      {/* Switch role */}
      <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl overflow-hidden">
        <button
          onClick={switchToSeller}
          disabled={switching}
          className="w-full flex items-center gap-3 p-4 text-white hover:bg-[#4361EE]/5 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-[#4361EE]/15 flex items-center justify-center">
            {switching ? <Loader2 className="w-4 h-4 text-[#4f8eff] animate-spin" /> : <ArrowLeftRight className="w-4 h-4 text-[#4f8eff]" />}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">Switch to Seller</p>
            <p className="text-[#8b9ab4] text-xs">Sell products & receive escrow payments</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8b9ab4]" />
        </button>
      </div>

      {/* Actions */}
      <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl overflow-hidden">
        <button
          onClick={logout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 p-4 text-red-400 hover:bg-red-500/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
          <ChevronRight className="w-4 h-4 ml-auto" />
        </button>
      </div>
    </div>
  );
}
