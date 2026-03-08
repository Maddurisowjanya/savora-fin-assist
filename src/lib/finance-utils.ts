import { Transaction, FinancialGoal } from './store';

export function getFinancialSummary(transactions: Transaction[]) {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = totalIncome - totalExpenses;
  const ratio = totalIncome > 0 ? totalExpenses / totalIncome : 0;
  return { totalIncome, totalExpenses, savings, ratio };
}

export function getMonthlySummary(transactions: Transaction[]) {
  const months: Record<string, { income: number; expenses: number }> = {};
  transactions.forEach(t => {
    const month = t.date.slice(0, 7);
    if (!months[month]) months[month] = { income: 0, expenses: 0 };
    if (t.type === 'income') months[month].income += t.amount;
    else months[month].expenses += t.amount;
  });
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      label: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      ...data,
      savings: data.income - data.expenses,
    }));
}

export function getCategoryBreakdown(transactions: Transaction[]) {
  const categories: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });
  return Object.entries(categories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function calculateRiskScore(transactions: Transaction[]): { score: number; level: string; reasons: string[] } {
  const monthly = getMonthlySummary(transactions);
  const reasons: string[] = [];
  let score = 0;

  const { ratio } = getFinancialSummary(transactions);
  if (ratio > 0.9) { score += 35; reasons.push('Spending exceeds 90% of income'); }
  else if (ratio > 0.7) { score += 20; reasons.push('Spending is above 70% of income'); }
  else if (ratio > 0.5) { score += 10; reasons.push('Moderate spending ratio'); }

  const savingsAmounts = monthly.map(m => m.savings);
  const negativeSavings = savingsAmounts.filter(s => s < 0).length;
  if (negativeSavings > 0) { score += 25; reasons.push(`${negativeSavings} month(s) with negative savings`); }

  if (monthly.length >= 2) {
    const expenses = monthly.map(m => m.expenses);
    const avg = expenses.reduce((a, b) => a + b, 0) / expenses.length;
    const variance = expenses.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / expenses.length;
    const cv = avg > 0 ? Math.sqrt(variance) / avg : 0;
    if (cv > 0.5) { score += 20; reasons.push('High expense volatility'); }
    else if (cv > 0.25) { score += 10; reasons.push('Moderate expense fluctuations'); }
  }

  score = Math.min(100, score);
  const level = score <= 30 ? 'Safe' : score <= 60 ? 'Moderate' : 'High Risk';
  if (reasons.length === 0) reasons.push('Your finances look healthy!');
  return { score, level, reasons };
}

export function detectSubscriptions(transactions: Transaction[]) {
  const recurring: Record<string, { amount: number; count: number; dates: string[]; description: string }> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const key = `${t.description.toLowerCase()}_${t.amount}`;
    if (!recurring[key]) recurring[key] = { amount: t.amount, count: 0, dates: [], description: t.description };
    recurring[key].count++;
    recurring[key].dates.push(t.date);
  });

  return Object.entries(recurring)
    .filter(([, v]) => v.count >= 2)
    .map(([, v]) => {
      // check interval is roughly monthly (28-32 days)
      const sorted = v.dates.sort();
      let isMonthly = false;
      if (sorted.length >= 2) {
        const d1 = new Date(sorted[0]).getTime();
        const d2 = new Date(sorted[1]).getTime();
        const daysDiff = (d2 - d1) / (1000 * 60 * 60 * 24);
        isMonthly = daysDiff >= 20 && daysDiff <= 40;
      }
      const annualCost = v.amount * 12;
      const cancelRisk = annualCost > 5000 ? 'high' : annualCost > 2000 ? 'medium' : 'low';
      return {
        name: v.description,
        amount: v.amount,
        occurrences: v.count,
        isMonthly,
        annualCost,
        cancelRisk: cancelRisk as 'high' | 'medium' | 'low',
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function predictSavings(transactions: Transaction[]) {
  const monthly = getMonthlySummary(transactions);
  if (monthly.length < 2) return { predictions: [], confidence: 0 };

  const savings = monthly.map(m => m.savings);
  const avg = savings.reduce((a, b) => a + b, 0) / savings.length;
  const trend = savings.length >= 2 ? (savings[savings.length - 1] - savings[0]) / (savings.length - 1) : 0;

  const predictions = [1, 2, 3].map(i => ({
    month: `Month +${i}`,
    predicted: Math.round(avg + trend * i),
  }));

  const variance = savings.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / savings.length;
  const confidence = Math.max(20, Math.min(95, 80 - Math.sqrt(variance) / avg * 50));

  return { predictions, confidence: Math.round(confidence) };
}

/* ── Spending Personality ── */
export type PersonalityType = 'Conservative Saver' | 'Balanced Planner' | 'Lifestyle Spender' | 'Impulsive Buyer';

export interface SpendingPersonality {
  type: PersonalityType;
  emoji: string;
  description: string;
  suggestion: string;
  scores: { savingsRate: number; expenseRatio: number; volatility: number; categorySpread: number };
}

export function classifySpendingPersonality(transactions: Transaction[]): SpendingPersonality {
  const { ratio, savings, totalIncome } = getFinancialSummary(transactions);
  const monthly = getMonthlySummary(transactions);
  const categories = getCategoryBreakdown(transactions);

  const savingsRate = totalIncome > 0 ? savings / totalIncome : 0;
  const expenseRatio = ratio;

  // volatility
  let volatility = 0;
  if (monthly.length >= 2) {
    const expenses = monthly.map(m => m.expenses);
    const avg = expenses.reduce((a, b) => a + b, 0) / expenses.length;
    const variance = expenses.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / expenses.length;
    volatility = avg > 0 ? Math.sqrt(variance) / avg : 0;
  }

  // category spread (how concentrated spending is)
  const totalExpense = categories.reduce((s, c) => s + c.value, 0);
  const topCategory = categories[0]?.value || 0;
  const categorySpread = totalExpense > 0 ? 1 - (topCategory / totalExpense) : 0;

  const scores = {
    savingsRate: Math.round(savingsRate * 100),
    expenseRatio: Math.round(expenseRatio * 100),
    volatility: Math.round(volatility * 100),
    categorySpread: Math.round(categorySpread * 100),
  };

  if (savingsRate > 0.4 && volatility < 0.3) {
    return {
      type: 'Conservative Saver',
      emoji: '🛡️',
      description: 'You prioritize saving and maintain consistent spending patterns. Your financial habits are disciplined and risk-averse.',
      suggestion: 'Consider investing a portion of surplus savings for better returns.',
      scores,
    };
  }
  if (savingsRate > 0.15 && expenseRatio < 0.75) {
    return {
      type: 'Balanced Planner',
      emoji: '⚖️',
      description: 'You maintain a healthy balance between spending and saving. Your financial approach is measured and sustainable.',
      suggestion: 'Build an emergency fund of 6 months expenses if you haven\'t already.',
      scores,
    };
  }
  if (volatility > 0.4 || (categorySpread > 0.6 && expenseRatio > 0.7)) {
    return {
      type: 'Impulsive Buyer',
      emoji: '⚡',
      description: 'Your spending is unpredictable with high volatility across categories. You tend to make spontaneous purchases.',
      suggestion: 'Set a 24-hour rule before non-essential purchases above ₹2,000.',
      scores,
    };
  }
  return {
    type: 'Lifestyle Spender',
    emoji: '✨',
    description: 'You enjoy spending on experiences and lifestyle. While you earn well, a larger share goes to discretionary categories.',
    suggestion: 'Automate 20% of income to savings before spending on lifestyle.',
    scores,
  };
}

/* ── Goal Planning ── */
export function analyzeGoal(goal: FinancialGoal, transactions: Transaction[]) {
  const { predictions } = predictSavings(transactions);
  const monthly = getMonthlySummary(transactions);
  const avgMonthlySavings = monthly.length > 0
    ? monthly.reduce((s, m) => s + m.savings, 0) / monthly.length
    : 0;

  const today = new Date();
  const target = new Date(goal.targetDate);
  const monthsLeft = Math.max(1, Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  const requiredMonthlySavings = goal.targetAmount / monthsLeft;
  const projectedSavings = avgMonthlySavings * monthsLeft;
  const isAchievable = projectedSavings >= goal.targetAmount;
  const progress = Math.min(100, Math.round((projectedSavings / goal.targetAmount) * 100));
  const gap = goal.targetAmount - projectedSavings;

  // Suggest category cuts if not achievable
  const suggestions: string[] = [];
  if (!isAchievable) {
    const categories = getCategoryBreakdown(transactions);
    const discretionary = categories.filter(c =>
      ['Entertainment', 'Shopping', 'Food & Dining', 'Subscriptions'].includes(c.name)
    );
    const monthCount = monthly.length || 1;
    discretionary.slice(0, 2).forEach(c => {
      const monthlyCat = c.value / monthCount;
      const reduction = Math.min(monthlyCat * 0.3, gap / monthsLeft / 2);
      if (reduction > 100) {
        suggestions.push(`Reduce ${c.name} by ₹${Math.round(reduction).toLocaleString()}/mo`);
      }
    });
  }

  return {
    monthsLeft,
    requiredMonthlySavings: Math.round(requiredMonthlySavings),
    avgMonthlySavings: Math.round(avgMonthlySavings),
    projectedSavings: Math.round(projectedSavings),
    isAchievable,
    progress,
    gap: Math.round(gap),
    suggestions,
    projectionData: Array.from({ length: Math.min(monthsLeft, 12) }, (_, i) => ({
      month: `M+${i + 1}`,
      projected: Math.round(avgMonthlySavings * (i + 1)),
      required: Math.round(requiredMonthlySavings * (i + 1)),
      target: goal.targetAmount,
    })),
  };
}

/* ── Enhanced Smart Alerts ── */
export function generateAlerts(transactions: Transaction[]): string[] {
  const alerts: string[] = [];
  const monthly = getMonthlySummary(transactions);

  if (monthly.length >= 2) {
    const current = monthly[monthly.length - 1];
    const previous = monthly[monthly.length - 2];

    // Adaptive: only alert on percentage if previous month was substantial
    if (previous.expenses > 5000 && current.expenses > previous.expenses * 1.2) {
      const pct = Math.round((current.expenses / previous.expenses - 1) * 100);
      alerts.push(`Spending increased by ${pct}% compared to last month.`);
    }
    if (current.savings < previous.savings * 0.5 && previous.savings > 0) {
      alerts.push('Your savings dropped significantly this month.');
    }
  }

  // Weekend overspending detection
  const weekendExpenses = transactions.filter(t => {
    if (t.type !== 'expense') return false;
    const day = new Date(t.date).getDay();
    return day === 0 || day === 6;
  });
  const weekdayExpenses = transactions.filter(t => {
    if (t.type !== 'expense') return false;
    const day = new Date(t.date).getDay();
    return day >= 1 && day <= 5;
  });
  if (weekendExpenses.length > 0 && weekdayExpenses.length > 0) {
    const weekendAvg = weekendExpenses.reduce((s, t) => s + t.amount, 0) / weekendExpenses.length;
    const weekdayAvg = weekdayExpenses.reduce((s, t) => s + t.amount, 0) / weekdayExpenses.length;
    if (weekendAvg > weekdayAvg * 1.5) {
      alerts.push(`Weekend spending is ${Math.round((weekendAvg / weekdayAvg - 1) * 100)}% higher than weekdays.`);
    }
  }

  // Category spike detection
  if (monthly.length >= 2) {
    const currentMonth = monthly[monthly.length - 1].month;
    const prevMonth = monthly[monthly.length - 2].month;
    const categoryByMonth = (m: string) => {
      const cats: Record<string, number> = {};
      transactions.filter(t => t.date.startsWith(m) && t.type === 'expense').forEach(t => {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
      });
      return cats;
    };
    const curr = categoryByMonth(currentMonth);
    const prev = categoryByMonth(prevMonth);
    for (const [cat, amount] of Object.entries(curr)) {
      const prevAmount = prev[cat] || 0;
      if (prevAmount > 500 && amount > prevAmount * 1.4) {
        alerts.push(`${cat} spending spiked by ${Math.round((amount / prevAmount - 1) * 100)}% this month.`);
        break; // only one category alert
      }
    }
  }

  // Subscription load
  const subs = detectSubscriptions(transactions);
  const subTotal = subs.reduce((s, sub) => s + sub.amount, 0);
  if (subTotal > 2000) alerts.push(`Subscription load: ₹${subTotal.toLocaleString()}/mo across ${subs.length} services.`);

  const { ratio } = getFinancialSummary(transactions);
  if (ratio > 0.85) alerts.push('Spending exceeds 85% of income — consider reviewing discretionary expenses.');

  if (alerts.length === 0) alerts.push('Your finances are looking great! Keep it up! 🎉');
  return alerts;
}

/* ── AI Insight of the Month ── */
export function generateMonthlyInsight(transactions: Transaction[]): string {
  const categories = getCategoryBreakdown(transactions);
  const monthly = getMonthlySummary(transactions);
  const { savingsRate } = (() => {
    const { savings, totalIncome } = getFinancialSummary(transactions);
    return { savingsRate: totalIncome > 0 ? savings / totalIncome : 0 };
  })();

  const expenses = transactions.filter(t => t.type === 'expense');

  if (monthly.length >= 2 && categories.length >= 2) {
    const stableCategories = categories.filter(c => {
      const amounts = monthly.map(m => {
        return transactions
          .filter(t => t.date.startsWith(m.month) && t.category === c.name && t.type === 'expense')
          .reduce((s, t) => s + t.amount, 0);
      }).filter(a => a > 0);
      if (amounts.length < 2) return false;
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const cv = avg > 0 ? Math.sqrt(amounts.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / amounts.length) / avg : 0;
      return cv < 0.2;
    });
    const volatileCategories = categories.filter(c => {
      const amounts = monthly.map(m => {
        return transactions
          .filter(t => t.date.startsWith(m.month) && t.category === c.name && t.type === 'expense')
          .reduce((s, t) => s + t.amount, 0);
      }).filter(a => a > 0);
      if (amounts.length < 2) return false;
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const cv = avg > 0 ? Math.sqrt(amounts.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / amounts.length) / avg : 0;
      return cv > 0.5;
    });

    if (stableCategories.length > 0 && volatileCategories.length > 0) {
      return `${stableCategories[0].name} spending is stable, but ${volatileCategories[0].name} is volatile — consider setting a monthly cap.`;
    }
  }

  if (monthly.length >= 3) {
    const recentSavings = monthly.slice(-3).map(m => m.savings);
    const improving = recentSavings[2] > recentSavings[1] && recentSavings[1] > recentSavings[0];
    if (improving) return 'Your savings consistency has improved over the last quarter — great momentum!';
    const declining = recentSavings[2] < recentSavings[1] && recentSavings[1] < recentSavings[0];
    if (declining) return 'Savings have been declining for 3 months. Review your top spending categories.';
  }

  if (categories.length > 0) {
    const top = categories[0];
    const totalExp = categories.reduce((s, c) => s + c.value, 0);
    const pct = Math.round((top.value / totalExp) * 100);
    if (pct > 40) {
      return `${top.name} accounts for ${pct}% of all spending — it's your biggest financial lever.`;
    }
  }

  if (savingsRate > 0.3) return 'You\'re saving over 30% of your income — you\'re ahead of most financial benchmarks.';

  return 'Consistent tracking is the first step to financial freedom. Keep logging your transactions!';
}

/* ── Spending Anomaly Detection ── */
export interface SpendingAnomaly {
  transaction: Transaction;
  categoryAvg: number;
  deviation: number; // how many standard deviations above
  severity: 'mild' | 'moderate' | 'severe';
}

export function detectSpendingAnomalies(transactions: Transaction[]): SpendingAnomaly[] {
  const expenses = transactions.filter(t => t.type === 'expense');
  const categoryStats: Record<string, { amounts: number[] }> = {};

  expenses.forEach(t => {
    if (!categoryStats[t.category]) categoryStats[t.category] = { amounts: [] };
    categoryStats[t.category].amounts.push(t.amount);
  });

  const anomalies: SpendingAnomaly[] = [];

  expenses.forEach(t => {
    const stats = categoryStats[t.category];
    if (!stats || stats.amounts.length < 3) return;
    const avg = stats.amounts.reduce((a, b) => a + b, 0) / stats.amounts.length;
    const stdDev = Math.sqrt(stats.amounts.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / stats.amounts.length);
    if (stdDev === 0) return;
    const zScore = (t.amount - avg) / stdDev;
    if (zScore > 1.5) {
      anomalies.push({
        transaction: t,
        categoryAvg: Math.round(avg),
        deviation: Math.round(zScore * 10) / 10,
        severity: zScore > 3 ? 'severe' : zScore > 2 ? 'moderate' : 'mild',
      });
    }
  });

  return anomalies.sort((a, b) => b.deviation - a.deviation).slice(0, 10);
}

/* ── AI Financial Advisor ── */
export interface FinancialAdvice {
  category: 'savings' | 'spending' | 'investment' | 'debt' | 'insurance' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  icon: string;
}

export function generateFinancialAdvice(
  transactions: Transaction[],
  commitments: {
    totalEMI: number;
    totalSIP: number;
    insuranceDue: number;
    loanOutstanding: number;
  }
): FinancialAdvice[] {
  const advice: FinancialAdvice[] = [];
  const { totalIncome, totalExpenses, savings, ratio } = getFinancialSummary(transactions);
  const monthly = getMonthlySummary(transactions);
  const categories = getCategoryBreakdown(transactions);
  const savingsRate = totalIncome > 0 ? savings / totalIncome : 0;
  const totalCommitments = commitments.totalEMI + commitments.totalSIP;
  const commitmentRatio = totalIncome > 0 ? totalCommitments / (totalIncome / (monthly.length || 1)) : 0;

  // Savings advice
  if (savingsRate < 0.1) {
    advice.push({
      category: 'savings', priority: 'high', icon: '🚨',
      title: 'Critical: Savings Below 10%',
      description: `You're only saving ${Math.round(savingsRate * 100)}% of income. Aim for at least 20%. Consider automating ₹${Math.round(totalIncome * 0.1 / (monthly.length || 1)).toLocaleString()}/mo to a savings account.`,
    });
  } else if (savingsRate < 0.2) {
    advice.push({
      category: 'savings', priority: 'medium', icon: '💡',
      title: 'Boost Your Savings Rate',
      description: `At ${Math.round(savingsRate * 100)}%, you're below the recommended 20%. Reducing discretionary spending by ₹${Math.round((totalExpenses * 0.1) / (monthly.length || 1)).toLocaleString()}/mo could help.`,
    });
  } else if (savingsRate > 0.35) {
    advice.push({
      category: 'savings', priority: 'low', icon: '🌟',
      title: 'Excellent Savings Habit',
      description: `You're saving ${Math.round(savingsRate * 100)}% — well above benchmarks. Consider channeling excess into investments for better returns.`,
    });
  }

  // Spending reduction advice
  const discretionary = categories.filter(c =>
    ['Entertainment', 'Shopping', 'Food & Dining', 'Subscriptions'].includes(c.name)
  );
  const discretionaryTotal = discretionary.reduce((s, c) => s + c.value, 0);
  const discretionaryRatio = totalExpenses > 0 ? discretionaryTotal / totalExpenses : 0;
  if (discretionaryRatio > 0.4) {
    const topDisc = discretionary[0];
    advice.push({
      category: 'spending', priority: 'high', icon: '✂️',
      title: `Cut Back on ${topDisc?.name || 'Discretionary Spending'}`,
      description: `${Math.round(discretionaryRatio * 100)}% of expenses go to discretionary categories. Reducing ${topDisc?.name} by 20% saves ₹${Math.round((topDisc?.value || 0) * 0.2 / (monthly.length || 1)).toLocaleString()}/mo.`,
    });
  }

  // Subscription optimization
  const subs = detectSubscriptions(transactions);
  const subTotal = subs.reduce((s, sub) => s + sub.amount, 0);
  if (subTotal > 1500) {
    advice.push({
      category: 'spending', priority: 'medium', icon: '🔄',
      title: 'Review Subscriptions',
      description: `You spend ₹${subTotal.toLocaleString()}/mo on ${subs.length} subscriptions (₹${(subTotal * 12).toLocaleString()}/yr). Review which ones you actively use.`,
    });
  }

  // Debt management
  if (commitments.loanOutstanding > 0 && commitments.totalEMI > 0) {
    const monthlyIncome = totalIncome / (monthly.length || 1);
    const emiRatio = commitments.totalEMI / monthlyIncome;
    if (emiRatio > 0.4) {
      advice.push({
        category: 'debt', priority: 'high', icon: '⚠️',
        title: 'High EMI Burden',
        description: `EMIs consume ${Math.round(emiRatio * 100)}% of monthly income. Consider prepaying high-interest loans or consolidating debt.`,
      });
    }
  }

  // Insurance
  if (commitments.insuranceDue > 0) {
    advice.push({
      category: 'insurance', priority: 'medium', icon: '🛡️',
      title: 'Insurance Premiums Due',
      description: `₹${commitments.insuranceDue.toLocaleString()} in insurance premiums are pending. Ensure timely payment to avoid policy lapses.`,
    });
  }

  // Investment advice
  if (savingsRate > 0.15 && commitments.totalSIP < totalIncome * 0.1 / (monthly.length || 1)) {
    advice.push({
      category: 'investment', priority: 'medium', icon: '📈',
      title: 'Increase Investment Allocation',
      description: `With a healthy savings rate, consider increasing SIP contributions. Even ₹${Math.round(totalIncome * 0.05 / (monthly.length || 1)).toLocaleString()}/mo more in mutual funds compounds significantly over time.`,
    });
  }

  // Emergency fund
  const monthlyExpenses = totalExpenses / (monthly.length || 1);
  advice.push({
    category: 'general', priority: 'medium', icon: '🏦',
    title: 'Emergency Fund Check',
    description: `Aim for 6 months of expenses (₹${Math.round(monthlyExpenses * 6).toLocaleString()}) in liquid savings for unexpected events.`,
  });

  return advice.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
}

/* ── Investment Recommendation ── */
export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

export interface InvestmentRecommendation {
  type: string;
  allocation: number; // percentage
  description: string;
  expectedReturn: string;
  risk: 'low' | 'medium' | 'high';
}

export function getInvestmentRecommendations(
  transactions: Transaction[],
  commitments: { totalEMI: number; totalSIP: number; loanOutstanding: number }
): { profile: RiskProfile; recommendations: InvestmentRecommendation[]; monthlyInvestable: number } {
  const { totalIncome, totalExpenses, savings } = getFinancialSummary(transactions);
  const monthly = getMonthlySummary(transactions);
  const monthCount = monthly.length || 1;
  const monthlyIncome = totalIncome / monthCount;
  const monthlySavings = savings / monthCount;
  const savingsRate = totalIncome > 0 ? savings / totalIncome : 0;
  const { score } = calculateRiskScore(transactions);
  const emiRatio = monthlyIncome > 0 ? commitments.totalEMI / monthlyIncome : 0;

  // Determine risk profile
  let profile: RiskProfile;
  if (savingsRate > 0.3 && score <= 30 && emiRatio < 0.2) {
    profile = 'aggressive';
  } else if (savingsRate > 0.15 && score <= 60) {
    profile = 'moderate';
  } else {
    profile = 'conservative';
  }

  const monthlyInvestable = Math.max(0, Math.round(monthlySavings - commitments.totalSIP - commitments.totalEMI));

  const recommendations: Record<RiskProfile, InvestmentRecommendation[]> = {
    conservative: [
      { type: 'Fixed Deposits', allocation: 40, description: 'Bank FDs with guaranteed returns. Ideal for emergency fund building.', expectedReturn: '6-7% p.a.', risk: 'low' },
      { type: 'Debt Mutual Funds', allocation: 30, description: 'Low-risk funds investing in government and corporate bonds.', expectedReturn: '7-8% p.a.', risk: 'low' },
      { type: 'PPF / NPS', allocation: 20, description: 'Tax-saving instruments with long-term wealth creation.', expectedReturn: '7-8% p.a.', risk: 'low' },
      { type: 'Gold ETFs', allocation: 10, description: 'Hedge against inflation with digital gold exposure.', expectedReturn: '8-10% p.a.', risk: 'medium' },
    ],
    moderate: [
      { type: 'Large Cap Mutual Funds', allocation: 35, description: 'Blue-chip equity funds for stable long-term growth.', expectedReturn: '10-12% p.a.', risk: 'medium' },
      { type: 'Balanced / Hybrid Funds', allocation: 25, description: 'Mix of equity and debt for balanced risk-return.', expectedReturn: '9-11% p.a.', risk: 'medium' },
      { type: 'Fixed Deposits', allocation: 20, description: 'Guaranteed returns for the conservative portion.', expectedReturn: '6-7% p.a.', risk: 'low' },
      { type: 'Gold & REITs', allocation: 20, description: 'Diversify with real estate and gold for inflation protection.', expectedReturn: '8-10% p.a.', risk: 'medium' },
    ],
    aggressive: [
      { type: 'Equity Mutual Funds', allocation: 40, description: 'Mid & small cap funds for high growth potential.', expectedReturn: '12-15% p.a.', risk: 'high' },
      { type: 'Direct Equities', allocation: 25, description: 'Individual stock picks in growth sectors.', expectedReturn: '12-18% p.a.', risk: 'high' },
      { type: 'Large Cap Funds', allocation: 20, description: 'Stable equity exposure through blue-chip companies.', expectedReturn: '10-12% p.a.', risk: 'medium' },
      { type: 'International Funds', allocation: 15, description: 'Global diversification with US/emerging market exposure.', expectedReturn: '10-14% p.a.', risk: 'high' },
    ],
  };

  return { profile, recommendations: recommendations[profile], monthlyInvestable };
}
