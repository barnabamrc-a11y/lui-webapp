"use client";

import { useState } from "react";
import { Mail, Phone, LogOut, ChevronRight, Building2, ArrowLeftRight, Loader2 } from "lucide-react";
import { getStoredUser, clearUserTokens, userApi } from "@/app/_lib/user-api";

export default function SellerProfile() {
  const user = getStoredUser<{ name: string; email: string | null; phone: string | null; referral_code?: string }>();
  const [loggingOut, setLoggingOut] = useState(false);
  const [switching, setSwitching]   = useState(false);

  const logout = () => {
    setLoggingOut(true);
    clearUserTokens();
    window.location.href = "/auth/login";
  };

  const switchToBuyer = async () => {
    if (!confirm("Switch to a Buyer account? You'll be signed out and need to sign in again.")) return;
    setSwitching(true);
    try {
      await userApi.post("/api/v1/users/me/switch-role", { role: "buyer" });
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

      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-20 h-20 rounded-full bg-[#4361EE] flex items-center justify-center text-white text-2xl font-bold">
          {initials}
        </div>
        <div className="text-center">
          <p className="text-white text-lg font-bold">{user?.name}</p>
          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">Seller</span>
        </div>
      </div>

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
        {user?.phone && (
          <div className="flex items-center gap-3 p-4 border-b border-[#1a3060]">
            <Phone className="w-4 h-4 text-[#4f8eff] flex-shrink-0" />
            <div>
              <p className="text-[#8b9ab4] text-xs">Phone</p>
              <p className="text-white text-sm">{user.phone}</p>
            </div>
          </div>
        )}
        {user?.referral_code && (
          <div className="flex items-center gap-3 p-4">
            <Building2 className="w-4 h-4 text-[#4f8eff] flex-shrink-0" />
            <div>
              <p className="text-[#8b9ab4] text-xs">Referral Code</p>
              <p className="text-white text-sm font-mono">{user.referral_code}</p>
            </div>
          </div>
        )}
      </div>

      {/* Switch role */}
      <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl overflow-hidden">
        <button onClick={switchToBuyer} disabled={switching}
          className="w-full flex items-center gap-3 p-4 text-white hover:bg-[#4361EE]/5 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-[#4361EE]/15 flex items-center justify-center">
            {switching ? <Loader2 className="w-4 h-4 text-[#4f8eff] animate-spin" /> : <ArrowLeftRight className="w-4 h-4 text-[#4f8eff]" />}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">Switch to Buyer</p>
            <p className="text-[#8b9ab4] text-xs">Buy products with escrow protection</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8b9ab4]" />
        </button>
      </div>

      <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl overflow-hidden">
        <button onClick={logout} disabled={loggingOut}
          className="w-full flex items-center gap-3 p-4 text-red-400 hover:bg-red-500/5 transition-colors">
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
          <ChevronRight className="w-4 h-4 ml-auto" />
        </button>
      </div>
    </div>
  );
}
