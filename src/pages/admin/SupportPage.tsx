import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Headphones } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { PullToRefresh } from "@/components/PullToRefresh";

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [status, setStatus] = useState<"open" | "closed">("open");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadTickets(); }, [status]);

  const loadTickets = async () => {
    setLoading(true);
    try { const data = await api.supportList(status); setTickets(data); } catch {
      setTickets([
        { ticket_id: 1, user_name: "محمد أحمد", user_uuid: "12345", last_message: "مرحبا عندي مشكلة بالشحن", time: "10:30", status: "new" },
        { ticket_id: 2, user_name: "سارة خالد", user_uuid: "67890", last_message: "ما يشتغل البث عندي", time: "09:15", status: "replied" },
        { ticket_id: 3, user_name: "أحمد علي", user_uuid: "11111", last_message: "أبي أغير الآيدي حقي", time: "أمس", status: "new" },
      ]);
    } finally { setLoading(false); }
  };

  const handleRefresh = useCallback(async () => { await loadTickets(); }, [status]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="pb-20">
      <PageHeader title="الدعم الفني" />
      
      {/* Tabs */}
      <div className="flex gap-1.5 px-3 py-2">
        {(["open", "closed"] as const).map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`flex-1 h-8 rounded-lg text-xs font-medium transition-all ${
              status === s ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "bg-card text-muted-foreground"
            }`}>
            {s === "open" ? "المفتوحة" : "المغلقة"}
          </button>
        ))}
      </div>

      {loading ? <CardSkeleton count={4} /> : tickets.length === 0 ? (
        <EmptyState icon={Headphones} title="لا توجد تذاكر" description="ما فيه تذاكر دعم حالياً 🎉" />
      ) : (
        <div className="px-3 space-y-1.5 mt-1">
          {tickets.map((t, i) => (
            <motion.button
              key={t.ticket_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/support/${t.ticket_id}`)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-card/60 rounded-xl active:bg-secondary/50 transition-colors text-right border border-border/30"
            >
              <UserAvatar name={t.user_name} uuid={t.user_uuid} size="md" online={t.status === "new"} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{t.time}</span>
                  <span className="font-semibold text-[13px]">{t.user_name}</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5 text-right">{t.last_message}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}
