import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function ChangePasswordPage() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!oldPass || !newPass || !confirmPass) {
      toast({ title: "خطأ", description: "جميع الحقول مطلوبة", variant: "destructive" });
      return;
    }
    if (newPass !== confirmPass) {
      toast({ title: "خطأ", description: "كلمة المرور الجديدة غير متطابقة", variant: "destructive" });
      return;
    }
    if (newPass.length < 4) {
      toast({ title: "خطأ", description: "كلمة المرور قصيرة جداً (4 أحرف على الأقل)", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await api.changePassword(oldPass, newPass, phone || undefined);
      localStorage.setItem("ghala_must_change_password", "false");
      toast({ title: "✅ تم تغيير كلمة المرور بنجاح" });
      navigate("/");
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "فشل تغيير كلمة المرور", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-primary/10 border border-primary/20">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-lg font-bold">تغيير كلمة المرور</h2>
          <p className="text-xs text-muted-foreground mt-1">يرجى تغيير كلمة المرور المبدئية وإدخال رقم الواتساب</p>
        </div>

        <div className="space-y-3">
          <input
            type="password"
            value={oldPass}
            onChange={e => setOldPass(e.target.value)}
            placeholder="كلمة المرور الحالية"
            className="w-full h-12 rounded-xl bg-secondary/80 border border-border/50 px-4 text-sm"
            dir="ltr"
          />
          <input
            type="password"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            placeholder="كلمة المرور الجديدة"
            className="w-full h-12 rounded-xl bg-secondary/80 border border-border/50 px-4 text-sm"
            dir="ltr"
          />
          <input
            type="password"
            value={confirmPass}
            onChange={e => setConfirmPass(e.target.value)}
            placeholder="تأكيد كلمة المرور الجديدة"
            className="w-full h-12 rounded-xl bg-secondary/80 border border-border/50 px-4 text-sm"
            dir="ltr"
          />
          <div className="relative">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="رقم الواتساب (اختياري)"
              className="w-full h-12 rounded-xl bg-secondary/80 border border-border/50 px-4 pr-10 text-sm"
              dir="ltr"
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-[52px] rounded-2xl font-semibold text-sm bg-primary text-primary-foreground disabled:opacity-50"
        >
          {loading ? "جاري الحفظ..." : "حفظ وإكمال"}
        </motion.button>
      </motion.div>
    </div>
  );
}
