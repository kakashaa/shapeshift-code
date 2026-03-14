import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { UserPlus } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

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

      {/* Stats */}
      {!loading && users.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-4 mt-2 mb-4">
          <div className="stat-card rounded-2xl p-4 flex items-center gap-4">
            <div className="icon-3d w-12 h-12 rounded-xl">
              <UserPlus className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-[11px] text-muted-foreground">مستخدم جديد</p>
            </div>
          </div>
        </motion.div>
      )}

      {loading ? <CardSkeleton /> : (
        <div className="px-4 space-y-2.5 perspective-grid">
          {users.map((u, i) => (
            <motion.div
              key={u.uuid}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="card-3d rounded-2xl p-3.5 flex items-center gap-3"
            >
              <div className="icon-3d w-11 h-11 rounded-xl shrink-0">
                <span className="text-base font-bold text-primary">{u.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold">{u.name}</p>
                <p className="text-[10px] text-muted-foreground">UUID: {u.uuid} • {u.country}</p>
              </div>
              <p className="text-[9px] text-muted-foreground whitespace-nowrap">{u.created_at}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
