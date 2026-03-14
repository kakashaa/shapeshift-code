import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, MessageSquare, AlertTriangle, Star, ShoppingBag, User, ArrowRightLeft, UserPlus, ClipboardList, Settings, LogOut } from "lucide-react";
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
    { icon: Bell, label: "إرسال إشعار", path: "/more/notifications" },
    { icon: Search, label: "مراجعة الدعم", path: "/more/gift-audit" },
    { icon: MessageSquare, label: "شات الأدمنز", path: "/more/admin-chat", badge: badges.admin_chat_unread },
    { icon: AlertTriangle, label: "البلاغات", path: "/more/reports", badge: badges.reports },
    { icon: Star, label: "طلبات VIP", path: "/more/vip", badge: badges.vip },
    { icon: ShoppingBag, label: "طلبات المتجر", path: "/more/store", badge: badges.store },
    { icon: User, label: "بحث مستخدم", path: "/more/user-search" },
    { icon: ArrowRightLeft, label: "طلبات تغيير آيدي", path: "/more/id-change" },
    { icon: UserPlus, label: "تسجيلات جديدة", path: "/more/registrations" },
    { icon: ClipboardList, label: "سجل الإجراءات", path: "/more/activity-log" },
    { icon: Settings, label: "الإعدادات", path: "/more/settings" },
  ];

  const handleLogout = () => {
    if (confirm("هل تريد تسجيل الخروج؟")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="pb-20">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold">المزيد</h1>
      </div>

      <div className="px-4 space-y-1">
        {items.map((item, i) => (
          <motion.button
            key={item.path}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-card rounded-xl active:bg-secondary transition-colors mb-1"
          >
            <item.icon className="w-5 h-5 text-primary" />
            <span className="flex-1 text-sm font-medium text-right">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <span className="min-w-[20px] h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
                {item.badge}
              </span>
            )}
          </motion.button>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-card rounded-xl active:bg-secondary transition-colors mt-4"
        >
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="flex-1 text-sm font-medium text-right text-destructive">تسجيل خروج</span>
        </button>
      </div>
    </div>
  );
}
