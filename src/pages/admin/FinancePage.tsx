import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";

export default function FinancePage() {
  const [tab, setTab] = useState<"charges" | "salaries">("charges");
  const [chargeFilter, setChargeFilter] = useState("all");
  const [chargeDate, setChargeDate] = useState(new Date().toISOString().split("T")[0]);
  const [chargeData, setChargeData] = useState<any>(null);
  const [salaryMonth, setSalaryMonth] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; });
  const [salaryData, setSalaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab === "charges") loadCharges();
    else loadSalaries();
  }, [tab, chargeFilter, chargeDate, salaryMonth]);

  const loadCharges = async () => {
    setLoading(true);
    try {
      const data = await api.charges(chargeDate, chargeFilter);
      setChargeData(data);
    } catch {
      setChargeData({
        stats: { total_usd: 12450, count: 1240 },
        charges: [
          { id: 1, charger_name: "أحمد محمد", charger_uuid: "88291", user_name: "سارة", user_uuid: "772", amount: 375000, amount_usd: 120, charge_type: "agent", time: "14:20" },
          { id: 2, charger_name: "سارة خالد", charger_uuid: "10293", user_name: "محمد", user_uuid: "555", amount: 187500, amount_usd: 55, charge_type: "direct", time: "13:45" },
          { id: 3, charger_name: "ياسر القحطاني", charger_uuid: "55432", user_name: "نوره", user_uuid: "109", amount: 937500, amount_usd: 250, charge_type: "agent", time: "12:10" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSalaries = async () => {
    setLoading(true);
    try {
      const data = await api.salaries(salaryMonth);
      setSalaryData(data);
    } catch {
      setSalaryData({
        stats: { total: 20678, deductions: 11815, net: 12809, user_count: 220 },
        users: [
          { uuid: "1000", name: "محمد علي", salary: 150, deduction: 20, remaining: 130 },
          { uuid: "2000", name: "سارة أحمد", salary: 120, deduction: 0, remaining: 120 },
          { uuid: "3000", name: "خالد محمد", salary: 90, deduction: 10, remaining: 80 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { key: "all", label: "الكل" },
    { key: "agent", label: "الوكلاء فقط" },
    { key: "big", label: "كبيرة $50+" },
  ];

  return (
    <div className="pb-20">
      <PageHeader title="المالية" />

      {/* Tabs */}
      <div className="flex gap-2 p-4 pb-0">
        {(["charges", "salaries"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 h-10 rounded-xl text-sm font-medium transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {t === "charges" ? "شحنات" : "رواتب"}
          </button>
        ))}
      </div>

      {tab === "charges" ? (
        <div className="p-4 space-y-4">
          {/* Stats */}
          {chargeData && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl p-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">إجمالي الشحنات اليوم</p>
              <p className="text-3xl font-black text-primary">${chargeData.stats.total_usd.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{chargeData.stats.count} عملية</p>
            </motion.div>
          )}

          {/* Date picker */}
          <input type="date" value={chargeDate} onChange={e => setChargeDate(e.target.value)} className="w-full h-10 rounded-xl bg-secondary px-3 text-sm" />

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto">
            {filters.map(f => (
              <button key={f.key} onClick={() => setChargeFilter(f.key)} className={`px-4 h-8 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${chargeFilter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Charges list */}
          {loading ? <CardSkeleton count={3} /> : (
            <div className="space-y-2">
              {chargeData?.charges.map((c: any) => (
                <div key={c.id} className="bg-card rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                    {c.charger_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{c.charger_name} → {c.user_name}</p>
                    <p className="text-xs text-muted-foreground">{c.charge_type === "agent" ? "وكيل" : "شحن مباشر"} • {c.time}</p>
                  </div>
                  <p className="text-sm font-bold text-success">+${c.amount_usd}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Month picker */}
          <input type="month" value={salaryMonth} onChange={e => setSalaryMonth(e.target.value)} className="w-full h-10 rounded-xl bg-secondary px-3 text-sm" />

          {/* Stats */}
          {salaryData && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-card rounded-xl p-3 text-center">
                <p className="text-lg font-bold">${salaryData.stats.total.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">إجمالي</p>
              </div>
              <div className="bg-card rounded-xl p-3 text-center">
                <p className="text-lg font-bold">${salaryData.stats.net.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">صافي</p>
              </div>
              <div className="bg-card rounded-xl p-3 text-center">
                <p className="text-lg font-bold">{salaryData.stats.user_count}</p>
                <p className="text-[10px] text-muted-foreground">مستخدم</p>
              </div>
            </div>
          )}

          {/* Salary list */}
          {loading ? <CardSkeleton count={3} /> : (
            <div className="space-y-2">
              {salaryData?.users.map((u: any) => (
                <div key={u.uuid} className="bg-card rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    {u.deduction > 0 && <span className="text-destructive text-xs">-${u.deduction}</span>}
                    <span className="font-bold text-success">${u.remaining}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{u.name}</p>
                    <p className="text-xs text-muted-foreground">الراتب: ${u.salary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
