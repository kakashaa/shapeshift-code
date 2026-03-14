import { useState, useEffect } from "react";
import { Send, Bell, History } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  body: string;
  target: string;
  user_uuid: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<"send" | "history">("send");
  const [sendTab, setSendTab] = useState<"dm" | "broadcast">("dm");
  const [uuid, setUuid] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) console.error("Error loading notifications:", error);
    setNotifications(data || []);
    setLoadingHistory(false);
  };

  const handleSendDm = async () => {
    if (!uuid || !message || !title) {
      toast({ title: "أدخل البيانات كاملة", variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await supabase
      .from("notifications")
      .insert({
        title,
        body: message,
        target: "user",
        user_uuid: uuid,
      });

    if (error) {
      toast({ title: "خطأ في الإرسال", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ تم إرسال الإشعار" });
      setMessage("");
      setUuid("");
      setTitle("");
    }
    setSending(false);
  };

  const handleBroadcast = async () => {
    if (!message || !title) {
      toast({ title: "أدخل البيانات كاملة", variant: "destructive" });
      return;
    }
    if (!confirm("هل أنت متأكد؟ سيتم إرسالها لجميع المستخدمين")) return;
    setSending(true);
    const { error } = await supabase
      .from("notifications")
      .insert({
        title,
        body: message,
        target: "all",
        user_uuid: null,
      });

    if (error) {
      toast({ title: "خطأ في الإرسال", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ تم الإرسال للجميع" });
      setMessage("");
      setTitle("");
    }
    setSending(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar", { day: "numeric", month: "short" }) + " " +
      d.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="pb-20">
      <PageHeader title="الإشعارات" showBack />

      {/* Main tabs */}
      <div className="flex gap-2 p-4 pb-0">
        {([
          { key: "send", label: "إرسال", icon: Send },
          { key: "history", label: "السجل", icon: History },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 h-10 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
              tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "send" ? (
        <>
          <div className="flex gap-2 p-4 pb-0">
            {(["dm", "broadcast"] as const).map(t => (
              <button key={t} onClick={() => setSendTab(t)} className={`flex-1 h-10 rounded-xl text-sm font-medium transition-colors ${sendTab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {t === "dm" ? "رسالة خاصة" : "إشعار عام"}
              </button>
            ))}
          </div>
          <div className="p-4 space-y-4">
            {sendTab === "dm" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">UUID المستقبل</label>
                <input value={uuid} onChange={e => setUuid(e.target.value)} placeholder="أدخل UUID" className="w-full h-12 rounded-xl bg-secondary px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary" dir="ltr" />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">العنوان</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان الإشعار" className="w-full h-12 rounded-xl bg-secondary px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الرسالة</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="اكتب الرسالة..." rows={4} className="w-full rounded-xl bg-secondary p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            {sendTab === "broadcast" && <p className="text-xs text-warning text-center">⚠️ سيتم إرسال هذه الرسالة لجميع مستخدمي التطبيق</p>}
            <button onClick={sendTab === "dm" ? handleSendDm : handleBroadcast} disabled={sending} className="w-full h-12 rounded-xl font-bold text-primary-foreground active:scale-[0.97] transition-transform disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "var(--gradient-button)" }}>
              <Send className="w-4 h-4" /> {sending ? "جاري الإرسال..." : sendTab === "dm" ? "إرسال" : "إرسال للجميع"}
            </button>
          </div>
        </>
      ) : (
        <div className="p-4 space-y-2">
          {loadingHistory ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">لا توجد إشعارات</div>
          ) : (
            notifications.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card/70 rounded-xl p-3 border border-border/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">{formatDate(n.created_at)}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-semibold">{n.title}</span>
                    <Bell className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">{n.body}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    n.target === "all" ? "bg-warning/20 text-warning" : "bg-primary/10 text-primary"
                  }`}>
                    {n.target === "all" ? "عام" : `خاص: ${n.user_uuid}`}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
