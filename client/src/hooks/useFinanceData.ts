import { useCallback } from 'react';
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

  const allCategories = categoriesData;

  // Filtrar transações por mês e ano selecionado
  const filteredTransactions = transactionsData.filter(transaction => {
    const transDate = new Date(transaction.date);
    return transDate.getMonth() === selectedMonth && transDate.getFullYear() === selectedYear;
  });

  // Calcular receitas, despesas e investimentos do mês
  const receitas = filteredTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const despesas = filteredTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const investimentos = filteredTransactions
    .filter(t => t.type === 'investimento')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const saldo = receitas - despesas;
  const economia = receitas - despesas - investimentos;

  // Calcular TOTAL investido de TODOS os meses e anos
  const totalInvestido = transactionsData
    .filter(t => t.type === 'investimento')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Calcular dados mensais dos últimos 6 meses
  const monthlyData: MonthlyData[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();

    const monthTransactions = transactionsData.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === month && tDate.getFullYear() === year;
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
    isLoading: transactionsLoading || categoriesLoading || installmentsLoading || fixedAccountsLoading,
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
  };
}
