import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { detectSpendingAnomalies } from '@/lib/finance-utils';

const severityStyles = {
  severe: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-l-destructive/60' },
  moderate: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-l-warning/60' },
  mild: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-l-primary/60' },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.4 } } };

export default function AnomaliesPage() {
  const { transactions } = useFinanceStore();
  const anomalies = detectSpendingAnomalies(transactions);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <span className="text-xs font-medium uppercase tracking-widest text-warning">Anomaly Detection</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Unusual Spending</h1>
        <p className="text-muted-foreground mt-1 text-sm">Transactions that deviate significantly from your usual patterns.</p>
      </div>

      {anomalies.length === 0 ? (
        <div className="stat-card text-center py-12">
          <TrendingUp className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="font-semibold font-display">No Anomalies Detected</p>
          <p className="text-sm text-muted-foreground mt-1">Your spending patterns look consistent. Great job!</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {anomalies.map((a, i) => {
            const style = severityStyles[a.severity];
            return (
              <motion.div
                key={i}
                variants={item}
                className={`rounded-2xl border-l-4 ${style.border} border border-border/50 bg-card/60 backdrop-blur-xl p-5`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold font-display text-sm">{a.transaction.description}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${style.bg} ${style.text}`}>
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {a.transaction.date} · {a.transaction.category}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Category average: ₹{a.categoryAvg.toLocaleString()} · {a.deviation}x above normal
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-bold font-display ${style.text}`}>
                      ₹{a.transaction.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
