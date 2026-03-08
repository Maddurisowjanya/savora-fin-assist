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

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  createdAt: string;
}

export interface InsurancePolicy {
  id: string;
  name: string;
  provider: string;
  premiumAmount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface SIPInvestment {
  id: string;
  fundName: string;
  monthlyAmount: number;
  startDate: string;
  totalInvested: number;
}

export interface EMI {
  id: string;
  loanName: string;
  emiAmount: number;
  interestRate: number;
  dueDate: string;
  remainingBalance: number;
  totalAmount: number;
}

export interface Loan {
  id: string;
  name: string;
  principalAmount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  monthlyPayment: number;
  remainingBalance: number;
}

export interface SavingsDivision {
  id: string;
  month: string;
  totalIncome: number;
  savings: number;
  expenses: number;
  investments: number;
}

interface FinanceStore {
  transactions: Transaction[];
  goals: FinancialGoal[];
  insurancePolicies: InsurancePolicy[];
  sipInvestments: SIPInvestment[];
  emis: EMI[];
  loans: Loan[];
  savingsDivisions: SavingsDivision[];

  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  addTransactions: (ts: Omit<Transaction, 'id'>[]) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setTransactions: (t: Transaction[]) => void;
  addGoal: (g: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  removeGoal: (id: string) => void;

  addInsurance: (p: Omit<InsurancePolicy, 'id'>) => void;
  updateInsurance: (id: string, p: Partial<InsurancePolicy>) => void;
  removeInsurance: (id: string) => void;

  addSIP: (s: Omit<SIPInvestment, 'id'>) => void;
  removeSIP: (id: string) => void;

  addEMI: (e: Omit<EMI, 'id'>) => void;
  updateEMI: (id: string, e: Partial<EMI>) => void;
  removeEMI: (id: string) => void;

  addLoan: (l: Omit<Loan, 'id'>) => void;
  updateLoan: (id: string, l: Partial<Loan>) => void;
  removeLoan: (id: string) => void;

  addSavingsDivision: (s: Omit<SavingsDivision, 'id'>) => void;
  updateSavingsDivision: (id: string, s: Partial<SavingsDivision>) => void;
  removeSavingsDivision: (id: string) => void;
}

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
  { id: '20', date: '2026-02-22', description: 'Restaurant dinner', amount: 1200, type: 'expense', category: 'Food & Dining' },
  { id: '21', date: '2026-02-23', description: 'Shopping mall', amount: 3500, type: 'expense', category: 'Shopping' },
  { id: '22', date: '2026-03-01', description: 'Gym Membership', amount: 1500, type: 'expense', category: 'Health' },
];

const SAMPLE_INSURANCE: InsurancePolicy[] = [
  { id: 'ins-1', name: 'Health Insurance', provider: 'Star Health', premiumAmount: 12000, frequency: 'quarterly', dueDate: '2026-04-15', status: 'pending' },
  { id: 'ins-2', name: 'Term Life Insurance', provider: 'LIC', premiumAmount: 8500, frequency: 'yearly', dueDate: '2026-06-01', status: 'pending' },
];

const SAMPLE_SIP: SIPInvestment[] = [
  { id: 'sip-1', fundName: 'Axis Bluechip Fund', monthlyAmount: 5000, startDate: '2025-06-01', totalInvested: 45000 },
  { id: 'sip-2', fundName: 'Mirae Asset Large Cap', monthlyAmount: 3000, startDate: '2025-09-01', totalInvested: 18000 },
];

const SAMPLE_EMI: EMI[] = [
  { id: 'emi-1', loanName: 'Car Loan', emiAmount: 15000, interestRate: 8.5, dueDate: '2026-03-05', remainingBalance: 320000, totalAmount: 600000 },
];

const SAMPLE_LOANS: Loan[] = [
  { id: 'loan-1', name: 'Education Loan', principalAmount: 500000, interestRate: 7.5, startDate: '2024-01-01', endDate: '2029-01-01', monthlyPayment: 10000, remainingBalance: 380000 },
];

const SAMPLE_SAVINGS: SavingsDivision[] = [
  { id: 'sav-1', month: '2026-03', totalIncome: 85000, savings: 25000, expenses: 40000, investments: 20000 },
];

export const useFinanceStore = create<FinanceStore>((set) => ({
  transactions: SAMPLE_TRANSACTIONS,
  goals: [
    { id: 'demo-1', name: 'MacBook Pro', targetAmount: 200000, targetDate: '2026-09-01', createdAt: '2026-01-15' },
  ],
  insurancePolicies: SAMPLE_INSURANCE,
  sipInvestments: SAMPLE_SIP,
  emis: SAMPLE_EMI,
  loans: SAMPLE_LOANS,
  savingsDivisions: SAMPLE_SAVINGS,

  addTransaction: (t) => set((s) => ({ transactions: [{ ...t, id: crypto.randomUUID() }, ...s.transactions] })),
  addTransactions: (ts) => set((s) => ({ transactions: [...ts.map(t => ({ ...t, id: crypto.randomUUID() })), ...s.transactions] })),
  updateTransaction: (id, u) => set((s) => ({ transactions: s.transactions.map(t => t.id === id ? { ...t, ...u } : t) })),
  deleteTransaction: (id) => set((s) => ({ transactions: s.transactions.filter(t => t.id !== id) })),
  setTransactions: (transactions) => set({ transactions }),
  addGoal: (g) => set((s) => ({ goals: [...s.goals, { ...g, id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10) }] })),
  removeGoal: (id) => set((s) => ({ goals: s.goals.filter(g => g.id !== id) })),

  addInsurance: (p) => set((s) => ({ insurancePolicies: [...s.insurancePolicies, { ...p, id: crypto.randomUUID() }] })),
  updateInsurance: (id, u) => set((s) => ({ insurancePolicies: s.insurancePolicies.map(p => p.id === id ? { ...p, ...u } : p) })),
  removeInsurance: (id) => set((s) => ({ insurancePolicies: s.insurancePolicies.filter(p => p.id !== id) })),

  addSIP: (si) => set((s) => ({ sipInvestments: [...s.sipInvestments, { ...si, id: crypto.randomUUID() }] })),
  removeSIP: (id) => set((s) => ({ sipInvestments: s.sipInvestments.filter(si => si.id !== id) })),

  addEMI: (e) => set((s) => ({ emis: [...s.emis, { ...e, id: crypto.randomUUID() }] })),
  updateEMI: (id, u) => set((s) => ({ emis: s.emis.map(e => e.id === id ? { ...e, ...u } : e) })),
  removeEMI: (id) => set((s) => ({ emis: s.emis.filter(e => e.id !== id) })),

  addLoan: (l) => set((s) => ({ loans: [...s.loans, { ...l, id: crypto.randomUUID() }] })),
  updateLoan: (id, u) => set((s) => ({ loans: s.loans.map(l => l.id === id ? { ...l, ...u } : l) })),
  removeLoan: (id) => set((s) => ({ loans: s.loans.filter(l => l.id !== id) })),

  addSavingsDivision: (sd) => set((s) => ({ savingsDivisions: [...s.savingsDivisions, { ...sd, id: crypto.randomUUID() }] })),
  updateSavingsDivision: (id, u) => set((s) => ({ savingsDivisions: s.savingsDivisions.map(sd => sd.id === id ? { ...sd, ...u } : sd) })),
  removeSavingsDivision: (id) => set((s) => ({ savingsDivisions: s.savingsDivisions.filter(sd => sd.id !== id) })),
}));
