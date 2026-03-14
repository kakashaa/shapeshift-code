import { useState, useEffect } from "react";
import { Send, Bell, History, Filter, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { adminAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { getCategoryLabel } from "@/hooks/useNotifications";

interface AdminNotification {
  id: string;
  category: string;
  title: string;
  body: string;
  time: string;
  is_read: boolean;
  extra?: Record<string, any>;
}

const CATEGORIES = [
  { key: "all", label: "الكل", emoji: "📋" },
  { key: "eid_prize", label: "حدث العيد", emoji: "🎉" },
  { key: "big_charge", label: "شحنات كبيرة", emoji: "💰" },
  { key: "big_gift", label: "هدايا كبيرة", emoji: "🎁" },
  { key: "ban", label: "حظر", emoji: "🚫" },
  { key: "vip", label: "VIP", emoji: "⭐" },
  { key: "id_change", label: "تغيير آيدي", emoji: "🔄" },
  { key: "new_user", label: "مستخدمين جدد", emoji: "👤" },
  { key: "support", label: "دعم", emoji: "🎧" },
  { key: "system", label: "نظام", emoji: "⚙️" },
];

export default function NotificationsPage() {
  const [tab, setTab] = useState<"alerts" | "send" | "history">("alerts");
  const [sendTab, setSendTab] = useState<"dm" | "broadcast">("dm");
  const [uuid, setUuid] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (selectedCategory !== "all") params.category = selectedCategory;
      const res = await adminAPI("admin_notifications", params);
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadUnreadCounts = async () => {
    try {
      const res = await adminAPI("admin_notifications_unread");
      if (res.success) {
        setUnreadCounts(res.by_category || {});
      }
    } catch {}
  };

  useEffect(() => {
    if (tab === "alerts") {
      loadNotifications();
      loadUnreadCounts();
    }
  }, [tab, selectedCategory]);

  // Auto-refresh every 15s
  useEffect(() => {
    if (tab !== "alerts") return;
    const interval = setInterval(() => {
      loadNotifications();
      loadUnreadCounts();
    }, 15000);
    return () => clearInterval(interval);
  }, [tab, selectedCategory]);

  const markAsRead = async (id: string) => {
    await adminAPI("admin_notification_read", { notification_id: id });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    loadUnreadCounts();
  };

  const markAllAsRead = async () => {
    const params: any = {};
    if (selectedCategory !== "all") params.category = selectedCategory;
    await adminAPI("admin_notifications_read_all", params);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    loadUnreadCounts();
    toast({ title: "✅ تم قراءة الكل" });
  };

  const handleSendDM = async () => {
    if (!uuid || !message) return;
    setSending(true);
    try {
      const res = await adminAPI("send_dm", { to_uuid: uuid, message });
      if (res.success) {
        toast({ title: "✅ تم إرسال الرسالة" });
        setUuid("");
        setMessage("");
      } else {
        toast({ title: "❌ فشل الإرسال", description: res.error || res.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "❌ خطأ", variant: "destructive" });
    }
    setSending(false);
  };

  const handleBroadcast = async () => {
    if (!message) return;
    setSending(true);
    try {
      const res = await adminAPI("broadcast", { message });
      if (res.success) {
        toast({ title: "✅ تم إرسال الإشعار العام" });
        setMessage("");
      } else {
        toast({ title: "❌ فشل", description: res.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "❌ خطأ", variant: "destructive" });
    }
    setSending(false);
  };

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `قبل ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `قبل ${hours} ساعة`;
    return date.toLocaleDateString("ar-SA");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="الإشعارات" />

      {/* Tabs */}
      <div className="flex gap-1 mx-4 mt-4 bg-card rounded-xl p-1">
        {[
          { key: "alerts", label: "التنبيهات", icon: Bell, badge: totalUnread },
          { key: "send", label: "إرسال", icon: Send },
          { key: "history", label: "السجل", icon: History },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
              tab === t.key ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.badge ? (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ALERTS TAB */}
      {tab === "alerts" && (
        <div className="px-4 mt-4 space-y-3">
          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => {
              const count = cat.key === "all" ? totalUnread : (unreadCounts[cat.key] || 0);
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === cat.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground border border-border"
                  }`}
                >
                  {cat.emoji} {cat.label}
                  {count > 0 && (
                    <span className="mr-1 bg-red-500/20 text-red-400 px-1 rounded-full text-[10px]">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mark all as read */}
          {totalUnread > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              تعيين الكل كمقروء
            </button>
          )}

          {/* Notifications list */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد إشعارات</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    notif.is_read
                      ? "bg-card/50 border-border/50 opacity-70"
                      : "bg-card border-primary/30 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {getCategoryLabel(notif.category)}
                        </span>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.body}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatTime(notif.time)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* SEND TAB */}
      {tab === "send" && (
        <div className="px-4 mt-4 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSendTab("dm")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                sendTab === "dm" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
              }`}
            >
              📩 رسالة خاصة
            </button>
            <button
              onClick={() => setSendTab("broadcast")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                sendTab === "broadcast" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
              }`}
            >
              📢 إشعار عام
            </button>
          </div>

          {sendTab === "dm" && (
            <input
              type="text"
              value={uuid}
              onChange={e => setUuid(e.target.value)}
              placeholder="UUID المستخدم"
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm"
              dir="ltr"
            />
          )}

          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="نص الرسالة..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm resize-none"
          />

          <button
            onClick={sendTab === "dm" ? handleSendDM : handleBroadcast}
            disabled={sending || !message || (sendTab === "dm" && !uuid)}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50"
          >
            {sending ? "جاري الإرسال..." : sendTab === "dm" ? "📩 إرسال رسالة خاصة" : "📢 إرسال إشعار عام"}
          </button>
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        <div className="px-4 mt-4">
          <HistoryTab />
        </div>
      )}
    </div>
  );
}

function HistoryTab() {
  const [log, setLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminAPI("notification_log", { limit: 50 });
        if (res.success) setLog(res.log || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;
  if (log.length === 0) return <div className="text-center py-8 text-muted-foreground">لا يوجد سجل</div>;

  return (
    <div className="space-y-2">
      {log.map((entry, i) => (
        <div key={i} className="p-3 bg-card rounded-xl border border-border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium">
                {entry.type === "broadcast" ? "📢 إشعار عام" : `📩 رسالة لـ ${entry.to_uuid}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{entry.message}</p>
            </div>
            <span className="text-[10px] text-muted-foreground">{entry.admin_name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
