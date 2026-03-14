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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-2xl border-t border-border/40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-[56px] max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = item.path === "/user" ? location.pathname === "/user" : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-all duration-200 active:scale-90",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-[20px] h-[20px]" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={cn("text-[10px]", isActive ? "font-semibold" : "font-normal")}>{item.label}</span>
              {isActive && <div className="absolute bottom-0 w-8 h-[3px] rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
