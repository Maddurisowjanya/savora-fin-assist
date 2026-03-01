import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinanceStore } from '@/lib/store';
import { getFinancialSummary, getCategoryBreakdown, calculateRiskScore, predictSavings, detectSubscriptions, getMonthlySummary } from '@/lib/finance-utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function processQuery(query: string, transactions: any[]): string {
  const lower = query.toLowerCase();
  const { totalIncome, totalExpenses, savings, ratio } = getFinancialSummary(transactions);
  const categories = getCategoryBreakdown(transactions);
  const { score, level, reasons } = calculateRiskScore(transactions);
  const { predictions, confidence } = predictSavings(transactions);
  const subs = detectSubscriptions(transactions);
  const monthly = getMonthlySummary(transactions);

  // Spending on specific category
  const categoryMatch = categories.find(c => lower.includes(c.name.toLowerCase().split(' ')[0].toLowerCase()));
  if (categoryMatch && (lower.includes('spend') || lower.includes('how much'))) {
    return `You've spent **₹${categoryMatch.value.toLocaleString()}** on **${categoryMatch.name}**. That's ${((categoryMatch.value / totalExpenses) * 100).toFixed(1)}% of your total expenses.`;
  }

  if (lower.includes('afford')) {
    const amountMatch = query.match(/₹?([\d,]+)/);
    if (amountMatch) {
      const amount = parseInt(amountMatch[1].replace(/,/g, ''));
      const canAfford = savings >= amount;
      return canAfford
        ? `✅ Yes, you can afford ₹${amount.toLocaleString()}! Your current savings are ₹${savings.toLocaleString()}. After this purchase, you'd have ₹${(savings - amount).toLocaleString()} remaining.`
        : `⚠️ I wouldn't recommend it. Your savings are ₹${savings.toLocaleString()}, and ₹${amount.toLocaleString()} would put you at risk. Consider waiting until you've saved more.`;
    }
  }

  if (lower.includes('predict') || lower.includes('savings') && lower.includes('next')) {
    if (predictions.length === 0) return "I need more transaction data to make predictions. Keep tracking!";
    return `📊 **Savings Predictions** (${confidence}% confidence)\n\n${predictions.map(p => `• ${p.month}: **₹${p.predicted.toLocaleString()}**`).join('\n')}\n\nBased on your spending trends and income patterns.`;
  }

  if (lower.includes('risk') || lower.includes('score')) {
    return `🛡️ Your **Financial Risk Score** is **${score}/100** (${level})\n\n${reasons.map(r => `• ${r}`).join('\n')}\n\n${score <= 30 ? "You're doing great!" : score <= 60 ? "There's room for improvement." : "Consider reducing expenses."}`;
  }

  if (lower.includes('subscription') || lower.includes('recurring')) {
    if (subs.length === 0) return "I haven't detected any recurring subscriptions yet.";
    const total = subs.reduce((s, sub) => s + sub.amount, 0);
    return `🔄 **Detected Subscriptions:**\n\n${subs.map(s => `• ${s.name}: ₹${s.amount}/month (${s.occurrences} times)`).join('\n')}\n\n**Total monthly cost:** ₹${total.toLocaleString()}`;
  }

  if (lower.includes('overspend') || lower.includes('spending too much')) {
    return ratio > 0.75
      ? `⚠️ Yes, you're spending **${(ratio * 100).toFixed(0)}%** of your income. That's above the recommended 75%. Top categories:\n\n${categories.slice(0, 3).map(c => `• ${c.name}: ₹${c.value.toLocaleString()}`).join('\n')}\n\nConsider cutting back on ${categories[0]?.name}.`
      : `✅ Your spending looks healthy at **${(ratio * 100).toFixed(0)}%** of income. Keep maintaining this balance!`;
  }

  if (lower.includes('summary') || lower.includes('overview')) {
    return `📋 **Financial Summary**\n\n• Total Income: **₹${totalIncome.toLocaleString()}**\n• Total Expenses: **₹${totalExpenses.toLocaleString()}**\n• Savings: **₹${savings.toLocaleString()}**\n• Expense Ratio: **${(ratio * 100).toFixed(0)}%**\n• Risk Score: **${score}/100** (${level})\n\nTop spending: ${categories.slice(0, 3).map(c => c.name).join(', ')}`;
  }

  return `I'd be happy to help! Here's what I can answer:\n\n• "How much did I spend on food?"\n• "Can I afford ₹50,000?"\n• "Predict my savings"\n• "What's my risk score?"\n• "Am I overspending?"\n• "Show my subscriptions"\n• "Give me a summary"\n\nTry asking one of these!`;
}

const quickActions = [
  "Give me a financial summary",
  "Am I overspending?",
  "Predict my savings",
  "What's my risk score?",
  "Show my subscriptions",
];

export default function ChatPage() {
  const { transactions } = useFinanceStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "👋 Hi! I'm **Savora AI**, your financial intelligence assistant. Ask me anything about your finances — spending patterns, affordability checks, savings predictions, and more!" },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processQuery(text, transactions);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold font-display flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Assistant
        </h1>
        <p className="text-muted-foreground mt-1">Ask about your finances in natural language</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant' ? 'bg-primary/10' : 'bg-muted'
              }`}>
                {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'stat-card'
              }`}>
                {msg.content.split('\n').map((line, j) => (
                  <p key={j} className={j > 0 ? 'mt-1' : ''}>
                    {line.split(/(\*\*.*?\*\*)/).map((part, k) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={k}>{part.slice(2, -2)}</strong>
                        : part
                    )}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="stat-card px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary/40"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      {messages.length <= 2 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {quickActions.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your finances..."
          className="flex-1"
        />
        <Button type="submit" disabled={!input.trim() || isTyping}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
