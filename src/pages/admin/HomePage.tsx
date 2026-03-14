import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, DollarSign, Headphones, AlertTriangle, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { StatsSkeleton } from "@/components/LoadingSkeleton";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationCenter } from "@/components/NotificationCenter";

interface Stats { online: number; charges_today: number; open_support: number; new_reports: number; }
interface Activity { type: string; text: string; time: string; link: string; }

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { name } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([api.dashboardStats(), api.activityFeed(20)]);
      setStats(s);
      setActivities(Array.isArray(a) ? a : []);
    } catch {
      setStats({ online: 234, charges_today: 1250, open_support: 3, new_reports: 2 });
      setActivities([
        { type: "support", text: "تذكرة دعم جديدة من محمد", time: "10:30", link: "#" },
        { type: "charge", text: "شحنة $100 من وكيل → سارة", time: "10:25", link: "#" },
        { type: "monitor", text: "رسالة مشبوهة: \"شغف شات\"", time: "10:20", link: "#" },
        { type: "report", text: "بلاغ جديد على خالد", time: "10:15", link: "#" },
        { type: "action", text: "ناز حظر UUID 5678", time: "10:10", link: "#" },
      ]);
    } finally { setLoading(false); }
  };

  const statCards = stats ? [
    { icon: Users, label: "أونلاين", value: stats.online, accent: "text-success", bg: "bg-success/8", path: "#", badge: 0 },
    { icon: DollarSign, label: "شحنات اليوم", value: `$${stats.charges_today.toLocaleString()}`, accent: "text-primary", bg: "bg-primary/8", path: "/finance", badge: 0 },
    { icon: Headphones, label: "دعم مفتوح", value: stats.open_support, accent: "text-warning", bg: "bg-warning/8", path: "/support", badge: stats.open_support },
    { icon: AlertTriangle, label: "بلاغات", value: stats.new_reports, accent: "text-destructive", bg: "bg-destructive/8", path: "/more/reports", badge: stats.new_reports },
  ] : [];

  const activityIcons: Record<string, string> = { support: "🎧", charge: "💰", monitor: "👁", report: "🚨", action: "✅" };

  const handleRefresh = useCallback(async () => { await loadData(); }, []);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="pb-20">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/more/notifications")}
            className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center relative transition-all active:scale-90"
          >
            <Bell className="w-[18px] h-[18px] text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive badge-pulse" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className="text-[10px] text-muted-foreground leading-none">مرحباً بك</p>
              <p className="text-sm font-bold leading-tight">{name || "أدمن"}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}>
              {(name || "A")[0]}
            </div>
          </div>
        </div>

        {/* Stats */}
        {loading ? <StatsSkeleton /> : (
          <div className="grid grid-cols-2 gap-3 px-4">
            {statCards.map((card, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                onClick={() => navigate(card.path)}
                className="stat-card text-right active:scale-[0.97] transition-transform"
              >
                {card.badge > 0 && (
                  <span className="absolute top-3 left-3 min-w-[20px] h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1.5 badge-pulse">
                    {card.badge}
                  </span>
                )}
                <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-2`}>
                  <card.icon className={`w-[18px] h-[18px] ${card.accent}`} />
                </div>
                <p className="text-2xl font-bold leading-tight">{card.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{card.label}</p>
              </motion.button>
            ))}
          </div>
        )}

        {/* Activity Feed */}
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <button className="text-[11px] text-primary font-medium flex items-center gap-0.5 active:opacity-70">
              عرض الكل <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <h2 className="text-[13px] font-bold">آخر الأحداث</h2>
          </div>
          <div className="space-y-2">
            {activities.map((act, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                className="glass-card-hover px-3.5 py-3 flex items-center gap-3"
              >
                <span className="text-base shrink-0">{activityIcons[act.type] || "📌"}</span>
                <p className="flex-1 min-w-0 text-[12px] leading-relaxed truncate">{act.text}</p>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium">{act.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}
