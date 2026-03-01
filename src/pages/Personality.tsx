import { motion } from 'framer-motion';
import { useFinanceStore } from '@/lib/store';
import { classifySpendingPersonality } from '@/lib/finance-utils';

const PERSONALITY_GRADIENTS: Record<string, string> = {
  'Conservative Saver': 'from-emerald-400 to-teal-600',
  'Balanced Planner': 'from-blue-400 to-indigo-600',
  'Lifestyle Spender': 'from-violet-400 to-purple-600',
  'Impulsive Buyer': 'from-orange-400 to-rose-600',
};

export default function PersonalityPage() {
  const { transactions } = useFinanceStore();
  const personality = classifySpendingPersonality(transactions);
  const gradient = PERSONALITY_GRADIENTS[personality.type] || 'from-primary to-secondary';

  const scoreItems = [
    { label: 'Savings Rate', value: personality.scores.savingsRate, suffix: '%' },
    { label: 'Expense Ratio', value: personality.scores.expenseRatio, suffix: '%' },
    { label: 'Volatility', value: personality.scores.volatility, suffix: '%' },
    { label: 'Category Spread', value: personality.scores.categorySpread, suffix: '%' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Spending Personality</h1>
        <p className="text-muted-foreground mt-1">AI-powered classification of your financial behavior</p>
      </div>

      {/* Personality card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="relative rounded-2xl overflow-hidden"
      >
        <div className={`bg-gradient-to-br ${gradient} p-8 md:p-10`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsla(0,0%,100%,0.15),transparent_60%)]" />
          <div className="relative z-10">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
              className="text-5xl md:text-6xl block mb-4"
            >
              {personality.emoji}
            </motion.span>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-white">{personality.type}</h2>
            <p className="text-white/80 mt-2 text-sm md:text-base max-w-lg leading-relaxed">{personality.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Scores */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {scoreItems.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-4 text-center"
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{s.label}</p>
            <p className="text-2xl font-bold font-display">{s.value}{s.suffix}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Suggestion */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-primary/20 bg-primary/5 p-6"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">💡 Personalized Recommendation</p>
        <p className="text-sm text-foreground leading-relaxed">{personality.suggestion}</p>
      </motion.div>
    </motion.div>
  );
}
