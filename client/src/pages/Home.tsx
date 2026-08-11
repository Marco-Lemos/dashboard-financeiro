/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Dashboard principal com layout fluido, cards semi-transparentes e interações suaves
 */

import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SummaryCard } from '@/components/SummaryCard';
import { MonthlyChart } from '@/components/MonthlyChart';
import { ExpensesDonutChart } from '@/components/ExpensesDonutChart';
import { InvestmentDonutChart } from '@/components/InvestmentDonutChart';
import { TransactionList } from '@/components/TransactionList';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useMonth } from '@/contexts/MonthContext';
import { MONTHS, YEARS } from '@/types/finance';
import { useAuth } from '@/_core/hooks/useAuth';

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const { selectedMonth, setSelectedMonth, selectedYear, setSelectedYear } = useMonth();
  
  const {
    addTransaction,
    receitas,
    despesas,
    saldo,
    economia,
    investimentos,
    totalInvestido,
    monthlyData,
    categoryExpenses,
    investmentData,
    recentTransactions,
    allCategories,
  } = useFinanceData();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl mt-0">
        <div className="container py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight">
                Controle Financeiro
              </h1>
              <p className="text-muted-foreground mt-1">
                {user?.name || 'Bem-vindo(a)'}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Select 
                value={selectedMonth.toString()} 
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-[140px] glass-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={selectedYear.toString()} 
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-[100px] glass-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <AddTransactionDialog onAddTransaction={addTransaction} categories={allCategories} selectedMonth={selectedMonth} selectedYear={selectedYear} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Receitas"
            value={`R$ ${receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={TrendingUp}
            iconColor="text-primary"
            iconBgColor="bg-primary/20"
          />
          <SummaryCard
            title="Despesas"
            value={`R$ ${despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={TrendingDown}
            iconColor="text-destructive"
            iconBgColor="bg-destructive/20"
          />
          <SummaryCard
            title="Saldo"
            value={`R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={Wallet}
            iconColor="text-primary"
            iconBgColor="bg-primary/20"
          />
          <SummaryCard
            title="Total Investido"
            value={`R$ ${totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={PiggyBank}
            iconColor="text-primary"
            iconBgColor="bg-primary/20"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <MonthlyChart data={monthlyData} />
          </div>
          <div>
            <ExpensesDonutChart data={categoryExpenses} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <InvestmentDonutChart data={investmentData} />
          </div>
          <div className="lg:col-span-2">
            <TransactionList transactions={recentTransactions} />
          </div>
        </div>
      </main>
    </div>
  );
}
