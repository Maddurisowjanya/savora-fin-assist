import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';
import {
  LayoutDashboard, ArrowLeftRight, Upload, TrendingUp,
  CreditCard, Target, User, Shield, Bell, MessageSquare,
  ShieldCheck, LineChart, PieChart, Banknote, Landmark,
  Brain, AlertTriangle, BarChart3,
} from 'lucide-react';

const features = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview of your finances' },
  { to: '/advisor', label: 'AI Advisor', icon: Brain, desc: 'Personalized financial advice' },
  { to: '/anomalies', label: 'Anomalies', icon: AlertTriangle, desc: 'Unusual spending alerts' },
  { to: '/investments', label: 'Invest', icon: BarChart3, desc: 'Smart investment picks' },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, desc: 'View & manage transactions' },
  { to: '/import', label: 'CSV Import', icon: Upload, desc: 'Upload bank statements' },
  { to: '/predictions', label: 'Predictions', icon: TrendingUp, desc: 'AI spending forecasts' },
  { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard, desc: 'Detect recurring payments' },
  { to: '/goals', label: 'Goals', icon: Target, desc: 'Plan & track savings goals' },
  { to: '/personality', label: 'Personality', icon: User, desc: 'Your spending personality' },
  { to: '/risk', label: 'Risk Score', icon: Shield, desc: 'Financial health assessment' },
  { to: '/alerts', label: 'Alerts', icon: Bell, desc: 'Smart spending alerts' },
  { to: '/chat', label: 'AI Assistant', icon: MessageSquare, desc: 'Chat with your AI advisor' },
  { to: '/insurance', label: 'Insurance', icon: ShieldCheck, desc: 'Track insurance premiums' },
  { to: '/sip', label: 'SIP Tracker', icon: LineChart, desc: 'Monitor SIP investments' },
  { to: '/savings-division', label: 'Savings Split', icon: PieChart, desc: 'Allocate monthly income' },
  { to: '/emi', label: 'EMIs', icon: Banknote, desc: 'Track EMI payments' },
  { to: '/loans', label: 'Loans', icon: Landmark, desc: 'Manage loan repayments' },
];

const containerV = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } } };
const itemV = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

export default function Home() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,hsla(239,100%,69%,0.12),transparent_70%)]" />
        <div className="absolute top-1/2 -left-48 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,hsla(253,100%,87%,0.10),transparent_70%)]" />
      </div>

      <button onClick={handleSignOut} className="absolute top-6 right-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
        <LogOut className="w-4 h-4" /> Sign out
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-2xl mb-14"
      >
        <h1 className="text-4xl md:text-6xl font-bold font-display mb-4">
          <span className="gradient-text">Savora</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground italic">
          "Your money tells a story — let intelligence write the next chapter."
        </p>
      </motion.div>

      <motion.div
        variants={containerV}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl w-full"
      >
        {features.map(({ to, label, icon: Icon, desc }) => (
          <motion.button
            key={to}
            variants={itemV}
            onClick={() => navigate(to)}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 text-center hover:border-primary/40 hover:shadow-[0_8px_30px_-8px_hsla(239,60%,50%,0.15)] transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-200">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold font-display mb-0.5">{label}</h3>
            <p className="text-[11px] text-muted-foreground leading-tight">{desc}</p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
