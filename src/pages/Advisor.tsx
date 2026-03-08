import { motion } from 'framer-motion';
import { Brain, ArrowRight, AlertTriangle, TrendingUp, Shield, Banknote, CreditCard, Lightbulb } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { generateFinancialAdvice, type FinancialAdvice } from '@/lib/finance-utils';

const categoryIcons: Record<string, typeof Brain> = {
  savings: Banknote,
  spending: CreditCard,
  investment: TrendingUp,
  debt: AlertTriangle,
  insurance: Shield,
  general: Lightbulb,
};

const priorityStyles: Record<string, string> = {
  high: 'border-l-destructive/60 bg-destructive/5',
  medium: 'border-l-warning/60 bg-warning/5',
  low: 'border-l-success/60 bg-success/5',
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AdvisorPage() {
  const { transactions, insurancePolicies, sipInvestments, emis, loans } = useFinanceStore();

  const insuranceDue = insurancePolicies.filter(p => p.status !== 'paid').reduce((s, p) => s + p.premiumAmount, 0);
  const totalSIP = sipInvestments.reduce((s, i) => s + i.monthlyAmount, 0);
  const totalEMI = emis.reduce((s, e) => s + e.emiAmount, 0);
  const loanOutstanding = loans.reduce((s, l) => s + l.remainingBalance, 0);

  const advice = generateFinancialAdvice(transactions, { totalEMI, totalSIP, insuranceDue, loanOutstanding });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-5 h-5 text-primary" />
          <span className="text-xs font-medium uppercase tracking-widest text-primary">AI Advisor</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Financial Advice</h1>
        <p className="text-muted-foreground mt-1 text-sm">Personalized suggestions based on your income, expenses, and commitments.</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {advice.map((a, i) => {
          const Icon = categoryIcons[a.category] || Lightbulb;
          return (
            <motion.div
              key={i}
              variants={item}
              className={`rounded-2xl border-l-4 border border-border/50 bg-card/60 backdrop-blur-xl p-5 ${priorityStyles[a.priority]}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{a.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold font-display text-sm">{a.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                      a.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                      a.priority === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-success/10 text-success'
                    }`}>{a.priority}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
