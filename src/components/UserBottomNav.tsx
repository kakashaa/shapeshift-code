import { useLocation, useNavigate } from "react-router-dom";
import { Home, DollarSign, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { path: "/user/salary", label: "الراتب", icon: BarChart3 },
    { path: "/user/charges", label: "الشحنات", icon: DollarSign },
    { path: "/user", label: "الرئيسية", icon: Home },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = item.path === "/user" ? location.pathname === "/user" : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all active:scale-90",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
              <Icon className={cn("w-[18px] h-[18px]", isActive && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]")} />
              <span className="text-[9px] font-medium">{item.label}</span>
              {isActive && <div className="absolute bottom-1 w-4 h-0.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
