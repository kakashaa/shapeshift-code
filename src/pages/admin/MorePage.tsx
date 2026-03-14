import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, MessageSquare, AlertTriangle, Star, ShoppingBag, User, ArrowRightLeft, UserPlus, ClipboardList, Settings, LogOut, ChevronLeft, Sun, Moon, BarChart2, Bot, Users, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function MorePage() {
  const navigate = useNavigate();
  const { logout, isOwner, isSuperAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [badges, setBadges] = useState<any>({});

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const [
        { count: reportsCount },
        { count: vipCount },
        { count: animatedCount },
        { count: customGiftCount },
      ] = await Promise.all([
        supabase.from("ban_reports" as any).select("*", { count: "exact", head: true }).eq("is_verified", false),
        supabase.from("vip_requests" as any).select("*", { count: "exact", head: true }),
        supabase.from("animated_photo_requests" as any).select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("custom_gifts" as any).select("*", { count: "exact", head: true }).eq("status", "pending").eq("is_deleted", false),
      ]);

      setBadges({
        reports: reportsCount || 0,
        vip: vipCount || 0,
        store: (animatedCount || 0) + (customGiftCount || 0),
        admin_chat_unread: 0,
      });
    } catch {
      setBadges({ reports: 0, vip: 0, store: 0, admin_chat_unread: 0 });
    }
  };

  const items = [
    { icon: Bell, label: "إرسال إشعار", path: "/more/notifications", badge: 0, color: "text-primary" },
    { icon: Search, label: "مراجعة الدعم", path: "/more/gift-audit", badge: 0, color: "text-accent" },
    { icon: MessageSquare, label: "شات الأدمنز", path: "/more/admin-chat", badge: badges.admin_chat_unread, color: "text-success" },
    { icon: AlertTriangle, label: "البلاغات", path: "/more/reports", badge: badges.reports, color: "text-destructive" },
    { icon: Star, label: "طلبات VIP", path: "/more/vip", badge: badges.vip, color: "text-warning" },
    { icon: ShoppingBag, label: "طلبات المتجر", path: "/more/store", badge: badges.store, color: "text-primary" },
    { icon: User, label: "بحث مستخدم", path: "/more/user-search", badge: 0, color: "text-accent" },
    { icon: ArrowRightLeft, label: "طلبات تغيير آيدي", path: "/more/id-change", badge: 0, color: "text-success" },
    { icon: UserPlus, label: "تسجيلات جديدة", path: "/more/registrations", badge: 0, color: "text-primary" },
    { icon: ClipboardList, label: "سجل الإجراءات", path: "/more/activity-log", badge: 0, color: "text-warning" },
    { icon: Settings, label: "الإعدادات", path: "/more/settings", badge: 0, color: "text-muted-foreground" },
    { icon: BarChart2, label: "الإحصائيات", path: "/more/analytics", badge: 0, color: "text-accent" },
    { icon: Bot, label: "المساعد الذكي — مدهش", path: "/more/ai-assistant", badge: 0, color: "text-primary" },
    ...(isOwner() ? [
      { icon: Users, label: "إدارة الأدمن", path: "/more/admin-management", badge: 0, color: "text-warning" },
      { icon: Trash2, label: "سلة المحذوفات", path: "/more/trash", badge: 0, color: "text-destructive" },
    ] : []),
  ];

  const handleLogout = () => {
    if (confirm("تسجيل خروج؟")) { logout(); navigate("/login"); }
  };

  return (
    <div className="pb-24">
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl icon-3d transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="w-4.5 h-4.5 text-warning" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-primary" />
          )}
        </motion.button>
        <h1 className="text-[16px] font-black tracking-tight">المزيد</h1>
      </div>

      <div className="px-4 space-y-2">
        {items.map((item, i) => (
          <motion.button
            key={item.path}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.97, y: 2 }}
            onClick={() => navigate(item.path)}
            className="w-full card-3d flex items-center gap-3 px-4 py-3.5 text-right"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground/40" />
            <span className="flex-1 text-[13px] font-semibold">{item.label}</span>
            {item.badge > 0 && (
              <span className="min-w-[20px] h-5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-1.5 badge-pulse"
                style={{ boxShadow: "0 2px 8px hsl(0 72% 52% / 0.4)" }}>
                {item.badge}
              </span>
            )}
            <div className={`w-9 h-9 rounded-xl icon-3d flex items-center justify-center shrink-0`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
          </motion.button>
        ))}

        <div className="pt-3">
          <motion.button
            whileTap={{ scale: 0.96, y: 2 }}
            onClick={handleLogout}
            className="w-full card-3d flex items-center gap-3 px-4 py-3.5 text-right"
            style={{ borderColor: "hsl(0 72% 52% / 0.15)" }}
          >
            <span className="flex-1 text-[13px] font-bold text-destructive">تسجيل خروج</span>
            <div className="w-9 h-9 rounded-xl icon-3d flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4 text-destructive" />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}