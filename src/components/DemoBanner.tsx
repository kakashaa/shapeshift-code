import { motion } from "framer-motion";
import { FlaskConical } from "lucide-react";
import { isDemoMode } from "@/lib/api";

export function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 flex items-center justify-center gap-2 py-1.5 text-[11px] font-semibold text-warning-foreground"
      style={{ background: "hsl(var(--warning))" }}
    >
      <FlaskConical className="w-3.5 h-3.5" />
      وضع تجريبي — البيانات وهمية
    </motion.div>
  );
}
