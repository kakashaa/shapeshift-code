import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, ArrowRight, MoreVertical, CheckCheck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { UserAvatar } from "@/components/UserAvatar";

interface TicketMessage {
  id: string;
  message: string;
  sender_name: string;
  sender_type: string;
  created_at: string;
  attachment_url: string | null;
}

interface TicketInfo {
  id: string;
  user_name: string;
  user_uuid: string;
  subject: string;
  status: string;
}

export default function SupportChatPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const { name } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadTicket(); }, [ticketId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!ticketId) return;
    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "ticket_messages",
        filter: `ticket_id=eq.${ticketId}`,
      }, (payload) => {
        const newMsg = payload.new as TicketMessage;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [ticketId]);

  const loadTicket = async () => {
    if (!ticketId) return;
    setLoading(true);

    // Load ticket info
    const { data: ticketData } = await supabase
      .from("support_tickets" as any)
      .select("id, user_name, user_uuid, subject, status")
      .eq("id", ticketId)
      .single();

    if (ticketData) setTicket(ticketData as any);

    // Load messages
    const { data: msgData } = await supabase
      .from("ticket_messages" as any)
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    setMessages((msgData as any) || []);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !ticketId) return;
    setSending(true);
    const msg = input;
    setInput("");

    const { error } = await supabase
      .from("ticket_messages" as any)
      .insert({
        ticket_id: ticketId,
        message: msg,
        sender_name: name || "أدمن",
        sender_type: "admin",
      });

    if (error) {
      toast({ title: "خطأ في الإرسال", variant: "destructive" });
      setInput(msg);
    }

    // Also update the ticket's admin_username
    await supabase
      .from("support_tickets" as any)
      .update({ admin_username: name || "أدمن", updated_at: new Date().toISOString() })
      .eq("id", ticketId);

    setSending(false);
    inputRef.current?.focus();
  };

  const handleClose = async () => {
    setShowMenu(false);
    if (!ticketId) return;

    const { error } = await supabase
      .from("support_tickets" as any)
      .update({ status: "closed", updated_at: new Date().toISOString() })
      .eq("id", ticketId);

    if (error) {
      toast({ title: "خطأ", variant: "destructive" });
      return;
    }
    toast({ title: "✅ تم إغلاق التذكرة" });
    navigate(-1);
  };

  if (loading || !ticket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs text-muted-foreground">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  };

  const groupedMessages = messages.map((msg, i) => {
    const next = messages[i + 1];
    const isLast = !next || next.sender_type !== msg.sender_type;
    return { ...msg, isLast };
  });

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-3 py-2.5 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-1 -mr-1 rounded-full hover:bg-secondary transition-colors">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <UserAvatar name={ticket.user_name} uuid={ticket.user_uuid} size="sm" online={ticket.status === "open"} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">{ticket.user_name}</h3>
          <p className="text-[10px] text-muted-foreground truncate">{ticket.subject}</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-40 min-w-[140px] overflow-hidden"
                >
                  <button onClick={handleClose} className="w-full px-4 py-2.5 text-xs text-destructive hover:bg-secondary flex items-center gap-2 transition-colors">
                    <X className="w-3.5 h-3.5" />
                    إغلاق التذكرة
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto relative" style={{ background: "hsl(var(--background))" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative p-3 space-y-1 pb-4">
          <div className="flex justify-center my-3">
            <span className="bg-card/80 backdrop-blur-sm text-[10px] text-muted-foreground px-3 py-1 rounded-full border border-border/50">اليوم</span>
          </div>
          {groupedMessages.map((msg, i) => {
            const isAdmin = msg.sender_type === "admin";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
              >
                <div className={`relative max-w-[78%] px-3 py-2 ${
                  isAdmin
                    ? "bg-primary text-primary-foreground rounded-t-2xl rounded-bl-sm rounded-br-2xl"
                    : "bg-card text-foreground rounded-t-2xl rounded-br-sm rounded-bl-2xl border border-border/50"
                } ${!msg.isLast ? "mb-0.5" : "mb-1"}`}>
                  {isAdmin && msg.sender_name && (
                    <p className="text-[10px] font-semibold text-primary-foreground/70 mb-0.5">{msg.sender_name}</p>
                  )}
                  <p className="text-[13px] leading-relaxed">{msg.message}</p>
                  {msg.attachment_url && (
                    <a href={msg.attachment_url} target="_blank" rel="noopener" className="text-[10px] underline mt-1 block">
                      📎 مرفق
                    </a>
                  )}
                  <div className={`flex items-center justify-end gap-1 mt-0.5 ${isAdmin ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                    <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                    {isAdmin && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
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
            disabled={!input.trim() || sending}
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
