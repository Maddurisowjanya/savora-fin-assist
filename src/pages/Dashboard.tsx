import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useFinanceStore } from '@/lib/store';
import { getFinancialSummary, getMonthlySummary, getCategoryBreakdown, calculateRiskScore, generateAlerts } from '@/lib/finance-utils';
import { CATEGORY_COLORS } from '@/lib/categories';
import { useEffect, useRef } from 'react';

/* ── Animated counter ── */
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionVal, value, { duration: 1.4, ease: 'easeOut' });
    return controls.stop;
  }, [value, motionVal]);

  useEffect(() => {
    const unsub = rounded.on('change', (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsub;
  }, [rounded]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

/* ── Circular gauge ── */
function RiskGauge({ score, level }: { score: number; level: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const color = score <= 30 ? 'hsl(152,60%,45%)' : score <= 60 ? 'hsl(38,92%,50%)' : 'hsl(0,72%,51%)';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="hsla(240,15%,90%,0.3)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (circumference * score) / 100 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-display" style={{ color }}>
            <AnimatedNumber value={score} />
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{level}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Glass card wrapper ── */
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 20px 50px -12px hsla(239,60%,50%,0.18)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 shadow-[0_8px_32px_-8px_hsla(239,60%,40%,0.10)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

export default function DashboardPage() {
  const { transactions } = useFinanceStore();
  const { totalIncome, totalExpenses, savings, ratio } = getFinancialSummary(transactions);
  const monthly = getMonthlySummary(transactions);
  const categories = getCategoryBreakdown(transactions);
  const { score, level } = calculateRiskScore(transactions);
  const alerts = generateAlerts(transactions);

  const stats = [
    { label: 'Total Income', value: totalIncome, icon: TrendingUp, accent: 'from-emerald-400 to-emerald-600' },
    { label: 'Total Expenses', value: totalExpenses, icon: TrendingDown, accent: 'from-rose-400 to-rose-600' },
    { label: 'Net Savings', value: savings, icon: PiggyBank, accent: 'from-violet-400 to-indigo-600' },
    { label: 'Expense Ratio', value: Math.round(ratio * 100), icon: Wallet, accent: 'from-amber-400 to-orange-500', suffix: '%' },
  ];

  return (
    <div className="relative min-h-full">
      {/* Gradient background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,hsla(239,100%,69%,0.12),transparent_70%)]" />
        <div className="absolute top-1/2 -left-48 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,hsla(253,100%,87%,0.10),transparent_70%)]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,hsla(303,100%,93%,0.08),transparent_70%)]" />
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto pb-8">
        {/* Hero */}
        <motion.div variants={item} className="pt-2">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-primary">Financial Overview</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'} 👋
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm max-w-md">
            Here's what's happening with your finances today.
          </p>
        </motion.div>

        {/* Alert */}
        {alerts.length > 0 && (
          <motion.div variants={item}>
            <GlassCard className="border-l-4 border-l-warning/60 py-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">⚡</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-warning mb-0.5">Smart Alert</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{alerts[0]}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Stat cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <GlassCard key={s.label} className="p-5">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center mb-3 shadow-lg`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-2xl md:text-3xl font-bold font-display tracking-tight">
                {s.suffix
                  ? <AnimatedNumber value={s.value} suffix={s.suffix} />
                  : <AnimatedNumber value={s.value} prefix="₹" />
                }
              </p>
            </GlassCard>
          ))}
        </motion.div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Monthly Trend */}
          <motion.div variants={item} className="lg:col-span-3">
            <GlassCard className="p-0">
              <div className="px-6 pt-6 pb-2">
                <h3 className="text-base font-semibold font-display">Monthly Trend</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Income vs expenses over time</p>
              </div>
              <div className="h-72 px-2 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthly}>
                    <defs>
                      <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(152,60%,45%)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="hsl(152,60%,45%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(239,100%,69%)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="hsl(239,100%,69%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(240,10%,55%)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(240,10%,55%)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsla(0,0%,100%,0.85)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid hsla(240,10%,90%,0.5)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px -8px hsla(239,60%,40%,0.12)',
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`₹${v.toLocaleString()}`, '']}
                    />
                    <Area type="monotone" dataKey="income" stroke="hsl(152,60%,45%)" fill="url(#incGrad)" strokeWidth={2.5} dot={false} name="Income" />
                    <Area type="monotone" dataKey="expenses" stroke="hsl(239,100%,69%)" fill="url(#expGrad)" strokeWidth={2.5} dot={false} name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* Category Pie */}
          <motion.div variants={item} className="lg:col-span-2">
            <GlassCard className="p-0 h-full flex flex-col">
              <div className="px-6 pt-6 pb-1">
                <h3 className="text-base font-semibold font-display">Spending Breakdown</h3>
                <p className="text-xs text-muted-foreground mt-0.5">By category</p>
              </div>
              <div className="h-48 px-2 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories.slice(0, 6)} cx="50%" cy="50%" innerRadius={42} outerRadius={72} dataKey="value" paddingAngle={4} cornerRadius={4}>
                      {categories.slice(0, 6).map((c, i) => (
                        <Cell key={c.name} fill={CATEGORY_COLORS[c.name] || `hsl(${i * 55 + 240}, 65%, 60%)`} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsla(0,0%,100%,0.85)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid hsla(240,10%,90%,0.5)',
                        borderRadius: '12px',
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`₹${v.toLocaleString()}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="px-6 pb-5 space-y-2.5 mt-auto">
                {categories.slice(0, 5).map(c => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: CATEGORY_COLORS[c.name] }} />
                      <span className="text-muted-foreground">{c.name}</span>
                    </span>
                    <span className="font-semibold">₹{c.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Risk gauge */}
        <motion.div variants={item}>
          <GlassCard>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-base font-semibold font-display">Financial Risk Score</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Calculated from your spending ratio, savings consistency, and expense volatility.
                </p>
              </div>
              <RiskGauge score={score} level={level} />
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
