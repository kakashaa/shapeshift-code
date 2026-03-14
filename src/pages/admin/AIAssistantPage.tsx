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
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "rounded-br-md text-primary-foreground"
                  : msg.denied
                    ? "card-3d border-destructive/20 rounded-bl-md"
                    : "card-3d rounded-bl-md"
              }`}
                style={msg.role === "user" ? {
                  background: "var(--gradient-button)",
                  boxShadow: "0 4px 16px hsl(200 95% 48% / 0.25), inset 0 1px 0 hsl(0 0% 100% / 0.1)",
                } : undefined}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-5 h-5 rounded-lg icon-3d flex items-center justify-center">
                      <Bot className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-primary">مدهش</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</p>
                {msg.link && (
                  <button
                    onClick={() => navigate(msg.link!)}
                    className="mt-2 text-xs text-primary font-bold underline"
                  >
                    فتح الصفحة ←
                  </button>
                )}
                <p className="text-[10px] text-muted-foreground mt-1.5 text-left font-medium" dir="ltr">
                  {msg.time.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="card-3d rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {SUGGESTIONS.map(s => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setInput(s); }}
              className="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs card-3d font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {s}
            </motion.button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 nav-glass">
        <div className="flex gap-2.5">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="اسأل مدهش..."
            className="flex-1 h-12 rounded-xl bg-secondary/80 border border-border/50 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            dir="auto"
          />
          <motion.button
            whileTap={{ scale: 0.85, y: 2 }}
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-12 h-12 rounded-xl btn-3d text-primary-foreground flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}