import { Transaction } from './store';

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

  // Spending ratio
  const { ratio } = getFinancialSummary(transactions);
  if (ratio > 0.9) { score += 35; reasons.push('Spending exceeds 90% of income'); }
  else if (ratio > 0.7) { score += 20; reasons.push('Spending is above 70% of income'); }
  else if (ratio > 0.5) { score += 10; reasons.push('Moderate spending ratio'); }

  // Savings consistency
  const savingsAmounts = monthly.map(m => m.savings);
  const negativeSavings = savingsAmounts.filter(s => s < 0).length;
  if (negativeSavings > 0) { score += 25; reasons.push(`${negativeSavings} month(s) with negative savings`); }

  // Expense volatility
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
  const recurring: Record<string, { amount: number; count: number; dates: string[] }> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const key = `${t.description.toLowerCase()}_${t.amount}`;
    if (!recurring[key]) recurring[key] = { amount: t.amount, count: 0, dates: [] };
    recurring[key].count++;
    recurring[key].dates.push(t.date);
  });
  return Object.entries(recurring)
    .filter(([, v]) => v.count >= 2)
    .map(([key, v]) => ({
      name: key.split('_')[0].replace(/^\w/, c => c.toUpperCase()),
      amount: v.amount,
      occurrences: v.count,
    }));
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

export function generateAlerts(transactions: Transaction[]): string[] {
  const alerts: string[] = [];
  const monthly = getMonthlySummary(transactions);

  if (monthly.length >= 2) {
    const current = monthly[monthly.length - 1];
    const previous = monthly[monthly.length - 2];

    if (current.expenses > previous.expenses * 1.2) {
      const pct = Math.round((current.expenses / previous.expenses - 1) * 100);
      alerts.push(`Your spending increased by ${pct}% compared to last month.`);
    }
    if (current.savings < previous.savings * 0.5 && previous.savings > 0) {
      alerts.push(`Your savings dropped significantly this month.`);
    }
  }

  const { ratio } = getFinancialSummary(transactions);
  if (ratio > 0.85) alerts.push('You are spending over 85% of your income. Consider cutting back.');

  const subs = detectSubscriptions(transactions);
  const subTotal = subs.reduce((s, sub) => s + sub.amount, 0);
  if (subTotal > 2000) alerts.push(`You have ₹${subTotal.toLocaleString()} in recurring subscriptions.`);

  if (alerts.length === 0) alerts.push('Your finances are looking great! Keep it up! 🎉');
  return alerts;
}
