import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFinanceStore, Transaction } from '@/lib/store';
import { CATEGORIES, autoDetectCategory, CATEGORY_ICONS } from '@/lib/categories';
import { toast } from 'sonner';

function TransactionForm({ initial, onSubmit, onClose }: {
  initial?: Transaction;
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState(initial?.description || '');
  const [amount, setAmount] = useState(initial?.amount?.toString() || '');
  const [type, setType] = useState<'income' | 'expense'>(initial?.type || 'expense');
  const [category, setCategory] = useState(initial?.category || '');

  const handleDescChange = (val: string) => {
    setDescription(val);
    if (!initial && val.length > 2) {
      const detected = autoDetectCategory(val);
      if (detected !== 'Other') setCategory(detected);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    onSubmit({ date, description, amount: parseFloat(amount), type, category: category || 'Other' });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Date</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Type</Label>
          <Select value={type} onValueChange={(v: 'income' | 'expense') => setType(v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Input value={description} onChange={e => handleDescChange(e.target.value)} placeholder="e.g. Swiggy order" className="mt-1" />
      </div>
      <div>
        <Label>Amount (₹)</Label>
        <Input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="mt-1" />
      </div>
      <div>
        <Label>Category {category && !initial ? <span className="text-primary text-xs ml-1">(auto-detected)</span> : null}</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_ICONS[c]} {c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">{initial ? 'Update' : 'Add Transaction'}</Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}

export default function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = transactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Transactions</h1>
          <p className="text-muted-foreground mt-1">Manage your income and expenses</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Add Transaction</DialogTitle></DialogHeader>
            <TransactionForm
              onSubmit={(data) => { addTransaction(data); toast.success('Transaction added!'); }}
              onClose={() => setAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {['all', 'income', 'expense'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterType === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="stat-card flex items-center gap-4"
            >
              <span className="text-xl">{CATEGORY_ICONS[t.category] || '📦'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{t.description}</p>
                <p className="text-xs text-muted-foreground">{t.category} · {new Date(t.date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</p>
              </div>
              <span className={`font-bold font-display text-sm ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
              </span>
              <div className="flex gap-1">
                <Dialog open={editId === t.id} onOpenChange={(o) => setEditId(o ? t.id : null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle className="font-display">Edit Transaction</DialogTitle></DialogHeader>
                    <TransactionForm
                      initial={t}
                      onSubmit={(data) => { updateTransaction(t.id, data); toast.success('Updated!'); }}
                      onClose={() => setEditId(null)}
                    />
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { deleteTransaction(t.id); toast.success('Deleted!'); }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No transactions found</p>
        )}
      </div>
    </div>
  );
}
