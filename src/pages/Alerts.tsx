import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { generateAlerts } from '@/lib/finance-utils';

export default function AlertsPage() {
  const { transactions } = useFinanceStore();
  const alerts = generateAlerts(transactions);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Smart Alerts</h1>
        <p className="text-muted-foreground mt-1">Intelligent insights about your spending</p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bell className="w-4 h-4 text-warning" />
            </div>
            <p className="text-sm leading-relaxed">{alert}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
