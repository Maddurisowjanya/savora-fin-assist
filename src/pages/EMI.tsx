import { useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, Plus, Trash2 } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function EMIPage() {
  const { emis, addEMI, removeEMI } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ loanName: '', emiAmount: '', interestRate: '', dueDate: '', remainingBalance: '', totalAmount: '' });

  const handleAdd = () => {
    if (!form.loanName || !form.emiAmount) return;
    addEMI({
      loanName: form.loanName,
      emiAmount: Number(form.emiAmount),
      interestRate: Number(form.interestRate),
      dueDate: form.dueDate,
      remainingBalance: Number(form.remainingBalance),
      totalAmount: Number(form.totalAmount),
    });
    setForm({ loanName: '', emiAmount: '', interestRate: '', dueDate: '', remainingBalance: '', totalAmount: '' });
    setShowForm(false);
  };

  const totalMonthlyEMI = emis.reduce((s, e) => s + e.emiAmount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Banknote className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-primary">EMIs</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Bank EMIs</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your EMI payments and balances</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm"><Plus className="w-4 h-4 mr-1" />Add EMI</Button>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Monthly EMI</p>
        <p className="text-2xl font-bold font-display">₹{totalMonthlyEMI.toLocaleString()}</p>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Loan name" value={form.loanName} onChange={e => setForm({ ...form, loanName: e.target.value })} />
            <Input type="number" placeholder="EMI amount" value={form.emiAmount} onChange={e => setForm({ ...form, emiAmount: e.target.value })} />
            <Input type="number" placeholder="Interest rate %" value={form.interestRate} onChange={e => setForm({ ...form, interestRate: e.target.value })} />
            <Input type="date" placeholder="Due date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            <Input type="number" placeholder="Remaining balance" value={form.remainingBalance} onChange={e => setForm({ ...form, remainingBalance: e.target.value })} />
            <Input type="number" placeholder="Total loan amount" value={form.totalAmount} onChange={e => setForm({ ...form, totalAmount: e.target.value })} />
          </div>
          <Button onClick={handleAdd} size="sm">Save EMI</Button>
        </motion.div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {emis.map(e => (
          <motion.div key={e.id} variants={item} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl p-4">
            <div>
              <p className="font-semibold text-sm">{e.loanName}</p>
              <p className="text-xs text-muted-foreground">Rate {e.interestRate}% · Due {e.dueDate} · Remaining ₹{e.remainingBalance.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm">₹{e.emiAmount.toLocaleString()}/mo</span>
              <Button variant="ghost" size="sm" onClick={() => removeEMI(e.id)}><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
