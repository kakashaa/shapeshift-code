import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Star, Crown, Gift } from "lucide-react";
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
  1: "عضوية فضية",
  2: "عضوية ذهبية",
  3: "التاج الذهبي",
  4: "التاج الماسي",
  5: "التاج الملكي",
  6: "VIP 6",
};

const vipIcons: Record<number, string> = {
  1: "🥈", 2: "🥇", 3: "👑", 4: "💎", 5: "🏆", 6: "⭐",
};

const vipGradients: Record<number, string> = {
  1: "from-slate-400/20 to-slate-500/5",
  2: "from-amber-400/20 to-amber-500/5",
  3: "from-yellow-400/20 to-yellow-500/5",
  4: "from-cyan-400/20 to-blue-500/5",
  5: "from-purple-400/20 to-pink-500/5",
  6: "from-primary/20 to-accent/5",
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, rotateX: 8 },
  visible: (i: number) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function VipRequestsPage() {
  const [requests, setRequests] = useState<VipRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRequests(); }, []);

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
    setRequests((data as any) || []);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar", { day: "numeric", month: "long" });
  };

  return (
    <div className="pb-20">
      <PageHeader title="طلبات VIP" showBack />

      {/* Stats Summary */}
      {!loading && requests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-2 mb-4"
        >
          <div className="stat-card rounded-2xl p-4 flex items-center gap-4">
            <div className="icon-3d w-12 h-12 rounded-xl">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{requests.length}</p>
              <p className="text-[11px] text-muted-foreground">طلب VIP نشط</p>
            </div>
          </div>
        </motion.div>
      )}

      {loading ? <CardSkeleton /> : requests.length === 0 ? (
        <EmptyState icon={Star} title="لا توجد طلبات" description="لا توجد طلبات VIP حالياً" />
      ) : (
        <div className="px-4 space-y-3 perspective-grid">
          {requests.map((r, i) => (
            <motion.div
              key={r.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="card-3d rounded-2xl overflow-hidden"
            >
              {/* VIP Level Gradient Header */}
              <div className={`bg-gradient-to-l ${vipGradients[r.vip_level] || vipGradients[6]} px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <motion.span
                    className="text-xl"
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    {vipIcons[r.vip_level] || "⭐"}
                  </motion.span>
                  <span className="text-[12px] font-bold text-amber-300">
                    {vipLabels[r.vip_level] || `VIP ${r.vip_level}`}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {formatDate(r.created_at)}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <UserAvatar name={r.user_name} uuid={r.user_uuid} size="md" badge={vipIcons[r.vip_level]} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold">{r.user_name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">UUID: {r.user_uuid}</p>
                  </div>
                </div>

                {r.recipient_uuid && (
                  <div className="glass-card rounded-xl px-3 py-2 flex items-center gap-2 border-border/10">
                    <Gift className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] text-muted-foreground">هدية لـ: <span className="text-foreground font-mono">{r.recipient_uuid}</span></span>
                  </div>
                )}

                <div className="flex items-center justify-center">
                  <span className="text-[10px] px-3 py-1 rounded-lg bg-secondary/60 text-muted-foreground font-medium">
                    📅 شهر: {r.request_month}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
