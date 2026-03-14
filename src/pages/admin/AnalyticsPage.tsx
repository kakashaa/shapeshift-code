import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import {
  Users, DollarSign, AlertTriangle, TrendingUp, TrendingDown,
  Activity, Eye, UserPlus, ShieldAlert, Zap, Download
} from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/export";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
} from "recharts";

// ── Demo Data ──

const userGrowth = [
  { month: "يناير", users: 1200, active: 980 },
  { month: "فبراير", users: 1450, active: 1100 },
  { month: "مارس", users: 1800, active: 1350 },
  { month: "أبريل", users: 2100, active: 1600 },
  { month: "مايو", users: 2650, active: 2000 },
  { month: "يونيو", users: 3200, active: 2500 },
];

const dailyCharges = [
  { day: "سبت", amount: 1800, count: 45 },
  { day: "أحد", amount: 2400, count: 62 },
  { day: "إثنين", amount: 1950, count: 48 },
  { day: "ثلاثاء", amount: 3200, count: 78 },
  { day: "أربعاء", amount: 2800, count: 71 },
  { day: "خميس", amount: 3600, count: 85 },
  { day: "جمعة", amount: 4200, count: 102 },
];

const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  online: Math.floor(80 + Math.sin(i / 3) * 60 + Math.random() * 30),
  messages: Math.floor(200 + Math.sin(i / 4) * 150 + Math.random() * 50),
}));

const reportsByType = [
  { name: "إساءة", value: 42, color: "hsl(0, 72%, 51%)" },
  { name: "تحرش", value: 28, color: "hsl(25, 95%, 53%)" },
  { name: "احتيال", value: 18, color: "hsl(45, 93%, 47%)" },
  { name: "سبام", value: 12, color: "hsl(200, 95%, 48%)" },
];

const reportsTrend = [
  { week: "أسبوع 1", reports: 15, resolved: 12 },
  { week: "أسبوع 2", reports: 22, resolved: 18 },
  { week: "أسبوع 3", reports: 18, resolved: 16 },
  { week: "أسبوع 4", reports: 25, resolved: 20 },
];

const topChargers = [
  { name: "أحمد محمد", amount: 4200, pct: 100 },
  { name: "سارة خالد", amount: 3100, pct: 74 },
  { name: "ياسر القحطاني", amount: 2800, pct: 67 },
  { name: "فهد العنزي", amount: 2100, pct: 50 },
  { name: "نوره سعيد", amount: 1500, pct: 36 },
];

const platformHealth = [
  { name: "سيرفر", value: 98, fill: "hsl(160, 72%, 42%)" },
  { name: "API", value: 95, fill: "hsl(200, 95%, 48%)" },
  { name: "تخزين", value: 72, fill: "hsl(45, 93%, 47%)" },
];

type Tab = "users" | "charges" | "reports";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border/50 rounded-xl px-3 py-2 shadow-xl text-right" style={{ direction: "rtl" }}>
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[11px] font-bold" style={{ color: p.color || p.stroke }}>
          {p.name}: {typeof p.value === "number" && p.value > 100 ? `$${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("users");

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 10 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { delay, duration: 0.3 },
  });

  const handleExport = (format: "csv" | "pdf") => {
    if (tab === "users") {
      const data = userGrowth;
      if (format === "csv") {
        exportToCSV(data.map(d => ({ الشهر: d.month, إجمالي: d.users, نشط: d.active })), "analytics-users");
      } else {
        exportToPDF("إحصائيات المستخدمين", ["نشط", "إجمالي", "الشهر"],
          data.map(d => [d.active, d.users, d.month]), "analytics-users");
      }
    } else if (tab === "charges") {
      if (format === "csv") {
        exportToCSV(dailyCharges.map(d => ({ اليوم: d.day, المبلغ: d.amount, العمليات: d.count })), "analytics-charges");
      } else {
        exportToPDF("إحصائيات الشحنات", ["العمليات", "المبلغ ($)", "اليوم"],
          dailyCharges.map(d => [d.count, d.amount, d.day]), "analytics-charges");
      }
    } else {
      if (format === "csv") {
        exportToCSV(reportsByType.map(r => ({ النوع: r.name, العدد: r.value })), "analytics-reports");
      } else {
        exportToPDF("إحصائيات البلاغات", ["العدد", "النوع"],
          reportsByType.map(r => [r.value, r.name]), "analytics-reports");
      }
    }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "users", label: "المستخدمين", icon: "👥" },
    { key: "charges", label: "الشحنات", icon: "💳" },
    { key: "reports", label: "البلاغات", icon: "🚨" },
  ];

  return (
    <div className="pb-20">
      <PageHeader title="الإحصائيات" actions={
        <div className="flex gap-1.5">
          <button onClick={() => handleExport("csv")} className="w-8 h-8 rounded-xl bg-secondary/80 flex items-center justify-center active:scale-90 transition-all hover:bg-secondary" title="CSV">
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => handleExport("pdf")} className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center active:scale-90 transition-all hover:bg-primary/20" title="PDF">
            <Download className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>
      } />

      {/* Tab switcher */}
      <div className="flex gap-1.5 px-4 py-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 h-9 rounded-xl text-[11px] font-semibold transition-all ${
              tab === t.key
                ? "text-primary-foreground shadow-lg"
                : "bg-secondary/60 text-muted-foreground"
            }`}
            style={tab === t.key ? { background: "var(--gradient-button)" } : undefined}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {tab === "users" && <UsersTab anim={anim} />}
        {tab === "charges" && <ChargesTab anim={anim} />}
        {tab === "reports" && <ReportsTab anim={anim} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Users Tab
// ═══════════════════════════════════════
function UsersTab({ anim }: { anim: (d: number) => any }) {
  const stats = [
    { icon: Users, label: "إجمالي", value: "3,200", color: "text-primary", bg: "bg-primary/10" },
    { icon: Eye, label: "أونلاين", value: "234", color: "text-success", bg: "bg-success/10" },
    { icon: UserPlus, label: "جدد اليوم", value: "18", color: "text-warning", bg: "bg-warning/10" },
    { icon: Activity, label: "نشاط", value: "78%", color: "text-accent-foreground", bg: "bg-accent/10" },
  ];

  return (
    <>
      {/* Stats grid */}
      <motion.div {...anim(0)} className="grid grid-cols-4 gap-2">
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-2.5 text-center">
            <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center mx-auto mb-1.5`}>
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
            </div>
            <p className="text-[13px] font-bold">{s.value}</p>
            <p className="text-[8px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* User growth chart */}
      <motion.div {...anim(0.1)} className="glass-card p-4">
        <p className="text-[12px] font-bold mb-3 text-right">📈 نمو المستخدمين</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={userGrowth}>
            <defs>
              <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(200, 95%, 48%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(200, 95%, 48%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 72%, 42%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 72%, 42%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="users" stroke="hsl(200, 95%, 48%)" strokeWidth={2} fill="url(#usersGrad)" name="إجمالي" />
            <Area type="monotone" dataKey="active" stroke="hsl(160, 72%, 42%)" strokeWidth={2} fill="url(#activeGrad)" name="نشط" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-5 mt-2">
          <Legend color="hsl(200, 95%, 48%)" label="إجمالي" />
          <Legend color="hsl(160, 72%, 42%)" label="نشط" />
        </div>
      </motion.div>

      {/* Hourly activity */}
      <motion.div {...anim(0.2)} className="glass-card p-4">
        <p className="text-[12px] font-bold mb-3 text-right">⏰ النشاط بالساعة</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={hourlyActivity.filter((_, i) => i % 2 === 0)}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
            <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={25} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="online" fill="hsl(200, 95%, 48%)" radius={[3, 3, 0, 0]} barSize={10} name="أونلاين" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Platform health */}
      <motion.div {...anim(0.3)} className="glass-card p-4">
        <p className="text-[12px] font-bold mb-3 text-right">🖥 صحة المنصة</p>
        <div className="flex items-center justify-around">
          {platformHealth.map((h, i) => (
            <div key={i} className="text-center">
              <div className="relative w-16 h-16 mx-auto">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(var(--border) / 0.3)" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r="26" fill="none"
                    stroke={h.fill} strokeWidth="5"
                    strokeDasharray={`${h.value * 1.63} 200`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold">
                  {h.value}%
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">{h.name}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}

// ═══════════════════════════════════════
// Charges Tab
// ═══════════════════════════════════════
function ChargesTab({ anim }: { anim: (d: number) => any }) {
  return (
    <>
      {/* Summary cards */}
      <motion.div {...anim(0)} className="grid grid-cols-2 gap-2.5">
        <div className="stat-card text-center glow-border">
          <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-primary">$19,950</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">إجمالي الأسبوع</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-success" />
            <span className="text-[10px] font-bold text-success">+15.2%</span>
          </div>
        </div>
        <div className="stat-card text-center">
          <Zap className="w-5 h-5 text-warning mx-auto mb-1" />
          <p className="text-xl font-bold">491</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">عدد العمليات</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-success" />
            <span className="text-[10px] font-bold text-success">+8.7%</span>
          </div>
        </div>
      </motion.div>

      {/* Weekly charges chart */}
      <motion.div {...anim(0.1)} className="glass-card p-4">
        <p className="text-[12px] font-bold mb-3 text-right">📊 شحنات الأسبوع</p>
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={dailyCharges}>
            <defs>
              <linearGradient id="chargesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(200, 95%, 48%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(200, 95%, 48%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={35} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="amount" stroke="hsl(200, 95%, 48%)" strokeWidth={2.5} fill="url(#chargesGrad)" name="المبلغ" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Charge count line chart */}
      <motion.div {...anim(0.15)} className="glass-card p-4">
        <p className="text-[12px] font-bold mb-3 text-right">📈 عدد العمليات</p>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={dailyCharges}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={25} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="count" stroke="hsl(160, 72%, 42%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(160, 72%, 42%)" }} name="العمليات" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top chargers */}
      <motion.div {...anim(0.2)} className="glass-card p-4">
        <p className="text-[12px] font-bold mb-3 text-right">🏆 أعلى الشاحنين</p>
        <div className="space-y-2.5">
          {topChargers.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-muted-foreground/60 w-4 text-center">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-primary">${c.amount.toLocaleString()}</span>
                  <span className="text-[11px] font-medium truncate">{c.name}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary/80 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.pct}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{ background: "var(--gradient-primary)" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}

// ═══════════════════════════════════════
// Reports Tab
// ═══════════════════════════════════════
function ReportsTab({ anim }: { anim: (d: number) => any }) {
  const totalReports = reportsByType.reduce((sum, r) => sum + r.value, 0);

  return (
    <>
      {/* Summary */}
      <motion.div {...anim(0)} className="grid grid-cols-3 gap-2">
        <div className="glass-card p-3 text-center">
          <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-destructive" />
          <p className="text-lg font-bold">{totalReports}</p>
          <p className="text-[8px] text-muted-foreground">إجمالي</p>
        </div>
        <div className="glass-card p-3 text-center">
          <ShieldAlert className="w-4 h-4 mx-auto mb-1 text-warning" />
          <p className="text-lg font-bold">34</p>
          <p className="text-[8px] text-muted-foreground">قيد المراجعة</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Activity className="w-4 h-4 mx-auto mb-1 text-success" />
          <p className="text-lg font-bold">66</p>
          <p className="text-[8px] text-muted-foreground">تم الحل</p>
        </div>
      </motion.div>

      {/* Reports by type - Pie */}
      <motion.div {...anim(0.1)} className="glass-card p-4">
        <p className="text-[12px] font-bold mb-2 text-right">📊 البلاغات حسب النوع</p>
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            {reportsByType.map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[12px] font-bold">{r.value}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{r.name}</span>
                  <div className="w-3 h-3 rounded-full" style={{ background: r.color }} />
                </div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width={110} height={110}>
            <PieChart>
              <Pie
                data={reportsByType}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={48}
                paddingAngle={3}
              >
                {reportsByType.map((r, i) => (
                  <Cell key={i} fill={r.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Reports trend */}
      <motion.div {...anim(0.2)} className="glass-card p-4">
        <p className="text-[12px] font-bold mb-3 text-right">📈 اتجاه البلاغات</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={reportsTrend} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={20} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="reports" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} barSize={16} name="بلاغات" />
            <Bar dataKey="resolved" fill="hsl(160, 72%, 42%)" radius={[4, 4, 0, 0]} barSize={16} name="تم الحل" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-5 mt-2">
          <Legend color="hsl(0, 72%, 51%)" label="بلاغات" />
          <Legend color="hsl(160, 72%, 42%)" label="تم الحل" />
        </div>
      </motion.div>

      {/* Resolution rate */}
      <motion.div {...anim(0.3)} className="glass-card p-4 text-center">
        <p className="text-[12px] font-bold mb-3">⚡ معدل الحل</p>
        <div className="relative w-24 h-24 mx-auto">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--border) / 0.3)" strokeWidth="7" />
            <circle
              cx="48" cy="48" r="40" fill="none"
              stroke="hsl(160, 72%, 42%)" strokeWidth="7"
              strokeDasharray={`${66 * 2.51} 300`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-success">
            66%
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">66 من 100 بلاغ تم حلّها</p>
      </motion.div>
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div className="w-3 h-3 rounded" style={{ background: color }} />
    </div>
  );
}
