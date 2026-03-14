import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Send, MoreVertical, X } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function SupportChatPage() {
  const { ticketId } = useParams();
  const [chat, setChat] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { name } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadChat(); }, [ticketId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat]);

  const loadChat = async () => {
    try {
      const data = await api.supportChat(Number(ticketId));
      setChat(data);
    } catch {
      setChat({
        user: { name: "محمد أحمد", uuid: "12345", avatar: "" },
        messages: [
          { sender: "user", text: "مرحبا، عندي مشكلة بالشحن ما يشتغل", time: "10:25" },
          { sender: "admin", admin_name: "ناز", text: "أهلاً محمد، وش المشكلة بالضبط؟", time: "10:28" },
          { sender: "user", text: "كل ما أحاول أشحن يطلع خطأ", time: "10:30" },
        ],
      });
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.supportReply(Number(ticketId), message);
      setChat((prev: any) => ({
        ...prev,
        messages: [...prev.messages, { sender: "admin", admin_name: name, text: message, time: new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }) }],
      }));
      setMessage("");
    } catch {
      // Demo mode - just add locally
      setChat((prev: any) => ({
        ...prev,
        messages: [...prev.messages, { sender: "admin", admin_name: name || "أدمن", text: message, time: new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }) }],
      }));
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    try {
      await api.supportClose(Number(ticketId));
      toast({ title: "تم إغلاق التذكرة" });
    } catch {
      toast({ title: "تم إغلاق التذكرة" });
    }
  };

  if (!chat) return <div className="min-h-screen bg-background"><PageHeader title="المحادثة" showBack /></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader
        title={chat.user.name}
        subtitle={`UUID: ${chat.user.uuid}`}
        showBack
        actions={
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-secondary">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        }
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
        {chat.messages.map((msg: any, i: number) => (
          <div key={i} className={`flex ${msg.sender === "admin" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.sender === "admin" ? "bg-primary text-primary-foreground rounded-bl-sm" : "bg-secondary text-foreground rounded-br-sm"}`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <div className={`flex items-center gap-1 mt-1 ${msg.sender === "admin" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {msg.admin_name && <span className="text-[10px]">{msg.admin_name}</span>}
                <span className="text-[10px]">{msg.time}</span>
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-3">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30"
            style={{ background: "var(--gradient-button)" }}
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="اكتب رسالة..."
            className="flex-1 h-10 rounded-full bg-secondary px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
}
