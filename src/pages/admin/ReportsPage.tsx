import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { AlertTriangle, Check, X, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BanReport {
  id: string;
  reporter_gala_id: string;
  reported_user_id: string;
  description: string;
  evidence_url: string;
  evidence_type: string;
  ban_type: string;
  is_verified: boolean;
  admin_notes: string | null;
  reward_amount: number | null;
  reward_paid: boolean;
  created_at: string;
  expires_at: string | null;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<BanReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("all");

  useEffect(() => { loadReports(); }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    let query = supabase
      .from("ban_reports" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (filter === "pending") query = query.eq("is_verified", false);
    if (filter === "verified") query = query.eq("is_verified", true);

    const { data, error } = await query;
    if (error) {
      console.error("Error loading reports:", error);
      toast({ title: "خطأ في تحميل البلاغات", variant: "destructive" });
    }
    setReports((data as any) || []);
    setLoading(false);
  };

  const handleVerify = async (id: string) => {
    const { error } = await supabase
      .from("ban_reports")
      .update({ is_verified: true })
      .eq("id", id);

    if (error) {
      toast({ title: "خطأ", variant: "destructive" });
      return;
    }
    setReports(prev => prev.map(r => r.id === id ? { ...r, is_verified: true } : r));
    toast({ title: "✅ تم التحقق من البلاغ" });
  };

  const handleAddNote = async (id: string) => {
    const note = prompt("أضف ملاحظة:");
    if (!note) return;
    const { error } = await supabase
      .from("ban_reports")
      .update({ admin_notes: note })
      .eq("id", id);

    if (error) {
      toast({ title: "خطأ", variant: "destructive" });
      return;
    }
    setReports(prev => prev.map(r => r.id === id ? { ...r, admin_notes: note } : r));
    toast({ title: "✅ تم إضافة الملاحظة" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar", { day: "numeric", month: "short" }) + " " +
      d.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  };

  const banTypeLabels: Record<string, string> = {
    permanent: "حظر دائم",
    temporary: "حظر مؤقت",
    warning: "تحذير",
  };

  return (
    <div className="pb-20">
      <PageHeader title="البلاغات" showBack />

      <div className="flex gap-2 p-4 pb-2">
        {([
          { key: "all", label: "الكل" },
          { key: "pending", label: "قيد المراجعة" },
          { key: "verified", label: "تم التحقق" },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 h-8 rounded-full text-xs font-medium ${filter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <CardSkeleton /> : reports.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="لا توجد بلاغات" description="ما فيه بلاغات جديدة 🎉" />
      ) : (
        <div className="px-3 space-y-2 mt-2">
          {reports.map(r => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card/70 rounded-2xl p-3 border border-border/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{formatDate(r.created_at)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium">{r.reporter_gala_id}</span>
                  <span className="text-[10px] text-muted-foreground">→</span>
                  <span className="text-[11px] font-medium text-destructive">{r.reported_user_id}</span>
                </div>
              </div>

              <div className="bg-background/50 rounded-lg px-2.5 py-1.5">
                <p className="text-[11px] text-muted-foreground">📝 {r.description}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.is_verified ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
                  {r.is_verified ? "✅ تم التحقق" : "⏳ قيد المراجعة"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {banTypeLabels[r.ban_type] || r.ban_type}
                </span>
                {r.evidence_url && (
                  <a href={r.evidence_url} target="_blank" rel="noopener"
                    className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> دليل ({r.evidence_type})
                  </a>
                )}
              </div>

              {r.admin_notes && (
                <div className="bg-primary/5 rounded-lg px-2.5 py-1.5">
                  <p className="text-[10px] text-primary">📋 {r.admin_notes}</p>
                </div>
              )}

              {!r.is_verified && (
                <div className="flex gap-2">
                  <button onClick={() => handleVerify(r.id)}
                    className="h-8 px-4 rounded-lg text-[11px] font-medium text-primary-foreground active:scale-[0.96] flex items-center gap-1 flex-1 justify-center"
                    style={{ background: "var(--gradient-button)" }}>
                    <Check className="w-3.5 h-3.5" /> تحقق وحظر
                  </button>
                  <button onClick={() => handleAddNote(r.id)}
                    className="h-8 px-4 rounded-lg bg-secondary text-muted-foreground text-[11px] font-medium active:scale-[0.96] flex items-center gap-1 flex-1 justify-center">
                    📋 ملاحظة
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
