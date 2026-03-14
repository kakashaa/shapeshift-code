import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { ClipboardList } from "lucide-react";

const actionColors: Record<string, string> = {
  ban: "bg-destructive/15 text-destructive",
  support: "bg-primary/15 text-primary",
  store: "bg-success/15 text-success",
  broadcast: "bg-warning/15 text-warning",
};

const cardVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

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
      
      <div className="px-4 pt-2 pb-3">
        <div className="glass-card rounded-xl overflow-hidden">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full h-11 bg-transparent px-4 text-sm text-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Stats */}
      {!loading && logs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-4 mb-4">
          <div className="stat-card rounded-2xl p-4 flex items-center gap-4">
            <div className="icon-3d w-12 h-12 rounded-xl">
              <ClipboardList className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs.length}</p>
              <p className="text-[11px] text-muted-foreground">إجراء اليوم</p>
            </div>
          </div>
        </motion.div>
      )}

      {loading ? <CardSkeleton /> : (
        <div className="px-4 space-y-2.5 perspective-grid">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="card-3d rounded-2xl p-3.5 flex items-center gap-3"
            >
              {/* Time */}
              <div className="text-center shrink-0">
                <p className="text-[11px] font-bold text-muted-foreground">{log.time}</p>
              </div>

              {/* Divider */}
              <div className="w-[2px] h-8 rounded-full bg-gradient-to-b from-primary/40 to-transparent" />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium leading-relaxed">{log.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-semibold ${actionColors[log.action_type] || "bg-secondary text-muted-foreground"}`}>
                    {log.action_type}
                  </span>
                  <span className="text-[10px] text-primary font-medium">{log.admin_name}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
