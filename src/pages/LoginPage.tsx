import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Key, User } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col items-center gap-8"
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center mb-4">
            <span className="text-3xl font-black text-primary-foreground">G</span>
          </div>
          <h1 className="text-3xl font-black">GhalaLive</h1>
          <p className="text-muted-foreground text-sm">لوحة الإدارة</p>
        </div>

        {/* Login buttons */}
        <div className="w-full space-y-4">
          <button
            onClick={() => navigate("/login/admin")}
            className="w-full h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 text-primary-foreground active:scale-[0.97] transition-transform"
            style={{ background: "var(--gradient-button)" }}
          >
            <Key className="w-5 h-5" />
            دخول أدمن
          </button>

          <button
            onClick={() => navigate("/login/user")}
            className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground font-bold text-lg flex items-center justify-center gap-3 active:scale-[0.97] transition-transform"
          >
            <User className="w-5 h-5" />
            دخول مستخدم
          </button>
        </div>
      </motion.div>
    </div>
  );
}
