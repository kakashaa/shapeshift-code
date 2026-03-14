import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "@/hooks/use-toast";

export default function UserLoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [uuid, setUuid] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { login } = useAuth();

  const sendOtp = async () => {
    if (!uuid) { toast({ title: "أدخل رقم الآيدي", variant: "destructive" }); return; }
    setLoading(true);
    try {
      await api.userLoginRequest(uuid);
      toast({ title: "تم إرسال رمز التحقق" });
      setStep(2);
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown(c => { if (c <= 1) { clearInterval(interval); return 0; } return c - 1; });
      }, 1000);
    } catch (e: any) { toast({ title: "خطأ", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    const otp = code.join("");
    if (otp.length < 6) { toast({ title: "أدخل الرمز كاملاً", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const res = await api.userLoginVerify(uuid, otp);
      login(res.token, res.type, res.name, { uuid: res.uuid, avatar: res.avatar });
      toast({ title: "مرحباً " + res.name });
      navigate("/user");
    } catch (e: any) { toast({ title: "خطأ", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) document.getElementById(`otp-${index - 1}`)?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="دخول مستخدم" showBack />
      <div className="p-6 max-w-sm mx-auto pt-10">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 glow-border"
                  style={{ background: "var(--gradient-primary)" }}>
                  <Fingerprint className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-bold">تسجيل دخول المستخدم</h2>
                <p className="text-xs text-muted-foreground mt-1">أدخل معرف المستخدم (UUID) الخاص بك</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">معرف المستخدم (UUID)</label>
                <input
                  type="text" value={uuid} onChange={e => setUuid(e.target.value)}
                  placeholder="أدخل رقم الآيدي"
                  className="w-full h-12 rounded-xl bg-secondary/80 border border-border/50 px-4 text-sm text-center placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                  dir="ltr"
                />
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={sendOtp} disabled={loading}
                className="w-full h-[52px] rounded-2xl font-semibold text-sm text-primary-foreground transition-all disabled:opacity-50 glow-border"
                style={{ background: "var(--gradient-button)" }}>
                {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
              </motion.button>

              <div className="glass-card p-3 text-center">
                <p className="text-[11px] text-muted-foreground">سيتم إرسال رمز تحقق كرسالة خاصة داخل التطبيق</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 glow-border"
                  style={{ background: "var(--gradient-primary)" }}>
                  <ShieldCheck className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-bold">رمز التحقق</h2>
                <p className="text-xs text-muted-foreground mt-1">أدخل الرمز المرسل لحسابك داخل التطبيق</p>
              </div>

              <div className="flex gap-2.5 justify-center" dir="ltr">
                {code.map((digit, i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                    value={digit} onChange={e => handleCodeChange(i, e.target.value)} onKeyDown={e => handleCodeKeyDown(i, e)}
                    className="w-11 h-13 rounded-xl bg-secondary/80 border border-border/50 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                  />
                ))}
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={verifyOtp} disabled={loading}
                className="w-full h-[52px] rounded-2xl font-semibold text-sm text-primary-foreground transition-all disabled:opacity-50 glow-border"
                style={{ background: "var(--gradient-button)" }}>
                {loading ? "جاري التحقق..." : "تأكيد الدخول"}
              </motion.button>

              <div className="text-center">
                <button onClick={sendOtp} disabled={countdown > 0 || loading}
                  className="text-xs text-primary disabled:text-muted-foreground transition-colors">
                  {countdown > 0 ? `إعادة الإرسال (${countdown}ث)` : "إعادة إرسال الرمز"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
