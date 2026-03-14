import { useLocation, useNavigate } from "react-router-dom";
import { Home, Headphones, MessageSquare, DollarSign, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface BottomNavProps {
  badges?: { support?: number; monitoring?: number; reports?: number };
}

export function BottomNav({ badges }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const items: NavItem[] = [
    { path: "/more", label: "المزيد", icon: MoreHorizontal },
    { path: "/finance", label: "مالية", icon: DollarSign },
    { path: "/monitoring", label: "مراقبة", icon: MessageSquare, badge: badges?.monitoring },
    { path: "/support", label: "دعم فني", icon: Headphones, badge: badges?.support },
    { path: "/", label: "الرئيسية", icon: Home },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = item.path === "/" 
            ? location.pathname === "/" 
            : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-colors active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center badge-pulse px-1">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
