import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, showBack, actions }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl px-3 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={() => navigate(-1)} className="w-7 h-7 rounded-lg bg-card/80 flex items-center justify-center active:scale-90 transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          <div>
            <h1 className="text-sm font-bold leading-tight">{title}</h1>
            {subtitle && <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-1.5">{actions}</div>}
      </div>
    </div>
  );
}
