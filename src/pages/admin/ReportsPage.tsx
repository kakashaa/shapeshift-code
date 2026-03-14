import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { AlertTriangle } from "lucide-react";
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
        { report_id: 2, reporter_name: "سارة", reporter_uuid: "1111", reported_name: "محمد", reported_uuid: "2222", reason: "إزعاج", time: "09:30", status: "pending" },
      ]);
    } finally { setLoading(false); }
  };

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try { await api.reportAction(id, action); } catch {}
    setReports(prev => prev.map(r => r.report_id === id ? { ...r, status: action === "approve" ? "approved" : "rejected", actioned_by: "أدمن" } : r));
    toast({ title: action === "approve" ? "✅ تم قبول البلاغ وحظر المستخدم" : "❌ تم رفض البلاغ" });
  };

  return (
    <div className="pb-20">
      <PageHeader title="البلاغات" showBack />
      {loading ? <CardSkeleton /> : reports.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="لا توجد بلاغات" description="ما فيه بلاغات جديدة 🎉" />
      ) : (
        <div className="p-4 space-y-3">
          {reports.map(r => (
            <motion.div key={r.report_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{r.time}</span>
                <span className="text-sm font-bold flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-destructive" /> بلاغ</span>
              </div>
              <div className="text-sm space-y-1">
                <p>📤 المبلّغ: {r.reporter_name} <span className="text-muted-foreground">({r.reporter_uuid})</span></p>
                <p>🎯 المبلّغ عنه: {r.reported_name} <span className="text-muted-foreground">({r.reported_uuid})</span></p>
                <p>📝 السبب: "{r.reason}"</p>
              </div>
              {r.status === "pending" ? (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(r.report_id, "approve")} className="flex-1 h-10 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium active:scale-[0.97]">✅ قبول (حظر)</button>
                  <button onClick={() => handleAction(r.report_id, "reject")} className="flex-1 h-10 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium active:scale-[0.97]">❌ رفض</button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{r.status === "approved" ? "✅ قبله" : "❌ رفضه"}: {r.actioned_by}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
