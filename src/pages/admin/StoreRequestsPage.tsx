import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ShoppingBag, Check, X, ExternalLink } from "lucide-react";
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
  { key: "all", label: "الكل" },
  { key: "animated_photo", label: "📸 صور متحركة" },
  { key: "frame", label: "🖼 إطارات" },
  { key: "entry_gift", label: "✨ دخوليات" },
  { key: "hair", label: "💇 شعارات" },
  { key: "custom_gift", label: "🎁 هدايا مخصصة" },
];

const typeLabels: Record<string, string> = {
  animated_photo: "📸 صورة متحركة",
  frame: "🖼 إطار",
  entry_gift: "✨ دخولية",
  custom_gift: "🎁 هدية مخصصة",
  hair: "💇 شعار",
};

export default function StoreRequestsPage() {
  const [requests, setRequests] = useState<StoreRequest[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    const allRequests: StoreRequest[] = [];

    try {
      // Animated photo requests
      if (filter === "all" || filter === "animated_photo") {
        const { data } = await supabase
          .from("animated_photo_requests")
          .select("*")
          .order("created_at", { ascending: false });
        if (data) {
          allRequests.push(...data.map(r => ({
            id: r.id,
            type: "animated_photo" as const,
            user_name: r.user_name,
            user_uuid: r.user_uuid,
            status: r.status,
            created_at: r.created_at,
            preview_url: r.gif_url,
            details: `مدة: ${r.duration_label}`,
            admin_note: r.admin_note,
          })));
        }
      }

      // Frame claims
      if (filter === "all" || filter === "frame") {
        const { data } = await supabase
          .from("frame_claims")
          .select("*, frames(title, file_url)")
          .order("created_at", { ascending: false });
        if (data) {
          allRequests.push(...data.map(r => ({
            id: r.id,
            type: "frame" as const,
            user_name: r.user_uuid,
            user_uuid: r.user_uuid,
            status: "claimed",
            created_at: r.created_at,
            preview_url: (r as any).frames?.file_url,
            details: `إطار: ${(r as any).frames?.title || r.frame_id} • نوع: ${r.claim_type} • شهر: ${r.claim_month}`,
          })));
        }
      }

      // Entry gift claims
      if (filter === "all" || filter === "entry_gift") {
        const { data } = await supabase
          .from("entry_gift_claims")
          .select("*, entry_gifts(title, video_url)")
          .order("created_at", { ascending: false });
        if (data) {
          allRequests.push(...data.map(r => ({
            id: r.id,
            type: "entry_gift" as const,
            user_name: r.user_uuid,
            user_uuid: r.user_uuid,
            status: "claimed",
            created_at: r.created_at,
            details: `دخولية: ${(r as any).entry_gifts?.title || r.gift_id} • استخدام: ${r.gift_usage} • نوع: ${r.claim_type}`,
          })));
        }
      }

      // Custom gifts
      if (filter === "all" || filter === "custom_gift") {
        const { data } = await supabase
          .from("custom_gifts")
          .select("*")
          .eq("is_deleted", false)
          .order("created_at", { ascending: false });
        if (data) {
          allRequests.push(...data.map(r => ({
            id: r.id,
            type: "custom_gift" as const,
            user_name: r.user_name,
            user_uuid: r.user_uuid,
            status: r.status,
            created_at: r.created_at,
            preview_url: r.thumbnail_url || r.video_url,
            details: `${r.title} • مدة: ${r.video_duration}ث`,
            admin_note: r.admin_note,
          })));
        }
      }

      // Hair selections
      if (filter === "all" || filter === "hair") {
        const { data } = await supabase
          .from("hair_selections")
          .select("*, hairs(title, file_url)")
          .order("created_at", { ascending: false });
        if (data) {
          allRequests.push(...data.map(r => ({
            id: r.id,
            type: "hair" as const,
            user_name: r.user_uuid,
            user_uuid: r.user_uuid,
            status: r.status,
            created_at: r.created_at,
            preview_url: (r as any).hairs?.file_url,
            details: `شعار: ${(r as any).hairs?.title || r.hair_id} • أسبوع: ${r.selection_week}`,
            admin_note: r.admin_note,
          })));
        }
      }

      // Sort by date
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
    else return; // frame/entry claims don't have approve flow

    const { error } = await supabase
      .from(table)
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
      .from(table)
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
            <motion.div key={`${r.type}-${r.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <UserAvatar name={r.user_name} uuid={r.user_uuid} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.user_name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {typeLabels[r.type]}
                </span>
              </div>

              {r.preview_url && (
                <div className="rounded-xl overflow-hidden bg-secondary">
                  {r.preview_url.match(/\.(mp4|webm|mov)$/i) ? (
                    <video src={r.preview_url} className="w-full h-40 object-cover" controls />
                  ) : (
                    <img src={r.preview_url} alt="معاينة" className="w-full h-40 object-cover" />
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">{r.details}</p>

              {r.admin_note && (
                <div className="bg-primary/5 rounded-lg px-2.5 py-1.5">
                  <p className="text-[10px] text-primary">📋 {r.admin_note}</p>
                </div>
              )}

              {r.status === "pending" ? (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(r)} className="flex-1 h-10 rounded-xl text-sm font-medium text-primary-foreground active:scale-[0.97] flex items-center justify-center gap-1" style={{ background: "var(--gradient-button)" }}>
                    <Check className="w-4 h-4" /> قبول
                  </button>
                  <button onClick={() => handleReject(r)} className="flex-1 h-10 rounded-xl bg-destructive/20 text-destructive text-sm font-medium active:scale-[0.97] flex items-center justify-center gap-1">
                    <X className="w-4 h-4" /> رفض
                  </button>
                </div>
              ) : (
                <p className="text-xs text-center text-muted-foreground">
                  {r.status === "approved" ? "✅ مقبول" : r.status === "rejected" ? "❌ مرفوض" : `📋 ${r.status}`}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
