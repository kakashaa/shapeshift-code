import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Headphones } from "lucide-react";

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [status, setStatus] = useState<"open" | "closed">("open");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadTickets(); }, [status]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await api.supportList(status);
      setTickets(data);
    } catch {
      setTickets([
        { ticket_id: 1, user_name: "محمد أحمد", user_uuid: "12345", user_avatar: "", last_message: "مرحبا عندي مشكلة بالشحن", time: "10:30", status: "new" },
        { ticket_id: 2, user_name: "سارة خالد", user_uuid: "67890", user_avatar: "", last_message: "ما يشتغل البث عندي", time: "09:15", status: "replied" },
        { ticket_id: 3, user_name: "أحمد علي", user_uuid: "11111", user_avatar: "", last_message: "أبي أغير الآيدي حقي", time: "أمس", status: "new" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <PageHeader title="الدعم الفني" subtitle="المحادثات" />
      
      {/* Tabs */}
      <div className="flex gap-2 p-4">
        {(["open", "closed"] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`flex-1 h-10 rounded-xl text-sm font-medium transition-colors ${status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
          >
            {s === "open" ? "المفتوحة" : "المغلقة"}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      {loading ? <CardSkeleton /> : tickets.length === 0 ? (
        <EmptyState icon={Headphones} title="لا توجد تذاكر" description="ما فيه تذاكر دعم حالياً 🎉" />
      ) : (
        <div className="space-y-1">
          {tickets.map((t, i) => (
            <motion.button
              key={t.ticket_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/support/${t.ticket_id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 active:bg-secondary/50 transition-colors text-right"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold">
                  {t.user_name[0]}
                </div>
                {t.status === "new" && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t.time}</span>
                  <span className="font-semibold text-sm">{t.user_name}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-muted-foreground">UUID: {t.user_uuid}</span>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{t.last_message}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
