import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useFinanceStore } from '@/lib/store';
import { getFinancialSummary, getMonthlySummary, getCategoryBreakdown, calculateRiskScore, generateAlerts } from '@/lib/finance-utils';
import { CATEGORY_COLORS } from '@/lib/categories';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { transactions } = useFinanceStore();
  const { totalIncome, totalExpenses, savings, ratio } = getFinancialSummary(transactions);
  const monthly = getMonthlySummary(transactions);
  const categories = getCategoryBreakdown(transactions);
  const { score, level } = calculateRiskScore(transactions);
  const alerts = generateAlerts(transactions);

  const stats = [
    { label: 'Total Income', value: totalIncome, icon: TrendingUp, color: 'text-success' },
    { label: 'Total Expenses', value: totalExpenses, icon: TrendingDown, color: 'text-destructive' },
    { label: 'Savings', value: savings, icon: PiggyBank, color: 'text-primary' },
    { label: 'Expense Ratio', value: `${(ratio * 100).toFixed(0)}%`, icon: Wallet, color: 'text-warning', raw: true },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your financial overview at a glance</p>
      </motion.div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div variants={item} className="stat-card border-l-4 border-l-warning">
          <p className="text-sm font-medium text-warning mb-1">⚡ Smart Alert</p>
          <p className="text-sm text-muted-foreground">{alerts[0]}</p>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
            </div>
            <p className="text-xl md:text-2xl font-bold font-display">
              {s.raw ? s.value : `₹${Number(s.value).toLocaleString()}`}
            </p>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <motion.div variants={item} className="stat-card lg:col-span-2 p-0">
          <div className="p-5 pb-0">
            <h3 className="font-semibold font-display">Monthly Trend</h3>
            <p className="text-xs text-muted-foreground">Income vs Expenses over time</p>
          </div>
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(239, 100%, 69%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(239, 100%, 69%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(240, 10%, 60%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(240, 10%, 60%)" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="income" stroke="hsl(152, 60%, 45%)" fill="url(#incomeGrad)" strokeWidth={2} name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="hsl(239, 100%, 69%)" fill="url(#expenseGrad)" strokeWidth={2} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Pie */}
        <motion.div variants={item} className="stat-card p-0">
          <div className="p-5 pb-0">
            <h3 className="font-semibold font-display">Spending by Category</h3>
          </div>
          <div className="h-52 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories.slice(0, 6)} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {categories.slice(0, 6).map((c, i) => (
                    <Cell key={c.name} fill={CATEGORY_COLORS[c.name] || `hsl(${i * 60}, 60%, 55%)`} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pb-4 space-y-1.5">
            {categories.slice(0, 4).map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[c.name] }} />
                  {c.name}
                </span>
                <span className="font-medium">₹{c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Risk Score mini */}
      <motion.div variants={item} className="stat-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold font-display">Financial Risk Score</h3>
            <p className="text-xs text-muted-foreground mt-1">Based on spending, savings & volatility</p>
          </div>
          <div className="text-right">
            <span className={`text-3xl font-bold font-display ${
              score <= 30 ? 'text-success' : score <= 60 ? 'text-warning' : 'text-destructive'
            }`}>
              {score}
            </span>
            <span className="text-xs text-muted-foreground block">{level}</span>
          </div>
        </div>
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: score <= 30 ? 'hsl(152, 60%, 45%)' : score <= 60 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 72%, 51%)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
