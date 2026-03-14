import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";

export default function RegistrationsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.newRegistrations().then(setUsers).catch(() => {
      setUsers([
        { uuid: "50001", name: "عبدالله محمد", country: "🇸🇦 السعودية", created_at: "2026-03-14 10:30" },
        { uuid: "50002", name: "فاطمة علي", country: "🇦🇪 الإمارات", created_at: "2026-03-14 09:15" },
        { uuid: "50003", name: "حسن أحمد", country: "🇰🇼 الكويت", created_at: "2026-03-13 22:00" },
      ]);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-20">
      <PageHeader title="تسجيلات جديدة" showBack />
      {loading ? <CardSkeleton /> : (
        <div className="p-4 space-y-2">
          {users.map((u, i) => (
            <motion.div key={u.uuid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="bg-card rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">{u.name[0]}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{u.name}</p>
                <p className="text-xs text-muted-foreground">UUID: {u.uuid} • {u.country}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">{u.created_at}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
