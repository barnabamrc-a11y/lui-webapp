"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, CheckCircle2, ArrowUpCircle } from "lucide-react";
import { userApi } from "@/app/_lib/user-api";
import { fmt } from "@/app/app/_lib/fmt";

type DisburseProvider = "Airtel" | "Azampesa" | "Tigo";
type Phase = "form" | "submitting" | "success";

const PROVIDERS: { value: DisburseProvider; label: string }[] = [
  { value: "Airtel", label: "Airtel Money" },
  { value: "Tigo", label: "Mixx by Yas (Tigo)" },
  { value: "Azampesa", label: "Azam Pesa" },
];

function previewPhone(raw: string): string {
  const p = raw.replace(/[^\d]/g, "");
  if (p.startsWith("255")) return p;
  if (p.startsWith("0")) return "255" + p.slice(1);
  if (p.length === 9) return "255" + p;
  return p;
}
function commas(v: string) { return v ? Number(v.replace(/[^\d]/g, "")).toLocaleString("en-US") : ""; }

export default function WithdrawPage() {
  const router = useRouter();
  const [available, setAvailable] = useState(0);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState<DisburseProvider>("Airtel");
  const [recipient, setRecipient] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const u = (() => { try { return JSON.parse(localStorage.getItem("lui_user") || "{}"); } catch { return {}; } })();
    if (u?.phone) setPhone(u.phone);
    userApi.get<{ available_balance: string }>("/api/v1/wallet").then((w) => setAvailable(parseFloat(w.available_balance))).catch(() => {});
  }, []);

  const amountNum = parseInt(amount || "0", 10);
  const formatted = previewPhone(phone);
  const phoneOk = /^255[67]\d{8}$/.test(formatted);
  const canSubmit = amountNum >= 500 && amountNum <= available && phoneOk && !!recipient;

  // Debounced recipient name lookup
  useEffect(() => {
    setRecipient(null);
    if (timer.current) clearTimeout(timer.current);
    if (!phoneOk) return;
    timer.current = setTimeout(async () => {
      setLooking(true); setError("");
      try {
        const r = await userApi.post<{ name: string }>("/api/v1/wallet/withdraw/lookup", { provider, phone: formatted });
        setRecipient(r.name);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not verify recipient");
      } finally { setLooking(false); }
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatted, provider, phoneOk]);

  const submit = async () => {
    setError(""); setPhase("submitting");
    try {
      await userApi.post("/api/v1/wallet/withdraw", { amount: amountNum, phone: formatted, provider, name: recipient });
      setPhase("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Withdrawal failed");
      setPhase("form");
    }
  };

  if (phase === "success") {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center text-center min-h-[60vh] gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center"><CheckCircle2 className="w-10 h-10 text-emerald-400" /></div>
        <h2 className="text-white text-xl font-bold">Withdrawal Initiated</h2>
        <p className="text-[#8b9ab4] text-sm">TZS {fmt(amountNum)} is on its way to {recipient} ({formatted}). It usually arrives within a few minutes.</p>
        <button onClick={() => router.back()} className="w-full h-12 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold rounded-xl">Done</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Withdraw</h1>
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-[#0d1f35] border border-[#1a3060] flex items-center justify-center text-[#8b9ab4]"><X className="w-4 h-4" /></button>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}

      <div className="bg-gradient-to-br from-[#4361EE] to-[#3451D1] rounded-2xl p-5">
        <p className="text-blue-200 text-xs font-bold tracking-widest mb-1">AMOUNT (TZS)</p>
        <input value={commas(amount)} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="0" inputMode="numeric"
          className="w-full bg-transparent text-white text-4xl font-extrabold outline-none placeholder-white/40" />
        <p className="text-white/70 text-xs font-semibold mt-2">Available: TZS {fmt(available)}</p>
      </div>

      {amountNum > available && <p className="text-red-400 text-xs">Amount exceeds your available balance.</p>}

      <div className="space-y-1.5">
        <label className="block text-xs font-bold tracking-widest text-[#8b9ab4]">OPERATOR</label>
        <div className="grid grid-cols-1 gap-2">
          {PROVIDERS.map((p) => (
            <button key={p.value} onClick={() => setProvider(p.value)}
              className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${provider === p.value ? "border-[#4361EE] text-[#4f8eff] bg-[#4361EE]/10" : "border-[#1a3060] text-[#8b9ab4] bg-[#07101e]"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold tracking-widest text-[#8b9ab4]">RECIPIENT NUMBER</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" inputMode="tel"
          className="w-full h-11 px-4 rounded-xl bg-[#07101e] border border-[#1a3060] text-white text-sm focus:outline-none focus:border-[#4361EE]" />
      </div>

      {looking && <div className="flex items-center gap-2 text-[#8b9ab4] text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Verifying recipient…</div>}
      {recipient && !looking && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-white text-sm font-semibold">{recipient}</span>
        </div>
      )}

      <button onClick={submit} disabled={!canSubmit || phase === "submitting"}
        className="w-full h-12 bg-[#4361EE] hover:bg-[#3451D1] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
        {phase === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowUpCircle className="w-4 h-4" /> Withdraw {amountNum >= 500 ? `TZS ${fmt(amountNum)}` : ""}</>}
      </button>
    </div>
  );
}
