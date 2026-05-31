"use client";

import { useRouter } from "next/navigation";
import { Bell, CheckCheck, ChevronLeft } from "lucide-react";
import { useNotifs } from "@/app/app/_lib/notif-context";
import { fmtDate } from "@/app/app/_lib/fmt";

export function NotificationsView({ role = "buyer" }: { role?: "buyer" | "seller" }) {
  const router = useRouter();
  const { notifs, unread, markRead, markAllRead } = useNotifs();

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[#8b9ab4] hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white flex-1">Notifications</h1>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-[#4f8eff] text-sm font-medium hover:underline">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="bg-[#0d1f35] border border-[#1a3060] rounded-2xl p-10 text-center">
          <Bell className="w-10 h-10 text-[#4f8eff] mx-auto mb-3 opacity-40" />
          <p className="text-[#8b9ab4]">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                if (!n.is_read) markRead(n.id);
                const orderId = (n.data as { orderId?: string } | null)?.orderId;
                if (orderId) router.push(`/app/${role}/orders/${orderId}`);
              }}
              className={`w-full text-left rounded-xl p-4 border transition-colors ${
                n.is_read ? "bg-[#0d1f35] border-[#1a3060]" : "bg-[#0d1f35] border-[#4361EE]/50"
              }`}
            >
              <div className="flex items-start gap-3">
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#4361EE] mt-1.5 flex-shrink-0" />}
                <div className={`flex-1 min-w-0 ${n.is_read ? "pl-5" : ""}`}>
                  <p className="text-white text-sm font-semibold">{n.title}</p>
                  {n.body && <p className="text-[#8b9ab4] text-sm mt-0.5">{n.body}</p>}
                  <p className="text-[#48484a] text-xs mt-1">{fmtDate(n.created_at)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
