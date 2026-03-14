import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, DollarSign, Headphones, AlertTriangle, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { StatsSkeleton } from "@/components/LoadingSkeleton";

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([api.dashboardStats(), api.activityFeed(20)]);
      setStats(s);
      setActivities(a);
    } catch {
      // Mock data for demo
      setStats({ online: 234, charges_today: 1250, open_support: 3, new_reports: 2 });
      setActivities([
        { type: "support", text: "تذكرة دعم جديدة من محمد", time: "10:30", link: "#" },
        { type: "charge", text: "شحنة $100 من وكيل → سارة", time: "10:25", link: "#" },
        { type: "monitor", text: "رسالة مشبوهة: \"شغف شات\"", time: "10:20", link: "#" },
        { type: "report", text: "بلاغ جديد على خالد", time: "10:15", link: "#" },
        { type: "action", text: "ناز حظر UUID 5678", time: "10:10", link: "#" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { icon: Users, label: "أونلاين الآن", value: stats.online, color: "text-success", path: "#" },
    { icon: DollarSign, label: "شحنات اليوم", value: `$${stats.charges_today.toLocaleString()}`, color: "text-primary", path: "/finance" },
    { icon: Headphones, label: "دعم مفتوح", value: stats.open_support, color: "text-warning", path: "/support", badge: stats.open_support },
    { icon: AlertTriangle, label: "بلاغات جديدة", value: stats.new_reports, color: "text-destructive", path: "/more/reports", badge: stats.new_reports },
  ] : [];

  const getActivityIcon = (type: string) => {
    const map: Record<string, string> = { support: "🎧", charge: "💰", monitor: "👁", report: "🚨", action: "✅" };
    return map[type] || "📌";
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <button className="relative p-2">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <div className="text-left">
            <p className="text-sm text-muted-foreground">مرحباً</p>
            <p className="font-bold">{name || "أدمن"}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
            {(name || "A")[0]}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4">
          {statCards.map((card, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(card.path)}
              className="bg-card rounded-2xl p-4 text-right relative active:scale-[0.97] transition-transform"
            >
              {card.badge && card.badge > 0 && (
                <span className="absolute top-3 left-3 min-w-[20px] h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 badge-pulse">
                  {card.badge}
                </span>
              )}
              <card.icon className={`w-7 h-7 ${card.color} mb-2`} />
              <p className="text-2xl font-black">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </motion.button>
          ))}
        </div>
      )}

      {/* Activity Feed */}
      <div className="px-4 mt-2">
        <h2 className="text-base font-bold mb-3">آخر الأحداث</h2>
        <div className="space-y-2">
          {activities.map((act, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="bg-card rounded-xl p-3 flex items-start gap-3 active:bg-secondary transition-colors"
            >
              <span className="text-lg mt-0.5">{getActivityIcon(act.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed">{act.text}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{act.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
