import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Star, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/UserAvatar";

export default function VipRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.vipRequests().then(setRequests).catch(() => {
      setRequests([
        { request_id: 1, user_name: "أحمد المنصور", user_uuid: "99281", level: 42, vip_type: "التاج الذهبي (VIP 3)", time: "12 أكتوبر", status: "pending" },
        { request_id: 2, user_name: "سارة العتيبي", user_uuid: "77412", level: 18, vip_type: "عضوية فضية (VIP 1)", time: "11 أكتوبر", status: "pending" },
      ]);
    }).finally(() => setLoading(false));
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try { await api.vipAction(id, action); } catch {}
    setRequests(prev => prev.map(r => r.request_id === id ? { ...r, status: action === "approve" ? "approved" : "rejected" } : r));
    toast({ title: action === "approve" ? "✅ تم القبول" : "❌ تم الرفض" });
  };

  return (
    <div className="pb-20">
      <PageHeader title="طلبات VIP" showBack />
      {loading ? <CardSkeleton /> : requests.length === 0 ? (
        <EmptyState icon={Star} title="لا توجد طلبات" />
      ) : (
        <div className="px-3 space-y-2 mt-2">
          {requests.map(r => (
            <motion.div key={r.request_id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card/70 rounded-2xl p-3 border border-border/30">
              {/* User info */}
              <div className="flex items-center gap-2.5 mb-2">
                <UserAvatar name={r.user_name} uuid={r.user_uuid} size="md" badge="⭐" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold">{r.user_name}</p>
                  <p className="text-[10px] text-muted-foreground">UUID: {r.user_uuid} • Lv.{r.level}</p>
                </div>
              </div>

              <div className="bg-background/50 rounded-lg px-2.5 py-1.5 mb-2.5 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{r.time}</span>
                <span className="text-[11px] text-amber-400 font-medium">⭐ {r.vip_type}</span>
              </div>

              {r.status === "pending" ? (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(r.request_id, "approve")}
                    className="h-8 rounded-lg text-[11px] font-medium text-primary-foreground active:scale-[0.96] flex items-center gap-1 flex-1 justify-center"
                    style={{ background: "var(--gradient-button)" }}>
                    <Check className="w-3.5 h-3.5" /> قبول
                  </button>
                  <button onClick={() => handleAction(r.request_id, "reject")}
                    className="h-8 rounded-lg bg-destructive/15 text-destructive text-[11px] font-medium active:scale-[0.96] flex items-center gap-1 flex-1 justify-center">
                    <X className="w-3.5 h-3.5" /> رفض
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-center text-muted-foreground">{r.status === "approved" ? "✅ مقبول" : "❌ مرفوض"}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
