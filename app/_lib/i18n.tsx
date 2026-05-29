"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Locale = "en" | "sw";

const en = {
  // Landing / nav
  howItWorks:   "How it Works",
  features:     "Features",
  pricing:      "Pricing",
  signIn:       "Sign In",
  getStarted:   "Get Started",
  heroTitle:    "Secure Every Transaction",
  heroSubtitle: "LUI holds your money safely in escrow until delivery is confirmed. Buy and sell with total confidence across Tanzania.",
  createAccount:"Create Account",

  // App common
  home:        "Home",
  orders:      "Orders",
  wallet:      "Wallet",
  profile:     "Profile",
  newOrder:    "New Order",
  seeAll:      "See all",
  pendingForYou:"Pending for You",
  activeOrders:"Active Orders",
  recentCompleted:"Recent Completed",
  payViaCode:  "Pay via Code",

  // Order flow
  acceptOrder:  "Accept Order",
  declineOrder: "Decline Order",
  declineReason:"Why are you declining? (optional)",
  setAddress:   "Set Delivery Address",
  confirmPay:   "Confirm Address & Pay",
  payNow:       "Pay Now",
  confirmReceived:"Confirm Delivery",
  openDispute:  "Open Dispute",

  // Create order
  buyerPhone:   "Buyer's LUI Phone Number",
  buyerFound:   "Buyer found",
  productName:  "Product Name",
  addPhoto:     "Click to add product photo",

  // Profile
  switchRole:   "Switch Role",
  switchToBuyer:"Switch to Buyer",
  switchToSeller:"Switch to Seller",
  signOut:      "Sign Out",
  language:     "Language",
};

const sw: typeof en = {
  howItWorks:   "Jinsi Inavyofanya kazi",
  features:     "Vipengele",
  pricing:      "Bei",
  signIn:       "Ingia",
  getStarted:   "Anza Sasa",
  heroTitle:    "Linda Kila Muamala",
  heroSubtitle: "LUI inashikilia pesa yako salama kwenye amana hadi utoaji uthibitishwe. Nunua na uza kwa ujasiri kote Tanzania.",
  createAccount:"Fungua Akaunti",

  home:        "Nyumbani",
  orders:      "Maagizo",
  wallet:      "Mkoba",
  profile:     "Wasifu",
  newOrder:    "Oda Mpya",
  seeAll:      "Ona yote",
  pendingForYou:"Yanakusubiri",
  activeOrders:"Maagizo Yanayoendelea",
  recentCompleted:"Yaliyokamilika",
  payViaCode:  "Lipa kwa Nambari",

  acceptOrder:  "Kubali Oda",
  declineOrder: "Kataa Oda",
  declineReason:"Kwa nini unakataa? (si lazima)",
  setAddress:   "Weka Anwani ya Utoaji",
  confirmPay:   "Thibitisha Anwani na Ulipe",
  payNow:       "Lipa Sasa",
  confirmReceived:"Thibitisha Upokeaji",
  openDispute:  "Fungua Mgogoro",

  buyerPhone:   "Nambari ya Simu ya LUI ya Mnunuzi",
  buyerFound:   "Mnunuzi amepatikana",
  productName:  "Jina la Bidhaa",
  addPhoto:     "Bofya kuongeza picha ya bidhaa",

  switchRole:   "Badilisha Jukumu",
  switchToBuyer:"Badilisha kwenda Mnunuzi",
  switchToSeller:"Badilisha kwenda Muuzaji",
  signOut:      "Toka",
  language:     "Lugha",
};

const dict: Record<Locale, typeof en> = { en, sw };
export type TKey = keyof typeof en;

interface I18nCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (k: TKey) => string;
}

const Ctx = createContext<I18nCtx>({ locale: "en", setLocale: () => {}, t: (k) => en[k] });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lui_locale") as Locale | null;
    if (saved === "en" || saved === "sw") setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("lui_locale", l);
  }, []);

  const t = useCallback((k: TKey) => dict[locale][k] ?? en[k], [locale]);

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
