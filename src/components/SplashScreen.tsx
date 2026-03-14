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
          exit={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          {/* Ambient 3D glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
              style={{ background: "radial-gradient(circle, hsl(200 95% 48% / 0.15), transparent 60%)" }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 2, delay: 0.3 }}
              className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] rounded-full"
              style={{ background: "radial-gradient(circle, hsl(220 85% 52% / 0.1), transparent 60%)" }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 2, delay: 0.6 }}
              className="absolute top-1/5 right-1/4 w-[200px] h-[200px] rounded-full"
              style={{ background: "radial-gradient(circle, hsl(160 72% 42% / 0.06), transparent 60%)" }}
            />
          </div>

          {/* Logo with 3D effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.2, rotateY: -120, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
            style={{ perspective: "800px" }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0px hsl(200 95% 48% / 0), 0 8px 32px hsl(225 18% 2% / 0.5)",
                  "0 0 50px hsl(200 95% 48% / 0.3), 0 8px 32px hsl(225 18% 2% / 0.5)",
                  "0 0 25px hsl(200 95% 48% / 0.15), 0 8px 32px hsl(225 18% 2% / 0.5)",
                ],
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-28 h-28 rounded-3xl flex items-center justify-center overflow-hidden"
              style={{
                background: "linear-gradient(145deg, hsl(225 16% 10%) 0%, hsl(225 16% 5%) 100%)",
                border: "1px solid hsl(200 95% 48% / 0.12)",
              }}
            >
              <img src={logo} alt="GhalaLive" className="w-full h-full object-contain" />
            </motion.div>
            {/* Reflection shine */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-1/3 h-full pointer-events-none rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.12), transparent)",
              }}
            />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={phase === "text" ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 text-center"
          >
            <h1 className="text-3xl font-black tracking-tight text-foreground">GhalaLive</h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={phase === "text" ? { opacity: 1 } : {}}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="text-xs text-muted-foreground mt-2 font-medium"
            >
              لوحة التحكم والإدارة
            </motion.p>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={phase === "text" ? { opacity: 1, width: 120 } : {}}
            transition={{ delay: 0.4 }}
            className="mt-10 h-[2px] rounded-full overflow-hidden bg-secondary"
            style={{ width: 120 }}
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