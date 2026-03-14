import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { PullToRefresh } from "@/components/PullToRefresh";

export default function UserDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { name, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.userProfile().then(setProfile).catch(() => {
      setProfile({
        uuid: localStorage.getItem("ghala_uuid") || "12345",
        name: name || "محمد", balance: 850000, vip: 15,
        sender_level: 42, received_level: 11, charger_level: 43,
        current_salary: { salary: 150, deduction: 20, net: 130 },
        monthly_sent: 500000, monthly_received: 1200000,
        agency_id: 2, created_at: "2025-01-15",
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleRefresh = useCallback(async () => {
    const data = await api.userProfile().catch(() => profile);
    setProfile(data);
  }, [profile]);

  if (loading) return <div className="pb-20 pt-4"><CardSkeleton count={5} /></div>;
  if (!profile) return null;

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.35 },
  });

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="pb-20">
        {/* Profile header */}
        <motion.div {...anim(0)} className="text-center pt-8 pb-4 px-4">
          <UserAvatar name={profile.name} uuid={profile.uuid} size="xl" className="mx-auto mb-3" online />
          <h1 className="text-base font-bold">{profile.name}</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">UUID: {profile.uuid}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-lg text-[10px] font-medium bg-success/10 text-success">
            🟢 نشط
          </span>
        </motion.div>

        <div className="px-4 space-y-3">
          {/* Balance */}
          <motion.div {...anim(0.08)} className="stat-card text-center glow-border">
            <p className="text-[10px] text-muted-foreground mb-1">💰 الرصيد</p>
            <p className="text-2xl font-bold text-primary">{profile.balance?.toLocaleString()} <span className="text-sm font-medium text-muted-foreground">كوينز</span></p>
          </motion.div>

          {/* Salary */}
          <motion.div {...anim(0.12)} className="glass-card p-4 space-y-2">
            <p className="text-[12px] font-bold">📊 الراتب</p>
            <div className="flex justify-between text-[12px] py-1">
              <span className="font-semibold">${profile.current_salary.salary}</span>
              <span className="text-muted-foreground">الراتب</span>
            </div>
            {profile.current_salary.deduction > 0 && (
              <div className="flex justify-between text-[12px] py-1">
                <span className="text-destructive font-semibold">-${profile.current_salary.deduction}</span>
                <span className="text-muted-foreground">القطع</span>
              </div>
            )}
            <div className="border-t border-border/40 pt-2 flex justify-between text-[13px] font-bold">
              <span className="text-success">${profile.current_salary.net}</span>
              <span>الصافي</span>
            </div>
          </motion.div>

          {/* Support */}
          <motion.div {...anim(0.16)} className="glass-card p-4">
            <p className="text-[12px] font-bold mb-2">🎁 الدعم</p>
            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-base font-bold">{(profile.monthly_sent / 1000).toFixed(0)}K</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">أرسلت</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-base font-bold">{(profile.monthly_received / 1000000).toFixed(1)}M</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">استلمت</p>
              </div>
            </div>
          </motion.div>

          {/* Levels */}
          <motion.div {...anim(0.2)} className="glass-card p-4">
            <p className="text-[12px] font-bold mb-2">📈 المستويات</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { v: profile.sender_level, l: "إرسال" },
                { v: profile.received_level, l: "استلام" },
                { v: profile.charger_level, l: "شحن" },
              ].map((s, i) => (
                <div key={i} className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-base font-bold">{s.v}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div {...anim(0.24)} className="glass-card p-4 space-y-2.5 text-[12px]">
            <div className="flex justify-between">
              <span className="font-semibold">{profile.vip}</span>
              <span className="text-muted-foreground">⭐ VIP</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">#{profile.agency_id}</span>
              <span className="text-muted-foreground">👨‍👩‍👦 الوكالة</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold font-mono text-[11px]">{profile.created_at}</span>
              <span className="text-muted-foreground">📅 التسجيل</span>
            </div>
          </motion.div>

          <motion.button
            {...anim(0.28)}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full h-10 rounded-xl bg-destructive/8 text-destructive text-[12px] font-semibold flex items-center justify-center gap-2 mt-1"
          >
            <LogOut className="w-4 h-4" /> تسجيل خروج
          </motion.button>
        </div>
      </div>
    </PullToRefresh>
  );
}
