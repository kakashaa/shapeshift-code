import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Sun, Moon, Monitor, Bell, BellOff, BellRing,
  Globe, User, Shield, LogOut, ChevronLeft, Volume2, VolumeX,
  Smartphone, Palette, Send
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { subscribeToPush, unsubscribeFromPush, sendPushNotification } from "@/lib/pushNotifications";
import { toast } from "@/hooks/use-toast";

type Language = "ar" | "en";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { name, logout } = useAuth();

  // Notification preferences (persisted in localStorage)
  const [soundEnabled, setSoundEnabled] = useState(() =>
    localStorage.getItem("ghala_sound") !== "0"
  );
  const [browserNotif, setBrowserNotif] = useState(() =>
    typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted"
  );
  const [demoNotif, setDemoNotif] = useState(() =>
    localStorage.getItem("ghala_demo_notif") !== "0"
  );
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  // Language
  const [language, setLanguage] = useState<Language>(() =>
    (localStorage.getItem("ghala_lang") as Language) || "ar"
  );

  const handleSoundToggle = (val: boolean) => {
    setSoundEnabled(val);
    localStorage.setItem("ghala_sound", val ? "1" : "0");
  };

  const handleBrowserNotif = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") return;
    const result = await Notification.requestPermission();
    setBrowserNotif(result === "granted");
  };

  const handleDemoNotif = (val: boolean) => {
    setDemoNotif(val);
    localStorage.setItem("ghala_demo_notif", val ? "1" : "0");
  };

  const handlePushToggle = async (val: boolean) => {
    setPushLoading(true);
    try {
      if (val) {
        const success = await subscribeToPush();
        setPushEnabled(success);
        if (success) toast({ title: "✅ تم تفعيل إشعارات Push" });
        else toast({ title: "❌ فشل تفعيل الإشعارات", variant: "destructive" });
      } else {
        await unsubscribeFromPush();
        setPushEnabled(false);
        toast({ title: "تم إيقاف إشعارات Push" });
      }
    } finally {
      setPushLoading(false);
    }
  };

  const handleTestPush = async () => {
    const success = await sendPushNotification(
      "🔔 تجربة إشعار",
      "هذا إشعار تجريبي من GhalaLive!",
      { tag: "test" }
    );
    if (success) toast({ title: "✅ تم إرسال الإشعار التجريبي" });
    else toast({ title: "❌ فشل الإرسال", variant: "destructive" });
  };

  const handleLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("ghala_lang", lang);
  };

  const handleLogout = () => {
    if (confirm("هل تريد تسجيل الخروج؟")) {
      logout();
      navigate("/login");
    }
  };

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04 } },
  };
  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div />
        <h1 className="text-[15px] font-bold">الإعدادات</h1>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-90 transition-transform">
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="px-4 space-y-5">

        {/* === Theme Section === */}
        <motion.div variants={item}>
          <SectionTitle icon={Palette} label="المظهر" />
          <div className="glass-card p-1 flex gap-1 rounded-xl">
            {([
              { value: "dark", label: "داكن", icon: Moon },
              { value: "light", label: "فاتح", icon: Sun },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => { if (theme !== opt.value) toggleTheme(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
                  theme === opt.value
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:bg-secondary/60"
                }`}
              >
                <opt.icon className="w-4 h-4" />
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* === Notifications Section === */}
        <motion.div variants={item}>
          <SectionTitle icon={Bell} label="الإشعارات" />
          <div className="glass-card divide-y divide-border/20 rounded-xl overflow-hidden">
            <SettingRow
              icon={Volume2}
              iconOff={VolumeX}
              label="صوت الإشعارات"
              description="تشغيل صوت عند وصول إشعار جديد"
              enabled={soundEnabled}
              onToggle={handleSoundToggle}
            />
            <SettingRow
              icon={BellRing}
              iconOff={BellOff}
              label="إشعارات المتصفح"
              description={browserNotif ? "مفعّلة — ستصلك إشعارات على سطح المكتب" : "اضغط لتفعيل إشعارات المتصفح"}
              enabled={browserNotif}
              onToggle={() => handleBrowserNotif()}
              isButton={!browserNotif}
            />
            <SettingRow
              icon={Smartphone}
              label="إشعارات تجريبية"
              description="توليد إشعارات وهمية تلقائياً في الوضع التجريبي"
              enabled={demoNotif}
              onToggle={handleDemoNotif}
            />
          </div>
        </motion.div>

        {/* === Language Section === */}
        <motion.div variants={item}>
          <SectionTitle icon={Globe} label="اللغة" />
          <div className="glass-card p-1 flex gap-1 rounded-xl">
            {([
              { value: "ar" as Language, label: "العربية 🇸🇦" },
              { value: "en" as Language, label: "English 🇺🇸" },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleLanguage(opt.value)}
                className={`flex-1 py-2.5 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
                  language === opt.value
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:bg-secondary/60"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {language === "en" && (
            <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">
              English support coming soon — currently UI is Arabic only
            </p>
          )}
        </motion.div>

        {/* === Account Section === */}
        <motion.div variants={item}>
          <SectionTitle icon={User} label="الحساب" />
          <div className="glass-card divide-y divide-border/20 rounded-xl overflow-hidden">
            {/* Profile info */}
            <div className="px-4 py-3.5 flex items-center gap-3">
              <div className="flex-1 text-right min-w-0">
                <p className="text-[13px] font-bold truncate">{name || "أدمن"}</p>
                <p className="text-[11px] text-muted-foreground">مدير النظام</p>
              </div>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0"
                style={{ background: "var(--gradient-primary)" }}
              >
                {(name || "A")[0]}
              </div>
            </div>

            {/* Account actions */}
            <AccountAction
              icon={Shield}
              label="تغيير كلمة المرور"
              onClick={() => {}}
            />
            <AccountAction
              icon={LogOut}
              label="تسجيل خروج"
              danger
              onClick={handleLogout}
            />
          </div>
        </motion.div>

        {/* App info */}
        <motion.div variants={item} className="text-center pb-4">
          <p className="text-[10px] text-muted-foreground/40">
            Ghala Admin Panel v1.0.0
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

function SectionTitle({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 justify-end">
      <span className="text-[12px] font-bold text-foreground">{label}</span>
      <Icon className="w-4 h-4 text-primary" />
    </div>
  );
}

function SettingRow({
  icon: Icon,
  iconOff: IconOff,
  label,
  description,
  enabled,
  onToggle,
  isButton,
}: {
  icon: any;
  iconOff?: any;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (val: boolean) => void;
  isButton?: boolean;
}) {
  const ActiveIcon = enabled ? Icon : (IconOff || Icon);
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <div className="shrink-0">
        {isButton ? (
          <button
            onClick={() => onToggle(true)}
            className="text-[10px] font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
          >
            تفعيل
          </button>
        ) : (
          <Switch checked={enabled} onCheckedChange={onToggle} />
        )}
      </div>
      <div className="flex-1 text-right min-w-0">
        <p className="text-[12px] font-semibold">{label}</p>
        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{description}</p>
      </div>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${enabled ? "bg-primary/10" : "bg-muted"}`}>
        <ActiveIcon className={`w-4 h-4 ${enabled ? "text-primary" : "text-muted-foreground/50"}`} />
      </div>
    </div>
  );
}

function AccountAction({ icon: Icon, label, danger, onClick }: { icon: any; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/40 transition-colors active:scale-[0.98]"
    >
      <ChevronLeft className={`w-3.5 h-3.5 ${danger ? "text-destructive/50" : "text-muted-foreground/40"}`} />
      <span className={`flex-1 text-right text-[12px] font-medium ${danger ? "text-destructive" : ""}`}>{label}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${danger ? "bg-destructive/10" : "bg-primary/10"}`}>
        <Icon className={`w-4 h-4 ${danger ? "text-destructive" : "text-primary"}`} />
      </div>
    </button>
  );
}
