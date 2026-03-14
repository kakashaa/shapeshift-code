import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, showBack, actions }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-40 nav-glass">
      <div className="flex items-center justify-between px-4 h-13">
        <div className="flex items-center gap-3">
          {showBack && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl icon-3d active:scale-90 transition-all"
            >
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          )}
          <div>
            <h1 className="text-[15px] font-bold leading-tight tracking-tight">{title}</h1>
            {subtitle && <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}