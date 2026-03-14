import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { CardSkeleton } from "@/components/LoadingSkeleton";

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <div className="pb-20"><CardSkeleton count={5} /></div>;
  if (!profile) return null;

  return (
    <div className="pb-20">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-8 pb-4 px-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center text-3xl font-bold text-primary-foreground mb-3">
          {profile.name[0]}
        </div>
        <h1 className="text-xl font-bold">{profile.name}</h1>
        <p className="text-sm text-muted-foreground">UUID: {profile.uuid}</p>
        <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs bg-success/20 text-success">🟢 نشط</span>
      </motion.div>

      <div className="px-4 space-y-3">
        {/* Balance */}
        <div className="bg-card rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground">💰 الرصيد الحالي</p>
          <p className="text-2xl font-black text-primary mt-1">{profile.balance?.toLocaleString()} كوينز</p>
        </div>

        {/* Salary */}
        <div className="bg-card rounded-2xl p-4 space-y-2">
          <p className="text-sm font-bold">📊 الراتب هذا الشهر</p>
          <div className="flex justify-between text-sm">
            <span>${profile.current_salary.salary}</span><span className="text-muted-foreground">الراتب</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-destructive">-${profile.current_salary.deduction}</span><span className="text-muted-foreground">القطع</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-sm font-bold">
            <span className="text-success">${profile.current_salary.net}</span><span>الصافي</span>
          </div>
        </div>

        {/* Support */}
        <div className="bg-card rounded-2xl p-4 space-y-2">
          <p className="text-sm font-bold">🎁 الدعم هذا الشهر</p>
          <div className="flex justify-between text-sm">
            <span>{profile.monthly_sent?.toLocaleString()} كوينز</span><span className="text-muted-foreground">أرسلت</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{profile.monthly_received?.toLocaleString()} كوينز</span><span className="text-muted-foreground">استلمت</span>
          </div>
        </div>

        {/* Levels */}
        <div className="bg-card rounded-2xl p-4 space-y-2">
          <p className="text-sm font-bold">📈 المستويات</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="text-lg font-bold">{profile.sender_level}</p><p className="text-[10px] text-muted-foreground">إرسال</p></div>
            <div><p className="text-lg font-bold">{profile.received_level}</p><p className="text-[10px] text-muted-foreground">استلام</p></div>
            <div><p className="text-lg font-bold">{profile.charger_level}</p><p className="text-[10px] text-muted-foreground">شحن</p></div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-card rounded-2xl p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>{profile.vip}</span><span className="text-muted-foreground">⭐ VIP</span></div>
          <div className="flex justify-between"><span>#{profile.agency_id}</span><span className="text-muted-foreground">👨‍👩‍👦 الوكالة</span></div>
          <div className="flex justify-between"><span>{profile.created_at}</span><span className="text-muted-foreground">📅 تاريخ التسجيل</span></div>
        </div>

        <button onClick={handleLogout} className="w-full h-12 rounded-xl bg-destructive/10 text-destructive font-medium flex items-center justify-center gap-2 active:scale-[0.97] mt-4">
          <LogOut className="w-4 h-4" /> تسجيل خروج
        </button>
      </div>
    </div>
  );
}
