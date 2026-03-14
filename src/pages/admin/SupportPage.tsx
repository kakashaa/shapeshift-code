import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Headphones } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { PullToRefresh } from "@/components/PullToRefresh";

interface SupportTicket {
  id: string;
  user_name: string;
  user_uuid: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  ticket_type: string;
  admin_username: string | null;
  created_at: string;
  updated_at: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [status, setStatus] = useState<"open" | "closed">("open");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadTickets(); }, [status]);

  const loadTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("support_tickets" as any)
      .select("*")
      .eq("status", status)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading tickets:", error);
    }
    setTickets((data as any) || []);
    setLoading(false);
  };

  const handleRefresh = useCallback(async () => { await loadTickets(); }, [status]);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `منذ ${mins} د`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} س`;
    return d.toLocaleDateString("ar", { day: "numeric", month: "short" });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="pb-20">
        <PageHeader title="الدعم الفني" />

        <div className="flex gap-2 px-4 py-3">
          {(["open", "closed"] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`flex-1 h-9 rounded-xl text-xs font-medium transition-all ${
                status === s
                  ? "text-primary-foreground glow-border"
                  : "bg-secondary/60 text-muted-foreground"
              }`}
              style={status === s ? { background: "var(--gradient-button)" } : undefined}
            >
              {s === "open" ? "المفتوحة" : "المغلقة"}
            </button>
          ))}
        </div>

        {loading ? <CardSkeleton count={4} /> : tickets.length === 0 ? (
          <EmptyState icon={Headphones} title="لا توجد تذاكر" description="ما فيه تذاكر دعم حالياً 🎉" />
        ) : (
          <div className="px-4 space-y-2 mt-1">
            {tickets.map((t, i) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                onClick={() => navigate(`/support/${t.id}`)}
                className="w-full glass-card-hover px-3.5 py-3 flex items-center gap-3 text-right"
              >
                <UserAvatar name={t.user_name} uuid={t.user_uuid} size="md" online={t.status === "open"} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">{formatTime(t.updated_at)}</span>
                      {t.status === "open" && !t.admin_username && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="font-semibold text-[13px]">{t.user_name}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5 text-right">{t.subject}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      t.priority === "high" ? "bg-destructive/20 text-destructive" :
                      t.priority === "medium" ? "bg-warning/20 text-warning" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {t.priority === "high" ? "عاجل" : t.priority === "medium" ? "متوسط" : "عادي"}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {t.ticket_type}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
