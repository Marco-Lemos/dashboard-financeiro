/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Navegação principal — barra superior completa a partir de md (desktop),
 * barra inferior fixa (padrão de apps mobile) abaixo disso.
 */

import { Link, useLocation } from 'wouter';
import { BarChart3, List, FileText, Tags, CreditCard, Target, Moon, Sun, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/_core/hooks/useAuth';

const navItems = [
  { href: '/', label: 'Início', icon: BarChart3 },
  { href: '/transactions', label: 'Transações', icon: List },
  { href: '/fixed-accounts', label: 'Contas', icon: FileText },
  { href: '/installments', label: 'Parcelas', icon: CreditCard },
  { href: '/goals', label: 'Metas', icon: Target },
  { href: '/categories', label: 'Categorias', icon: Tags },
];

export function Navigation() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <>
      {/* Barra superior: logo sempre, links completos só a partir de md */}
      <nav className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-bold text-xl font-display hover:opacity-80 smooth-transition">
              💰 Finanças
            </Link>

            <div className="flex items-center gap-1">
              <div className="hidden md:flex items-center gap-1">
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
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground smooth-transition md:ml-2"
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

      {/* Barra inferior fixa: só até md, navegação principal por toque */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 backdrop-blur-xl bg-background/95"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2.5 smooth-transition',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
