import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ShoppingBag, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/UserAvatar";

interface StoreRequest {
  id: string;
  type: "animated_photo" | "frame" | "entry_gift" | "custom_gift" | "hair";
  user_name: string;
  user_uuid: string;
  status: string;
  created_at: string;
  preview_url?: string;
  details: string;
  admin_note?: string | null;
}

const typeFilters = [
  { key: "all", label: "الكل", icon: "📦" },
  { key: "animated_photo", label: "صور متحركة", icon: "📸" },
  { key: "frame", label: "إطارات", icon: "🖼" },
  { key: "entry_gift", label: "دخوليات", icon: "✨" },
  { key: "hair", label: "شعارات", icon: "💇" },
  { key: "custom_gift", label: "هدايا مخصصة", icon: "🎁" },
];

const typeLabels: Record<string, string> = {
  animated_photo: "📸 صورة متحركة",
  frame: "🖼 إطار",
  entry_gift: "✨ دخولية",
  custom_gift: "🎁 هدية مخصصة",
  hair: "💇 شعار",
};

const typeAccentColors: Record<string, string> = {
  animated_photo: "hsl(200, 95%, 48%)",
  frame: "hsl(280, 80%, 55%)",
  entry_gift: "hsl(38, 92%, 52%)",
  custom_gift: "hsl(340, 80%, 55%)",
  hair: "hsl(160, 72%, 42%)",
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "⏳ قيد المراجعة", class: "bg-warning/15 text-warning" },
  approved: { label: "✅ مقبول", class: "bg-success/15 text-success" },
  rejected: { label: "❌ مرفوض", class: "bg-destructive/15 text-destructive" },
  claimed: { label: "📋 مُطالَب", class: "bg-primary/15 text-primary" },
};

export default function StoreRequestsPage() {
  const [requests, setRequests] = useState<StoreRequest[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRequests(); }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    const allRequests: StoreRequest[] = [];

    try {
      if (filter === "all" || filter === "animated_photo") {
        const { data } = await supabase
          .from("animated_photo_requests" as any)
          .select("*")
          .order("created_at", { ascending: false });
        if (data) {
          allRequests.push(...(data as any[]).map((r: any) => ({
            id: r.id, type: "animated_photo" as const,
            user_name: r.user_name, user_uuid: r.user_uuid, status: r.status,
            created_at: r.created_at, preview_url: r.gif_url,
            details: `مدة: ${r.duration_label}`, admin_note: r.admin_note,
          })));
        }
      }

      if (filter === "all" || filter === "frame") {
        const { data } = await supabase
          .from("frame_claims" as any)
          .select("*, frames(title, file_url)")
          .order("created_at", { ascending: false });
        if (data) {
          allRequests.push(...(data as any[]).map((r: any) => ({
            id: r.id, type: "frame" as const,
            user_name: r.user_uuid, user_uuid: r.user_uuid, status: "claimed",
            created_at: r.created_at, preview_url: (r as any).frames?.file_url,
            details: `إطار: ${(r as any).frames?.title || r.frame_id} • نوع: ${r.claim_type} • شهر: ${r.claim_month}`,
          })));
        }
      }

      if (filter === "all" || filter === "entry_gift") {
        const { data } = await supabase
          .from("entry_gift_claims" as any)
          .select("*, entry_gifts(title, video_url)")
          .order("created_at", { ascending: false });
        if (data) {
          allRequests.push(...(data as any[]).map((r: any) => ({
            id: r.id, type: "entry_gift" as const,
            user_name: r.user_uuid, user_uuid: r.user_uuid, status: "claimed",
            created_at: r.created_at,
            details: `دخولية: ${(r as any).entry_gifts?.title || r.gift_id} • استخدام: ${r.gift_usage} • نوع: ${r.claim_type}`,
          })));
        }
      }

      if (filter === "all" || filter === "custom_gift") {
        const { data } = await supabase
          .from("custom_gifts" as any)
          .select("*")
          .eq("is_deleted", false)
          .order("created_at", { ascending: false });
        if (data) {
          allRequests.push(...(data as any[]).map((r: any) => ({
            id: r.id, type: "custom_gift" as const,
            user_name: r.user_name, user_uuid: r.user_uuid, status: r.status,
            created_at: r.created_at, preview_url: r.thumbnail_url || r.video_url,
            details: `${r.title} • مدة: ${r.video_duration}ث`, admin_note: r.admin_note,
          })));
        }
      }

      if (filter === "all" || filter === "hair") {
        const { data } = await supabase
          .from("hair_selections" as any)
          .select("*, hairs(title, file_url)")
          .order("created_at", { ascending: false });
        if (data) {
          allRequests.push(...(data as any[]).map((r: any) => ({
            id: r.id, type: "hair" as const,
            user_name: r.user_uuid, user_uuid: r.user_uuid, status: r.status,
            created_at: r.created_at, preview_url: (r as any).hairs?.file_url,
            details: `شعار: ${(r as any).hairs?.title || r.hair_id} • أسبوع: ${r.selection_week}`,
            admin_note: r.admin_note,
          })));
        }
      }

      allRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (err) {
      console.error("Error loading store requests:", err);
      toast({ title: "خطأ في تحميل الطلبات", variant: "destructive" });
    }

    setRequests(allRequests);
    setLoading(false);
  };

  const handleApprove = async (req: StoreRequest) => {
    let table: string;
    if (req.type === "animated_photo") table = "animated_photo_requests";
    else if (req.type === "custom_gift") table = "custom_gifts";
    else if (req.type === "hair") table = "hair_selections";
    else return;

    const { error } = await supabase
      .from(table as any)
      .update({ status: "approved" })
      .eq("id", req.id);

    if (error) {
      toast({ title: "خطأ في قبول الطلب", variant: "destructive" });
      return;
    }
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "approved" } : r));
    toast({ title: "✅ تم قبول الطلب" });
  };

  const handleReject = async (req: StoreRequest) => {
    let table: string;
    if (req.type === "animated_photo") table = "animated_photo_requests";
    else if (req.type === "custom_gift") table = "custom_gifts";
    else if (req.type === "hair") table = "hair_selections";
    else return;

    const note = prompt("سبب الرفض (اختياري):");

    const { error } = await supabase
      .from(table as any)
      .update({ status: "rejected", admin_note: note || null })
      .eq("id", req.id);

    if (error) {
      toast({ title: "خطأ في رفض الطلب", variant: "destructive" });
      return;
    }
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "rejected", admin_note: note } : r));
    toast({ title: "❌ تم رفض الطلب" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return d.toLocaleDateString("ar", { day: "numeric", month: "short" });
  };

  return (
    <div className="pb-20">
      <PageHeader title="طلبات المتجر" showBack />

      {/* 3D Filter Chips */}
      <div className="flex gap-2 p-4 overflow-x-auto scrollbar-none">
        {typeFilters.map(f => (
          <motion.button
            key={f.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 h-9 rounded-xl text-[11px] font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all duration-300 ${
              filter === f.key
                ? "text-primary-foreground shadow-lg"
                : "glass-card border-border/20 text-muted-foreground"
            }`}
            style={filter === f.key ? { background: "var(--gradient-button)", boxShadow: "0 4px 20px hsl(200 95% 48% / 0.3)" } : {}}
          >
            <span>{f.icon}</span> {f.label}
          </motion.button>
        ))}
      </div>

      {loading ? <CardSkeleton /> : requests.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="لا توجد طلبات" description="لا توجد طلبات متجر حالياً" />
      ) : (
        <div className="px-4 space-y-3 perspective-grid">
          {requests.map((r, i) => (
            <motion.div
              key={`${r.type}-${r.id}`}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="card-3d rounded-2xl overflow-hidden"
            >
              {/* Type accent bar */}
              <div className="h-[2px]" style={{ background: typeAccentColors[r.type] || "hsl(var(--primary))" }} />

              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <UserAvatar name={r.user_name} uuid={r.user_uuid} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold">{r.user_name}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(r.created_at)}</p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-lg glass-card font-medium border-border/10">
                    {typeLabels[r.type]}
                  </span>
                </div>

                {/* Preview Image */}
                {r.preview_url && (
                  <div className="rounded-xl overflow-hidden border border-border/20" style={{ boxShadow: "var(--shadow-3d)" }}>
                    {r.preview_url.match(/\.(mp4|webm|mov)$/i) ? (
                      <video src={r.preview_url} className="w-full h-40 object-cover" controls />
                    ) : (
                      <img src={r.preview_url} alt="معاينة" className="w-full h-40 object-cover" />
                    )}
                  </div>
                )}

                {/* Details */}
                <p className="text-[11px] text-muted-foreground">{r.details}</p>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold ${statusConfig[r.status]?.class || "bg-secondary text-muted-foreground"}`}>
                    {statusConfig[r.status]?.label || `📋 ${r.status}`}
                  </span>
                </div>

                {/* Admin Notes */}
                {r.admin_note && (
                  <div className="bg-primary/5 rounded-xl px-3 py-2 border border-primary/10">
                    <p className="text-[10px] text-primary font-medium">📋 {r.admin_note}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {r.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleApprove(r)}
                      className="btn-3d flex-1 h-10 rounded-xl text-[12px] font-bold text-primary-foreground flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> قبول
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleReject(r)}
                      className="flex-1 h-10 rounded-xl bg-destructive/15 text-destructive text-[12px] font-bold flex items-center justify-center gap-1.5 active:bg-destructive/25 transition-colors"
                    >
                      <X className="w-4 h-4" /> رفض
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
