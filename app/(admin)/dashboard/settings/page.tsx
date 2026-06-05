"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Save, Shield, Percent, AlertTriangle, Bell, Loader2, AlertCircle, CheckCircle2,
} from "lucide-react";
import { api } from "../../../_lib/api";

// ---------------------------------------------------------------------------
// Types — mirrors PlatformSettings on the backend
// ---------------------------------------------------------------------------
interface PlatformSettings {
  fee_rate_percent: number;
  min_order_amount: number;
  max_order_amount: number;
  auto_release_days: number;
  dispute_window_days: number;
  otp_expiry_minutes: number;
  max_otp_attempts: number;
  session_minutes: number;
  refresh_token_days: number;
  require_otp_all_logins: boolean;
  require_2fa_admins: boolean;
  lock_after_failed_logins: boolean;
  notify_high_priority_dispute: boolean;
  notify_large_order: boolean;
  notify_daily_summary: boolean;
  notify_account_suspension: boolean;
  alert_recipient_email: string;
  orders_frozen: boolean;
  maintenance_mode: boolean;
}

// ---------------------------------------------------------------------------
// Presentational helpers
// ---------------------------------------------------------------------------
function Section({ title, description, icon: Icon, children }: {
  title: string; description: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#4361EE]/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#4361EE]" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 items-start sm:grid-cols-[260px_1fr]">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}

function NumberInput({ value, onChange, suffix, min = 0 }: {
  value: number; onChange: (v: number) => void; suffix?: string; min?: number;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        min={min}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className="w-full h-9 px-3 pr-14 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{suffix}</span>
      )}
    </div>
  );
}

function TextInput({ value, onChange, type = "text" }: {
  value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]"
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? "bg-[#4361EE]" : "bg-slate-200"}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

// Mirrors the backend DEFAULT_SETTINGS — used as a read-only fallback when the
// settings service isn't reachable (e.g. backend not yet deployed).
const DEFAULT_SETTINGS: PlatformSettings = {
  fee_rate_percent: 2,
  min_order_amount: 10000,
  max_order_amount: 50000000,
  auto_release_days: 7,
  dispute_window_days: 3,
  otp_expiry_minutes: 10,
  max_otp_attempts: 5,
  session_minutes: 15,
  refresh_token_days: 30,
  require_otp_all_logins: true,
  require_2fa_admins: false,
  lock_after_failed_logins: true,
  notify_high_priority_dispute: true,
  notify_large_order: true,
  notify_daily_summary: false,
  notify_account_suspension: true,
  alert_recipient_email: "ops@luipayment.com",
  orders_frozen: false,
  maintenance_mode: false,
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [degraded, setDegraded] = useState(false); // settings service unreachable → defaults shown read-only
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dangerBusy, setDangerBusy] = useState<null | "orders_frozen" | "maintenance_mode">(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PlatformSettings>("/api/v1/admin/settings");
      setSettings(res);
      setDegraded(false);
    } catch {
      // Settings service not available (e.g. backend not deployed) — render real
      // defaults read-only instead of a blocking error, so the page is still usable.
      setSettings(DEFAULT_SETTINGS);
      setDegraded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) =>
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const res = await api.patch<PlatformSettings>("/api/v1/admin/settings", settings);
      setSettings(res);
      setDegraded(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Danger-zone flags apply immediately (with confirmation) rather than via the main Save.
  const toggleDanger = async (key: "orders_frozen" | "maintenance_mode", turnOn: boolean, confirmMsg: string) => {
    if (turnOn && !window.confirm(confirmMsg)) return;
    setDangerBusy(key);
    setSaveError(null);
    try {
      const res = await api.patch<PlatformSettings>("/api/v1/admin/settings", { [key]: turnOn });
      setSettings(res);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setDangerBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!settings) return null;

  const s = settings;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage platform configuration and rules</p>
        </div>
        <button
          onClick={save}
          disabled={saving || degraded}
          title={degraded ? "Settings service unavailable" : undefined}
          className="flex items-center gap-2 bg-[#4361EE] hover:bg-[#3451D1] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {degraded && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Settings service isn’t reachable yet — showing platform defaults. Deploy the backend (with the <code className="font-mono">/admin/settings</code> endpoint) to view and edit live values.</span>
          <button onClick={load} className="ml-auto text-xs underline whitespace-nowrap">Retry</button>
        </div>
      )}

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Settings saved successfully.
        </div>
      )}
      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {saveError}
        </div>
      )}

      {/* Escrow & Fees */}
      <Section title="Escrow & Fees" description="Platform fee rate and escrow rules" icon={Percent}>
        <Field label="Platform fee rate" hint="Applied to every order total">
          <NumberInput value={s.fee_rate_percent} onChange={(v) => set("fee_rate_percent", v)} suffix="%" />
        </Field>
        <Field label="Minimum order amount" hint="Orders below this are rejected">
          <NumberInput value={s.min_order_amount} onChange={(v) => set("min_order_amount", v)} suffix="TZS" />
        </Field>
        <Field label="Maximum order amount" hint="Orders above this are rejected">
          <NumberInput value={s.max_order_amount} onChange={(v) => set("max_order_amount", v)} suffix="TZS" />
        </Field>
        <Field label="Auto-release window" hint="Days before held funds release to seller if buyer doesn't confirm">
          <NumberInput value={s.auto_release_days} onChange={(v) => set("auto_release_days", v)} suffix="days" />
        </Field>
        <Field label="Dispute window" hint="Days a buyer can open a dispute after delivery">
          <NumberInput value={s.dispute_window_days} onChange={(v) => set("dispute_window_days", v)} suffix="days" />
        </Field>
      </Section>

      {/* Security */}
      <Section title="Security" description="OTP, sessions, and access controls" icon={Shield}>
        <Field label="OTP expiry" hint="How long a one-time code is valid">
          <NumberInput value={s.otp_expiry_minutes} onChange={(v) => set("otp_expiry_minutes", v)} suffix="min" />
        </Field>
        <Field label="Max OTP attempts" hint="Failed attempts before code is invalidated">
          <NumberInput value={s.max_otp_attempts} onChange={(v) => set("max_otp_attempts", v)} suffix="tries" />
        </Field>
        <Field label="Session duration" hint="Access token lifetime">
          <NumberInput value={s.session_minutes} onChange={(v) => set("session_minutes", v)} suffix="min" />
        </Field>
        <Field label="Refresh token lifetime">
          <NumberInput value={s.refresh_token_days} onChange={(v) => set("refresh_token_days", v)} suffix="days" />
        </Field>
        <div className="pt-2 space-y-3 border-t border-slate-100">
          <Toggle checked={s.require_otp_all_logins} onChange={(v) => set("require_otp_all_logins", v)} label="Require email OTP for all logins" />
          <Toggle checked={s.require_2fa_admins} onChange={(v) => set("require_2fa_admins", v)} label="Require 2FA for admin accounts" />
          <Toggle checked={s.lock_after_failed_logins} onChange={(v) => set("lock_after_failed_logins", v)} label="Lock account after repeated failed logins" />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" description="Admin alert preferences" icon={Bell}>
        <div className="space-y-3">
          <Toggle checked={s.notify_high_priority_dispute} onChange={(v) => set("notify_high_priority_dispute", v)} label="Email alert on new high-priority dispute" />
          <Toggle checked={s.notify_large_order} onChange={(v) => set("notify_large_order", v)} label="Email alert on large orders" />
          <Toggle checked={s.notify_daily_summary} onChange={(v) => set("notify_daily_summary", v)} label="Daily summary email" />
          <Toggle checked={s.notify_account_suspension} onChange={(v) => set("notify_account_suspension", v)} label="Alert on account suspension" />
        </div>
        <Field label="Alert recipient email" hint="Ops team inbox">
          <TextInput value={s.alert_recipient_email} onChange={(v) => set("alert_recipient_email", v)} type="email" />
        </Field>
      </Section>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-200">
        <div className="px-6 py-4 border-b border-red-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h2 className="font-semibold text-red-700">Danger Zone</h2>
            <p className="text-xs text-red-400 mt-0.5">These apply immediately across the platform</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Freeze all new orders</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {s.orders_frozen ? "New escrow orders are currently blocked." : "Prevent any new escrow orders from being created"}
              </p>
            </div>
            <button
              onClick={() => toggleDanger("orders_frozen", !s.orders_frozen, "Freeze all new orders? Sellers will be unable to create orders until you unfreeze.")}
              disabled={dangerBusy === "orders_frozen" || degraded}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 ${
                s.orders_frozen
                  ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                  : "border-red-200 text-red-600 hover:bg-red-50"
              }`}
            >
              {dangerBusy === "orders_frozen" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {s.orders_frozen ? "Unfreeze" : "Freeze"}
            </button>
          </div>
          <div className="border-t border-slate-100" />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Maintenance mode</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {s.maintenance_mode ? "The app is in maintenance — non-admin API access is blocked." : "Block non-admin API access while you perform maintenance"}
              </p>
            </div>
            <button
              onClick={() => toggleDanger("maintenance_mode", !s.maintenance_mode, "Enable maintenance mode? All non-admin app traffic will be blocked until you disable it.")}
              disabled={dangerBusy === "maintenance_mode" || degraded}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 ${
                s.maintenance_mode
                  ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                  : "border-red-200 text-red-600 hover:bg-red-50"
              }`}
            >
              {dangerBusy === "maintenance_mode" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {s.maintenance_mode ? "Disable" : "Enable"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
