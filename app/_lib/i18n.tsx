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
  completeBusinessTitle: "Complete your business info",
  completeBusinessBody:  "Before you can create orders, please add your business name and location so buyers know who they are dealing with.",
  completeBusinessCta:   "Add Business Info",

  // Profile
  switchRole:   "Switch Role",
  switchToBuyer:"Switch to Buyer",
  switchToSeller:"Switch to Seller",
  signOut:      "Sign Out",
  language:     "Language",

  // Greetings / home
  hi:               "Hi",
  accountOverview:  "Here's your account overview",
  sellerDashboard:  "Your seller dashboard",
  availableBalance: "Available Balance",
  inEscrow:         "In Escrow",
  pending:          "Pending",
  viewWallet:       "View Wallet",
  myOrders:         "My Orders",
  total:            "Total",
  active:           "Active",
  completed:        "Completed",
  recentOrders:     "Recent Orders",
  noOrdersYet:      "No orders yet",
  makeFirstPayment: "Make your first payment",
  createFirstOrder: "Create your first transaction",
  review:           "Review",
  awaitingBuyer:    "awaiting buyer",
  enterCodeToPay:   "Enter order number to pay",

  // Orders list
  all:        "All",
  disputed:   "Disputed",
  noOrdersFound: "No orders found",

  // Wallet
  transactionHistory: "Transaction History",
  noTransactions:     "No transactions yet",
  deposit:            "Deposit",
  withdraw:           "Withdraw",
  yourReferralCode:   "Your Referral Code",

  // Deposit
  depositCash:     "Deposit Cash",
  mobileMoney:     "Mobile Money",
  bank:            "Bank",
  amountToReceive: "Amount to receive (TZS)",
  walletCredit:    "Wallet credit",
  luiFee:          "LUI fee (2.5%)",
  totalToPay:      "Total to pay",
  operator:        "Operator",
  mobileMoneyNumber:"Mobile money number",
  bankAccountNumber:"Bank account number",
  otpFromBank:     "OTP from bank USSD",

  // Withdraw
  recipientNumber: "Recipient number",
  verifyingRecipient: "Verifying recipient…",

  // Order detail / pay
  orderTotal:      "Order total",
  youPay:          "You pay",
  trackOrder:      "Track Order",
  chatWithSeller:  "Chat with Seller",
  chatWithBuyer:   "Chat with Buyer",
  releasePayment:  "Release Payment",
  markPreparing:   "Mark as Preparing",
  markDispatched:  "Mark as Dispatched",
  deliveryAddress: "Delivery Address",

  // Common
  cancel:   "Cancel",
  save:     "Save",
  done:     "Done",
  back:     "Back",
  email:    "Email",
  phone:    "Phone",
  notifications: "Notifications",
  markAllRead:   "Mark all read",
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
  completeBusinessTitle: "Kamilisha taarifa za biashara",
  completeBusinessBody:  "Kabla ya kuunda oda, tafadhali ongeza jina na eneo la biashara yako ili wanunuzi wajue wanashughulika na nani.",
  completeBusinessCta:   "Ongeza Taarifa za Biashara",

  switchRole:   "Badilisha Jukumu",
  switchToBuyer:"Badilisha kwenda Mnunuzi",
  switchToSeller:"Badilisha kwenda Muuzaji",
  signOut:      "Toka",
  language:     "Lugha",

  hi:               "Habari",
  accountOverview:  "Muhtasari wa akaunti yako",
  sellerDashboard:  "Dashibodi yako ya muuzaji",
  availableBalance: "Salio Lililopo",
  inEscrow:         "Kwenye Amana",
  pending:          "Inasubiri",
  viewWallet:       "Ona Mkoba",
  myOrders:         "Maagizo Yangu",
  total:            "Jumla",
  active:           "Yanayoendelea",
  completed:        "Yaliyokamilika",
  recentOrders:     "Maagizo ya Karibuni",
  noOrdersYet:      "Hakuna maagizo bado",
  makeFirstPayment: "Fanya malipo yako ya kwanza",
  createFirstOrder: "Unda muamala wako wa kwanza",
  review:           "Kagua",
  awaitingBuyer:    "inasubiri mnunuzi",
  enterCodeToPay:   "Weka nambari ya oda kulipa",

  all:        "Yote",
  disputed:   "Yenye Mgogoro",
  noOrdersFound: "Hakuna maagizo yaliyopatikana",

  transactionHistory: "Historia ya Miamala",
  noTransactions:     "Hakuna miamala bado",
  deposit:            "Weka Pesa",
  withdraw:           "Toa Pesa",
  yourReferralCode:   "Nambari yako ya Rufaa",

  depositCash:     "Weka Pesa",
  mobileMoney:     "Pesa za Simu",
  bank:            "Benki",
  amountToReceive: "Kiasi cha kupokea (TZS)",
  walletCredit:    "Salio la mkoba",
  luiFee:          "Ada ya LUI (2.5%)",
  totalToPay:      "Jumla ya kulipa",
  operator:        "Mtoa huduma",
  mobileMoneyNumber:"Nambari ya pesa za simu",
  bankAccountNumber:"Nambari ya akaunti ya benki",
  otpFromBank:     "OTP kutoka USSD ya benki",

  recipientNumber: "Nambari ya mpokeaji",
  verifyingRecipient: "Inathibitisha mpokeaji…",

  orderTotal:      "Jumla ya oda",
  youPay:          "Unalipa",
  trackOrder:      "Fuatilia Oda",
  chatWithSeller:  "Ongea na Muuzaji",
  chatWithBuyer:   "Ongea na Mnunuzi",
  releasePayment:  "Toa Malipo",
  markPreparing:   "Weka kama Inaandaliwa",
  markDispatched:  "Weka kama Imetumwa",
  deliveryAddress: "Anwani ya Utoaji",

  cancel:   "Ghairi",
  save:     "Hifadhi",
  done:     "Imekamilika",
  back:     "Rudi",
  email:    "Barua pepe",
  phone:    "Simu",
  notifications: "Arifa",
  markAllRead:   "Soma zote",
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
