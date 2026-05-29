import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck, Zap, Scale, Users, TrendingUp, Clock,
  ArrowRight, CheckCircle, Globe, Star
} from "lucide-react";
import { LangSwitch } from "./_components/lang-switch";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Nav />
      <main className="flex-1">
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <Image src="/lui-logo.png" alt="LUI" width={72} height={30} className="object-contain" priority />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {[["How it Works", "#how-it-works"], ["Features", "#features"], ["Pricing", "#pricing"]].map(([label, href]) => (
            <a key={label} href={href}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LangSwitch />
          <Link href="/auth/login"
            className="text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
            Sign In
          </Link>
          <Link href="/auth/register"
            className="text-sm font-semibold text-white bg-[#4361EE] hover:bg-[#3451D1] px-4 py-2 rounded-lg transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="pt-24 pb-20 px-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-blue-100">
          <Globe className="w-3.5 h-3.5" />
          Built for Tanzania · Trusted by Thousands
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
          Tanzania&apos;s Most Trusted{" "}
          <span className="text-[#4361EE]">Escrow Platform</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          LUI holds your money safely in escrow until delivery is confirmed.
          Buy and sell with total confidence — no chargebacks, no fraud.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register"
            className="inline-flex items-center justify-center gap-2 bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base shadow-lg shadow-blue-200">
            Start for Free <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-8 py-4 rounded-xl transition-colors text-base">
            See How It Works
          </a>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
          {["No setup fees", "Mobile-first", "Instant OTP verification", "MNO payment support"].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              {f}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const stats = [
    { value: "50,000+", label: "Active Users" },
    { value: "TZS 2B+", label: "Secured in Escrow" },
    { value: "99.9%", label: "Uptime" },
    { value: "< 2min", label: "Avg. Release Time" },
  ];
  return (
    <section className="py-12 border-y border-slate-100 bg-white">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl font-extrabold text-[#4361EE]">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: ShieldCheck, title: "Escrow Protection", desc: "Funds held securely until buyer confirms delivery. Zero risk." },
    { icon: Zap, title: "Instant Notifications", desc: "Real-time email and in-app alerts at every transaction step." },
    { icon: Scale, title: "Dispute Mediation", desc: "Fair, fast resolution by trained mediators when things go wrong." },
    { icon: Users, title: "Verified Sellers", desc: "Seller profiles with ratings build trust in every transaction." },
    { icon: TrendingUp, title: "Instant Payouts", desc: "Earnings land in your LUI wallet, withdraw to M-Pesa or bank." },
    { icon: Clock, title: "Auto-Release", desc: "Orders auto-release after 72 hours if buyer raises no dispute." },
  ];
  return (
    <section id="features" className="py-24 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to transact safely</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            LUI gives buyers and sellers a complete toolkit for transparent commerce.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#4361EE]/40 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#4361EE]" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Create an Order", desc: "Seller creates an escrow order with product details and amount. Buyer gets a payment link." },
    { n: "02", title: "Buyer Pays Securely", desc: "Payment via M-Pesa, Tigo Pesa, or card. Funds held in LUI escrow — never touching seller until confirmed." },
    { n: "03", title: "Confirm & Release", desc: "Buyer confirms delivery, funds instantly release to seller's LUI wallet." },
  ];
  return (
    <section id="how-it-works" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">How LUI Works</h2>
          <p className="text-slate-500 text-lg">Simple, secure, three steps.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-full w-full h-px bg-slate-200 -translate-x-1/2" />
              )}
              <div className="text-6xl font-black text-slate-100 mb-4 leading-none select-none">{s.n}</div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { name: "Amina Hassan", role: "Online Seller, Dar es Salaam", text: "LUI changed my business. Buyers trust me more now and I get paid on time, every time." },
    { name: "John Mbwambo", role: "Electronics Buyer", text: "I was scammed twice before. With LUI I finally feel safe buying expensive items online." },
    { name: "Fatuma Ally", role: "Fashion Store Owner", text: "The escrow system is brilliant. My customers love knowing their money is protected." },
  ];
  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Trusted across Tanzania</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
              <p className="font-semibold text-slate-900 text-sm">{r.name}</p>
              <p className="text-slate-400 text-xs">{r.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section id="pricing" className="py-20 px-6 bg-[#4361EE]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to transact with confidence?</h2>
        <p className="text-blue-200 mb-8 text-lg">2% fee per transaction. No monthly fees. No hidden costs.</p>
        <Link href="/auth/register"
          className="inline-flex items-center gap-2 bg-white text-[#4361EE] hover:bg-blue-50 font-bold px-8 py-4 rounded-xl transition-colors text-base">
          Create Free Account <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div>
            <div className="mb-3">
              <div className="bg-white rounded-xl px-3 py-1.5 inline-flex">
                <Image src="/lui-logo.png" alt="LUI" width={60} height={24} className="object-contain" />
              </div>
            </div>
            <p className="text-sm max-w-xs leading-relaxed">Secure escrow payments built for Tanzania. Flow · Hold · Release.</p>
          </div>
          <div className="grid grid-cols-3 gap-8 text-sm">
            {[
              { title: "Product", links: ["How it Works", "Features", "Pricing", "Mobile App"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} LUI Payments Ltd. All rights reserved.</p>
          <p>🇹🇿 Proudly made in Tanzania</p>
        </div>
      </div>
    </footer>
  );
}
