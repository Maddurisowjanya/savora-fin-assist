import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, BarChart3, Brain, Shield, Upload, Target,
  CreditCard, Bell, TrendingUp, User, Menu, X,
  LayoutDashboard, ArrowLeftRight, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import savoraLogo from '@/assets/savora-logo.jpg';

const navFeatures = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/import', label: 'CSV Import', icon: Upload },
  { to: '/predictions', label: 'Predictions', icon: TrendingUp },
  { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/personality', label: 'Personality', icon: User },
  { to: '/risk', label: 'Risk Score', icon: Shield },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/chat', label: 'AI Assistant', icon: MessageSquare },
];

const featureCards = [
  { icon: BarChart3, title: 'Smart Analytics', desc: 'Visual dashboards with category insights and trend analysis', to: '/dashboard' },
  { icon: Brain, title: 'AI Advisor', desc: 'Conversational assistant that understands your financial goals', to: '/chat' },
  { icon: Shield, title: 'Risk Assessment', desc: 'Real-time risk scoring to keep your finances healthy', to: '/risk' },
  { icon: Upload, title: 'CSV Import', desc: 'Upload bank statements and auto-categorize transactions', to: '/import' },
  { icon: Target, title: 'Goal Planner', desc: 'Set savings goals and track your progress with projections', to: '/goals' },
  { icon: User, title: 'Spending Personality', desc: 'AI-powered financial behavior classification', to: '/personality' },
  { icon: CreditCard, title: 'Subscriptions', desc: 'Auto-detect recurring payments and manage subscriptions', to: '/subscriptions' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Intelligent contextual alerts about your spending', to: '/alerts' },
  { icon: TrendingUp, title: 'Predictions', desc: 'AI-powered spending predictions and savings forecasts', to: '/predictions' },
];

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [user, loading, navigate]);

  if (loading) return null;

  const handleNavClick = (to: string) => {
    setMobileMenuOpen(false);
    navigate(user ? to : '/auth');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
          <div className="flex items-center gap-2.5">
            <img src={savoraLogo} alt="Savora" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-xl font-bold font-display gradient-text">Savora</span>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navFeatures.slice(0, 7).map(({ to, label, icon: Icon }) => (
              <button
                key={to}
                onClick={() => handleNavClick(to)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
            <button
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-3 space-y-1"
          >
            {navFeatures.map(({ to, label, icon: Icon }) => (
              <button
                key={to}
                onClick={() => handleNavClick(to)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <img src={savoraLogo} alt="Savora" className="h-16 w-16 rounded-2xl object-cover mx-auto mb-6 shadow-lg" />
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-6">
              AI-Powered Financial Intelligence
            </span>
            <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight mb-6">
              Take control of your
              <br />
              <span className="gradient-text">financial future</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Track expenses, predict savings, and get intelligent financial advice — all powered by AI that understands your money.
            </p>
            <div className="flex gap-3 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-20"
          >
            {featureCards.map(({ icon: Icon, title, desc, to }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                className="stat-card text-center cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all duration-200 group"
                onClick={() => handleNavClick(to)}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold font-display mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border/50">
        © {new Date().getFullYear()} Savora. All rights reserved.
      </footer>
    </div>
  );
}
