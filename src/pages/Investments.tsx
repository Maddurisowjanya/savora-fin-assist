import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Shield, Zap } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { getInvestmentRecommendations, type RiskProfile } from '@/lib/finance-utils';

const profileConfig: Record<RiskProfile, { label: string; icon: typeof Shield; color: string; gradient: string }> = {
  conservative: { label: 'Conservative', icon: Shield, color: 'text-success', gradient: 'from-emerald-400 to-emerald-600' },
  moderate: { label: 'Moderate', icon: BarChart3, color: 'text-warning', gradient: 'from-amber-400 to-orange-500' },
  aggressive: { label: 'Aggressive', icon: Zap, color: 'text-destructive', gradient: 'from-rose-400 to-rose-600' },
};

const riskColors = { low: 'bg-success/10 text-success', medium: 'bg-warning/10 text-warning', high: 'bg-destructive/10 text-destructive' };

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function InvestmentsPage() {
  const { transactions, sipInvestments, emis, loans } = useFinanceStore();

  const totalSIP = sipInvestments.reduce((s, i) => s + i.monthlyAmount, 0);
  const totalEMI = emis.reduce((s, e) => s + e.emiAmount, 0);
  const loanOutstanding = loans.reduce((s, l) => s + l.remainingBalance, 0);

  const { profile, recommendations, monthlyInvestable } = getInvestmentRecommendations(
    transactions, { totalEMI, totalSIP, loanOutstanding }
  );

  const config = profileConfig[profile];
  const ProfileIcon = config.icon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-xs font-medium uppercase tracking-widest text-primary">Smart Investing</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Investment Recommendations</h1>
        <p className="text-muted-foreground mt-1 text-sm">Personalized suggestions based on your risk profile and financial capacity.</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
            <ProfileIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Risk Profile</p>
            <p className={`text-xl font-bold font-display ${config.color}`}>{config.label} Investor</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="stat-card text-center">
            <p className="text-xs text-muted-foreground">Investable/mo</p>
            <p className="text-lg font-bold font-display text-primary">₹{monthlyInvestable.toLocaleString()}</p>
          </div>
          <div className="stat-card text-center">
            <p className="text-xs text-muted-foreground">Current SIP</p>
            <p className="text-lg font-bold font-display text-success">₹{totalSIP.toLocaleString()}/mo</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {recommendations.map((rec, i) => (
          <motion.div
            key={i}
            variants={item}
            className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold font-display text-sm">{rec.type}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${riskColors[rec.risk]}`}>
                    {rec.risk} risk
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>
                <p className="text-xs text-muted-foreground mt-2">Expected returns: <span className="font-semibold text-foreground">{rec.expectedReturn}</span></p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold font-display text-primary">{rec.allocation}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">₹{Math.round(monthlyInvestable * rec.allocation / 100).toLocaleString()}/mo</p>
              </div>
            </div>

            {/* Allocation bar */}
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${rec.allocation}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
