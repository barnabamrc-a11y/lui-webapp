"use client";

import { useState } from "react";
import { Save, Shield, Mail, Percent, AlertTriangle, Bell, ChevronRight } from "lucide-react";

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
    <div className="grid grid-cols-[1fr_auto] gap-4 items-start sm:grid-cols-[220px_1fr]">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}

function Input({ defaultValue, type = "text", suffix }: { defaultValue: string; type?: string; suffix?: string }) {
  return (
    <div className="relative">
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{suffix}</span>
      )}
    </div>
  );
}

function Toggle({ defaultChecked, label }: { defaultChecked: boolean; label: string }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-10 h-6 rounded-full transition-colors ${on ? "bg-[#4361EE]" : "bg-slate-200"}`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage platform configuration and rules</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#4361EE] hover:bg-[#3451D1] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save changes"}
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Settings saved successfully.
        </div>
      )}

      {/* Escrow & Fees */}
      <Section title="Escrow & Fees" description="Platform fee rates and escrow rules" icon={Percent}>
        <Field label="Platform fee rate" hint="Applied to every order total">
          <Input defaultValue="2" suffix="%" />
        </Field>
        <Field label="Minimum order amount" hint="Orders below this are rejected">
          <Input defaultValue="10,000" suffix="TZS" />
        </Field>
        <Field label="Maximum order amount" hint="Orders above this require manual approval">
          <Input defaultValue="50,000,000" suffix="TZS" />
        </Field>
        <Field label="Auto-release window" hint="Days before held funds release to seller if buyer doesn't confirm">
          <Input defaultValue="7" suffix="days" />
        </Field>
        <Field label="Dispute window" hint="Days a buyer can open a dispute after delivery">
          <Input defaultValue="3" suffix="days" />
        </Field>
      </Section>

      {/* Email / SMTP */}
      <Section title="Email & SMTP" description="Outbound mail configuration for OTPs and notifications" icon={Mail}>
        <Field label="SMTP host">
          <Input defaultValue="smtp.hostinger.com" />
        </Field>
        <Field label="SMTP port">
          <Input defaultValue="465" type="number" />
        </Field>
        <Field label="SMTP username">
          <Input defaultValue="email-blaster@ai.hernatter.com" type="email" />
        </Field>
        <Field label="SMTP password">
          <Input defaultValue="••••••••••••" type="password" />
        </Field>
        <Field label="From name">
          <Input defaultValue="LUI Escrow" />
        </Field>
        <Field label="From address">
          <Input defaultValue="noreply@luipayment.com" type="email" />
        </Field>
        <div className="pt-2">
          <button className="flex items-center gap-2 text-sm text-[#4361EE] font-semibold hover:underline">
            Send test email <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </Section>

      {/* Security */}
      <Section title="Security" description="OTP, sessions, and access controls" icon={Shield}>
        <Field label="OTP expiry" hint="How long a one-time code is valid">
          <Input defaultValue="10" suffix="min" />
        </Field>
        <Field label="Max OTP attempts" hint="Failed attempts before code is invalidated">
          <Input defaultValue="5" suffix="tries" />
        </Field>
        <Field label="Session duration" hint="Access token lifetime">
          <Input defaultValue="15" suffix="min" />
        </Field>
        <Field label="Refresh token lifetime">
          <Input defaultValue="30" suffix="days" />
        </Field>
        <div className="pt-2 space-y-3 border-t border-slate-100">
          <Toggle defaultChecked={true} label="Require email OTP for all logins" />
          <Toggle defaultChecked={false} label="Require 2FA for admin accounts" />
          <Toggle defaultChecked={true} label="Lock account after 5 failed login attempts" />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" description="Admin alert preferences" icon={Bell}>
        <div className="space-y-3">
          <Toggle defaultChecked={true} label="Email alert on new high-priority dispute" />
          <Toggle defaultChecked={true} label="Email alert on order exceeding TZS 10,000,000" />
          <Toggle defaultChecked={false} label="Daily summary email" />
          <Toggle defaultChecked={true} label="Alert on account suspension" />
        </div>
        <Field label="Alert recipient email" hint="Ops team inbox">
          <Input defaultValue="ops@luipayment.com" type="email" />
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
            <p className="text-xs text-red-400 mt-0.5">Irreversible actions — proceed with caution</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Freeze all new orders</p>
              <p className="text-xs text-slate-400 mt-0.5">Prevent any new escrow orders from being created</p>
            </div>
            <button className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
              Freeze
            </button>
          </div>
          <div className="border-t border-slate-100" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Enable maintenance mode</p>
              <p className="text-xs text-slate-400 mt-0.5">Display a maintenance page to all users</p>
            </div>
            <button className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
              Enable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
