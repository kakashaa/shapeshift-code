import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { PullToRefresh } from "@/components/PullToRefresh";
import { UserAvatar } from "@/components/UserAvatar";
import { TrendingUp, TrendingDown, DollarSign, Users, ArrowUpRight } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// Mock weekly chart data
const weeklyCharges = [
  { day: "سبت", amount: 1800 },
  { day: "أحد", amount: 2400 },
  { day: "إثنين", amount: 1950 },
  { day: "ثلاثاء", amount: 3200 },
  { day: "أربعاء", amount: 2800 },
  { day: "خميس", amount: 3600 },
  { day: "جمعة", amount: 4200 },
];

const monthlySalaries = [
  { month: "يناير", total: 18000, net: 15200 },
  { month: "فبراير", total: 19500, net: 16800 },
  { month: "مارس", total: 20678, net: 17500 },
  { month: "أبريل", total: 21200, net: 18100 },
  { month: "مايو", total: 22800, net: 19400 },
  { month: "يونيو", total: 24500, net: 20900 },
];

const chargeTypes = [
  { name: "وكلاء", value: 65, color: "hsl(262, 80%, 55%)" },
  { name: "مباشر", value: 25, color: "hsl(230, 80%, 60%)" },
  { name: "تحويل", value: 10, color: "hsl(142, 71%, 45%)" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border/50 rounded-lg px-2.5 py-1.5 shadow-lg">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[11px] font-bold" style={{ color: p.color }}>
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
    try {
      const data = await api.charges(chargeDate, chargeFilter);
      setChargeData(data);
    } catch {
      setChargeData({
        stats: { total_usd: 12450, count: 1240, avg: 10, change: 12.5 },
        charges: [
          { id: 1, charger_name: "أحمد محمد", charger_uuid: "c1", user_name: "سارة", amount_usd: 120, charge_type: "agent", time: "14:20" },
          { id: 2, charger_name: "سارة خالد", charger_uuid: "c2", user_name: "محمد", amount_usd: 55, charge_type: "direct", time: "13:45" },
          { id: 3, charger_name: "ياسر القحطاني", charger_uuid: "c3", user_name: "نوره", amount_usd: 250, charge_type: "agent", time: "12:10" },
          { id: 4, charger_name: "فهد العنزي", charger_uuid: "c4", user_name: "خالد", amount_usd: 80, charge_type: "direct", time: "11:30" },
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
        stats: { total: 20678, deductions: 3815, net: 16863, user_count: 220 },
        users: [
          { uuid: "1000", name: "محمد علي", salary: 150, deduction: 20, remaining: 130 },
          { uuid: "2000", name: "سارة أحمد", salary: 120, deduction: 0, remaining: 120 },
          { uuid: "3000", name: "خالد محمد", salary: 90, deduction: 10, remaining: 80 },
          { uuid: "4000", name: "نوره فهد", salary: 200, deduction: 30, remaining: 170 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (tab === "charges") await loadCharges();
    else await loadSalaries();
  }, [tab, chargeFilter, chargeDate, salaryMonth]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="pb-20">
        <PageHeader title="المالية" />

        {/* Tabs */}
        <div className="flex gap-1.5 px-3 py-2">
          {(["charges", "salaries"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 h-9 rounded-xl text-xs font-semibold transition-all ${
                tab === t
                  ? "text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground"
              }`}
              style={tab === t ? { background: "var(--gradient-button)" } : undefined}
            >
              {t === "charges" ? "💳 شحنات" : "💰 رواتب"}
            </button>
          ))}
        </div>

        {tab === "charges" ? (
          <div className="px-3 space-y-3 mt-1">
            {/* Stats Cards */}
            {chargeData && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                {/* Main stat */}
                <div className="rounded-2xl p-4 text-center border border-primary/20 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, hsl(262 80% 55% / 0.12), hsl(230 80% 60% / 0.06))" }}>
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/15">
                    <TrendingUp className="w-3 h-3 text-success" />
                    <span className="text-[10px] font-bold text-success">+{chargeData.stats.change || 12.5}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">إجمالي شحنات اليوم</p>
                  <p className="text-3xl font-black text-primary">${chargeData.stats.total_usd.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{chargeData.stats.count} عملية • متوسط ${chargeData.stats.avg || 10}</p>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { icon: DollarSign, label: "المتوسط", value: `$${chargeData.stats.avg || 10}`, color: "text-primary" },
                    { icon: Users, label: "العمليات", value: chargeData.stats.count, color: "text-accent" },
                    { icon: ArrowUpRight, label: "النمو", value: `${chargeData.stats.change || 12.5}%`, color: "text-success" },
                  ].map((s, i) => (
                    <div key={i} className="bg-card/60 rounded-xl p-2 text-center border border-border/30">
                      <s.icon className={`w-3.5 h-3.5 mx-auto mb-0.5 ${s.color}`} />
                      <p className="text-sm font-bold">{s.value}</p>
                      <p className="text-[8px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Weekly Chart */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card/60 rounded-2xl p-3 border border-border/30"
            >
              <p className="text-[11px] font-bold mb-2 text-right">📊 شحنات الأسبوع</p>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={weeklyCharges}>
                  <defs>
                    <linearGradient id="chargeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(262, 80%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(262, 80%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 18%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(240, 5%, 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(240, 5%, 55%)" }} axisLine={false} tickLine={false} width={35} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke="hsl(262, 80%, 55%)" strokeWidth={2} fill="url(#chargeGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Charge Type Pie */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card/60 rounded-2xl p-3 border border-border/30"
            >
              <p className="text-[11px] font-bold mb-1 text-right">🔄 توزيع الشحنات</p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  {chargeTypes.map((t, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <span className="text-[11px] font-bold">{t.value}%</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground">{t.name}</span>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width={90} height={90}>
                  <PieChart>
                    <Pie data={chargeTypes} dataKey="value" cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={3}>
                      {chargeTypes.map((t, i) => (
                        <Cell key={i} fill={t.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Date + Filters */}
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={chargeDate}
                onChange={(e) => setChargeDate(e.target.value)}
                className="h-8 rounded-lg bg-card px-2 text-[11px] border border-border/50 flex-1"
              />
              <div className="flex gap-1">
                {[
                  { key: "all", label: "الكل" },
                  { key: "agent", label: "وكلاء" },
                  { key: "big", label: "$50+" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setChargeFilter(f.key)}
                    className={`px-2.5 h-7 rounded-md text-[10px] font-medium ${
                      chargeFilter === f.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Charges list */}
            <p className="text-[11px] font-bold text-right">📋 آخر العمليات</p>
            {loading ? (
              <CardSkeleton count={3} />
            ) : (
              <div className="space-y-1.5">
                {chargeData?.charges.map((c: any, i: number) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-card/60 rounded-xl px-3 py-2.5 flex items-center gap-2.5 border border-border/30"
                  >
                    <UserAvatar name={c.charger_name} uuid={c.charger_uuid || c.id.toString()} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate">
                        {c.charger_name} → {c.user_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {c.charge_type === "agent" ? "🏪 وكيل" : "📱 مباشر"} • {c.time}
                      </p>
                    </div>
                    <span className="text-[13px] font-bold text-success">+${c.amount_usd}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 space-y-3 mt-1">
            <input
              type="month"
              value={salaryMonth}
              onChange={(e) => setSalaryMonth(e.target.value)}
              className="w-full h-8 rounded-lg bg-card px-2 text-[11px] border border-border/50"
            />

            {salaryData && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                {/* Salary overview */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="rounded-xl p-3 text-center border border-primary/20"
                    style={{ background: "linear-gradient(135deg, hsl(262 80% 55% / 0.12), hsl(230 80% 60% / 0.06))" }}>
                    <p className="text-[10px] text-muted-foreground">إجمالي الرواتب</p>
                    <p className="text-lg font-black text-primary">${salaryData.stats.total.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl p-3 text-center border border-success/20"
                    style={{ background: "linear-gradient(135deg, hsl(142 71% 45% / 0.12), hsl(142 71% 45% / 0.04))" }}>
                    <p className="text-[10px] text-muted-foreground">الصافي</p>
                    <p className="text-lg font-black text-success">${salaryData.stats.net.toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-card/60 rounded-xl p-2.5 text-center border border-border/30">
                    <TrendingDown className="w-3.5 h-3.5 mx-auto mb-0.5 text-destructive" />
                    <p className="text-sm font-bold text-destructive">-${salaryData.stats.deductions.toLocaleString()}</p>
                    <p className="text-[8px] text-muted-foreground">الخصومات</p>
                  </div>
                  <div className="bg-card/60 rounded-xl p-2.5 text-center border border-border/30">
                    <Users className="w-3.5 h-3.5 mx-auto mb-0.5 text-accent" />
                    <p className="text-sm font-bold">{salaryData.stats.user_count}</p>
                    <p className="text-[8px] text-muted-foreground">مستخدم</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Monthly Salary Chart */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card/60 rounded-2xl p-3 border border-border/30"
            >
              <p className="text-[11px] font-bold mb-2 text-right">📈 الرواتب الشهرية</p>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={monthlySalaries} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 18%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: "hsl(240, 5%, 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(240, 5%, 55%)" }} axisLine={false} tickLine={false} width={35} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" fill="hsl(262, 80%, 55%)" radius={[4, 4, 0, 0]} barSize={14} name="إجمالي" />
                  <Bar dataKey="net" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} barSize={14} name="صافي" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-4 mt-1.5">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
                  <span className="text-[9px] text-muted-foreground">إجمالي</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm bg-success" />
                  <span className="text-[9px] text-muted-foreground">صافي</span>
                </div>
              </div>
            </motion.div>

            {/* Salary list */}
            <p className="text-[11px] font-bold text-right">👥 تفاصيل الرواتب</p>
            {loading ? (
              <CardSkeleton count={3} />
            ) : (
              <div className="space-y-1.5">
                {salaryData?.users.map((u: any, i: number) => (
                  <motion.div
                    key={u.uuid}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-card/60 rounded-xl px-3 py-2.5 flex items-center gap-2.5 border border-border/30"
                  >
                    <UserAvatar name={u.name} uuid={u.uuid} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        الراتب: ${u.salary}
                        {u.deduction > 0 && <span className="text-destructive"> • خصم: -${u.deduction}</span>}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-bold text-success">${u.remaining}</p>
                      <p className="text-[8px] text-muted-foreground">صافي</p>
                    </div>
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
