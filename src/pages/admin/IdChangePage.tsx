import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ArrowRightLeft, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface IdChange {
  id: string;
  user_uuid: string;
  new_id: string;
  level_milestone: number;
  created_at: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function IdChangePage() {
  const [requests, setRequests] = useState<IdChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRequests(); }, []);

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

      {/* Stats */}
      {!loading && requests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-4 mt-2 mb-4">
          <div className="stat-card rounded-2xl p-4 flex items-center gap-4">
            <div className="icon-3d w-12 h-12 rounded-xl">
              <ArrowRightLeft className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{requests.length}</p>
              <p className="text-[11px] text-muted-foreground">طلب تغيير آيدي</p>
            </div>
          </div>
        </motion.div>
      )}

      {loading ? <CardSkeleton /> : requests.length === 0 ? (
        <EmptyState icon={ArrowRightLeft} title="لا توجد طلبات" description="لا توجد طلبات تغيير آيدي" />
      ) : (
        <div className="px-4 space-y-3 perspective-grid">
          {requests.map((r, i) => (
            <motion.div
              key={r.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="card-3d rounded-2xl p-4 space-y-3 relative overflow-hidden"
            >
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-l from-primary to-accent" />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-medium">{formatDate(r.created_at)}</span>
                <span className="text-[10px] px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> مستوى: {r.level_milestone}
                </span>
              </div>

              {/* ID Change Visual */}
              <div className="glass-card rounded-xl p-3.5 flex items-center justify-center gap-4 border-border/10">
                <div className="text-center">
                  <p className="text-[9px] text-muted-foreground mb-1">القديم</p>
                  <p className="text-[12px] font-mono font-bold text-muted-foreground">{r.user_uuid}</p>
                </div>
                <div className="icon-3d w-8 h-8 rounded-lg shrink-0">
                  <ArrowRightLeft className="w-4 h-4 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-primary mb-1">الجديد</p>
                  <p className="text-[12px] font-mono font-bold text-primary">{r.new_id}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
