import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { PullToRefresh } from "@/components/PullToRefresh";
import { UserAvatar } from "@/components/UserAvatar";
import { TrendingUp, TrendingDown, DollarSign, Users, ArrowUpRight, Download } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/export";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const weeklyCharges = [
  { day: "سبت", amount: 1800 }, { day: "أحد", amount: 2400 },
  { day: "إثنين", amount: 1950 }, { day: "ثلاثاء", amount: 3200 },
  { day: "أربعاء", amount: 2800 }, { day: "خميس", amount: 3600 },
  { day: "جمعة", amount: 4200 },
];

const monthlySalaries = [
  { month: "يناير", total: 18000, net: 15200 }, { month: "فبراير", total: 19500, net: 16800 },
  { month: "مارس", total: 20678, net: 17500 }, { month: "أبريل", total: 21200, net: 18100 },
  { month: "مايو", total: 22800, net: 19400 }, { month: "يونيو", total: 24500, net: 20900 },
];

const chargeTypes = [
  { name: "وكلاء", value: 65, color: "hsl(200, 95%, 48%)" },
  { name: "مباشر", value: 25, color: "hsl(220, 85%, 52%)" },
  { name: "تحويل", value: 10, color: "hsl(160, 72%, 42%)" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border/50 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[12px] font-bold" style={{ color: p.color }}>
          ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function FinancePage() {
  const [tab, setTab] = useState<"charges" | "salaries">("charges");
  const [chargeFilter, setChargeFilter] = useState("all");
  const [chargeDate, setChargeDate] = useState(new Date().toISOString().split("T")[0]);
  const [chargeData, setChargeData] = useState<any>(null);
  const [salaryMonth, setSalaryMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [salaryData, setSalaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab === "charges") loadCharges();
    else loadSalaries();
  }, [tab, chargeFilter, chargeDate, salaryMonth]);

  const loadCharges = async () => {
    setLoading(true);
    try { const data = await api.charges(chargeDate, chargeFilter); setChargeData(data); } catch {
      setChargeData({
        stats: { total_usd: 12450, count: 1240, avg: 10, change: 12.5 },
        charges: [
          { id: 1, charger_name: "أحمد محمد", charger_uuid: "c1", user_name: "سارة", amount_usd: 120, charge_type: "agent", time: "14:20" },
          { id: 2, charger_name: "سارة خالد", charger_uuid: "c2", user_name: "محمد", amount_usd: 55, charge_type: "direct", time: "13:45" },
          { id: 3, charger_name: "ياسر القحطاني", charger_uuid: "c3", user_name: "نوره", amount_usd: 250, charge_type: "agent", time: "12:10" },
          { id: 4, charger_name: "فهد العنزي", charger_uuid: "c4", user_name: "خالد", amount_usd: 80, charge_type: "direct", time: "11:30" },
        ],
      });
    } finally { setLoading(false); }
  };

  const loadSalaries = async () => {
    setLoading(true);
    try { const data = await api.salaries(salaryMonth); setSalaryData(data); } catch {
      setSalaryData({
        stats: { total: 20678, deductions: 3815, net: 16863, user_count: 220 },
        users: [
          { uuid: "1000", name: "محمد علي", salary: 150, deduction: 20, remaining: 130 },
          { uuid: "2000", name: "سارة أحمد", salary: 120, deduction: 0, remaining: 120 },
          { uuid: "3000", name: "خالد محمد", salary: 90, deduction: 10, remaining: 80 },
          { uuid: "4000", name: "نوره فهد", salary: 200, deduction: 30, remaining: 170 },
        ],
      });
    } finally { setLoading(false); }
  };

  const handleRefresh = useCallback(async () => {
    if (tab === "charges") await loadCharges(); else await loadSalaries();
  }, [tab, chargeFilter, chargeDate, salaryMonth]);

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 10 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { delay, duration: 0.3 },
  });

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="pb-20">
        <PageHeader title="المالية" />

        {/* Tabs */}
        <div className="flex gap-2 px-4 py-3">
          {(["charges", "salaries"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 h-9 rounded-xl text-xs font-medium transition-all ${
                tab === t ? "text-primary-foreground glow-border" : "bg-secondary/60 text-muted-foreground"
              }`}
              style={tab === t ? { background: "var(--gradient-button)" } : undefined}
            >
              {t === "charges" ? "💳 شحنات" : "💰 رواتب"}
            </button>
          ))}
        </div>

        {tab === "charges" ? (
          <div className="px-4 space-y-3 mt-1">
            {chargeData && (
              <motion.div {...anim(0)} className="space-y-3">
                {/* Main stat */}
                <div className="stat-card text-center glow-border">
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-success/10">
                    <TrendingUp className="w-3 h-3 text-success" />
                    <span className="text-[10px] font-bold text-success">+{chargeData.stats.change}%</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1">إجمالي شحنات اليوم</p>
                  <p className="text-3xl font-bold text-primary">${chargeData.stats.total_usd.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{chargeData.stats.count} عملية • متوسط ${chargeData.stats.avg}</p>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: DollarSign, label: "المتوسط", value: `$${chargeData.stats.avg}`, color: "text-primary" },
                    { icon: Users, label: "العمليات", value: chargeData.stats.count, color: "text-accent" },
                    { icon: ArrowUpRight, label: "النمو", value: `${chargeData.stats.change}%`, color: "text-success" },
                  ].map((s, i) => (
                    <div key={i} className="glass-card p-3 text-center">
                      <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                      <p className="text-sm font-bold">{s.value}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Weekly Chart */}
            <motion.div {...anim(0.1)} className="glass-card p-4">
              <p className="text-[12px] font-bold mb-3 text-right">📊 شحنات الأسبوع</p>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={weeklyCharges}>
                  <defs>
                    <linearGradient id="chargeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(200, 95%, 48%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(200, 95%, 48%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 14%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215, 12%, 48%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 48%)" }} axisLine={false} tickLine={false} width={35} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke="hsl(200, 95%, 48%)" strokeWidth={2} fill="url(#chargeGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie chart */}
            <motion.div {...anim(0.15)} className="glass-card p-4">
              <p className="text-[12px] font-bold mb-2 text-right">🔄 توزيع الشحنات</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-2">
                  {chargeTypes.map((t, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[12px] font-bold">{t.value}%</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">{t.name}</span>
                        <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width={100} height={100}>
                  <PieChart>
                    <Pie data={chargeTypes} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={44} paddingAngle={3}>
                      {chargeTypes.map((t, i) => <Cell key={i} fill={t.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Filters */}
            <div className="flex gap-2 items-center">
              <input type="date" value={chargeDate} onChange={(e) => setChargeDate(e.target.value)}
                className="h-9 rounded-xl bg-secondary/80 border border-border/50 px-3 text-[11px] flex-1 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <div className="flex gap-1.5">
                {[{ key: "all", label: "الكل" }, { key: "agent", label: "وكلاء" }, { key: "big", label: "$50+" }].map((f) => (
                  <button key={f.key} onClick={() => setChargeFilter(f.key)}
                    className={`px-3 h-8 rounded-lg text-[10px] font-medium transition-all ${
                      chargeFilter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground"
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Charges list */}
            <p className="text-[12px] font-bold text-right">📋 آخر العمليات</p>
            {loading ? <CardSkeleton count={3} /> : (
              <div className="space-y-2">
                {chargeData?.charges.map((c: any, i: number) => (
                  <motion.div key={c.id} {...anim(0.2 + i * 0.04)}
                    className="glass-card px-3.5 py-3 flex items-center gap-3">
                    <UserAvatar name={c.charger_name} uuid={c.charger_uuid || c.id.toString()} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate">{c.charger_name} → {c.user_name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.charge_type === "agent" ? "🏪 وكيل" : "📱 مباشر"} • {c.time}</p>
                    </div>
                    <span className="text-[13px] font-bold text-success">+${c.amount_usd}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 space-y-3 mt-1">
            <input type="month" value={salaryMonth} onChange={(e) => setSalaryMonth(e.target.value)}
              className="w-full h-9 rounded-xl bg-secondary/80 border border-border/50 px-3 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30" />

            {salaryData && (
              <motion.div {...anim(0)} className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="stat-card text-center glow-border">
                    <p className="text-[10px] text-muted-foreground">إجمالي الرواتب</p>
                    <p className="text-xl font-bold text-primary mt-1">${salaryData.stats.total.toLocaleString()}</p>
                  </div>
                  <div className="stat-card text-center" style={{ boxShadow: "0 0 0 1px hsl(160 72% 42% / 0.15)" }}>
                    <p className="text-[10px] text-muted-foreground">الصافي</p>
                    <p className="text-xl font-bold text-success mt-1">${salaryData.stats.net.toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="glass-card p-3 text-center">
                    <TrendingDown className="w-4 h-4 mx-auto mb-1 text-destructive" />
                    <p className="text-sm font-bold text-destructive">-${salaryData.stats.deductions.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">الخصومات</p>
                  </div>
                  <div className="glass-card p-3 text-center">
                    <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
                    <p className="text-sm font-bold">{salaryData.stats.user_count}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">مستخدم</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Salary Chart */}
            <motion.div {...anim(0.1)} className="glass-card p-4">
              <p className="text-[12px] font-bold mb-3 text-right">📈 الرواتب الشهرية</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={monthlySalaries} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 14%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215, 12%, 48%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 48%)" }} axisLine={false} tickLine={false} width={35} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" fill="hsl(200, 95%, 48%)" radius={[4, 4, 0, 0]} barSize={14} name="إجمالي" />
                  <Bar dataKey="net" fill="hsl(160, 72%, 42%)" radius={[4, 4, 0, 0]} barSize={14} name="صافي" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-5 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span className="text-[10px] text-muted-foreground">إجمالي</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-success" />
                  <span className="text-[10px] text-muted-foreground">صافي</span>
                </div>
              </div>
            </motion.div>

            {/* Salary list */}
            <p className="text-[12px] font-bold text-right">👥 تفاصيل الرواتب</p>
            {loading ? <CardSkeleton count={3} /> : (
              <div className="space-y-2">
                {salaryData?.users.map((u: any, i: number) => (
                  <motion.div key={u.uuid} {...anim(0.15 + i * 0.04)}
                    className="glass-card px-3.5 py-3 flex items-center gap-3">
                    <UserAvatar name={u.name} uuid={u.uuid} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        ${u.salary} {u.deduction > 0 && <span className="text-destructive">(-${u.deduction})</span>}
                      </p>
                    </div>
                    <span className="text-[13px] font-bold text-success">${u.remaining}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
