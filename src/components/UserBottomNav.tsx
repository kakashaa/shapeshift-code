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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = item.path === "/user"
            ? location.pathname === "/user"
            : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
