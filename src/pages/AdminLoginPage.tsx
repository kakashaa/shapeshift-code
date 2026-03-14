import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
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
      login(res.token, res.type, res.name);
      toast({ title: "مرحباً " + res.name });
      navigate("/");
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "بيانات خاطئة", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="دخول أدمن" showBack />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6 max-w-sm mx-auto pt-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center mb-3">
            <LogIn className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold">تسجيل دخول الأدمن</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
              className="w-full h-12 rounded-xl bg-secondary border-0 px-4 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full h-12 rounded-xl bg-secondary border-0 px-4 pl-12 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                dir="ltr"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
              <button onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-14 rounded-2xl font-bold text-lg text-primary-foreground active:scale-[0.97] transition-transform disabled:opacity-50"
          style={{ background: "var(--gradient-button)" }}
        >
          {loading ? "جاري الدخول..." : "تسجيل دخول"}
        </button>
      </motion.div>
    </div>
  );
}
