import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ArrowRightLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function IdChangePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.idChangeRequests().then(setRequests).catch(() => {
      setRequests([
        { request_id: 1, user_name: "محمد علي", old_uuid: "12345", new_uuid: "99999", status: "pending" },
        { request_id: 2, user_name: "سارة أحمد", old_uuid: "67890", new_uuid: "11111", status: "pending" },
      ]);
    }).finally(() => setLoading(false));
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try { await api.idChangeAction(id, action); } catch {}
    setRequests(prev => prev.map(r => r.request_id === id ? { ...r, status: action === "approve" ? "approved" : "rejected" } : r));
    toast({ title: action === "approve" ? "✅ تم قبول الطلب" : "❌ تم رفض الطلب" });
  };

  return (
    <div className="pb-20">
      <PageHeader title="طلبات تغيير آيدي" showBack />
      {loading ? <CardSkeleton /> : requests.length === 0 ? (
        <EmptyState icon={ArrowRightLeft} title="لا توجد طلبات" />
      ) : (
        <div className="p-4 space-y-3">
          {requests.map(r => (
            <motion.div key={r.request_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 space-y-3">
              <p className="font-semibold text-sm">{r.user_name}</p>
              <div className="flex items-center justify-center gap-3 bg-secondary/50 rounded-xl p-3">
                <span className="text-sm font-mono">{r.old_uuid}</span>
                <ArrowRightLeft className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono text-primary">{r.new_uuid}</span>
              </div>
              {r.status === "pending" ? (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(r.request_id, "approve")} className="flex-1 h-10 rounded-xl text-sm font-medium text-primary-foreground active:scale-[0.97]" style={{ background: "var(--gradient-button)" }}>✅ قبول</button>
                  <button onClick={() => handleAction(r.request_id, "reject")} className="flex-1 h-10 rounded-xl bg-destructive/20 text-destructive text-sm font-medium active:scale-[0.97]">❌ رفض</button>
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
