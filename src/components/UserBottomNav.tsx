import { useLocation, useNavigate } from "react-router-dom";
import { Home, DollarSign, BarChart3, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function UserBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { path: "/user/requests", label: "الخدمات", icon: FileText },
    { path: "/user/salary", label: "الراتب", icon: BarChart3 },
    { path: "/user", label: "الرئيسية", icon: Home },
    { path: "/user/charges", label: "الشحنات", icon: DollarSign },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 nav-glass pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-[60px] max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = item.path === "/user" ? location.pathname === "/user" : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-all duration-300 active:scale-90",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <motion.div
                animate={isActive ? { scale: 1, y: -2 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                  isActive && "icon-3d"
                )}>
                  <Icon className={cn("w-[18px] h-[18px]", isActive && "text-primary")} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
              </motion.div>
              <span className={cn("text-[9px] font-medium", isActive ? "font-bold text-primary" : "font-normal")}>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="user-nav-indicator"
                  className="absolute bottom-1 w-5 h-[3px] rounded-full bg-primary"
                  style={{ boxShadow: "0 0 8px hsl(200 95% 48% / 0.5)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}