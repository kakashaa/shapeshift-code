import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";

const adminColors = ["text-primary", "text-success", "text-warning", "text-pink-400", "text-cyan-400"];

export default function AdminChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const { name } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const loadMessages = async () => {
    try {
      const data = await api.adminChat(0, 100);
      setMessages(data);
    } catch {
      if (messages.length === 0) {
        setMessages([
          { id: 1, admin_name: "ناز", message: "يا شباب حظروا 5678 يروج لتطبيق ثاني", time: "10:25" },
          { id: 2, admin_name: "جنجون", message: "تم الحظر ✅", time: "10:28" },
          { id: 3, admin_name: "مارس", message: "أنا بأراجع البلاغات الجديدة", time: "10:30" },
        ]);
      }
    }
  };

  const getColor = (adminName: string) => {
    const hash = adminName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return adminColors[hash % adminColors.length];
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input;
    setInput("");
    const newMsg = { id: Date.now(), admin_name: name || "أدمن", message: msg, time: new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, newMsg]);
    try { await api.adminChatSend(msg); } catch {}
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="💬 شات الأدمنز" showBack />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
        {messages.map(msg => (
          <div key={msg.id} className="space-y-1">
            <span className={`text-xs font-medium ${getColor(msg.admin_name)}`}>{msg.admin_name}</span>
            <div className="bg-card rounded-2xl rounded-tr-sm px-4 py-2.5">
              <p className="text-sm leading-relaxed">{msg.message}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-3">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <button onClick={handleSend} disabled={!input.trim()} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30" style={{ background: "var(--gradient-button)" }}>
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="اكتب رسالة..." className="flex-1 h-10 rounded-full bg-secondary px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>
    </div>
  );
}
