import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  ArrowLeftRight,
  MessageSquare,
  Shield,
  CreditCard,
  Bell,
  LogOut,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/predictions', label: 'Predictions', icon: TrendingUp },
  { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/risk', label: 'Risk Score', icon: Shield },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/chat', label: 'AI Assistant', icon: MessageSquare },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="p-6">
          <h1 className="text-2xl font-bold font-display gradient-text">Savora</h1>
          <p className="text-xs text-muted-foreground mt-1">Financial Intelligence</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <h1 className="text-xl font-bold font-display gradient-text">Savora</h1>
          <button onClick={handleSignOut} className="text-muted-foreground">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex gap-1 px-2 py-2 border-b border-border bg-card overflow-x-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
