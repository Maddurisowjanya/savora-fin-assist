import { motion } from 'framer-motion';
import { Bell, AlertTriangle, TrendingUp, Calendar, CreditCard, Lightbulb } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { generateAlerts } from '@/lib/finance-utils';

const ALERT_ICONS = [Bell, AlertTriangle, TrendingUp, Calendar, CreditCard, Lightbulb];

export default function AlertsPage() {
  const { transactions } = useFinanceStore();
  const alerts = generateAlerts(transactions);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Smart Alerts</h1>
        <p className="text-muted-foreground mt-1">Contextual, adaptive financial insights</p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const Icon = ALERT_ICONS[i % ALERT_ICONS.length];
          const isPositive = alert.includes('great') || alert.includes('improved');
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isPositive ? 'bg-success/10' : 'bg-warning/10'}`}>
                <Icon className={`w-4 h-4 ${isPositive ? 'text-success' : 'text-warning'}`} />
              </div>
              <p className="text-sm leading-relaxed pt-1.5">{alert}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
