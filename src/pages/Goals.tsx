import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Trash2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinanceStore } from '@/lib/store';
import { analyzeGoal } from '@/lib/finance-utils';

export default function GoalsPage() {
  const { transactions, goals, addGoal, removeGoal } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleAdd = () => {
    if (!name || !targetAmount || !targetDate) return;
    addGoal({ name, targetAmount: parseFloat(targetAmount), targetDate });
    setName('');
    setTargetAmount('');
    setTargetDate('');
    setShowForm(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Financial Goals</h1>
          <p className="text-muted-foreground mt-1">Track progress toward your savings targets</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'default'} className="gap-2">
          <Plus className="w-4 h-4" />
          New Goal
        </Button>
      </div>

      {/* Add goal form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-6 space-y-4"
        >
          <h3 className="font-semibold font-display">Create a Goal</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <Input placeholder="Goal name (e.g. MacBook Pro)" value={name} onChange={e => setName(e.target.value)} />
            <Input type="number" placeholder="Target amount (₹)" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
            <Input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>
          <Button onClick={handleAdd} disabled={!name || !targetAmount || !targetDate}>Save Goal</Button>
        </motion.div>
      )}

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-12 text-center">
          <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No goals yet. Set a financial target to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map((goal, idx) => {
            const analysis = analyzeGoal(goal, transactions);
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-xl overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${analysis.isAchievable ? 'bg-success/10' : 'bg-warning/10'}`}>
                        {analysis.isAchievable ? <CheckCircle className="w-5 h-5 text-success" /> : <AlertTriangle className="w-5 h-5 text-warning" />}
                      </div>
                      <div>
                        <h3 className="font-semibold font-display text-lg">{goal.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          ₹{goal.targetAmount.toLocaleString()} by {new Date(goal.targetDate).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                          {' · '}{analysis.monthsLeft} months left
                        </p>
                      </div>
                    </div>
                    <button onClick={() => removeGoal(goal.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Projected progress</span>
                      <span className="font-medium">{analysis.progress}%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: analysis.isAchievable ? 'hsl(152,60%,45%)' : 'hsl(38,92%,50%)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(analysis.progress, 100)}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Required/mo</p>
                      <p className="text-sm font-bold font-display">₹{analysis.requiredMonthlySavings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg savings/mo</p>
                      <p className="text-sm font-bold font-display">₹{analysis.avgMonthlySavings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
                      <p className={`text-sm font-bold font-display ${analysis.isAchievable ? 'text-success' : 'text-warning'}`}>
                        {analysis.isAchievable ? 'On Track' : `Gap: ₹${analysis.gap.toLocaleString()}`}
                      </p>
                    </div>
                  </div>

                  {/* Suggestions */}
                  {analysis.suggestions.length > 0 && (
                    <div className="mt-4 rounded-xl bg-warning/5 border border-warning/20 p-3">
                      <p className="text-xs font-medium text-warning mb-1">💡 Suggestions to reach your goal</p>
                      {analysis.suggestions.map((s, i) => (
                        <p key={i} className="text-xs text-muted-foreground">• {s}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Projection chart */}
                {analysis.projectionData.length > 1 && (
                  <div className="h-48 px-2 pb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analysis.projectionData}>
                        <defs>
                          <linearGradient id={`goalGrad-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(239,100%,69%)" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="hsl(239,100%,69%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, '']} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid hsla(240,10%,90%,0.5)', background: 'hsla(0,0%,100%,0.85)' }} />
                        <ReferenceLine y={goal.targetAmount} stroke="hsl(38,92%,50%)" strokeDasharray="5 5" label={{ value: 'Target', fontSize: 10, fill: 'hsl(38,92%,50%)' }} />
                        <Area type="monotone" dataKey="projected" stroke="hsl(239,100%,69%)" fill={`url(#goalGrad-${goal.id})`} strokeWidth={2} dot={false} name="Projected" />
                        <Area type="monotone" dataKey="required" stroke="hsl(152,60%,45%)" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Required" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
