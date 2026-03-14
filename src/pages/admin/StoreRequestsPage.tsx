import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ShoppingBag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const typeFilters = [
  { key: "all", label: "الكل" },
  { key: "animated_photo", label: "📸 صور متحركة" },
  { key: "frame", label: "🖼 إطارات" },
  { key: "entry", label: "✨ دخوليات" },
  { key: "hair", label: "💇 شعارات" },
  { key: "custom_gift", label: "🎁 هدايا" },
];

export default function StoreRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.storeRequests(filter).then(setRequests).catch(() => {
      setRequests([
        { request_id: 1, user_name: "أحمد القحطاني", user_uuid: "1234", type: "animated_photo", preview_url: "", time: "منذ 15 دقيقة", status: "pending", cost: "2,500 ماسة" },
        { request_id: 2, user_name: "سارة محمد", user_uuid: "5678", type: "frame", preview_url: "", time: "منذ ساعتين", status: "pending", cost: "5,000 ماسة" },
      ]);
    }).finally(() => setLoading(false));
  }, [filter]);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    if (action === "approve") {
      try { await api.storeApprove(id); } catch {}
    } else {
      try { await api.storeReject(id, ""); } catch {}
    }
    setRequests(prev => prev.map(r => r.request_id === id ? { ...r, status: action === "approve" ? "approved" : "rejected" } : r));
    toast({ title: action === "approve" ? "✅ تم قبول الطلب" : "❌ تم رفض الطلب" });
  };

  return (
    <div className="pb-20">
      <PageHeader title="طلبات المتجر" showBack />
      <div className="flex gap-2 p-4 overflow-x-auto">
        {typeFilters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 h-8 rounded-full text-xs font-medium whitespace-nowrap ${filter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {f.label}
          </button>
        ))}
      </div>
      {loading ? <CardSkeleton /> : requests.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="لا توجد طلبات" />
      ) : (
        <div className="px-4 space-y-3">
          {requests.map(r => (
            <motion.div key={r.request_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold">{r.user_name[0]}</div>
                <div>
                  <p className="text-sm font-semibold">{r.user_name}</p>
                  <p className="text-xs text-muted-foreground">{r.time}</p>
                </div>
              </div>
              {r.preview_url && (
                <div className="h-40 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground text-sm">معاينة</div>
              )}
              <p className="text-xs text-muted-foreground">التكلفة: {r.cost}</p>
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
