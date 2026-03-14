import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { AlertTriangle, Check, ExternalLink, Shield } from "lucide-react";
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

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

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
      .from("ban_reports" as any)
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
      .from("ban_reports" as any)
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

  const banTypeColors: Record<string, string> = {
    permanent: "bg-destructive/15 text-destructive",
    temporary: "bg-warning/15 text-warning",
    warning: "bg-accent/15 text-accent",
  };

  const filters = [
    { key: "all" as const, label: "الكل", icon: "📋" },
    { key: "pending" as const, label: "قيد المراجعة", icon: "⏳" },
    { key: "verified" as const, label: "تم التحقق", icon: "✅" },
  ];

  return (
    <div className="pb-20">
      <PageHeader title="البلاغات" showBack />

      {/* 3D Filter Tabs */}
      <div className="flex gap-2 p-4 pb-2">
        {filters.map(f => (
          <motion.button
            key={f.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f.key)}
            className={`px-4 h-9 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
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

      {loading ? <CardSkeleton /> : reports.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="لا توجد بلاغات" description="ما فيه بلاغات جديدة 🎉" />
      ) : (
        <div className="px-4 space-y-3 mt-2 perspective-grid">
          {reports.map((r, i) => (
            <motion.div
              key={r.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="card-3d rounded-2xl p-4 space-y-3 relative overflow-hidden"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: r.is_verified ? "hsl(var(--success))" : "hsl(var(--warning))" }} />

              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-medium">{formatDate(r.created_at)}</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="icon-3d w-6 h-6 rounded-lg">
                      <Shield className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-[11px] font-semibold">{r.reporter_gala_id}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">→</span>
                  <span className="text-[11px] font-semibold text-destructive">{r.reported_user_id}</span>
                </div>
              </div>

              {/* Description */}
              <div className="glass-card rounded-xl px-3 py-2.5 border-border/10">
                <p className="text-[11px] text-foreground/80 leading-relaxed">📝 {r.description}</p>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold ${r.is_verified ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}
                >
                  {r.is_verified ? "✅ تم التحقق" : "⏳ قيد المراجعة"}
                </motion.span>
                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-medium ${banTypeColors[r.ban_type] || "bg-secondary text-muted-foreground"}`}>
                  {banTypeLabels[r.ban_type] || r.ban_type}
                </span>
                {r.evidence_url && (
                  <a href={r.evidence_url} target="_blank" rel="noopener"
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-primary/10 text-primary flex items-center gap-1 font-medium hover:bg-primary/20 transition-colors">
                    <ExternalLink className="w-3 h-3" /> دليل ({r.evidence_type})
                  </a>
                )}
              </div>

              {/* Admin Notes */}
              {r.admin_notes && (
                <div className="bg-primary/5 rounded-xl px-3 py-2 border border-primary/10">
                  <p className="text-[10px] text-primary font-medium">📋 {r.admin_notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              {!r.is_verified && (
                <div className="flex gap-2 pt-1">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleVerify(r.id)}
                    className="btn-3d h-9 px-4 rounded-xl text-[11px] font-bold text-primary-foreground flex items-center gap-1.5 flex-1 justify-center"
                  >
                    <Check className="w-3.5 h-3.5" /> تحقق وحظر
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleAddNote(r.id)}
                    className="h-9 px-4 rounded-xl glass-card text-muted-foreground text-[11px] font-semibold flex items-center gap-1.5 flex-1 justify-center hover:text-foreground transition-colors"
                  >
                    📋 ملاحظة
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
