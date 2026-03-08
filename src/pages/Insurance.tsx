import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useFinanceStore, InsurancePolicy } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const statusIcons = {
  paid: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  pending: <Clock className="w-4 h-4 text-amber-500" />,
  overdue: <AlertTriangle className="w-4 h-4 text-destructive" />,
};

export default function Insurance() {
  const { insurancePolicies, addInsurance, updateInsurance, removeInsurance } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', provider: '', premiumAmount: '', frequency: 'monthly' as InsurancePolicy['frequency'], dueDate: '' });

  const handleAdd = () => {
    if (!form.name || !form.premiumAmount || !form.dueDate) return;
    addInsurance({ ...form, premiumAmount: Number(form.premiumAmount), status: 'pending' });
    setForm({ name: '', provider: '', premiumAmount: '', frequency: 'monthly', dueDate: '' });
    setShowForm(false);
  };

  const totalPending = insurancePolicies.filter(p => p.status !== 'paid').reduce((s, p) => s + p.premiumAmount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-primary">Insurance</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Insurance Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your insurance policies and premiums</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm"><Plus className="w-4 h-4 mr-1" />Add Policy</Button>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Upcoming Premiums Due</p>
        <p className="text-2xl font-bold font-display">₹{totalPending.toLocaleString()}</p>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Policy name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Provider" value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} />
            <Input type="number" placeholder="Premium amount" value={form.premiumAmount} onChange={e => setForm({ ...form, premiumAmount: e.target.value })} />
            <Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <Button onClick={handleAdd} size="sm">Save Policy</Button>
        </motion.div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {insurancePolicies.map(p => (
          <motion.div key={p.id} variants={item} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl p-4">
            <div className="flex items-center gap-3">
              {statusIcons[p.status]}
              <div>
                <p className="font-semibold text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.provider} · {p.frequency} · Due {p.dueDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm">₹{p.premiumAmount.toLocaleString()}</span>
              {p.status !== 'paid' && (
                <Button variant="ghost" size="sm" onClick={() => updateInsurance(p.id, { status: 'paid' })}>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => removeInsurance(p.id)}>
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
