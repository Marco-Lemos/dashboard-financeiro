import { useCallback, useEffect, useRef } from 'react';
import { Transaction, MonthlyData, CategoryExpense, InvestmentData, CATEGORY_COLORS } from '@/types/finance';
import { trpc } from '@/lib/trpc';
import { useMonth } from '@/contexts/MonthContext';

export function useFinanceData() {
  // Usar MonthContext em vez de URL
  const { selectedMonth, selectedYear } = useMonth();

  const utils = trpc.useUtils();

  // Carregar dados da nuvem
  const { data: transactionsData = [], isLoading: transactionsLoading } = trpc.finance.transactions.list.useQuery();
  const { data: categoriesData = [], isLoading: categoriesLoading } = trpc.finance.categories.list.useQuery();
  const { data: installmentsData = [], isLoading: installmentsLoading } = trpc.finance.installments.list.useQuery();
  const { data: fixedAccountsData = [], isLoading: fixedAccountsLoading } = trpc.finance.fixedAccounts.list.useQuery();
  const { data: goalsData = [], isLoading: goalsLoading } = trpc.finance.goals.list.useQuery();
  const { data: investmentsData = [], isLoading: investmentsLoading } = trpc.finance.investments.list.useQuery();

  // Mutations — cada uma invalida a query correspondente para a UI refletir a mudança sem precisar recarregar a página
  const addTransactionMutation = trpc.finance.transactions.create.useMutation({
    onSuccess: () => utils.finance.transactions.list.invalidate(),
  });
  const updateTransactionMutation = trpc.finance.transactions.update.useMutation({
    onSuccess: () => utils.finance.transactions.list.invalidate(),
  });
  const deleteTransactionMutation = trpc.finance.transactions.delete.useMutation({
    onSuccess: () => utils.finance.transactions.list.invalidate(),
  });

  const addCategoryMutation = trpc.finance.categories.create.useMutation({
    onSuccess: () => utils.finance.categories.list.invalidate(),
  });
  const updateCategoryMutation = trpc.finance.categories.update.useMutation({
    onSuccess: () => utils.finance.categories.list.invalidate(),
  });
  const deleteCategoryMutation = trpc.finance.categories.delete.useMutation({
    onSuccess: () => utils.finance.categories.list.invalidate(),
  });

  const addInstallmentMutation = trpc.finance.installments.create.useMutation({
    onSuccess: () => utils.finance.installments.list.invalidate(),
  });
  const updateInstallmentMutation = trpc.finance.installments.update.useMutation({
    onSuccess: () => utils.finance.installments.list.invalidate(),
  });
  const deleteInstallmentMutation = trpc.finance.installments.delete.useMutation({
    onSuccess: () => utils.finance.installments.list.invalidate(),
  });

  const addFixedAccountMutation = trpc.finance.fixedAccounts.create.useMutation({
    onSuccess: () => utils.finance.fixedAccounts.list.invalidate(),
  });
  const updateFixedAccountMutation = trpc.finance.fixedAccounts.update.useMutation({
    onSuccess: () => utils.finance.fixedAccounts.list.invalidate(),
  });
  const deleteFixedAccountMutation = trpc.finance.fixedAccounts.delete.useMutation({
    onSuccess: () => utils.finance.fixedAccounts.list.invalidate(),
  });

  const addGoalMutation = trpc.finance.goals.create.useMutation({
    onSuccess: () => utils.finance.goals.list.invalidate(),
  });
  const updateGoalMutation = trpc.finance.goals.update.useMutation({
    onSuccess: () => utils.finance.goals.list.invalidate(),
  });
  const deleteGoalMutation = trpc.finance.goals.delete.useMutation({
    onSuccess: () => utils.finance.goals.list.invalidate(),
  });

  const addInvestmentMutation = trpc.finance.investments.create.useMutation({
    onSuccess: () => utils.finance.investments.list.invalidate(),
  });
  const updateInvestmentMutation = trpc.finance.investments.update.useMutation({
    onSuccess: () => utils.finance.investments.list.invalidate(),
  });
  const deleteInvestmentMutation = trpc.finance.investments.delete.useMutation({
    onSuccess: () => utils.finance.investments.list.invalidate(),
  });

  const seedCategoriesMutation = trpc.finance.categories.seedDefaults.useMutation({
    onSuccess: () => utils.finance.categories.list.invalidate(),
  });

  // Na primeira vez que o usuário não tem NENHUMA categoria (conta nova, ou
  // conta antiga de antes de existir esse seed), cria as categorias padrão
  // como linhas reais — passam a ser editáveis/removíveis normalmente.
  const seedAttempted = useRef(false);
  useEffect(() => {
    if (!categoriesLoading && categoriesData.length === 0 && !seedAttempted.current) {
      seedAttempted.current = true;
      seedCategoriesMutation.mutate();
    }
  }, [categoriesLoading, categoriesData.length, seedCategoriesMutation]);

  const allCategories = categoriesData;

  // Filtrar transações por mês e ano selecionado.
  // Usa getUTC* porque a data é salva ancorada em meia-noite UTC — ler com
  // getMonth()/getFullYear() (fuso local) empurra o dia pro anterior em
  // qualquer fuso atrás de UTC, como o do Brasil.
  const filteredTransactions = transactionsData.filter(transaction => {
    const transDate = new Date(transaction.date);
    return transDate.getUTCMonth() === selectedMonth && transDate.getUTCFullYear() === selectedYear;
  });

  // Calcular receitas, despesas e investimentos do mês
  const receitas = filteredTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const despesas = filteredTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Sem Math.abs aqui de propósito: resgate de investimento é lançado com
  // valor negativo, e precisa REDUZIR o total investido, não aumentar.
  const investimentos = filteredTransactions
    .filter(t => t.type === 'investimento')
    .reduce((sum, t) => sum + t.amount, 0);

  const saldo = receitas - despesas;
  const economia = receitas - despesas - investimentos;

  // Calcular TOTAL investido de TODOS os meses e anos (líquido de resgates)
  const totalInvestido = transactionsData
    .filter(t => t.type === 'investimento')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calcular dados mensais dos últimos 6 meses
  const monthlyData: MonthlyData[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();

    const monthTransactions = transactionsData.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getUTCMonth() === month && tDate.getUTCFullYear() === year;
    });

    const monthReceitas = monthTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthDespesas = monthTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    monthlyData.push({
      month: date.toLocaleString('pt-BR', { month: 'short' }),
      receitas: monthReceitas,
      despesas: monthDespesas
    });
  }

  // Calcular despesas por categoria do mês (percentual real em relação ao total de despesas,
  // e cor vinda da categoria cadastrada, com fallback pro mapa estático)
  const categoryMap = new Map<string, number>();

  filteredTransactions
    .filter(t => t.type === 'despesa')
    .forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + Math.abs(t.amount));
    });

  const categoryExpenses: CategoryExpense[] = Array.from(categoryMap.entries()).map(([category, value]) => {
    const matchedCategory = categoriesData.find(c => c.name === category);
    return {
      name: category,
      value,
      percentage: despesas > 0 ? (value / despesas) * 100 : 0,
      color: matchedCategory?.color || CATEGORY_COLORS[category] || '#808080',
    };
  });

  // Calcular percentual de investimentos DO MES SELECIONADO
  const investmentPercentage = receitas > 0 ? (investimentos / receitas) * 100 : 0;

  const investmentData: InvestmentData = {
    percentage: Math.min(investmentPercentage, 100),
    total: investimentos
  };

  // Transações recentes
  const recentTransactions = [...transactionsData]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Funções para adicionar/editar/deletar transações
  const addTransaction = useCallback(async (data: {
    date: string;
    description: string;
    category: string;
    type: 'receita' | 'despesa' | 'investimento';
    amount: number;
    fixedAccountId?: number;
    goalId?: number;
  }) => {
    try {
      await addTransactionMutation.mutateAsync(data);
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  }, [addTransactionMutation]);

  const updateTransaction = useCallback(async (id: number, data: {
    date: string;
    description: string;
    category: string;
    type: 'receita' | 'despesa' | 'investimento';
    amount: number;
  }) => {
    try {
      await updateTransactionMutation.mutateAsync({ id, ...data });
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    }
  }, [updateTransactionMutation]);

  const deleteTransaction = useCallback(async (id: number) => {
    try {
      await deleteTransactionMutation.mutateAsync({ id });
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      throw error;
    }
  }, [deleteTransactionMutation]);

  // Funções para adicionar/editar/deletar categorias
  const addCategory = useCallback(async (data: {
    name: string;
    type: 'receita' | 'despesa' | 'investimento';
    color: string;
  }) => {
    try {
      await addCategoryMutation.mutateAsync(data);
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      throw error;
    }
  }, [addCategoryMutation]);

  const updateCategory = useCallback(async (id: number, data: {
    name: string;
    color: string;
  }) => {
    try {
      await updateCategoryMutation.mutateAsync({ id, ...data });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  }, [updateCategoryMutation]);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      await deleteCategoryMutation.mutateAsync({ id });
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  }, [deleteCategoryMutation]);

  // Funções para adicionar/editar/deletar parcelamentos
  // Os campos aqui precisam bater exatamente com o schema (finalMonth/finalYear, não existe startMonth/endMonth no banco)
  const addInstallment = useCallback(async (data: {
    name: string;
    totalValue: number;
    monthlyValue: number;
    finalMonth: number;
    finalYear: number;
    paidUntilMonth: number;
    paidUntilYear: number;
  }) => {
    try {
      await addInstallmentMutation.mutateAsync({
        name: data.name,
        totalValue: data.totalValue.toString(),
        monthlyValue: data.monthlyValue.toString(),
        finalMonth: data.finalMonth,
        finalYear: data.finalYear,
        paidUntilMonth: data.paidUntilMonth,
        paidUntilYear: data.paidUntilYear,
      });
    } catch (error) {
      console.error('Erro ao adicionar parcelamento:', error);
      throw error;
    }
  }, [addInstallmentMutation]);

  const updateInstallment = useCallback(async (id: number, data: {
    name: string;
    totalValue: number;
    monthlyValue: number;
    finalMonth: number;
    finalYear: number;
    paidUntilMonth: number;
    paidUntilYear: number;
  }) => {
    try {
      await updateInstallmentMutation.mutateAsync({
        id,
        name: data.name,
        totalValue: data.totalValue.toString(),
        monthlyValue: data.monthlyValue.toString(),
        finalMonth: data.finalMonth,
        finalYear: data.finalYear,
        paidUntilMonth: data.paidUntilMonth,
        paidUntilYear: data.paidUntilYear,
      });
    } catch (error) {
      console.error('Erro ao atualizar parcelamento:', error);
      throw error;
    }
  }, [updateInstallmentMutation]);

  const deleteInstallment = useCallback(async (id: number) => {
    try {
      await deleteInstallmentMutation.mutateAsync({ id });
    } catch (error) {
      console.error('Erro ao deletar parcelamento:', error);
      throw error;
    }
  }, [deleteInstallmentMutation]);

  // Funções para adicionar/editar/deletar contas fixas
  // Antes essa aba só existia em localStorage; agora usa o mesmo backend das demais
  const addFixedAccount = useCallback(async (data: {
    name: string;
    value: number;
    dueDay: number;
  }) => {
    try {
      await addFixedAccountMutation.mutateAsync({
        name: data.name,
        value: data.value.toString(),
        dueDay: data.dueDay,
      });
    } catch (error) {
      console.error('Erro ao adicionar conta fixa:', error);
      throw error;
    }
  }, [addFixedAccountMutation]);

  const updateFixedAccount = useCallback(async (id: number, data: {
    name: string;
    value: number;
    dueDay: number;
  }) => {
    try {
      await updateFixedAccountMutation.mutateAsync({
        id,
        name: data.name,
        value: data.value.toString(),
        dueDay: data.dueDay,
      });
    } catch (error) {
      console.error('Erro ao atualizar conta fixa:', error);
      throw error;
    }
  }, [updateFixedAccountMutation]);

  const deleteFixedAccount = useCallback(async (id: number) => {
    try {
      await deleteFixedAccountMutation.mutateAsync({ id });
    } catch (error) {
      console.error('Erro ao deletar conta fixa:', error);
      throw error;
    }
  }, [deleteFixedAccountMutation]);

  // Marcar uma conta fixa como paga NO MÊS SELECIONADO cria uma transação de
  // despesa de verdade, ligada a ela — é isso que faz o valor entrar no
  // orçamento do mês. Enquanto não for marcada, ela fica só "em aberto" e não
  // conta em receitas/despesas/saldo.
  const payFixedAccount = useCallback(async (account: { id: number; name: string; value: number | string; dueDay: number }) => {
    const value = typeof account.value === 'string' ? parseFloat(account.value) : account.value;
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const day = Math.min(account.dueDay, daysInMonth);
    const paidDate = new Date(selectedYear, selectedMonth, day).toISOString().split('T')[0];

    try {
      await addTransactionMutation.mutateAsync({
        description: account.name,
        category: account.name,
        type: 'despesa',
        amount: value,
        date: paidDate,
        fixedAccountId: account.id,
      });
    } catch (error) {
      console.error('Erro ao marcar conta fixa como paga:', error);
      throw error;
    }
  }, [addTransactionMutation, selectedMonth, selectedYear]);

  // Desfaz o pagamento: apaga a transação vinculada, a conta volta a ficar em aberto.
  const unpayFixedAccount = useCallback(async (transactionId: number) => {
    try {
      await deleteTransactionMutation.mutateAsync({ id: transactionId });
    } catch (error) {
      console.error('Erro ao desfazer pagamento da conta fixa:', error);
      throw error;
    }
  }, [deleteTransactionMutation]);

  // Metas financeiras
  const addGoal = useCallback(async (data: { name: string; targetValue: number; targetMonth?: number; targetYear?: number }) => {
    try {
      await addGoalMutation.mutateAsync({
        name: data.name,
        targetValue: data.targetValue.toString(),
        targetMonth: data.targetMonth,
        targetYear: data.targetYear,
      });
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
      throw error;
    }
  }, [addGoalMutation]);

  const updateGoal = useCallback(async (id: number, data: { name: string; targetValue: number; targetMonth?: number; targetYear?: number }) => {
    try {
      await updateGoalMutation.mutateAsync({
        id,
        name: data.name,
        targetValue: data.targetValue.toString(),
        targetMonth: data.targetMonth,
        targetYear: data.targetYear,
      });
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      throw error;
    }
  }, [updateGoalMutation]);

  const deleteGoal = useCallback(async (id: number) => {
    try {
      await deleteGoalMutation.mutateAsync({ id });
    } catch (error) {
      console.error('Erro ao deletar meta:', error);
      throw error;
    }
  }, [deleteGoalMutation]);

  // Investimentos
  const addInvestment = useCallback(async (data: { name: string; category: string }) => {
    try {
      await addInvestmentMutation.mutateAsync(data);
    } catch (error) {
      console.error('Erro ao adicionar investimento:', error);
      throw error;
    }
  }, [addInvestmentMutation]);

  const updateInvestment = useCallback(async (id: number, data: { name: string; category: string }) => {
    try {
      await updateInvestmentMutation.mutateAsync({ id, ...data });
    } catch (error) {
      console.error('Erro ao atualizar investimento:', error);
      throw error;
    }
  }, [updateInvestmentMutation]);

  const deleteInvestment = useCallback(async (id: number) => {
    try {
      await deleteInvestmentMutation.mutateAsync({ id });
    } catch (error) {
      console.error('Erro ao deletar investimento:', error);
      throw error;
    }
  }, [deleteInvestmentMutation]);

  // Aporte: transação de investimento com valor POSITIVO, ligada ao investimento.
  const contributeToInvestment = useCallback(async (investmentId: number, amount: number, name: string, category: string) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await addTransactionMutation.mutateAsync({
        description: `Aporte: ${name}`,
        category,
        type: 'investimento',
        amount,
        date: today,
        investmentId,
      });
    } catch (error) {
      console.error('Erro ao aportar no investimento:', error);
      throw error;
    }
  }, [addTransactionMutation]);

  // Resgate: mesma coisa, mas com valor NEGATIVO — é isso que reduz o saldo
  // do investimento e libera esse dinheiro de volta pro seu orçamento.
  const withdrawFromInvestment = useCallback(async (investmentId: number, amount: number, name: string, category: string) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await addTransactionMutation.mutateAsync({
        description: `Resgate: ${name}`,
        category,
        type: 'investimento',
        amount: -Math.abs(amount),
        date: today,
        investmentId,
      });
    } catch (error) {
      console.error('Erro ao resgatar do investimento:', error);
      throw error;
    }
  }, [addTransactionMutation]);

  // Contribuir com uma meta cria uma transação de investimento de verdade,
  // ligada a ela — mesmo padrão das contas fixas. O progresso nunca desalinha
  // da realidade porque é sempre a soma dessas transações, nunca um número solto.
  const contributeToGoal = useCallback(async (goalId: number, amount: number, goalName: string) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await addTransactionMutation.mutateAsync({
        description: `Meta: ${goalName}`,
        category: goalName,
        type: 'investimento',
        amount,
        date: today,
        goalId,
      });
    } catch (error) {
      console.error('Erro ao contribuir com a meta:', error);
      throw error;
    }
  }, [addTransactionMutation]);

  // Cada meta acompanhada do quanto já foi contribuído (soma de todas as
  // transações ligadas a ela, em qualquer mês) e do percentual concluído.
  const goalsWithProgress = goalsData.map((goal: any) => {
    const target = typeof goal.targetValue === 'string' ? parseFloat(goal.targetValue) : goal.targetValue;
    const currentValue = transactionsData
      .filter((t: any) => t.goalId === goal.id)
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
    const percentage = target > 0 ? Math.min(100, (currentValue / target) * 100) : 0;
    return { ...goal, targetValue: target, currentValue, percentage };
  });

  // Saldo de cada investimento = soma líquida (sem Math.abs) dos aportes e
  // resgates ligados a ele — resgate é lançado com valor negativo.
  const investmentsWithBalance = investmentsData.map((investment: any) => {
    const linkedTransactions = transactionsData
      .filter((t: any) => t.investmentId === investment.id)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const balance = linkedTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);
    return { ...investment, balance, transactions: linkedTransactions };
  });

  return {
    selectedMonth,
    selectedYear,
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
    filteredTransactions,
    allCategories,
    installments: installmentsData,
    fixedAccounts: fixedAccountsData,
    goals: goalsWithProgress,
    investments: investmentsWithBalance,
    isLoading: transactionsLoading || categoriesLoading || installmentsLoading || fixedAccountsLoading || goalsLoading || investmentsLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addInstallment,
    updateInstallment,
    deleteInstallment,
    addFixedAccount,
    updateFixedAccount,
    deleteFixedAccount,
    payFixedAccount,
    unpayFixedAccount,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    contributeToInvestment,
    withdrawFromInvestment,
  };
}
