/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Tela de boas-vindas exibida apenas no primeiro acesso — coleta renda mensal
 * e alguns gastos principais para o painel já nascer com dados reais.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import { useFinanceData } from '@/hooks/useFinanceData';
import { trpc } from '@/lib/trpc';
import { EXPENSE_CATEGORIES } from '@/types/finance';

function formatCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits === '') return '';
  const numValue = parseInt(digits) / 100;
  return numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseCurrencyInput(value: string): number {
  return parseFloat(value.replace(/\./g, '').replace(/,/g, '.'));
}

interface ExpenseRow {
  category: string;
  amount: string;
}

export default function Onboarding() {
  const { user } = useAuth();
  const { addTransaction } = useFinanceData();
  const utils = trpc.useUtils();
  const completeOnboardingMutation = trpc.auth.completeOnboarding.useMutation();

  const [step, setStep] = useState<'welcome' | 'form'>('welcome');
  const [submitting, setSubmitting] = useState(false);
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState<ExpenseRow[]>([
    { category: 'Alimentação', amount: '' },
    { category: 'Contas', amount: '' },
    { category: 'Transporte', amount: '' },
  ]);

  const today = new Date().toISOString().split('T')[0];
  const firstName = user?.name?.split(' ')[0] || '';

  const markCompleted = async () => {
    await completeOnboardingMutation.mutateAsync();
    await utils.auth.me.invalidate();
  };

  const handleSkip = async () => {
    setSubmitting(true);
    try {
      await markCompleted();
    } catch (error) {
      toast.error('Não foi possível pular agora. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const incomeValue = parseCurrencyInput(income);
      if (income && !isNaN(incomeValue) && incomeValue > 0) {
        await addTransaction({
          type: 'receita',
          category: 'Salário',
          description: 'Renda mensal',
          amount: incomeValue,
          date: today,
        });
      }

      for (const row of expenses) {
        const value = parseCurrencyInput(row.amount);
        if (row.amount && !isNaN(value) && value > 0) {
          await addTransaction({
            type: 'despesa',
            category: row.category,
            description: row.category,
            amount: value,
            date: today,
          });
        }
      }

      await markCompleted();
      toast.success('Tudo pronto! Bem-vindo(a) ao seu painel financeiro.');
    } catch (error) {
      toast.error('Não foi possível salvar seus dados. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateExpense = (index: number, field: 'category' | 'amount', value: string) => {
    setExpenses(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md glass-card border-border text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-display">
              Seja bem-vindo(a){firstName ? `, ${firstName}` : ''}!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              A seguir, preencha alguns dados básicos para começar a simplificar sua vida financeira.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => setStep('form')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Vamos começar
            </Button>
            <button
              onClick={handleSkip}
              disabled={submitting}
              className="text-sm text-muted-foreground hover:text-foreground smooth-transition"
            >
              Pular por agora
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg glass-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-display">Seus dados básicos</CardTitle>
          <CardDescription>Isso já deixa seu painel com números reais, não vazio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="income">Qual sua renda mensal? (R$)</Label>
            <Input
              id="income"
              type="text"
              value={income}
              onChange={(e) => setIncome(formatCurrencyInput(e.target.value))}
              placeholder="0,00"
              autoComplete="off"
            />
          </div>

          <div className="space-y-3">
            <Label>Quais são seus principais gastos?</Label>
            {expenses.map((row, index) => (
              <div key={index} className="grid grid-cols-2 gap-3">
                <Select value={row.category} onValueChange={(v) => updateExpense(index, 'category', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  value={row.amount}
                  onChange={(e) => updateExpense(index, 'amount', formatCurrencyInput(e.target.value))}
                  placeholder="0,00"
                  autoComplete="off"
                />
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {submitting ? 'Salvando...' : 'Concluir e ver meu painel'}
            </Button>
            <button
              onClick={handleSkip}
              disabled={submitting}
              className="w-full text-sm text-center text-muted-foreground hover:text-foreground smooth-transition"
            >
              Pular por agora
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
