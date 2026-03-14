import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLogs(); }, [date]);

  const loadLogs = async () => {
    setLoading(true);
    try { const data = await api.activityLog("all", date); setLogs(data); } catch {
      setLogs([
        { time: "10:30", admin_name: "ناز", action_type: "ban", description: "🚫 حظر UUID 5678" },
        { time: "10:25", admin_name: "جنجون", action_type: "support", description: "💬 رد على دعم #45" },
        { time: "10:20", admin_name: "مارس", action_type: "store", description: "✅ قبول إطار #12" },
        { time: "10:15", admin_name: "ناز", action_type: "broadcast", description: "📢 broadcast \"عرض خاص\"" },
      ]);
    } finally { setLoading(false); }
  };

  return (
    <div className="pb-20">
      <PageHeader title="سجل الإجراءات" showBack />
      <div className="p-4 pb-0">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-10 rounded-xl bg-secondary px-3 text-sm" />
      </div>
      {loading ? <CardSkeleton /> : (
        <div className="p-4 space-y-2">
          {logs.map((log, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="bg-card rounded-xl p-3 flex items-center gap-3">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{log.time}</span>
              <div className="w-px h-8 bg-border" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{log.description}</p>
                <p className="text-xs text-primary">{log.admin_name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
