import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, ArrowRight, CheckCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { UserAvatar } from "@/components/UserAvatar";

interface ChatMessage {
  id: string;
  admin_name: string;
  message: string;
  created_at: string;
}

// We'll use the support_chat_messages table with a special chat_id for admin chat
const ADMIN_CHAT_ID = "admin-group-chat";

export default function AdminChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const { name } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();

    // Real-time subscription
    const channel = supabase
      .channel("admin-chat")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "support_chat_messages",
        filter: `chat_id=eq.${ADMIN_CHAT_ID}`,
      }, (payload) => {
        const msg = payload.new as any;
        const newMsg: ChatMessage = {
          id: msg.id,
          admin_name: msg.sender_name,
          message: msg.message,
          created_at: msg.created_at,
        };
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from("support_chat_messages")
      .select("*")
      .eq("chat_id", ADMIN_CHAT_ID)
      .order("created_at", { ascending: true })
      .limit(200);

    if (data) {
      setMessages(data.map(m => ({
        id: m.id,
        admin_name: m.sender_name,
        message: m.message,
        created_at: m.created_at,
      })));
    }
    if (error) console.error("Error loading admin chat:", error);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input;
    setInput("");

    // Optimistic add
    const tempId = `temp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      admin_name: name || "أدمن",
      message: msg,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);

    const { error } = await supabase
      .from("support_chat_messages")
      .insert({
        chat_id: ADMIN_CHAT_ID,
        message: msg,
        sender_name: name || "أدمن",
        sender_type: "admin",
        sender_uuid: "admin",
      });

    if (error) {
      console.error("Error sending:", error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }

    inputRef.current?.focus();
  };

  const isMe = (adminName: string) => adminName === (name || "أدمن");

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  };

  // Group consecutive messages from same sender
  const groupedMessages = messages.map((msg, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const isFirst = !prev || prev.admin_name !== msg.admin_name;
    const isLast = !next || next.admin_name !== msg.admin_name;
    return { ...msg, isFirst, isLast };
  });

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-3 py-2.5 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-1 -mr-1 rounded-full hover:bg-secondary transition-colors">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-accent flex items-center justify-center shrink-0">
          <Users className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">شات الأدمنز</h3>
          <p className="text-[10px] text-muted-foreground">مجموعة الإدارة • مباشر</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto relative" style={{ background: "hsl(var(--background))" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative p-3 space-y-0.5 pb-4">
          <div className="flex justify-center my-3">
            <span className="bg-card/80 backdrop-blur-sm text-[10px] text-muted-foreground px-3 py-1 rounded-full border border-border/50">
              اليوم
            </span>
          </div>

          {groupedMessages.map((msg, i) => {
            const mine = isMe(msg.admin_name);

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: Math.min(i * 0.02, 0.5) }}
                className={`flex items-end gap-1.5 ${msg.isLast ? "mb-2" : "mb-0.5"}`}
              >
                <div className="w-7 shrink-0">
                  {msg.isLast ? (
                    <UserAvatar name={msg.admin_name} size="xs" />
                  ) : null}
                </div>

                <div className={`relative max-w-[78%] px-3 py-2 bg-card border border-border/50 ${
                  msg.isFirst && msg.isLast
                    ? "rounded-2xl rounded-br-sm"
                    : msg.isFirst
                    ? "rounded-t-2xl rounded-bl-2xl rounded-br-sm"
                    : msg.isLast
                    ? "rounded-b-2xl rounded-bl-2xl rounded-tr-sm"
                    : "rounded-l-2xl rounded-r-sm"
                }`}>
                  {msg.isFirst && (
                    <p className="text-[10px] font-bold mb-0.5 text-primary">
                      {msg.admin_name}
                      {mine && " (أنت)"}
                    </p>
                  )}
                  <p className="text-[13px] leading-relaxed text-foreground">{msg.message}</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{formatTime(msg.created_at)}</span>
                    {mine && <CheckCheck className="w-3 h-3 text-primary/60" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="bg-card/95 backdrop-blur-sm border-t border-border px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] mb-14">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-secondary rounded-2xl flex items-end">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="اكتب رسالة..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm focus:outline-none min-h-[40px] placeholder:text-muted-foreground"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 transition-all"
            style={{ background: "var(--gradient-button)" }}
          >
            <Send className="w-4 h-4 text-primary-foreground rtl:-scale-x-100" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
