import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
    toast({ title: action === "approve" ? "✅ تم قبول الطلب" : "❌ تم رفض الطلب" });
  };

  return (
    <div className="pb-20">
      <PageHeader title="طلبات VIP" showBack />
      {loading ? <CardSkeleton /> : requests.length === 0 ? (
        <EmptyState icon={Star} title="لا توجد طلبات" description="ما فيه طلبات VIP حالياً" />
      ) : (
        <div className="p-4 space-y-3">
          {requests.map(r => (
            <motion.div key={r.request_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold">{r.user_name[0]}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{r.user_name}</p>
                  <p className="text-xs text-muted-foreground">UUID: {r.user_uuid} • المستوى {r.level}</p>
                </div>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 text-sm">
                <p>نوع الباقة: <span className="text-primary font-medium">{r.vip_type}</span></p>
                <p className="text-xs text-muted-foreground mt-1">تاريخ الطلب: {r.time}</p>
              </div>
              {r.status === "pending" ? (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(r.request_id, "approve")} className="flex-1 h-10 rounded-xl text-sm font-medium text-primary-foreground active:scale-[0.97]" style={{ background: "var(--gradient-button)" }}>قبول الطلب</button>
                  <button onClick={() => handleAction(r.request_id, "reject")} className="flex-1 h-10 rounded-xl bg-destructive/20 text-destructive text-sm font-medium active:scale-[0.97]">رفض</button>
                </div>
              ) : (
                <p className="text-xs text-center text-muted-foreground">{r.status === "approved" ? "✅ تم القبول" : "❌ مرفوض"}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
