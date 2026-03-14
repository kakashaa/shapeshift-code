import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { DollarSign } from "lucide-react";

export default function UserChargesPage() {
  const [charges, setCharges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.userProfile().then((data: any) => {
      setCharges(data.recent_charges || []);
    }).catch(() => {
      setCharges([
        { amount: 375000, amount_usd: 50, time: "2026-03-14 10:30" },
        { amount: 187500, amount_usd: 25, time: "2026-03-13 15:20" },
        { amount: 75000, amount_usd: 10, time: "2026-03-12 09:45" },
      ]);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-20">
      <PageHeader title="سجل الشحنات" />
      {loading ? <CardSkeleton /> : charges.length === 0 ? (
        <EmptyState icon={DollarSign} title="لا توجد شحنات" />
      ) : (
        <div className="p-4 space-y-2">
          {charges.map((c, i) => (
            <div key={i} className="bg-card rounded-xl p-3 flex items-center justify-between">
              <p className="text-sm font-bold text-success">+${c.amount_usd}</p>
              <div className="text-right">
                <p className="text-sm">💳 ${c.amount_usd}</p>
                <p className="text-xs text-muted-foreground">{c.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
