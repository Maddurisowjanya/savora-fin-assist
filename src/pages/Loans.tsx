import { useState } from 'react';
import { motion } from 'framer-motion';
import { Landmark, Plus, Trash2 } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function LoansPage() {
  const { loans, addLoan, removeLoan } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', principalAmount: '', interestRate: '', startDate: '', endDate: '', monthlyPayment: '', remainingBalance: '' });

  const handleAdd = () => {
    if (!form.name || !form.principalAmount) return;
    addLoan({
      name: form.name,
      principalAmount: Number(form.principalAmount),
      interestRate: Number(form.interestRate),
      startDate: form.startDate,
      endDate: form.endDate,
      monthlyPayment: Number(form.monthlyPayment),
      remainingBalance: Number(form.remainingBalance),
    });
    setForm({ name: '', principalAmount: '', interestRate: '', startDate: '', endDate: '', monthlyPayment: '', remainingBalance: '' });
    setShowForm(false);
  };

  const totalRemaining = loans.reduce((s, l) => s + l.remainingBalance, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-primary">Loans</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Loan Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Track loans and repayment schedules</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm"><Plus className="w-4 h-4 mr-1" />Add Loan</Button>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Outstanding</p>
        <p className="text-2xl font-bold font-display">₹{totalRemaining.toLocaleString()}</p>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Loan name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input type="number" placeholder="Principal amount" value={form.principalAmount} onChange={e => setForm({ ...form, principalAmount: e.target.value })} />
            <Input type="number" placeholder="Interest rate %" value={form.interestRate} onChange={e => setForm({ ...form, interestRate: e.target.value })} />
            <Input type="number" placeholder="Monthly payment" value={form.monthlyPayment} onChange={e => setForm({ ...form, monthlyPayment: e.target.value })} />
            <Input type="date" placeholder="Start date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            <Input type="date" placeholder="End date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            <Input type="number" placeholder="Remaining balance" value={form.remainingBalance} onChange={e => setForm({ ...form, remainingBalance: e.target.value })} />
          </div>
          <Button onClick={handleAdd} size="sm">Save Loan</Button>
        </motion.div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {loans.map(l => (
          <motion.div key={l.id} variants={item} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl p-4">
            <div>
              <p className="font-semibold text-sm">{l.name}</p>
              <p className="text-xs text-muted-foreground">₹{l.principalAmount.toLocaleString()} @ {l.interestRate}% · {l.startDate} → {l.endDate}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-bold text-sm">₹{l.monthlyPayment.toLocaleString()}/mo</p>
                <p className="text-xs text-muted-foreground">₹{l.remainingBalance.toLocaleString()} left</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeLoan(l.id)}><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
