import { motion } from 'framer-motion';
import { CreditCard, AlertCircle, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { detectSubscriptions } from '@/lib/finance-utils';

const CANCEL_RISK_CONFIG = {
  high: { color: 'text-destructive', bg: 'bg-destructive/10', label: 'High spend — review', icon: AlertTriangle },
  medium: { color: 'text-warning', bg: 'bg-warning/10', label: 'Moderate', icon: TrendingDown },
  low: { color: 'text-success', bg: 'bg-success/10', label: 'Good value', icon: CheckCircle },
};

export default function SubscriptionsPage() {
  const { transactions } = useFinanceStore();
  const subs = detectSubscriptions(transactions);
  const total = subs.reduce((s, sub) => s + sub.amount, 0);
  const annual = subs.reduce((s, sub) => s + sub.annualCost, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">Auto-detected recurring payments with cancel-risk analysis</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Monthly Cost</p>
          <p className="text-2xl font-bold font-display text-primary">₹{total.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Annual Cost</p>
          <p className="text-2xl font-bold font-display">₹{annual.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Active Services</p>
          <p className="text-2xl font-bold font-display">{subs.length}</p>
        </div>
      </div>

      {subs.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-12 text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No recurring subscriptions detected yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Add more transactions to enable detection.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map((sub, i) => {
            const risk = CANCEL_RISK_CONFIG[sub.cancelRisk];
            const RiskIcon = risk.icon;
            return (
              <motion.div
                key={sub.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-5 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{sub.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{sub.occurrences} charges detected</p>
                      {sub.isMonthly && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">Monthly</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${risk.bg} ${risk.color}`}>
                    <RiskIcon className="w-3 h-3" />
                    {risk.label}
                  </div>
                  <div>
                    <span className="font-bold font-display">₹{sub.amount.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
