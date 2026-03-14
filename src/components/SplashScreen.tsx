import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          {/* Ambient glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
              style={{ background: "radial-gradient(circle, hsl(200 95% 48% / 0.12), transparent 70%)" }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="absolute bottom-1/4 left-1/4 w-[200px] h-[200px] rounded-full"
              style={{ background: "radial-gradient(circle, hsl(220 85% 52% / 0.08), transparent 70%)" }}
            />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <motion.div
              animate={{ boxShadow: ["0 0 0px hsl(200 95% 48% / 0)", "0 0 40px hsl(200 95% 48% / 0.3)", "0 0 20px hsl(200 95% 48% / 0.15)"] }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ background: "var(--gradient-primary)" }}
            >
              <span className="text-4xl font-bold text-primary-foreground">G</span>
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={phase === "text" ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-center"
          >
            <h1 className="text-2xl font-bold tracking-tight text-foreground">GhalaLive</h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={phase === "text" ? { opacity: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-xs text-muted-foreground mt-1.5"
            >
              لوحة التحكم والإدارة
            </motion.p>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={phase === "text" ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="flex gap-1.5 mt-8"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
            ))}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
