import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<"logo" | "text" | "exit">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 600);
    const t2 = setTimeout(() => setPhase("exit"), 1800);
    const t3 = setTimeout(onFinish, 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          key="splash"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          {/* Warm ambient glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 1.5 }}
              className="absolute bottom-0 left-0 right-0 h-1/2"
              style={{ background: "radial-gradient(ellipse at center bottom, hsl(24 85% 52% / 0.12), transparent 70%)" }}
            />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center overflow-hidden"
              style={{
                background: "linear-gradient(145deg, hsl(20 10% 12%) 0%, hsl(20 10% 6%) 100%)",
                boxShadow: "0 8px 32px hsl(20 12% 2% / 0.5), 0 0 0 1px hsl(24 85% 52% / 0.1)",
              }}
            >
              <img src={logo} alt="GhalaLive" className="w-full h-full object-contain" />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={phase === "text" ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.5 }}
            className="mt-6 text-center"
          >
            <h1 className="text-2xl font-black text-foreground">GhalaLive</h1>
            <p className="text-[11px] text-muted-foreground mt-1.5">لوحة التحكم والإدارة</p>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={phase === "text" ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="mt-8 h-[2px] rounded-full overflow-hidden bg-secondary"
            style={{ width: 100 }}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-1/2 rounded-full"
              style={{ background: "var(--gradient-primary)" }}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
