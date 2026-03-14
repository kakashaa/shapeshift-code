import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Smartphone, Monitor, Apple, Share, Plus, MoreVertical, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setPlatform("ios");
    else if (/android/.test(ua)) setPlatform("android");
    else setPlatform("desktop");

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { delay, duration: 0.4 },
  });

  if (isInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div {...anim(0)} className="text-center space-y-4 max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold">تم التثبيت ✅</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            التطبيق مثبت على جهازك. يمكنك فتحه من الشاشة الرئيسية في أي وقت.
          </p>
          <a href="/" className="inline-block mt-4 px-6 py-3 rounded-xl text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-button)" }}>
            فتح التطبيق
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <motion.div {...anim(0)} className="relative text-center pt-12 pb-8 px-6">
          <div className="w-24 h-24 rounded-3xl mx-auto mb-5 overflow-hidden shadow-2xl shadow-primary/20 border-2 border-primary/20">
            <img src="/pwa-512x512.png" alt="GhalaLive" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold mb-2">GhalaLive</h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            ثبّت التطبيق على جهازك للوصول السريع والعمل بدون إنترنت
          </p>
        </motion.div>
      </div>

      {/* Install button (Android / Desktop) */}
      {deferredPrompt && (
        <motion.div {...anim(0.1)} className="px-6 mb-6">
          <button
            onClick={handleInstall}
            className="w-full py-4 rounded-2xl text-base font-bold text-primary-foreground flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-primary/25"
            style={{ background: "var(--gradient-button)" }}
          >
            <Download className="w-5 h-5" />
            تثبيت التطبيق
          </button>
        </motion.div>
      )}

      {/* Features */}
      <motion.div {...anim(0.15)} className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "⚡", label: "سريع", desc: "تحميل فوري" },
            { icon: "📴", label: "بدون نت", desc: "يعمل أوفلاين" },
            { icon: "🔔", label: "إشعارات", desc: "تنبيهات فورية" },
          ].map((f, i) => (
            <div key={i} className="glass-card p-3 text-center">
              <span className="text-2xl">{f.icon}</span>
              <p className="text-[12px] font-bold mt-1">{f.label}</p>
              <p className="text-[9px] text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Instructions */}
      <div className="px-6 space-y-4 pb-10">
        {platform === "ios" && (
          <motion.div {...anim(0.2)} className="space-y-3">
            <h2 className="text-[14px] font-bold flex items-center gap-2">
              <Apple className="w-4 h-4" /> التثبيت على iPhone / iPad
            </h2>
            <div className="glass-card rounded-2xl divide-y divide-border/20 overflow-hidden">
              <Step num={1} icon={<Share className="w-4 h-4 text-primary" />}
                title="اضغط زر المشاركة"
                desc="في شريط Safari السفلي، اضغط على أيقونة المشاركة ⬆️" />
              <Step num={2} icon={<Plus className="w-4 h-4 text-primary" />}
                title='اختر "إضافة إلى الشاشة الرئيسية"'
                desc="مرر للأسفل في القائمة حتى تجد الخيار" />
              <Step num={3} icon={<CheckCircle2 className="w-4 h-4 text-success" />}
                title='اضغط "إضافة"'
                desc="سيظهر التطبيق على شاشتك الرئيسية" />
            </div>
          </motion.div>
        )}

        {platform === "android" && (
          <motion.div {...anim(0.2)} className="space-y-3">
            <h2 className="text-[14px] font-bold flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> التثبيت على Android
            </h2>
            <div className="glass-card rounded-2xl divide-y divide-border/20 overflow-hidden">
              {deferredPrompt ? (
                <Step num={1} icon={<Download className="w-4 h-4 text-primary" />}
                  title="اضغط زر التثبيت أعلاه"
                  desc="سيطلب منك المتصفح تأكيد التثبيت" />
              ) : (
                <>
                  <Step num={1} icon={<MoreVertical className="w-4 h-4 text-primary" />}
                    title="افتح قائمة المتصفح"
                    desc="اضغط على النقاط الثلاث ⋮ في أعلى المتصفح" />
                  <Step num={2} icon={<Download className="w-4 h-4 text-primary" />}
                    title='اختر "تثبيت التطبيق"'
                    desc='أو "إضافة إلى الشاشة الرئيسية"' />
                </>
              )}
              <Step num={deferredPrompt ? 2 : 3} icon={<CheckCircle2 className="w-4 h-4 text-success" />}
                title="تم!"
                desc="سيظهر التطبيق على شاشتك الرئيسية" />
            </div>
          </motion.div>
        )}

        {platform === "desktop" && (
          <motion.div {...anim(0.2)} className="space-y-3">
            <h2 className="text-[14px] font-bold flex items-center gap-2">
              <Monitor className="w-4 h-4" /> التثبيت على الكمبيوتر
            </h2>
            <div className="glass-card rounded-2xl divide-y divide-border/20 overflow-hidden">
              {deferredPrompt ? (
                <Step num={1} icon={<Download className="w-4 h-4 text-primary" />}
                  title="اضغط زر التثبيت أعلاه"
                  desc="سيطلب منك المتصفح تأكيد التثبيت" />
              ) : (
                <Step num={1} icon={<Download className="w-4 h-4 text-primary" />}
                  title="اضغط أيقونة التثبيت في شريط العنوان"
                  desc="ستجدها في الطرف الأيمن من شريط عنوان المتصفح ⊕" />
              )}
              <Step num={2} icon={<CheckCircle2 className="w-4 h-4 text-success" />}
                title='اضغط "تثبيت"'
                desc="سيعمل التطبيق كتطبيق مستقل" />
            </div>
          </motion.div>
        )}

        {/* Back link */}
        <motion.div {...anim(0.3)} className="text-center pt-4">
          <a href="/login" className="text-[12px] text-muted-foreground hover:text-primary transition-colors">
            ← العودة لتسجيل الدخول
          </a>
        </motion.div>
      </div>
    </div>
  );
}

function Step({ num, icon, title, desc }: { num: number; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-4">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-[12px] font-bold text-primary">
        {num}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {icon}
          <p className="text-[13px] font-semibold">{title}</p>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
