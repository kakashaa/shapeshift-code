import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";

export default function UserSalaryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.userProfile().then((data: any) => {
      setHistory(data.salary_history || []);
    }).catch(() => {
      setHistory([
        { month: "مارس 2026", salary: 150, deduction: 20, net: 130 },
        { month: "فبراير 2026", salary: 120, deduction: 0, net: 120 },
        { month: "يناير 2026", salary: 90, deduction: 10, net: 80 },
      ]);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-20">
      <PageHeader title="سجل الرواتب" />
      {loading ? <CardSkeleton /> : (
        <div className="p-4 space-y-2">
          {history.map((s, i) => (
            <div key={i} className="bg-card rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-success">${s.net}</span>
                <span className="font-semibold text-sm">{s.month}</span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>الراتب: ${s.salary}</span>
                {s.deduction > 0 && <span className="text-destructive">القطع: -${s.deduction}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
