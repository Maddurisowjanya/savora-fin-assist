import { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart as PieIcon, Plus, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinanceStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const COLORS = ['hsl(152,60%,45%)', 'hsl(239,100%,69%)', 'hsl(38,92%,50%)'];

export default function SavingsDivisionPage() {
  const { savingsDivisions, addSavingsDivision, removeSavingsDivision } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ month: '', totalIncome: '', savings: '', expenses: '', investments: '' });

  const handleAdd = () => {
    if (!form.month || !form.totalIncome) return;
    addSavingsDivision({
      month: form.month,
      totalIncome: Number(form.totalIncome),
      savings: Number(form.savings),
      expenses: Number(form.expenses),
      investments: Number(form.investments),
    });
    setForm({ month: '', totalIncome: '', savings: '', expenses: '', investments: '' });
    setShowForm(false);
  };

  const latest = savingsDivisions[savingsDivisions.length - 1];
  const pieData = latest ? [
    { name: 'Savings', value: latest.savings },
    { name: 'Expenses', value: latest.expenses },
    { name: 'Investments', value: latest.investments },
  ] : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PieIcon className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-primary">Allocation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Savings Division</h1>
          <p className="text-sm text-muted-foreground mt-1">Allocate monthly income across categories</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm"><Plus className="w-4 h-4 mr-1" />Add Month</Button>
      </div>

      {latest && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Month: {latest.month}</p>
            <p className="text-2xl font-bold font-display">₹{latest.totalIncome.toLocaleString()}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Savings</span><span className="font-semibold text-emerald-500">₹{latest.savings.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expenses</span><span className="font-semibold text-primary">₹{latest.expenses.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Investments</span><span className="font-semibold text-amber-500">₹{latest.investments.toLocaleString()}</span></div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={4} cornerRadius={4}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input type="month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} />
            <Input type="number" placeholder="Total income" value={form.totalIncome} onChange={e => setForm({ ...form, totalIncome: e.target.value })} />
            <Input type="number" placeholder="Savings" value={form.savings} onChange={e => setForm({ ...form, savings: e.target.value })} />
            <Input type="number" placeholder="Expenses" value={form.expenses} onChange={e => setForm({ ...form, expenses: e.target.value })} />
            <Input type="number" placeholder="Investments" value={form.investments} onChange={e => setForm({ ...form, investments: e.target.value })} />
          </div>
          <Button onClick={handleAdd} size="sm">Save</Button>
        </motion.div>
      )}

      <div className="space-y-3">
        {savingsDivisions.map(sd => (
          <div key={sd.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl p-4">
            <div>
              <p className="font-semibold text-sm">{sd.month}</p>
              <p className="text-xs text-muted-foreground">Income ₹{sd.totalIncome.toLocaleString()} → S: ₹{sd.savings.toLocaleString()} · E: ₹{sd.expenses.toLocaleString()} · I: ₹{sd.investments.toLocaleString()}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => removeSavingsDivision(sd.id)}><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
