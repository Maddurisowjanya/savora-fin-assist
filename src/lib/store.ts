import { create } from 'zustand';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  user_id?: string;
}

interface FinanceStore {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setTransactions: (t: Transaction[]) => void;
}

// Sample data for demo
const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2026-03-01', description: 'Monthly Salary', amount: 85000, type: 'income', category: 'Salary' },
  { id: '2', date: '2026-03-01', description: 'Rent Payment', amount: 25000, type: 'expense', category: 'Bills & Utilities' },
  { id: '3', date: '2026-02-28', description: 'Swiggy Order', amount: 450, type: 'expense', category: 'Food & Dining' },
  { id: '4', date: '2026-02-27', description: 'Netflix Subscription', amount: 649, type: 'expense', category: 'Subscriptions' },
  { id: '5', date: '2026-02-26', description: 'Uber Ride', amount: 320, type: 'expense', category: 'Transport' },
  { id: '6', date: '2026-02-25', description: 'Freelance Project', amount: 15000, type: 'income', category: 'Freelance' },
  { id: '7', date: '2026-02-24', description: 'Amazon Shopping', amount: 2300, type: 'expense', category: 'Shopping' },
  { id: '8', date: '2026-02-23', description: 'Spotify Premium', amount: 119, type: 'expense', category: 'Subscriptions' },
  { id: '9', date: '2026-02-22', description: 'Movie tickets', amount: 500, type: 'expense', category: 'Entertainment' },
  { id: '10', date: '2026-02-20', description: 'Grocery Store', amount: 1800, type: 'expense', category: 'Food & Dining' },
  { id: '11', date: '2026-02-18', description: 'Gym Membership', amount: 1500, type: 'expense', category: 'Health' },
  { id: '12', date: '2026-02-15', description: 'Monthly Salary', amount: 85000, type: 'income', category: 'Salary' },
  { id: '13', date: '2026-02-14', description: 'Electricity Bill', amount: 2100, type: 'expense', category: 'Bills & Utilities' },
  { id: '14', date: '2026-02-12', description: 'Zomato Order', amount: 680, type: 'expense', category: 'Food & Dining' },
  { id: '15', date: '2026-02-10', description: 'Book Purchase', amount: 450, type: 'expense', category: 'Education' },
  { id: '16', date: '2026-01-28', description: 'Netflix Subscription', amount: 649, type: 'expense', category: 'Subscriptions' },
  { id: '17', date: '2026-01-28', description: 'Spotify Premium', amount: 119, type: 'expense', category: 'Subscriptions' },
  { id: '18', date: '2026-01-15', description: 'Monthly Salary', amount: 85000, type: 'income', category: 'Salary' },
  { id: '19', date: '2026-01-01', description: 'Monthly Salary', amount: 85000, type: 'income', category: 'Salary' },
];

export const useFinanceStore = create<FinanceStore>((set) => ({
  transactions: SAMPLE_TRANSACTIONS,
  addTransaction: (t) =>
    set((state) => ({
      transactions: [{ ...t, id: crypto.randomUUID() }, ...state.transactions],
    })),
  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
  setTransactions: (transactions) => set({ transactions }),
}));
