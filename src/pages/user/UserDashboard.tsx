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

  if (loading) return <div className="pb-20"><CardSkeleton count={5} /></div>;
  if (!profile) return null;

  return (
    <div className="pb-20">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-6 pb-3 px-4">
        <UserAvatar name={profile.name} uuid={profile.uuid} size="xl" className="mx-auto mb-2" online />
        <h1 className="text-base font-bold">{profile.name}</h1>
        <p className="text-[11px] text-muted-foreground">UUID: {profile.uuid}</p>
        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400">🟢 نشط</span>
      </motion.div>

      <div className="px-3 space-y-2">
        {/* Balance */}
        <div className="bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl p-3 text-center border border-primary/20">
          <p className="text-[10px] text-muted-foreground">💰 الرصيد</p>
          <p className="text-xl font-black text-primary">{profile.balance?.toLocaleString()} كوينز</p>
        </div>

        {/* Salary */}
        <div className="bg-card/70 rounded-2xl p-3 space-y-1.5 border border-border/30">
          <p className="text-[12px] font-bold">📊 الراتب</p>
          <div className="flex justify-between text-[11px]">
            <span>${profile.current_salary.salary}</span><span className="text-muted-foreground">الراتب</span>
          </div>
          {profile.current_salary.deduction > 0 && (
            <div className="flex justify-between text-[11px]">
              <span className="text-destructive">-${profile.current_salary.deduction}</span><span className="text-muted-foreground">القطع</span>
            </div>
          )}
          <div className="border-t border-border/50 pt-1.5 flex justify-between text-[12px] font-bold">
            <span className="text-emerald-400">${profile.current_salary.net}</span><span>الصافي</span>
          </div>
        </div>

        {/* Support */}
        <div className="bg-card/70 rounded-2xl p-3 border border-border/30">
          <p className="text-[12px] font-bold mb-1.5">🎁 الدعم</p>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-background/50 rounded-lg p-2">
              <p className="text-sm font-bold">{(profile.monthly_sent / 1000).toFixed(0)}K</p>
              <p className="text-[9px] text-muted-foreground">أرسلت</p>
            </div>
            <div className="bg-background/50 rounded-lg p-2">
              <p className="text-sm font-bold">{(profile.monthly_received / 1000000).toFixed(1)}M</p>
              <p className="text-[9px] text-muted-foreground">استلمت</p>
            </div>
          </div>
        </div>

        {/* Levels */}
        <div className="bg-card/70 rounded-2xl p-3 border border-border/30">
          <p className="text-[12px] font-bold mb-1.5">📈 المستويات</p>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            {[
              { v: profile.sender_level, l: "إرسال" },
              { v: profile.received_level, l: "استلام" },
              { v: profile.charger_level, l: "شحن" },
            ].map((s, i) => (
              <div key={i} className="bg-background/50 rounded-lg p-2">
                <p className="text-sm font-bold">{s.v}</p>
                <p className="text-[9px] text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-card/70 rounded-2xl p-3 space-y-1.5 text-[11px] border border-border/30">
          <div className="flex justify-between"><span>{profile.vip}</span><span className="text-muted-foreground">⭐ VIP</span></div>
          <div className="flex justify-between"><span>#{profile.agency_id}</span><span className="text-muted-foreground">👨‍👩‍👦 الوكالة</span></div>
          <div className="flex justify-between"><span>{profile.created_at}</span><span className="text-muted-foreground">📅 التسجيل</span></div>
        </div>

        <button onClick={handleLogout} className="w-full h-9 rounded-xl bg-destructive/10 text-destructive text-[12px] font-medium flex items-center justify-center gap-1.5 active:scale-[0.96] mt-2">
          <LogOut className="w-3.5 h-3.5" /> تسجيل خروج
        </button>
      </div>
    </div>
  );
}
