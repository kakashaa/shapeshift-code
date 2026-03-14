import { useNavigate } from "react-router-dom";
import { Shield, User, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { setDemoMode } from "@/lib/api";
import logo from "@/assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleDemo = (type: "admin" | "user") => {
    setDemoMode(true);
    const name = type === "admin" ? "أدمن تجريبي" : "مستخدم تجريبي";
    login("demo-token", type, name);
    navigate(type === "admin" ? "/" : "/user");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm flex flex-col items-center gap-8"
      >
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center glow-border relative overflow-hidden">
            <img src={logo} alt="GhalaLive" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">GhalaLive</h1>
            <p className="text-muted-foreground text-xs mt-1">لوحة التحكم والإدارة</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login/admin")}
            className="w-full h-[52px] rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 text-primary-foreground transition-all glow-border"
            style={{ background: "var(--gradient-button)" }}
          >
            <Shield className="w-[18px] h-[18px]" /> دخول أدمن
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login/user")}
            className="w-full h-[52px] rounded-2xl glass-card font-semibold text-sm flex items-center justify-center gap-2.5 text-foreground transition-all"
          >
            <User className="w-[18px] h-[18px]" /> دخول مستخدم
          </motion.button>
        </div>

        {/* Demo Mode */}
        <div className="w-full space-y-2">
          <div className="flex items-center gap-3 px-2">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-[10px] text-muted-foreground/60 font-medium">وضع تجريبي</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleDemo("admin")}
              className="flex-1 h-10 rounded-xl bg-success/10 text-success text-[12px] font-semibold flex items-center justify-center gap-1.5 border border-success/20 transition-all"
            >
              <Play className="w-3.5 h-3.5" /> تجريبي أدمن
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleDemo("user")}
              className="flex-1 h-10 rounded-xl bg-accent/10 text-accent text-[12px] font-semibold flex items-center justify-center gap-1.5 border border-accent/20 transition-all"
            >
              <Play className="w-3.5 h-3.5" /> تجريبي مستخدم
            </motion.button>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/60">v2.0 — Powered by GhalaLive</p>
      </motion.div>
    </div>
  );
}
