import { useState, useEffect } from "react";
import { Users, Shield, UserPlus, Edit, Trash2, Clock, Phone } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface AdminAccount {
  username: string;
  name: string;
  role: string;
  phone: string;
  status: string;
  must_change_password: boolean;
  shift_start: string | null;
  shift_end: string | null;
  permissions: string[];
  last_login: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "👑 مالك",
  super_admin: "🛡️ سوبر أدمن",
  admin: "👤 أدمن",
};

export default function AdminManagementPage() {
  const { isOwner } = useAuth();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminAccount | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.adminAccounts();
      if (res.success) setAccounts(res.accounts || []);
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (username: string) => {
    if (!confirm(`هل تريد حذف حساب ${username}؟`)) return;
    try {
      await api.adminAccountDelete(username);
      toast({ title: "✅ تم حذف الحساب" });
      loadAccounts();
    } catch (e: any) {
      toast({ title: "❌ خطأ", description: e.message, variant: "destructive" });
    }
  };

  const handleResetPassword = async (username: string) => {
    try {
      await api.adminAccountUpdate(username, { password: "1122" });
      toast({ title: "✅ تم إعادة تعيين كلمة المرور إلى 1122" });
      loadAccounts();
    } catch {}
  };

  if (!isOwner()) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <PageHeader title="إدارة الأدمن" showBack />
        <div className="text-center py-20 text-muted-foreground">🔒 هذه الصفحة خاصة بالمالك فقط</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="👥 إدارة الأدمن" showBack />

      <div className="px-4 mt-4 space-y-3">
        {/* Summary */}
        <div className="flex gap-2">
          {["owner", "super_admin", "admin"].map(role => {
            const count = accounts.filter(a => a.role === role).length;
            return (
              <div key={role} className="flex-1 p-3 bg-card rounded-xl border border-border text-center">
                <p className="text-lg font-bold">{count}</p>
                <p className="text-[10px] text-muted-foreground">{ROLE_LABELS[role]}</p>
              </div>
            );
          })}
        </div>

        {/* Account list */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : (
          accounts.map((acc, i) => (
            <motion.div
              key={acc.username}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-3 bg-card rounded-xl border border-border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    acc.role === "owner" ? "bg-yellow-500/20 text-yellow-400" :
                    acc.role === "super_admin" ? "bg-blue-500/20 text-blue-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>
                    {acc.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{acc.name}</p>
                    <p className="text-[10px] text-muted-foreground">@{acc.username} · {ROLE_LABELS[acc.role] || acc.role}</p>
                    {acc.shift_start && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {acc.shift_start} - {acc.shift_end}
                      </p>
                    )}
                    {acc.phone && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1" dir="ltr">
                        <Phone className="w-3 h-3" /> {acc.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {acc.status === "active" ? (
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                  {acc.role !== "owner" && (
                    <>
                      <button onClick={() => handleResetPassword(acc.username)} className="p-1.5 text-muted-foreground hover:text-foreground">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(acc.username)} className="p-1.5 text-muted-foreground hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {acc.must_change_password && (
                <p className="text-[10px] text-yellow-400 mt-1">⚠️ لم يغير كلمة المرور بعد</p>
              )}
              {acc.last_login && (
                <p className="text-[10px] text-muted-foreground mt-0.5">آخر دخول: {acc.last_login}</p>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
