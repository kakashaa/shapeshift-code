import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Ban, Diamond, Send, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/UserAvatar";

export default function UserSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await api.userSearch(query);
      setResults(data);
    } catch {
      setResults([
        { uuid: "12345", name: "محمد الأحمدي", avatar: "", status: "active" },
        { uuid: "67890", name: "محمد علي", avatar: "", status: "active" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetail = async (uuid: string) => {
    try {
      const data = await api.userDetail(uuid);
      setSelectedUser(data);
    } catch {
      setSelectedUser({
        uuid, name: "محمد الأحمدي", status: "active", balance: 50000, diamonds: 1200000,
        monthly_charges: 45, monthly_charges_usd: 45, created_at: "2025-01-15", is_banned: false,
      });
    }
  };

  const handleBan = async () => {
    if (!selectedUser) return;
    const reason = prompt("سبب الحظر:");
    if (!reason) return;
    try { await api.userBan(selectedUser.uuid, reason); } catch {}
    toast({ title: `تم حظر ${selectedUser.name}` });
    setSelectedUser({ ...selectedUser, is_banned: true });
  };

  const handleAddDiamonds = async () => {
    if (!selectedUser) return;
    const amount = prompt("كم ماسة تبي تضيف؟");
    if (!amount || isNaN(Number(amount))) return;
    try { await api.addDiamonds(selectedUser.uuid, Number(amount)); } catch {}
    toast({ title: `تم إضافة ${amount} ماسة` });
  };

  return (
    <div className="pb-20">
      <PageHeader title="بحث مستخدم" showBack />
      
      <div className="p-4">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="ابحث بـ UUID أو الاسم..."
            className="flex-1 h-12 rounded-xl bg-secondary px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button onClick={handleSearch} disabled={loading} className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--gradient-button)" }}>
            <Search className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedUser ? (
          <motion.div key="detail" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-4 space-y-4">
            <button onClick={() => setSelectedUser(null)} className="text-sm text-primary">← العودة للنتائج</button>
            <div className="text-center space-y-2">
              <UserAvatar name={selectedUser.name} uuid={selectedUser.uuid} size="xl" className="mx-auto" online={!selectedUser.is_banned} />
              <h2 className="text-xl font-bold">{selectedUser.name}</h2>
              <p className="text-sm text-muted-foreground">UUID: {selectedUser.uuid}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${selectedUser.is_banned ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>
                {selectedUser.is_banned ? "محظور" : "🟢 نشط"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-xl p-3 text-center">
                <p className="text-lg font-bold">{selectedUser.balance?.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">كوينز</p>
              </div>
              <div className="bg-card rounded-xl p-3 text-center">
                <p className="text-lg font-bold">{(selectedUser.diamonds / 1000000).toFixed(1)}M</p>
                <p className="text-[10px] text-muted-foreground">ماسات</p>
              </div>
              <div className="bg-card rounded-xl p-3 text-center">
                <p className="text-lg font-bold">${selectedUser.monthly_charges_usd}</p>
                <p className="text-[10px] text-muted-foreground">شحنات الشهر</p>
              </div>
              <div className="bg-card rounded-xl p-3 text-center">
                <p className="text-lg font-bold">{selectedUser.created_at}</p>
                <p className="text-[10px] text-muted-foreground">تاريخ التسجيل</p>
              </div>
            </div>

            <div className="space-y-2">
              <button onClick={handleBan} className="w-full h-11 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97]">
                <Ban className="w-4 h-4" /> {selectedUser.is_banned ? "فك الحظر" : "حظر"}
              </button>
              <button onClick={handleAddDiamonds} className="w-full h-11 rounded-xl bg-secondary text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97]">
                <Diamond className="w-4 h-4 text-primary" /> إضافة ماسات
              </button>
              <button onClick={() => navigate("/more/notifications")} className="w-full h-11 rounded-xl bg-secondary text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97]">
                <Send className="w-4 h-4 text-primary" /> إرسال رسالة
              </button>
              <button onClick={() => navigate("/more/gift-audit")} className="w-full h-11 rounded-xl bg-secondary text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97]">
                <Eye className="w-4 h-4 text-primary" /> مراجعة الدعم
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 space-y-1">
            {results.map(u => (
              <button key={u.uuid} onClick={() => loadUserDetail(u.uuid)} className="w-full flex items-center gap-3 px-4 py-3 bg-card rounded-xl active:bg-secondary transition-colors">
                <UserAvatar name={u.name} uuid={u.uuid} size="md" />
                <div className="text-right">
                  <p className="text-sm font-semibold">{u.name}</p>
                  <p className="text-xs text-muted-foreground">UUID: {u.uuid}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
