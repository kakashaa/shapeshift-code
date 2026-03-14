import { useLocation, useNavigate } from "react-router-dom";
import { Home, Headphones, BarChart3, DollarSign, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  badges?: { support?: number; monitoring?: number; reports?: number };
}

export function BottomNav({ badges }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { path: "/more", label: "المزيد", icon: MoreHorizontal },
    { path: "/finance", label: "مالية", icon: DollarSign },
    { path: "/monitoring", label: "مراقبة", icon: BarChart3, badge: badges?.monitoring },
    { path: "/support", label: "الدعم", icon: Headphones, badge: badges?.support },
    { path: "/", label: "الرئيسية", icon: Home },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-2xl border-t border-border/40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-[56px] max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
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
              <div className="relative">
                <Icon className="w-[20px] h-[20px]" strokeWidth={isActive ? 2.5 : 1.8} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 min-w-[16px] h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-1 badge-pulse">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px]", isActive ? "font-semibold" : "font-normal")}>{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-[3px] rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
