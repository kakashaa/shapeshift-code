import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, MessageSquare, AlertTriangle, Star, ShoppingBag, User, ArrowRightLeft, UserPlus, ClipboardList, Settings, LogOut, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function MorePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
      <div className="px-4 pt-3 pb-2">
        <h1 className="text-base font-bold">المزيد</h1>
      </div>

      <div className="px-3 space-y-1">
        {items.map((item, i) => (
          <motion.button
            key={item.path}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-card/60 rounded-xl active:bg-secondary/50 transition-colors border border-border/30"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="flex-1 text-[12px] font-medium text-right">{item.label}</span>
            {item.badge > 0 && (
              <span className="min-w-[16px] h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-1">
                {item.badge}
              </span>
            )}
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon className="w-3.5 h-3.5 text-primary" />
            </div>
          </motion.button>
        ))}

        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-card/60 rounded-xl active:bg-secondary/50 transition-colors mt-3 border border-destructive/20">
          <span className="flex-1 text-[12px] font-medium text-right text-destructive">تسجيل خروج</span>
          <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
            <LogOut className="w-3.5 h-3.5 text-destructive" />
          </div>
        </button>
      </div>
    </div>
  );
}
