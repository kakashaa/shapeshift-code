import { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: Date;
  action?: string;
  link?: string;
  denied?: boolean;
}

const SUGGESTIONS = [
  "حساب UUID 80001",
  "كم شحنات اليوم؟",
  "من المسؤول الحالي؟",
  "من حظر UUID 12345",
  "راتب UUID 80001",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", text: "👋 مرحباً! أنا مدهش، المساعد الذكي.\n\nأقدر أساعدك في البحث عن المستخدمين، الرواتب، الشحنات، وأكثر.\n\nجرب تسألني أي سؤال!", time: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: question, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.aiAssistant(question);
      const resp = res.response || {};
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: resp.text || "عذراً، لم أفهم السؤال",
        time: new Date(),
        action: resp.action,
        link: resp.link,
        denied: resp.denied,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "❌ حدث خطأ، حاول مرة أخرى",
        time: new Date(),
      }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <PageHeader title="🤖 مدهش — المساعد الذكي" showBack />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-3">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : msg.denied
                    ? "bg-red-500/10 border border-red-500/20 text-foreground rounded-bl-md"
                    : "bg-card border border-border rounded-bl-md"
              }`}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-medium text-primary">مدهش</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                {msg.link && (
                  <button
                    onClick={() => navigate(msg.link!)}
                    className="mt-2 text-xs text-primary underline"
                  >
                    فتح الصفحة ←
                  </button>
                )}
                <p className="text-[10px] text-muted-foreground mt-1 text-left" dir="ltr">
                  {msg.time.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestions (show when few messages) */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setInput(s); }}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="اسأل مدهش..."
            className="flex-1 h-11 rounded-xl bg-secondary/80 border border-border/50 px-4 text-sm"
            dir="auto"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
