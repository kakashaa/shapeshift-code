import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden px-6">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(200 95% 48% / 0.15), transparent 70%)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 right-1/4 w-[200px] h-[200px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(0 68% 52% / 0.1), transparent 70%)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center relative z-10 max-w-xs"
      >
        {/* 404 Number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative mb-6"
        >
          <span
            className="text-[120px] font-bold leading-none bg-clip-text text-transparent select-none"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            404
          </span>
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 blur-2xl -z-10"
            style={{ background: "radial-gradient(circle, hsl(200 95% 48% / 0.2), transparent 60%)" }}
          />
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center glass-card glow-border"
        >
          <span className="text-3xl">🔍</span>
        </motion.div>

        {/* Text */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-lg font-bold text-foreground mb-2"
        >
          الصفحة غير موجودة
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-sm text-muted-foreground mb-8 leading-relaxed"
        >
          عذراً، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="space-y-3"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
            className="w-full h-[48px] rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 text-primary-foreground glow-border"
            style={{ background: "var(--gradient-button)" }}
          >
            <Home className="w-4 h-4" />
            العودة للرئيسية
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="w-full h-[48px] rounded-2xl glass-card font-medium text-sm flex items-center justify-center gap-2 text-muted-foreground"
          >
            <ArrowRight className="w-4 h-4" />
            الرجوع للخلف
          </motion.button>
        </motion.div>

        {/* Path info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[10px] text-muted-foreground/40 mt-6 font-mono direction-ltr"
          dir="ltr"
        >
          {location.pathname}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default NotFound;
