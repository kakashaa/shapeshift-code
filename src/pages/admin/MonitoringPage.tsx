import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Eye, ShieldOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function MonitoringPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try {
      const data = await api.suspiciousMessages(50);
      setMessages(data);
    } catch {
      setMessages([
        { msg_id: 1, sender_name: "أحمد", sender_uuid: "5432", receiver_name: "سارة", receiver_uuid: "8765", keyword: "شغف شات", message: "تعال على شغف شات حلو ومليان ناس", time: "10:20", actioned: false },
        { msg_id: 2, sender_name: "خالد", sender_uuid: "3333", receiver_name: "نوره", receiver_uuid: "4444", keyword: "واتساب", message: "أرسلي رقمك واتساب", time: "10:15", actioned: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (msg: any) => {
    if (!confirm(`هل تريد حظر ${msg.sender_name} (UUID: ${msg.sender_uuid})؟`)) return;
    try {
      await api.banUser(msg.sender_uuid, "ترويج لتطبيق منافس");
    } catch {}
    setMessages(prev => prev.map(m => m.msg_id === msg.msg_id ? { ...m, actioned: true, action_by: "أدمن" } : m));
    toast({ title: `تم حظر ${msg.sender_name}` });
  };

  const handleIgnore = (msgId: number) => {
    try { api.ignoreMessage(msgId); } catch {}
    setMessages(prev => prev.filter(m => m.msg_id !== msgId));
  };

  return (
    <div className="pb-20">
      <PageHeader title="مراقبة الرسائل" subtitle="رسائل مشبوهة" />

      {loading ? <CardSkeleton /> : messages.length === 0 ? (
        <EmptyState icon={Eye} title="لا توجد رسائل مشبوهة" description="كل شي نظيف حالياً 🎉" />
      ) : (
        <div className="p-4 space-y-3">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.msg_id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`bg-card rounded-2xl p-4 space-y-3 ${msg.actioned ? "opacity-60 border border-destructive/30" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-warning" />
                  <span className="text-sm font-bold">رسالة مشبوهة</span>
                  <span className="text-xs text-muted-foreground mr-auto">{msg.time}</span>
                </div>

                <div className="space-y-1 text-sm">
                  <p>📤 {msg.sender_name} <span className="text-muted-foreground">(UUID: {msg.sender_uuid})</span></p>
                  <p>📥 → {msg.receiver_name} <span className="text-muted-foreground">(UUID: {msg.receiver_uuid})</span></p>
                  <p className="text-xs"><span className="bg-warning/20 text-warning px-2 py-0.5 rounded-full">🔑 {msg.keyword}</span></p>
                </div>

                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-sm leading-relaxed">"{msg.message}"</p>
                </div>

                {msg.actioned ? (
                  <p className="text-xs text-destructive">🚫 حظره: {msg.action_by}</p>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => handleBan(msg)} className="flex-1 h-10 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium active:scale-[0.97] transition-transform flex items-center justify-center gap-1">
                      <ShieldOff className="w-4 h-4" /> حظر المرسل
                    </button>
                    <button onClick={() => handleIgnore(msg.msg_id)} className="flex-1 h-10 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium active:scale-[0.97] transition-transform">
                      👀 تجاهل
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
