"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Send, Loader2, ShieldCheck } from "lucide-react";
import { userApi, getStoredUser } from "@/app/_lib/user-api";
import { fmtDate } from "@/app/app/_lib/fmt";

interface Message {
  id: string; order_id: string; sender_id: string; sender_name: string;
  body: string; is_read: boolean; created_at: string;
}

interface OrderMeta { order_number: string; product: string; }

export default function ChatPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [order,    setOrder]    = useState<OrderMeta | null>(null);
  const [text,     setText]     = useState("");
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const me = getStoredUser<{ id: string }>();

  const loadMessages = async () => {
    const res = await userApi.get<Message[]>(`/api/v1/messages/${orderId}`);
    setMessages(res);
    await userApi.patch(`/api/v1/messages/${orderId}/read`);
  };

  useEffect(() => {
    Promise.all([
      userApi.get<OrderMeta>(`/api/v1/orders/${orderId}`),
      loadMessages(),
    ]).then(([o]) => setOrder(o)).finally(() => setLoading(false));

    // Poll for new messages every 5s (WebSocket upgrade happens on the same endpoint)
    const id = setInterval(loadMessages, 5000);
    return () => clearInterval(id);
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    const body = text.trim();
    setText("");
    try {
      const msg = await userApi.post<Message>(`/api/v1/messages/${orderId}`, { body });
      setMessages((prev) => [...prev, msg]);
    } catch { setText(body); }
    finally { setSending(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-6 h-6 text-[#4f8eff] animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100dvh-120px)] md:h-[calc(100dvh-4rem)] max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#1a3060] flex-shrink-0">
        <Link href="javascript:history.back()" className="text-[#8b9ab4] hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-white font-semibold text-sm">{order?.product ?? "Order Chat"}</p>
          <p className="text-[#8b9ab4] text-xs">{order?.order_number}</p>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-center gap-2 py-2 px-3 bg-[#0d1f35] border border-[#1a3060] rounded-xl my-3 flex-shrink-0">
        <ShieldCheck className="w-3.5 h-3.5 text-[#4f8eff] flex-shrink-0" />
        <p className="text-[#8b9ab4] text-xs">Never share personal phone numbers or payment outside LUI</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <p className="text-[#8b9ab4] text-sm text-center py-8">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === me?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                {!isMe && (
                  <span className="text-[#4f8eff] text-xs font-medium px-1">{msg.sender_name}</span>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? "bg-[#4361EE] text-white rounded-br-sm"
                    : "bg-[#0d1f35] border border-[#1a3060] text-white rounded-bl-sm"
                }`}>
                  {msg.body}
                </div>
                <span className="text-[#8b9ab4] text-[10px] px-1">
                  {new Date(msg.created_at).toLocaleTimeString("en-TZ", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex items-center gap-2 pt-3 border-t border-[#1a3060] flex-shrink-0">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 h-11 px-4 rounded-xl bg-[#0d1f35] border border-[#1a3060] text-white placeholder-[#4f8eff]/30 text-sm focus:outline-none focus:border-[#4361EE]"
        />
        <button type="submit" disabled={sending || !text.trim()}
          className="w-11 h-11 bg-[#4361EE] hover:bg-[#3451D1] text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
