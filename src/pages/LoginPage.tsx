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
      {/* Warm ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-1/2"
          style={{ background: "radial-gradient(ellipse at center bottom, hsl(24 85% 52% / 0.08), transparent 70%)" }} />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10"
      >
        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 rounded-3xl mx-auto overflow-hidden"
            style={{
              background: "linear-gradient(145deg, hsl(20 10% 12%) 0%, hsl(20 10% 6%) 100%)",
              boxShadow: "0 0 0 1px hsl(24 85% 52% / 0.1), 0 8px 32px hsl(20 12% 2% / 0.5)",
            }}
          >
            <img src={logo} alt="GhalaLive" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">GhalaLive</h1>
            <p className="text-muted-foreground text-xs mt-1.5 font-medium">لوحة التحكم والإدارة</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login/admin")}
            className="w-full h-[52px] rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 text-primary-foreground btn-3d"
          >
            <Shield className="w-[18px] h-[18px]" /> دخول أدمن
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login/user")}
            className="w-full h-[52px] rounded-2xl glass-card font-bold text-sm flex items-center justify-center gap-2.5 text-foreground active:scale-[0.97] transition-transform"
          >
            <User className="w-[18px] h-[18px]" /> دخول مستخدم
          </motion.button>
        </div>

        {/* Demo */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-[10px] text-muted-foreground/50 font-semibold">وضع تجريبي</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>
          <div className="flex gap-2.5">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleDemo("admin")}
              className="flex-1 h-11 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 bg-success/10 border border-success/20 text-success"
            >
              <Play className="w-3.5 h-3.5" /> تجريبي أدمن
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleDemo("user")}
              className="flex-1 h-11 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 bg-primary/10 border border-primary/20 text-primary"
            >
              <Play className="w-3.5 h-3.5" /> تجريبي مستخدم
            </motion.button>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/40 font-medium">v2.0 — Powered by GhalaLive</p>
      </motion.div>
    </div>
  );
}
