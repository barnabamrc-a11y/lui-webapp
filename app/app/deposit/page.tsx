"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, CheckCircle2, AlertCircle, Info, ArrowDownCircle } from "lucide-react";
import { userApi } from "@/app/_lib/user-api";
import { fmt } from "@/app/app/_lib/fmt";

type MnoProvider = "Airtel" | "Mpesa" | "Tigo" | "Halopesa" | "Azampesa";
type BankProvider = "CRDB" | "NMB";
type Method = "mno" | "bank";
type Phase = "form" | "pending" | "success" | "failed";

const PROVIDERS: { value: MnoProvider; label: string }[] = [
  { value: "Mpesa", label: "M-Pesa (Vodacom)" },
  { value: "Airtel", label: "Airtel Money" },
  { value: "Tigo", label: "Mixx by Yas (Tigo)" },
  { value: "Halopesa", label: "HaloPesa" },
  { value: "Azampesa", label: "Azam Pesa" },
];
const BANKS: { value: BankProvider; label: string }[] = [
  { value: "CRDB", label: "CRDB Bank" },
  { value: "NMB", label: "NMB Bank" },
];
const BANK_USSD: Record<BankProvider, string> = {
  CRDB: "Dial *150*03# → 7 Other Services → 5 AzamPay → Link Account to get your OTP.",
  NMB: "Dial *150*66# → 8 More → 5 Register Sarafu → 1 Select Account No. to get your OTP.",
};
const QUICK = [5000, 10000, 20000, 50000];

function previewPhone(raw: string): string {
  const p = raw.replace(/[^\d]/g, "");
  if (p.startsWith("255")) return p;
  if (p.startsWith("0")) return "255" + p.slice(1);
  if (p.length === 9) return "255" + p;
  return p;
}
function commas(v: string) { return v ? Number(v.replace(/[^\d]/g, "")).toLocaleString("en-US") : ""; }

export default function DepositPage() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("mno");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState<MnoProvider>("Mpesa");
  const [bank, setBank] = useState<BankProvider>("CRDB");
  const [bankAcct, setBankAcct] = useState("");
  const [bankOtp, setBankOtp] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const u = (() => { try { return JSON.parse(localStorage.getItem("lui_user") || "{}"); } catch { return {}; } })();
    if (u?.phone) setPhone(u.phone);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const amountNum = parseInt(amount || "0", 10);
  const fee = Math.round(amountNum * 0.025);
  const totalPay = amountNum + fee;
  const formatted = previewPhone(phone);
  const phoneOk = /^255[67]\d{8}$/.test(formatted);
  const valid = amountNum >= 100 && phoneOk && (method === "mno" || (bankAcct.trim() && bankOtp.trim()));

  const start = async () => {
    setError(""); setPhase("pending");
    try {
      let reference: string;
      if (method === "mno") {
        const r = await userApi.post<{ reference: string }>("/api/v1/wallet/topup", { amount: amountNum, phone: formatted, provider });
        reference = r.reference;
      } else {
        const r = await userApi.post<{ reference: string }>("/api/v1/wallet/topup/bank", {
          amount: amountNum, accountNumber: bankAcct.trim(), mobileNumber: formatted, otp: bankOtp.trim(), provider: bank,
        });
        reference = r.reference;
      }
      poll(reference);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start deposit");
      setPhase("form");
    }
  };

  const poll = (reference: string) => {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const r = await userApi.get<{ status: string }>(`/api/v1/wallet/topup/${encodeURIComponent(reference)}/status`);
        if (r.status === "completed") { clearInterval(pollRef.current!); setPhase("success"); }
        else if (r.status === "failed") { clearInterval(pollRef.current!); setError("Payment was not completed. No money was deducted."); setPhase("failed"); }
      } catch { /* keep polling */ }
      if (attempts >= 40 && pollRef.current) {
        clearInterval(pollRef.current);
        setError("Still waiting for confirmation. If you approved it, your balance will update shortly.");
        setPhase("failed");
      }
    }, 3000);
  };

  // ── Result overlays ─────────────────────────────────────────
  if (phase !== "form") {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center text-center min-h-[60vh] gap-4 px-4">
        {phase === "pending" && (
          <>
            <Loader2 className="w-10 h-10 text-[#4f8eff] animate-spin" />
            <h2 className="text-white text-xl font-bold">
              {method === "mno" ? "Check your phone 📲" : "Bank payment submitted 🏦"}
            </h2>
            <p className="text-[#8b9ab4] text-sm leading-relaxed">
              {method === "mno"
                ? `We sent a USSD prompt to ${formatted}. Enter your PIN to approve TZS ${fmt(totalPay)} (${fmt(amountNum)} + ${fmt(fee)} fee).`
                : `Your ${bank} payment of TZS ${fmt(totalPay)} is being processed. It confirms automatically once your bank approves it.`}
            </p>
            <p className="text-[#48484a] text-xs">Waiting for confirmation…</p>
          </>
        )}
        {phase === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center"><CheckCircle2 className="w-10 h-10 text-emerald-400" /></div>
            <h2 className="text-white text-xl font-bold">Deposit Successful</h2>
            <p className="text-[#8b9ab4] text-sm">TZS {fmt(amountNum)} has been added to your wallet.</p>
            <button onClick={() => router.back()} className="w-full h-12 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold rounded-xl">Done</button>
          </>
        )}
        {phase === "failed" && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-500/15 flex items-center justify-center"><AlertCircle className="w-10 h-10 text-red-400" /></div>
            <h2 className="text-white text-xl font-bold">Not Confirmed</h2>
            <p className="text-[#8b9ab4] text-sm">{error}</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => router.back()} className="flex-1 h-12 border border-[#1a3060] text-[#8b9ab4] rounded-xl font-medium">Close</button>
              <button onClick={() => { setError(""); setPhase("form"); }} className="flex-1 h-12 bg-[#4361EE] text-white rounded-xl font-semibold">Try Again</button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Deposit Cash</h1>
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-[#0d1f35] border border-[#1a3060] flex items-center justify-center text-[#8b9ab4]"><X className="w-4 h-4" /></button>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}

      {/* Method toggle */}
      <div className="flex bg-[#0d1f35] border border-[#1a3060] rounded-xl p-1 gap-1">
        {(["mno", "bank"] as Method[]).map((m) => (
          <button key={m} onClick={() => setMethod(m)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${method === m ? "bg-[#4361EE] text-white" : "text-[#8b9ab4]"}`}>
            {m === "mno" ? "Mobile Money" : "Bank"}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="bg-gradient-to-br from-[#4361EE] to-[#3451D1] rounded-2xl p-5">
        <p className="text-blue-200 text-xs font-bold tracking-widest mb-1">AMOUNT TO RECEIVE (TZS)</p>
        <input value={commas(amount)} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="0" inputMode="numeric"
          className="w-full bg-transparent text-white text-4xl font-extrabold outline-none placeholder-white/40" />
        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK.map((q) => (
            <button key={q} onClick={() => setAmount(String(q))} className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-full">{q.toLocaleString()}</button>
          ))}
        </div>
      </div>

      {/* Fee breakdown */}
      {amountNum > 0 && (
        <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-4 space-y-2">
          <Row label="Wallet credit" value={`TZS ${fmt(amountNum)}`} />
          <Row label="LUI fee (2.5%)" value={`TZS ${fmt(fee)}`} />
          <div className="border-t border-[#1a3060]" />
          <div className="flex justify-between"><span className="text-white font-semibold">Total to pay</span><span className="text-[#4f8eff] font-bold">TZS {fmt(totalPay)}</span></div>
        </div>
      )}

      <Field label={method === "mno" ? "MOBILE MONEY NUMBER" : "MOBILE NUMBER (LINKED TO BANK)"}>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" inputMode="tel" className="w-full h-11 px-4 rounded-xl bg-[#07101e] border border-[#1a3060] text-white text-sm focus:outline-none focus:border-[#4361EE]" />
      </Field>

      {method === "mno" ? (
        <Field label="OPERATOR">
          <div className="grid grid-cols-1 gap-2">
            {PROVIDERS.map((p) => (
              <button key={p.value} onClick={() => setProvider(p.value)}
                className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${provider === p.value ? "border-[#4361EE] text-[#4f8eff] bg-[#4361EE]/10" : "border-[#1a3060] text-[#8b9ab4] bg-[#07101e]"}`}>
                {p.label}
              </button>
            ))}
          </div>
        </Field>
      ) : (
        <>
          <Field label="BANK">
            <div className="grid grid-cols-2 gap-2">
              {BANKS.map((b) => (
                <button key={b.value} onClick={() => setBank(b.value)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${bank === b.value ? "border-[#4361EE] text-[#4f8eff] bg-[#4361EE]/10" : "border-[#1a3060] text-[#8b9ab4] bg-[#07101e]"}`}>
                  {b.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="BANK ACCOUNT NUMBER">
            <input value={bankAcct} onChange={(e) => setBankAcct(e.target.value.replace(/[^\d]/g, ""))} placeholder="0123456789" inputMode="numeric" className="w-full h-11 px-4 rounded-xl bg-[#07101e] border border-[#1a3060] text-white text-sm focus:outline-none focus:border-[#4361EE]" />
          </Field>
          <div className="flex items-start gap-2 bg-[#0d1f35] border border-[#4361EE]/30 rounded-xl p-3">
            <Info className="w-4 h-4 text-[#4f8eff] flex-shrink-0 mt-0.5" />
            <p className="text-[#8b9ab4] text-xs leading-relaxed">{BANK_USSD[bank]}</p>
          </div>
          <Field label="OTP FROM BANK USSD">
            <input value={bankOtp} onChange={(e) => setBankOtp(e.target.value.replace(/[^\d]/g, ""))} placeholder="123456" inputMode="numeric" className="w-full h-11 px-4 rounded-xl bg-[#07101e] border border-[#1a3060] text-white text-sm focus:outline-none focus:border-[#4361EE]" />
          </Field>
        </>
      )}

      <button onClick={start} disabled={!valid}
        className="w-full h-12 bg-[#4361EE] hover:bg-[#3451D1] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
        <ArrowDownCircle className="w-4 h-4" /> Deposit {amountNum >= 100 ? `TZS ${fmt(amountNum)}` : ""}
      </button>
      <p className="text-[#48484a] text-xs text-center">
        {method === "mno" ? "You'll get a USSD prompt on your phone — enter your PIN to approve." : "Generate the OTP from your bank USSD (above), enter it, then deposit."}
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold tracking-widest text-[#8b9ab4]">{label}</label>
      {children}
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-sm"><span className="text-[#8b9ab4]">{label}</span><span className="text-white font-medium">{value}</span></div>;
}
