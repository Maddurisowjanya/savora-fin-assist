import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinanceStore } from '@/lib/store';
import { predictSavings, getMonthlySummary } from '@/lib/finance-utils';

export default function PredictionsPage() {
  const { transactions } = useFinanceStore();
  const monthly = getMonthlySummary(transactions);
  const { predictions, confidence } = predictSavings(transactions);

  const chartData = [
    ...monthly.map(m => ({ name: m.label, savings: m.savings, type: 'actual' })),
    ...predictions.map(p => ({ name: p.month, savings: p.predicted, type: 'predicted' })),
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Savings Predictions</h1>
        <p className="text-muted-foreground mt-1">AI-powered forecast of your financial future</p>
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold font-display">Projected Savings Trend</h3>
          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
            {confidence}% confidence
          </span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(239, 100%, 69%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(239, 100%, 69%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Savings']} />
              <Area type="monotone" dataKey="savings" stroke="hsl(239, 100%, 69%)" fill="url(#savingsGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {predictions.map((p, i) => (
          <motion.div key={p.month} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card text-center">
            <p className="text-sm text-muted-foreground">{p.month}</p>
            <p className={`text-2xl font-bold font-display mt-2 ${p.predicted >= 0 ? 'text-success' : 'text-destructive'}`}>
              ₹{p.predicted.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Predicted savings</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
