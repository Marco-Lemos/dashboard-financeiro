/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Navegação principal com links para todas as páginas
 */

import { Link, useLocation } from 'wouter';
import { BarChart3, List, FileText, Tags, CreditCard, Moon, Sun, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/_core/hooks/useAuth';

export function Navigation() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/transactions', label: 'Transações', icon: List },
    { href: '/fixed-accounts', label: 'Contas Fixas', icon: FileText },
    { href: '/installments', label: 'Parcelamentos', icon: CreditCard },
    { href: '/categories', label: 'Categorias', icon: Tags },
  ];

  return (
    <nav className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-xl font-display hover:opacity-80 smooth-transition">
            💰 Finanças
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg smooth-transition',
                    isActive
                      ? 'bg-primary/20 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{item.label}</span>
                </Link>
              );
            })}
            
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground smooth-transition ml-2"
              title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => logout()}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground smooth-transition"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
