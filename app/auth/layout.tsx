import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8">
        <div className="bg-white rounded-2xl shadow-md shadow-slate-200 px-6 py-3 flex items-center justify-center">
          <Image src="/lui-logo.png" alt="LUI" width={120} height={48} className="object-contain" priority />
        </div>
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-xs text-slate-400 text-center">
        © {new Date().getFullYear()} LUI Payments Ltd · 🇹🇿 Tanzania
      </p>
    </div>
  );
}
