import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, DollarSign, Headphones, AlertTriangle, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
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
  const [badges, setBadges] = useState({ reports: 0, vip: 0, store: 0, support: 0 });
  const navigate = useNavigate();
  const { name } = useAuth();
  const {
    notifications, unreadCount, markAsRead, markAllAsRead, clearAll,
    permissionGranted, enableBrowserNotifications,
  } = useNotifications();

  useEffect(() => { loadData(); loadBadges(); }, []);

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

  const loadBadges = async () => {
    try {
      const [
        { count: reportsCount },
        { count: vipCount },
        { count: supportCount },
        { count: animatedCount },
        { count: customGiftCount },
      ] = await Promise.all([
        supabase.from("ban_reports" as any).select("*", { count: "exact", head: true }).eq("is_verified", false),
        supabase.from("vip_requests" as any).select("*", { count: "exact", head: true }),
        supabase.from("support_tickets" as any).select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("animated_photo_requests" as any).select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("custom_gifts" as any).select("*", { count: "exact", head: true }).eq("status", "pending").eq("is_deleted", false),
      ]);

      setBadges({
        reports: reportsCount || 0,
        vip: vipCount || 0,
        support: supportCount || 0,
        store: (animatedCount || 0) + (customGiftCount || 0),
      });
    } catch (err) {
      console.error("Error loading badges:", err);
    }
  };

  const statCards = stats ? [
    { icon: Users, label: "أونلاين", value: stats.online, accent: "text-success", gradient: "from-success/15 to-success/5", iconBg: "bg-success/12", path: "#", badge: 0 },
    { icon: DollarSign, label: "شحنات اليوم", value: `$${stats.charges_today.toLocaleString()}`, accent: "text-primary", gradient: "from-primary/15 to-primary/5", iconBg: "bg-primary/12", path: "/finance", badge: 0 },
    { icon: Headphones, label: "دعم مفتوح", value: badges.support || stats.open_support, accent: "text-warning", gradient: "from-warning/15 to-warning/5", iconBg: "bg-warning/12", path: "/support", badge: badges.support || stats.open_support },
    { icon: AlertTriangle, label: "بلاغات", value: badges.reports || stats.new_reports, accent: "text-destructive", gradient: "from-destructive/15 to-destructive/5", iconBg: "bg-destructive/12", path: "/more/reports", badge: badges.reports || stats.new_reports },
  ] : [];

  const activityIcons: Record<string, string> = { support: "🎧", charge: "💰", monitor: "👁", report: "🚨", action: "✅" };

  const handleRefresh = useCallback(async () => { await Promise.all([loadData(), loadBadges()]); }, []);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="pb-24">
        {/* Header */}
        <div className="px-4 pt-5 pb-4 flex items-center justify-between">
          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClear={clearAll}
            permissionGranted={permissionGranted}
            onEnableBrowser={enableBrowserNotifications}
          />
          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className="text-[10px] text-muted-foreground leading-none font-medium">مرحباً بك</p>
              <p className="text-sm font-black leading-tight mt-0.5">{name || "أدمن"}</p>
            </div>
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-primary-foreground relative"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "0 4px 16px hsl(200 95% 48% / 0.25), inset 0 1px 0 hsl(0 0% 100% / 0.15)",
              }}
            >
              {(name || "A")[0]}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-background" />
            </motion.div>
          </div>
        </div>

        {/* Stats with 3D cards */}
        {loading ? <StatsSkeleton /> : (
          <div className="grid grid-cols-2 gap-3 px-4 perspective-grid">
            {statCards.map((card, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileTap={{ scale: 0.95, y: 3 }}
                onClick={() => navigate(card.path)}
                className="card-3d p-4 text-right relative overflow-hidden"
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none rounded-2xl`} />
                {/* Top highlight */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent pointer-events-none" />
                
                {card.badge > 0 && (
                  <span className="absolute top-3 left-3 min-w-[20px] h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1.5 badge-pulse"
                    style={{ boxShadow: "0 2px 8px hsl(0 72% 52% / 0.4)" }}>
                    {card.badge}
                  </span>
                )}
                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-2.5 icon-3d`}
                    style={{ background: undefined }}>
                    <card.icon className={`w-[18px] h-[18px] ${card.accent}`} />
                  </div>
                  <p className="text-2xl font-black leading-tight tracking-tight">{card.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 font-medium">{card.label}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Activity Feed */}
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <button className="text-[11px] text-primary font-semibold flex items-center gap-0.5 active:opacity-70">
              عرض الكل <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <h2 className="text-[13px] font-bold">آخر الأحداث</h2>
          </div>
          <div className="space-y-2">
            {activities.map((act, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="card-3d px-4 py-3.5 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl icon-3d flex items-center justify-center text-sm shrink-0">
                  {activityIcons[act.type] || "📌"}
                </div>
                <p className="flex-1 min-w-0 text-[12px] leading-relaxed truncate font-medium">{act.text}</p>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap font-semibold">{act.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}