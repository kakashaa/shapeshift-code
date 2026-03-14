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
      {/* 3D Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/5 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, hsl(200 95% 48% / 0.1), transparent 60%)" }} />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, hsl(220 85% 52% / 0.06), transparent 60%)" }} />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10"
      >
        {/* Logo with 3D float */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-center space-y-4"
        >
          <div className="w-24 h-24 rounded-3xl mx-auto overflow-hidden relative"
            style={{
              background: "linear-gradient(145deg, hsl(225 16% 10%) 0%, hsl(225 16% 5%) 100%)",
              boxShadow: "0 0 0 1px hsl(200 95% 48% / 0.12), 0 8px 32px hsl(225 18% 2% / 0.5), 0 0 40px hsl(200 95% 48% / 0.1)",
            }}
          >
            <img src={logo} alt="GhalaLive" className="w-full h-full object-contain" />
            {/* Shine overlay */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(145deg, hsl(0 0% 100% / 0.06), transparent 60%)" }} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">GhalaLive</h1>
            <p className="text-muted-foreground text-xs mt-1.5 font-medium">لوحة التحكم والإدارة</p>
          </div>
        </motion.div>

        {/* Buttons with 3D press effect */}
        <div className="w-full space-y-3">
          <motion.button
            whileTap={{ scale: 0.96, y: 2 }}
            onClick={() => navigate("/login/admin")}
            className="w-full h-[54px] rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 text-primary-foreground btn-3d"
          >
            <Shield className="w-[18px] h-[18px]" /> دخول أدمن
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96, y: 2 }}
            onClick={() => navigate("/login/user")}
            className="w-full h-[54px] rounded-2xl card-3d font-bold text-sm flex items-center justify-center gap-2.5 text-foreground"
          >
            <User className="w-[18px] h-[18px]" /> دخول مستخدم
          </motion.button>
        </div>

        {/* Demo Mode */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-[10px] text-muted-foreground/50 font-semibold">وضع تجريبي</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>
          <div className="flex gap-2.5">
            <motion.button
              whileTap={{ scale: 0.95, y: 1 }}
              onClick={() => handleDemo("admin")}
              className="flex-1 h-11 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all"
              style={{
                background: "linear-gradient(145deg, hsl(160 72% 42% / 0.12), hsl(160 72% 42% / 0.06))",
                border: "1px solid hsl(160 72% 42% / 0.2)",
                color: "hsl(160 72% 42%)",
                boxShadow: "0 2px 8px hsl(160 72% 42% / 0.08)",
              }}
            >
              <Play className="w-3.5 h-3.5" /> تجريبي أدمن
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95, y: 1 }}
              onClick={() => handleDemo("user")}
              className="flex-1 h-11 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all"
              style={{
                background: "linear-gradient(145deg, hsl(200 95% 48% / 0.12), hsl(200 95% 48% / 0.06))",
                border: "1px solid hsl(200 95% 48% / 0.2)",
                color: "hsl(200 95% 48%)",
                boxShadow: "0 2px 8px hsl(200 95% 48% / 0.08)",
              }}
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