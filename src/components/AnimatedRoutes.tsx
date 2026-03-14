import { ReactNode } from "react";
import { motion } from "framer-motion";

export function AnimatedPage({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}
