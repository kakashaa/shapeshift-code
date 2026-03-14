import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, MessageSquare, AlertTriangle, Star, ShoppingBag, User, ArrowRightLeft, UserPlus, ClipboardList, Settings, LogOut, ChevronLeft, Sun, Moon, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function MorePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [badges, setBadges] = useState<any>({});

  useEffect(() => {
    api.badgeCounts().then(setBadges).catch(() => setBadges({ reports: 3, vip: 1, store: 5, admin_chat_unread: 2 }));
  }, []);

  const items = [
    { icon: Bell, label: "إرسال إشعار", path: "/more/notifications", badge: 0 },
    { icon: Search, label: "مراجعة الدعم", path: "/more/gift-audit", badge: 0 },
    { icon: MessageSquare, label: "شات الأدمنز", path: "/more/admin-chat", badge: badges.admin_chat_unread },
    { icon: AlertTriangle, label: "البلاغات", path: "/more/reports", badge: badges.reports },
    { icon: Star, label: "طلبات VIP", path: "/more/vip", badge: badges.vip },
    { icon: ShoppingBag, label: "طلبات المتجر", path: "/more/store", badge: badges.store },
    { icon: User, label: "بحث مستخدم", path: "/more/user-search", badge: 0 },
    { icon: ArrowRightLeft, label: "طلبات تغيير آيدي", path: "/more/id-change", badge: 0 },
    { icon: UserPlus, label: "تسجيلات جديدة", path: "/more/registrations", badge: 0 },
    { icon: ClipboardList, label: "سجل الإجراءات", path: "/more/activity-log", badge: 0 },
    { icon: Settings, label: "الإعدادات", path: "/more/settings", badge: 0 },
  ];

  const handleLogout = () => {
    if (confirm("تسجيل خروج؟")) { logout(); navigate("/login"); }
  };

  return (
    <div className="pb-20">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-warning" />
          ) : (
            <Moon className="w-4 h-4 text-primary" />
          )}
        </motion.button>
        <h1 className="text-[15px] font-bold">المزيد</h1>
      </div>

      <div className="px-4 space-y-1.5">
        {items.map((item, i) => (
          <motion.button
            key={item.path}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.025, duration: 0.25 }}
            onClick={() => navigate(item.path)}
            className="w-full glass-card-hover flex items-center gap-3 px-4 py-3 text-right"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground/50" />
            <span className="flex-1 text-[13px] font-medium">{item.label}</span>
            {item.badge > 0 && (
              <span className="min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-1 badge-pulse">
                {item.badge}
              </span>
            )}
            <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
              <item.icon className="w-4 h-4 text-primary" />
            </div>
          </motion.button>
        ))}

        <div className="pt-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full glass-card flex items-center gap-3 px-4 py-3 border-destructive/20 text-right"
          >
            <span className="flex-1 text-[13px] font-medium text-destructive">تسجيل خروج</span>
            <div className="w-8 h-8 rounded-xl bg-destructive/8 flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4 text-destructive" />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
