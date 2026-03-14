import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      toast({ title: "خطأ", description: "أدخل اسم المستخدم وكلمة المرور", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await api.adminLogin(username, password);
      login(res.token, res.type, res.name, {
        role: res.role || "",
        permissions: JSON.stringify(res.permissions || []),
        must_change_password: String(res.must_change_password || false),
        username: res.username || "",
      });
      toast({ title: "مرحباً " + res.name });
      if (res.must_change_password) {
        navigate("/change-password");
      } else {
        navigate("/");
      }
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "بيانات خاطئة", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="دخول أدمن" showBack />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 space-y-8 max-w-sm mx-auto pt-10"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 glow-border"
            style={{ background: "var(--gradient-primary)" }}>
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-lg font-bold">تسجيل دخول الأدمن</h2>
          <p className="text-xs text-muted-foreground mt-1">أدخل بياناتك للوصول للوحة التحكم</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
              className="w-full h-12 rounded-xl bg-secondary/80 border border-border/50 px-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full h-12 rounded-xl bg-secondary/80 border border-border/50 px-4 pl-12 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                dir="ltr"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
              <button onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-[52px] rounded-2xl font-semibold text-sm text-primary-foreground transition-all disabled:opacity-50 glow-border"
          style={{ background: "var(--gradient-button)" }}
        >
          {loading ? "جاري الدخول..." : "تسجيل دخول"}
        </motion.button>
      </motion.div>
    </div>
  );
}
