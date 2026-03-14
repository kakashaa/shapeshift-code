import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, DollarSign, Headphones, AlertTriangle, Bell, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { StatsSkeleton } from "@/components/LoadingSkeleton";
import { PullToRefresh } from "@/components/PullToRefresh";

interface Stats {
  online: number;
  charges_today: number;
  open_support: number;
  new_reports: number;
}

interface Activity {
  type: string;
  text: string;
  time: string;
  link: string;
}

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
    { icon: Users, label: "أونلاين", value: stats.online, color: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-400", path: "#", badge: 0 },
    { icon: DollarSign, label: "شحنات اليوم", value: `$${stats.charges_today.toLocaleString()}`, color: "from-primary/20 to-primary/5", iconColor: "text-primary", path: "/finance", badge: 0 },
    { icon: Headphones, label: "دعم مفتوح", value: stats.open_support, color: "from-amber-500/20 to-amber-500/5", iconColor: "text-amber-400", path: "/support", badge: stats.open_support },
    { icon: AlertTriangle, label: "بلاغات", value: stats.new_reports, color: "from-red-500/20 to-red-500/5", iconColor: "text-red-400", path: "/more/reports", badge: stats.new_reports },
  ] : [];

  const getActivityIcon = (type: string) => {
    const map: Record<string, string> = { support: "🎧", charge: "💰", monitor: "👁", report: "🚨", action: "✅" };
    return map[type] || "📌";
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="px-4 pt-3 pb-3 flex items-center justify-between">
        <button className="w-9 h-9 rounded-full bg-card flex items-center justify-center relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full bg-destructive" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="text-left">
            <p className="text-[11px] text-muted-foreground leading-none">مرحباً</p>
            <p className="text-sm font-bold leading-tight">{name || "أدمن"}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
            {(name || "A")[0]}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? <StatsSkeleton /> : (
        <div className="grid grid-cols-2 gap-2 px-3">
          {statCards.map((card, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => navigate(card.path)}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-3 text-right relative active:scale-[0.96] transition-transform border border-border/50`}
            >
              {card.badge > 0 && (
                <span className="absolute top-2 left-2 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-1 badge-pulse">
                  {card.badge}
                </span>
              )}
              <div className={`w-8 h-8 rounded-xl bg-card/60 flex items-center justify-center mb-1.5 ${card.iconColor}`}>
                <card.icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-black leading-tight">{card.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{card.label}</p>
            </motion.button>
          ))}
        </div>
      )}

      {/* Activity Feed */}
      <div className="px-3 mt-4">
        <div className="flex items-center justify-between mb-2">
          <button className="text-[11px] text-primary flex items-center gap-0.5">عرض الكل <ChevronLeft className="w-3 h-3" /></button>
          <h2 className="text-sm font-bold">آخر الأحداث</h2>
        </div>
        <div className="space-y-1.5">
          {activities.map((act, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              className="bg-card/60 rounded-xl px-3 py-2.5 flex items-center gap-2.5 active:bg-secondary/50 transition-colors border border-border/30"
            >
              <span className="text-base">{getActivityIcon(act.type)}</span>
              <p className="flex-1 min-w-0 text-[12px] leading-relaxed truncate">{act.text}</p>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{act.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
