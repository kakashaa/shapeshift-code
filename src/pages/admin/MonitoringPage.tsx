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
        <div className="px-4 space-y-3 mt-3">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.msg_id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -80 }}
                className={`glass-card p-4 ${msg.actioned ? "opacity-40" : ""}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-muted-foreground font-medium">{msg.time}</span>
                  <span className="text-[10px] bg-warning/10 text-warning px-2.5 py-1 rounded-lg font-semibold">
                    🔑 {msg.keyword}
                  </span>
                </div>

                {/* Users */}
                <div className="flex items-center gap-2 mb-3 text-[12px]">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={msg.sender_name} uuid={msg.sender_uuid} size="xs" />
                    <span className="font-medium">{msg.sender_name}</span>
                  </div>
                  <span className="text-muted-foreground text-[10px]">→</span>
                  <div className="flex items-center gap-2">
                    <UserAvatar name={msg.receiver_name} uuid={msg.receiver_uuid} size="xs" />
                    <span className="font-medium">{msg.receiver_name}</span>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-secondary/50 rounded-xl px-3 py-2.5 mb-3">
                  <p className="text-[11px] leading-relaxed text-muted-foreground">"{msg.message}"</p>
                </div>

                {/* Actions */}
                {msg.actioned ? (
                  <p className="text-[10px] text-destructive text-center font-medium">🚫 تم الحظر</p>
                ) : (
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleBan(msg)}
                      className="flex-1 h-9 rounded-xl bg-destructive/10 text-destructive text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-destructive/15">
                      <Ban className="w-3.5 h-3.5" /> حظر
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleIgnore(msg.msg_id)}
                      className="flex-1 h-9 rounded-xl bg-secondary/80 text-muted-foreground text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-secondary">
                      <X className="w-3.5 h-3.5" /> تجاهل
                    </motion.button>
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
