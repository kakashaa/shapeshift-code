import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Eye, Ban, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/UserAvatar";

export default function MonitoringPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try { const data = await api.suspiciousMessages(50); setMessages(data); } catch {
      setMessages([
        { msg_id: 1, sender_name: "أحمد", sender_uuid: "5432", receiver_name: "سارة", receiver_uuid: "8765", keyword: "شغف شات", message: "تعال على شغف شات حلو ومليان ناس", time: "10:20", actioned: false },
        { msg_id: 2, sender_name: "خالد", sender_uuid: "3333", receiver_name: "نوره", receiver_uuid: "4444", keyword: "واتساب", message: "أرسلي رقمك واتساب عشان نتواصل", time: "10:15", actioned: false },
        { msg_id: 3, sender_name: "فهد", sender_uuid: "7777", receiver_name: "منى", receiver_uuid: "8888", keyword: "تلجرام", message: "عندي قروب تلجرام تعالي", time: "09:50", actioned: false },
      ]);
    } finally { setLoading(false); }
  };

  const handleBan = async (msg: any) => {
    if (!confirm(`حظر ${msg.sender_name} (${msg.sender_uuid})؟`)) return;
    try { await api.banUser(msg.sender_uuid, "ترويج"); } catch {}
    setMessages(prev => prev.map(m => m.msg_id === msg.msg_id ? { ...m, actioned: true, action_by: "أدمن" } : m));
    toast({ title: `تم حظر ${msg.sender_name}` });
  };

  const handleIgnore = (msgId: number) => {
    try { api.ignoreMessage(msgId); } catch {}
    setMessages(prev => prev.filter(m => m.msg_id !== msgId));
  };

  return (
    <div className="pb-20">
      <PageHeader title="المراقبة" subtitle="رسائل مشبوهة" />
      {loading ? <CardSkeleton /> : messages.length === 0 ? (
        <EmptyState icon={Eye} title="لا توجد رسائل مشبوهة" description="كل شي نظيف 🎉" />
      ) : (
        <div className="px-3 space-y-2 mt-2">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.msg_id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -80 }}
                className={`bg-card/70 rounded-2xl p-3 border border-border/30 ${msg.actioned ? "opacity-50" : ""}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                  <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full font-medium">🔑 {msg.keyword}</span>
                </div>

                {/* Users */}
                <div className="flex items-center gap-2 mb-2 text-[12px]">
                  <div className="flex items-center gap-1.5">
                    <UserAvatar name={msg.sender_name} uuid={msg.sender_uuid} size="xs" />
                    <span>{msg.sender_name}</span>
                  </div>
                  <span className="text-muted-foreground text-[10px]">→</span>
                  <div className="flex items-center gap-1.5">
                    <UserAvatar name={msg.receiver_name} uuid={msg.receiver_uuid} size="xs" />
                    <span>{msg.receiver_name}</span>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-background/50 rounded-lg px-2.5 py-2 mb-2.5">
                  <p className="text-[11px] leading-relaxed text-muted-foreground">"{msg.message}"</p>
                </div>

                {/* Actions */}
                {msg.actioned ? (
                  <p className="text-[10px] text-destructive text-center">🚫 تم الحظر</p>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => handleBan(msg)} className="flex-1 h-8 rounded-lg bg-destructive/15 text-destructive text-[11px] font-medium active:scale-[0.96] transition-transform flex items-center justify-center gap-1">
                      <Ban className="w-3.5 h-3.5" /> حظر
                    </button>
                    <button onClick={() => handleIgnore(msg.msg_id)} className="flex-1 h-8 rounded-lg bg-secondary text-muted-foreground text-[11px] font-medium active:scale-[0.96] transition-transform flex items-center justify-center gap-1">
                      <X className="w-3.5 h-3.5" /> تجاهل
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
