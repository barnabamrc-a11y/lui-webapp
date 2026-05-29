"use client";

import { useI18n, type Locale } from "@/app/_lib/i18n";

const LANGS: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "sw", label: "SW" },
];

export function LangSwitch({ dark = false }: { dark?: boolean }) {
  const { locale, setLocale } = useI18n();
  return (
    <div className={`inline-flex items-center gap-1 rounded-full p-0.5 border ${dark ? "border-white/20" : "border-slate-200"}`}>
      {LANGS.map((l) => {
        const active = locale === l.value;
        return (
          <button
            key={l.value}
            onClick={() => setLocale(l.value)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
              active
                ? "bg-[#4361EE] text-white"
                : dark ? "text-white/70 hover:text-white" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
