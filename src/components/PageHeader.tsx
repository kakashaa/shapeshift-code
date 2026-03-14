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
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border/30">
      <div className="flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-xl bg-secondary/80 flex items-center justify-center active:scale-90 transition-all hover:bg-secondary"
            >
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <div>
            <h1 className="text-[15px] font-bold leading-tight">{title}</h1>
            {subtitle && <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
