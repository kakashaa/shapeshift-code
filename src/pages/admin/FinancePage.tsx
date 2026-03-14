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

  useEffect(() => { if (tab === "charges") loadCharges(); else loadSalaries(); }, [tab, chargeFilter, chargeDate, salaryMonth]);

  const loadCharges = async () => {
    setLoading(true);
    try { const data = await api.charges(chargeDate, chargeFilter); setChargeData(data); } catch {
      setChargeData({
        stats: { total_usd: 12450, count: 1240 },
        charges: [
          { id: 1, charger_name: "أحمد محمد", user_name: "سارة", amount_usd: 120, charge_type: "agent", time: "14:20" },
          { id: 2, charger_name: "سارة خالد", user_name: "محمد", amount_usd: 55, charge_type: "direct", time: "13:45" },
          { id: 3, charger_name: "ياسر القحطاني", user_name: "نوره", amount_usd: 250, charge_type: "agent", time: "12:10" },
        ],
      });
    } finally { setLoading(false); }
  };

  const loadSalaries = async () => {
    setLoading(true);
    try { const data = await api.salaries(salaryMonth); setSalaryData(data); } catch {
      setSalaryData({
        stats: { total: 20678, deductions: 11815, net: 12809, user_count: 220 },
        users: [
          { uuid: "1000", name: "محمد علي", salary: 150, deduction: 20, remaining: 130 },
          { uuid: "2000", name: "سارة أحمد", salary: 120, deduction: 0, remaining: 120 },
          { uuid: "3000", name: "خالد محمد", salary: 90, deduction: 10, remaining: 80 },
        ],
      });
    } finally { setLoading(false); }
  };

  return (
    <div className="pb-20">
      <PageHeader title="المالية" />
      
      {/* Tabs */}
      <div className="flex gap-1.5 px-3 py-2">
        {(["charges", "salaries"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 h-8 rounded-lg text-xs font-medium transition-all ${
              tab === t ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "bg-card text-muted-foreground"
            }`}>
            {t === "charges" ? "شحنات" : "رواتب"}
          </button>
        ))}
      </div>

      {tab === "charges" ? (
        <div className="px-3 space-y-2.5 mt-1">
          {/* Stats Card */}
          {chargeData && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl p-3 text-center border border-primary/20">
              <p className="text-[10px] text-muted-foreground">إجمالي اليوم</p>
              <p className="text-2xl font-black text-primary">${chargeData.stats.total_usd.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">{chargeData.stats.count} عملية</p>
            </motion.div>
          )}

          {/* Date + Filters */}
          <div className="flex gap-2 items-center">
            <input type="date" value={chargeDate} onChange={e => setChargeDate(e.target.value)}
              className="h-8 rounded-lg bg-card px-2 text-[11px] border border-border/50 flex-1" />
            <div className="flex gap-1">
              {[{ key: "all", label: "الكل" }, { key: "agent", label: "وكلاء" }, { key: "big", label: "$50+" }].map(f => (
                <button key={f.key} onClick={() => setChargeFilter(f.key)}
                  className={`px-2.5 h-7 rounded-md text-[10px] font-medium ${
                    chargeFilter === f.key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Charges list */}
          {loading ? <CardSkeleton count={3} /> : (
            <div className="space-y-1.5">
              {chargeData?.charges.map((c: any) => (
                <div key={c.id} className="bg-card/60 rounded-xl px-3 py-2.5 flex items-center gap-2.5 border border-border/30">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {c.charger_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate">{c.charger_name} → {c.user_name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.charge_type === "agent" ? "وكيل" : "مباشر"} • {c.time}</p>
                  </div>
                  <span className="text-[13px] font-bold text-emerald-400">+${c.amount_usd}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="px-3 space-y-2.5 mt-1">
          <input type="month" value={salaryMonth} onChange={e => setSalaryMonth(e.target.value)}
            className="w-full h-8 rounded-lg bg-card px-2 text-[11px] border border-border/50" />

          {salaryData && (
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { v: `$${salaryData.stats.total.toLocaleString()}`, l: "إجمالي" },
                { v: `$${salaryData.stats.net.toLocaleString()}`, l: "صافي" },
                { v: salaryData.stats.user_count, l: "مستخدم" },
              ].map((s, i) => (
                <div key={i} className="bg-card/60 rounded-xl p-2.5 text-center border border-border/30">
                  <p className="text-sm font-bold">{s.v}</p>
                  <p className="text-[9px] text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          )}

          {loading ? <CardSkeleton count={3} /> : (
            <div className="space-y-1.5">
              {salaryData?.users.map((u: any) => (
                <div key={u.uuid} className="bg-card/60 rounded-xl px-3 py-2.5 flex items-center justify-between border border-border/30">
                  <div className="flex items-center gap-1.5 text-[12px]">
                    {u.deduction > 0 && <span className="text-destructive text-[10px]">-${u.deduction}</span>}
                    <span className="font-bold text-emerald-400">${u.remaining}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-medium">{u.name}</p>
                    <p className="text-[10px] text-muted-foreground">الراتب: ${u.salary}</p>
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
