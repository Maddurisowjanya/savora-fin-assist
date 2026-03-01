import { motion } from 'framer-motion';
import { CreditCard, AlertCircle } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { detectSubscriptions } from '@/lib/finance-utils';

export default function SubscriptionsPage() {
  const { transactions } = useFinanceStore();
  const subs = detectSubscriptions(transactions);
  const total = subs.reduce((s, sub) => s + sub.amount, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">Auto-detected recurring payments</p>
      </div>

      <div className="stat-card flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Monthly subscription cost</p>
          <p className="text-3xl font-bold font-display text-primary">₹{total.toLocaleString()}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-primary" />
        </div>
      </div>

      {subs.length === 0 ? (
        <div className="stat-card text-center py-12">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No recurring subscriptions detected yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Add more transactions to enable detection.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map((sub, i) => (
            <motion.div
              key={sub.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="stat-card flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <span className="text-lg">🔄</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">{sub.occurrences} occurrences detected</p>
                </div>
              </div>
              <span className="font-bold font-display">₹{sub.amount.toLocaleString()}/mo</span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
