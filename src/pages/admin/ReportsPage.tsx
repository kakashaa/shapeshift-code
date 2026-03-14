import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { AlertTriangle, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReports(); }, []);
  const loadReports = async () => {
    setLoading(true);
    try { const data = await api.reports(); setReports(data); } catch {
      setReports([
        { report_id: 1, reporter_name: "أحمد", reporter_uuid: "5432", reported_name: "خالد", reported_uuid: "5678", reason: "محتوى غير لائق", time: "10:15", status: "pending" },
        { report_id: 2, reporter_name: "سارة", reporter_uuid: "1111", reported_name: "محمد", reported_uuid: "2222", reason: "إزعاج وتحرش", time: "09:30", status: "pending" },
      ]);
    } finally { setLoading(false); }
  };

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try { await api.reportAction(id, action); } catch {}
    setReports(prev => prev.map(r => r.report_id === id ? { ...r, status: action === "approve" ? "approved" : "rejected" } : r));
    toast({ title: action === "approve" ? "✅ تم الحظر" : "❌ تم الرفض" });
  };

  return (
    <div className="pb-20">
      <PageHeader title="البلاغات" showBack />
      {loading ? <CardSkeleton /> : reports.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="لا توجد بلاغات" description="ما فيه بلاغات جديدة 🎉" />
      ) : (
        <div className="px-3 space-y-2 mt-2">
          {reports.map(r => (
            <motion.div key={r.report_id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card/70 rounded-2xl p-3 border border-border/30 space-y-2.5">
              {/* Users row */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{r.time}</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium">{r.reporter_name}</span>
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold">{r.reporter_name[0]}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">→</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-destructive">{r.reported_name}</span>
                    <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center text-[9px] font-bold text-destructive">{r.reported_name[0]}</div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="bg-background/50 rounded-lg px-2.5 py-1.5">
                <p className="text-[11px] text-muted-foreground">📝 {r.reason}</p>
              </div>

              {/* Actions */}
              {r.status === "pending" ? (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(r.report_id, "approve")}
                    className="h-8 px-4 rounded-lg bg-destructive/15 text-destructive text-[11px] font-medium active:scale-[0.96] flex items-center gap-1 flex-1 justify-center">
                    <Check className="w-3.5 h-3.5" /> حظر
                  </button>
                  <button onClick={() => handleAction(r.report_id, "reject")}
                    className="h-8 px-4 rounded-lg bg-secondary text-muted-foreground text-[11px] font-medium active:scale-[0.96] flex items-center gap-1 flex-1 justify-center">
                    <X className="w-3.5 h-3.5" /> رفض
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-center text-muted-foreground">{r.status === "approved" ? "✅ تم الحظر" : "❌ مرفوض"}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
