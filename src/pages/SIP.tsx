import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Plus, Trash2 } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function SIP() {
  const { sipInvestments, addSIP, removeSIP } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fundName: '', monthlyAmount: '', startDate: '', totalInvested: '' });

  const handleAdd = () => {
    if (!form.fundName || !form.monthlyAmount) return;
    addSIP({ fundName: form.fundName, monthlyAmount: Number(form.monthlyAmount), startDate: form.startDate, totalInvested: Number(form.totalInvested) || 0 });
    setForm({ fundName: '', monthlyAmount: '', startDate: '', totalInvested: '' });
    setShowForm(false);
  };

  const totalMonthly = sipInvestments.reduce((s, i) => s + i.monthlyAmount, 0);
  const totalInvested = sipInvestments.reduce((s, i) => s + i.totalInvested, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-primary">Investments</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">SIP Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor your systematic investment plans</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm"><Plus className="w-4 h-4 mr-1" />Add SIP</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monthly SIP</p>
          <p className="text-2xl font-bold font-display">₹{totalMonthly.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Invested</p>
          <p className="text-2xl font-bold font-display">₹{totalInvested.toLocaleString()}</p>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Fund name" value={form.fundName} onChange={e => setForm({ ...form, fundName: e.target.value })} />
            <Input type="number" placeholder="Monthly amount" value={form.monthlyAmount} onChange={e => setForm({ ...form, monthlyAmount: e.target.value })} />
            <Input type="date" placeholder="Start date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            <Input type="number" placeholder="Total invested so far" value={form.totalInvested} onChange={e => setForm({ ...form, totalInvested: e.target.value })} />
          </div>
          <Button onClick={handleAdd} size="sm">Save SIP</Button>
        </motion.div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {sipInvestments.map(s => (
          <motion.div key={s.id} variants={item} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl p-4">
            <div>
              <p className="font-semibold text-sm">{s.fundName}</p>
              <p className="text-xs text-muted-foreground">Since {s.startDate} · ₹{s.monthlyAmount.toLocaleString()}/mo</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm">₹{s.totalInvested.toLocaleString()}</span>
              <Button variant="ghost" size="sm" onClick={() => removeSIP(s.id)}><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
