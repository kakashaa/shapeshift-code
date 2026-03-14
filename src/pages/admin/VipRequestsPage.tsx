import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Star, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/UserAvatar";

interface VipRequest {
  id: string;
  user_name: string;
  user_uuid: string;
  vip_level: number;
  request_month: string;
  created_at: string;
  type_user: number | null;
  recipient_uuid: string | null;
}

const vipLabels: Record<number, string> = {
  1: "عضوية فضية (VIP 1)",
  2: "عضوية ذهبية (VIP 2)",
  3: "التاج الذهبي (VIP 3)",
  4: "التاج الماسي (VIP 4)",
  5: "التاج الملكي (VIP 5)",
  6: "VIP 6",
};

export default function VipRequestsPage() {
  const [requests, setRequests] = useState<VipRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vip_requests" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading VIP requests:", error);
      toast({ title: "خطأ في تحميل الطلبات", variant: "destructive" });
    }
    setRequests(data || []);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar", { day: "numeric", month: "long" });
  };

  return (
    <div className="pb-20">
      <PageHeader title="طلبات VIP" showBack />
      {loading ? <CardSkeleton /> : requests.length === 0 ? (
        <EmptyState icon={Star} title="لا توجد طلبات" />
      ) : (
        <div className="px-3 space-y-2 mt-2">
          {requests.map(r => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card/70 rounded-2xl p-3 border border-border/30">
              <div className="flex items-center gap-2.5 mb-2">
                <UserAvatar name={r.user_name} uuid={r.user_uuid} size="md" badge="⭐" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold">{r.user_name}</p>
                  <p className="text-[10px] text-muted-foreground">UUID: {r.user_uuid}</p>
                </div>
              </div>

              <div className="bg-background/50 rounded-lg px-2.5 py-1.5 mb-2.5 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{formatDate(r.created_at)}</span>
                <span className="text-[11px] text-amber-400 font-medium">⭐ {vipLabels[r.vip_level] || `VIP ${r.vip_level}`}</span>
              </div>

              {r.recipient_uuid && (
                <div className="bg-background/50 rounded-lg px-2.5 py-1.5 mb-2.5">
                  <span className="text-[10px] text-muted-foreground">هدية لـ: {r.recipient_uuid}</span>
                </div>
              )}

              <p className="text-[10px] text-center text-muted-foreground">
                شهر: {r.request_month}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
