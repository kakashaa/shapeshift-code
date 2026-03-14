import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ArrowRightLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface IdChange {
  id: string;
  user_uuid: string;
  new_id: string;
  level_milestone: number;
  created_at: string;
}

export default function IdChangePage() {
  const [requests, setRequests] = useState<IdChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("id_changes" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading ID changes:", error);
      toast({ title: "خطأ في تحميل الطلبات", variant: "destructive" });
    }
    setRequests((data as any) || []);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar", { day: "numeric", month: "short" }) + " " +
      d.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="pb-20">
      <PageHeader title="طلبات تغيير آيدي" showBack />
      {loading ? <CardSkeleton /> : requests.length === 0 ? (
        <EmptyState icon={ArrowRightLeft} title="لا توجد طلبات" />
      ) : (
        <div className="p-4 space-y-3">
          {requests.map(r => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{formatDate(r.created_at)}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  مستوى: {r.level_milestone}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 bg-secondary/50 rounded-xl p-3">
                <span className="text-sm font-mono">{r.user_uuid}</span>
                <ArrowRightLeft className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono text-primary">{r.new_id}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
