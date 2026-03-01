import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Brain, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/dashboard');
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4">
        <h1 className="text-2xl font-bold font-display gradient-text">Savora</h1>
        <Button variant="outline" onClick={() => navigate('/auth')}>Sign In</Button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-6">
              AI-Powered Financial Intelligence
            </span>
            <h2 className="text-4xl md:text-6xl font-bold font-display leading-tight mb-6">
              Take control of your
              <br />
              <span className="gradient-text">financial future</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Track expenses, predict savings, and get intelligent financial advice — all powered by AI that understands your money.
            </p>
            <div className="flex gap-3 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid md:grid-cols-3 gap-6 mt-20"
          >
            {[
              { icon: BarChart3, title: 'Smart Analytics', desc: 'Visual dashboards with category insights and trend analysis' },
              { icon: Brain, title: 'AI Advisor', desc: 'Conversational assistant that understands your financial goals' },
              { icon: Shield, title: 'Risk Assessment', desc: 'Real-time risk scoring to keep your finances healthy' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="stat-card text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold font-display mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
