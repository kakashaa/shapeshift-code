import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Key, User } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="text-center space-y-1.5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center mb-3">
            <span className="text-2xl font-black text-primary-foreground">G</span>
          </div>
          <h1 className="text-2xl font-black">GhalaLive</h1>
          <p className="text-muted-foreground text-[11px]">لوحة الإدارة</p>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3">
          <button onClick={() => navigate("/login/admin")}
            className="w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-primary-foreground active:scale-[0.96] transition-transform"
            style={{ background: "var(--gradient-button)" }}>
            <Key className="w-4 h-4" /> دخول أدمن
          </button>
          <button onClick={() => navigate("/login/user")}
            className="w-full h-12 rounded-2xl bg-card text-foreground font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.96] transition-transform border border-border/50">
            <User className="w-4 h-4" /> دخول مستخدم
          </button>
        </div>
      </motion.div>
    </div>
  );
}
