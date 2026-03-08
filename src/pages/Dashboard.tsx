import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Sparkles, Lightbulb, ShieldCheck, LineChart, Banknote, Landmark, PieChart, Brain, AlertTriangle, BarChart3, Heart } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useFinanceStore } from '@/lib/store';
import { getFinancialSummary, getMonthlySummary, getCategoryBreakdown, calculateRiskScore, generateAlerts, generateMonthlyInsight, generateFinancialAdvice, detectSpendingAnomalies, getInvestmentRecommendations } from '@/lib/finance-utils';
import { CATEGORY_COLORS } from '@/lib/categories';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Animated counter ── */
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => { const c = animate(motionVal, value, { duration: 1.4, ease: 'easeOut' }); return c.stop; }, [value, motionVal]);
  useEffect(() => { const u = rounded.on('change', (v) => { if (ref.current) ref.current.textContent = v; }); return u; }, [rounded]);
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
          <motion.circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (circumference * score) / 100 }}
            transition={{ duration: 1.6, ease: 'easeOut' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-display" style={{ color }}><AnimatedNumber value={score} /></span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{level}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Financial Health Bar ── */
function HealthIndicator({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function GlassCard({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <motion.div onClick={onClick}
      whileHover={{ y: -3, boxShadow: '0 20px 50px -12px hsla(239,60%,50%,0.18)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 shadow-[0_8px_32px_-8px_hsla(239,60%,40%,0.10)] ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >{children}</motion.div>
  );
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

export default function DashboardPage() {
  const navigate = useNavigate();
  const { transactions, insurancePolicies, sipInvestments, emis, loans, savingsDivisions } = useFinanceStore();
  const { totalIncome, totalExpenses, savings, ratio } = getFinancialSummary(transactions);
  const monthly = getMonthlySummary(transactions);
  const categories = getCategoryBreakdown(transactions);
  const { score, level } = calculateRiskScore(transactions);
  const alerts = generateAlerts(transactions);

  const insuranceDue = insurancePolicies.filter(p => p.status !== 'paid').reduce((s, p) => s + p.premiumAmount, 0);
  const totalSIPMonthly = sipInvestments.reduce((s, i) => s + i.monthlyAmount, 0);
  const totalEMI = emis.reduce((s, e) => s + e.emiAmount, 0);
  const totalLoanOutstanding = loans.reduce((s, l) => s + l.remainingBalance, 0);
  const latestSavings = savingsDivisions[savingsDivisions.length - 1];

  // New features data
  const topAdvice = generateFinancialAdvice(transactions, { totalEMI, totalSIP: totalSIPMonthly, insuranceDue, loanOutstanding: totalLoanOutstanding }).slice(0, 3);
  const anomalies = detectSpendingAnomalies(transactions);
  const { profile, recommendations } = getInvestmentRecommendations(transactions, { totalEMI, totalSIP: totalSIPMonthly, loanOutstanding: totalLoanOutstanding });

  const savingsRate = totalIncome > 0 ? savings / totalIncome : 0;
  const monthlyIncome = totalIncome / (monthly.length || 1);

  const stats = [
    { label: 'Total Income', value: totalIncome, icon: TrendingUp, accent: 'from-emerald-400 to-emerald-600' },
    { label: 'Total Expenses', value: totalExpenses, icon: TrendingDown, accent: 'from-rose-400 to-rose-600' },
    { label: 'Net Savings', value: savings, icon: PiggyBank, accent: 'from-violet-400 to-indigo-600' },
    { label: 'Expense Ratio', value: Math.round(ratio * 100), icon: Wallet, accent: 'from-amber-400 to-orange-500', suffix: '%' },
  ];

  const miniCards = [
    { label: 'Insurance Due', value: insuranceDue, icon: ShieldCheck, accent: 'from-sky-400 to-blue-600', route: '/insurance' },
    { label: 'Monthly SIP', value: totalSIPMonthly, icon: LineChart, accent: 'from-teal-400 to-emerald-600', route: '/sip' },
    { label: 'Monthly EMI', value: totalEMI, icon: Banknote, accent: 'from-orange-400 to-red-500', route: '/emi' },
    { label: 'Loans Outstanding', value: totalLoanOutstanding, icon: Landmark, accent: 'from-pink-400 to-rose-600', route: '/loans' },
  ];

  return (
    <div className="relative min-h-full">
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
          <p className="text-muted-foreground mt-1.5 text-sm max-w-md">Here's what's happening with your finances today.</p>
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

        {/* Main stat cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <GlassCard key={s.label} className="p-5">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center mb-3 shadow-lg`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-2xl md:text-3xl font-bold font-display tracking-tight">
                {s.suffix ? <AnimatedNumber value={s.value} suffix={s.suffix} /> : <AnimatedNumber value={s.value} prefix="₹" />}
              </p>
            </GlassCard>
          ))}
        </motion.div>

        {/* Financial Health Indicators */}
        <motion.div variants={item}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-primary" />
              <h3 className="text-base font-semibold font-display">Financial Health</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HealthIndicator label="Savings Rate" value={savingsRate * 100} max={100} color="bg-success" />
              <HealthIndicator label="Debt-to-Income" value={totalEMI > 0 ? (totalEMI / monthlyIncome) * 100 : 0} max={100} color={totalEMI / monthlyIncome > 0.4 ? 'bg-destructive' : 'bg-primary'} />
              <HealthIndicator label="Investment Coverage" value={totalSIPMonthly > 0 ? (totalSIPMonthly / monthlyIncome) * 100 : 0} max={30} color="bg-secondary" />
              <HealthIndicator label="Expense Control" value={(1 - ratio) * 100} max={100} color={ratio > 0.8 ? 'bg-destructive' : 'bg-success'} />
            </div>
          </GlassCard>
        </motion.div>

        {/* AI Advisor Summary + Anomalies */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <GlassCard className="h-full" onClick={() => navigate('/advisor')}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold font-display">AI Financial Advice</h3>
                  <p className="text-[10px] text-muted-foreground">Top recommendations</p>
                </div>
              </div>
              <div className="space-y-3">
                {topAdvice.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-sm flex-shrink-0">{a.icon}</span>
                    <div>
                      <p className="text-xs font-semibold">{a.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{a.description}</p>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      a.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                      a.priority === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-success/10 text-success'
                    }`}>{a.priority}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={item}>
            <GlassCard className="h-full" onClick={() => navigate('/anomalies')}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold font-display">Spending Anomalies</h3>
                  <p className="text-[10px] text-muted-foreground">{anomalies.length} unusual transaction{anomalies.length !== 1 ? 's' : ''} detected</p>
                </div>
              </div>
              {anomalies.length === 0 ? (
                <p className="text-sm text-success font-medium">✓ No unusual spending detected</p>
              ) : (
                <div className="space-y-2.5">
                  {anomalies.slice(0, 3).map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium">{a.transaction.description}</p>
                        <p className="text-muted-foreground">{a.deviation}x above avg · {a.transaction.category}</p>
                      </div>
                      <span className={`font-bold ${
                        a.severity === 'severe' ? 'text-destructive' : a.severity === 'moderate' ? 'text-warning' : 'text-primary'
                      }`}>₹{a.transaction.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Investment Recommendation Summary */}
        <motion.div variants={item}>
          <GlassCard onClick={() => navigate('/investments')}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold font-display">Investment Recommendations</h3>
                <p className="text-[10px] text-muted-foreground">Profile: <span className="font-semibold capitalize">{profile}</span></p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-muted/50">
                  <p className="text-lg font-bold font-display text-primary">{rec.allocation}%</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{rec.type}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* New feature mini-cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {miniCards.map((c) => (
            <GlassCard key={c.label} className="p-5" onClick={() => navigate(c.route)}>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.accent} flex items-center justify-center mb-3 shadow-lg`}>
                <c.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-1">{c.label}</p>
              <p className="text-xl font-bold font-display tracking-tight">₹{c.value.toLocaleString()}</p>
            </GlassCard>
          ))}
        </motion.div>

        {/* Savings allocation */}
        {latestSavings && (
          <motion.div variants={item}>
            <GlassCard onClick={() => navigate('/savings-division')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center shadow-lg">
                  <PieChart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Monthly Allocation — {latestSavings.month}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Savings</p>
                  <p className="text-lg font-bold font-display text-success">₹{latestSavings.savings.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expenses</p>
                  <p className="text-lg font-bold font-display text-primary">₹{latestSavings.expenses.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Investments</p>
                  <p className="text-lg font-bold font-display text-warning">₹{latestSavings.investments.toLocaleString()}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Charts row */}
        <div className="grid lg:grid-cols-5 gap-6">
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
                    <Tooltip contentStyle={{ background: 'hsla(0,0%,100%,0.85)', backdropFilter: 'blur(12px)', border: '1px solid hsla(240,10%,90%,0.5)', borderRadius: '12px', boxShadow: '0 8px 32px -8px hsla(239,60%,40%,0.12)', fontSize: 12 }}
                      formatter={(v: number) => [`₹${v.toLocaleString()}`, '']} />
                    <Area type="monotone" dataKey="income" stroke="hsl(152,60%,45%)" fill="url(#incGrad)" strokeWidth={2.5} dot={false} name="Income" />
                    <Area type="monotone" dataKey="expenses" stroke="hsl(239,100%,69%)" fill="url(#expGrad)" strokeWidth={2.5} dot={false} name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-2">
            <GlassCard className="p-0 h-full flex flex-col">
              <div className="px-6 pt-6 pb-1">
                <h3 className="text-base font-semibold font-display">Spending Breakdown</h3>
                <p className="text-xs text-muted-foreground mt-0.5">By category</p>
              </div>
              <div className="h-48 px-2 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={categories.slice(0, 6)} cx="50%" cy="50%" innerRadius={42} outerRadius={72} dataKey="value" paddingAngle={4} cornerRadius={4}>
                      {categories.slice(0, 6).map((c, i) => (
                        <Cell key={c.name} fill={CATEGORY_COLORS[c.name] || `hsl(${i * 55 + 240}, 65%, 60%)`} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsla(0,0%,100%,0.85)', backdropFilter: 'blur(12px)', border: '1px solid hsla(240,10%,90%,0.5)', borderRadius: '12px', fontSize: 12 }}
                      formatter={(v: number) => [`₹${v.toLocaleString()}`, '']} />
                  </RePieChart>
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
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">Calculated from your spending ratio, savings consistency, and expense volatility.</p>
              </div>
              <RiskGauge score={score} level={level} />
            </div>
          </GlassCard>
        </motion.div>

        {/* AI Insight */}
        <motion.div variants={item}>
          <GlassCard className="border-l-4 border-l-primary/50">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">AI Insight of the Month</p>
                <p className="text-sm leading-relaxed">{generateMonthlyInsight(transactions)}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
