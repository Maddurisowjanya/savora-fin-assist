import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { calculateRiskScore } from '@/lib/finance-utils';

export default function RiskPage() {
  const { transactions } = useFinanceStore();
  const { score, level, reasons } = calculateRiskScore(transactions);

  const color = score <= 30 ? 'text-success' : score <= 60 ? 'text-warning' : 'text-destructive';
  const bgColor = score <= 30 ? 'hsl(152, 60%, 45%)' : score <= 60 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 72%, 51%)';
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Financial Risk Score</h1>
        <p className="text-muted-foreground mt-1">AI-calculated assessment of your financial health</p>
      </div>

      <div className="stat-card flex flex-col items-center py-10">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(240, 10%, 90%)" strokeWidth="10" />
            <motion.circle
              cx="80" cy="80" r="70" fill="none"
              stroke={bgColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold font-display ${color}`}>{score}</span>
            <span className="text-sm text-muted-foreground">{level}</span>
          </div>
        </div>

        <div className="mt-8 w-full space-y-3">
          <h3 className="font-semibold font-display flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Score Breakdown
          </h3>
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="mt-0.5">•</span>
              <span>{reason}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Safe', range: '0-30', color: 'text-success', desc: 'Healthy finances' },
          { label: 'Moderate', range: '31-60', color: 'text-warning', desc: 'Room to improve' },
          { label: 'High Risk', range: '61-100', color: 'text-destructive', desc: 'Take action' },
        ].map(tier => (
          <div key={tier.label} className={`stat-card text-center ${level === tier.label ? 'ring-2 ring-primary' : ''}`}>
            <p className={`text-lg font-bold font-display ${tier.color}`}>{tier.range}</p>
            <p className="text-xs font-medium mt-1">{tier.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{tier.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
