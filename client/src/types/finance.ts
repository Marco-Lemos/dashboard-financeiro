export type TransactionType = 'receita' | 'despesa' | 'investimento';

export type ExpenseCategory = 
  | 'Alimentação'
  | 'Entretenimento'
  | 'Contas'
  | 'Saúde'
  | 'Transporte'
  | 'Carro'
  | 'Educação'
  | 'Investimentos'
  | 'Outros';

export type IncomeCategory = 
  | 'Salário'
  | 'Freelance'
  | 'Investimentos'
  | 'Outros';

export type InvestmentCategory =
  | 'BTC'
  | 'Ações'
  | 'Terreno'
  | 'Imóvel';

export type Category = ExpenseCategory | IncomeCategory | InvestmentCategory;

export interface Transaction {
  id: string | number;
  type: 'receita' | 'despesa' | 'investimento';
  category: string;
  description: string;
  value: number;
  amount: number;
  date: Date;
}

export interface MonthlyData {
  month: string;
  receitas: number;
  despesas: number;
}

export interface CategoryExpense {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface InvestmentData {
  percentage: number;
  total: number;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Alimentação',
  'Entretenimento',
  'Contas',
  'Saúde',
  'Transporte',
  'Carro',
  'Educação',
  'Investimentos',
  'Outros'
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Outros'
];

export const INVESTMENT_CATEGORIES: InvestmentCategory[] = [
  'BTC',
  'Ações',
  'Terreno',
  'Imóvel'
];

// Paleta corporativa moderna para categorias
export const CATEGORY_COLORS: Record<string, string> = {
  'Alimentação': '#2563EB',      // Azul corporativo
  'Entretenimento': '#7C3AED',   // Roxo corporativo
  'Contas': '#059669',            // Verde corporativo
  'Saúde': '#DC2626',             // Vermelho corporativo
  'Transporte': '#0891B2',        // Ciano corporativo
  'Carro': '#F59E0B',             // Âmbar corporativo
  'Educação': '#EA580C',          // Laranja corporativo
  'Investimentos': '#10B981',     // Verde esmeralda
  'Outros': '#6B7280',             // Cinza corporativo
  'BTC': '#F7931A',               // Laranja Bitcoin
  'Acoes': '#00AA44',             // Verde acoes
  'Terreno': '#8B4513',           // Marrom terra
  'Imovel': '#D4A574'             // Bege imovel
};

// Ícones para categorias
export const CATEGORY_ICONS: Record<string, string> = {
  'Alimentação': '🍔',
  'Entretenimento': '🎬',
  'Contas': '📄',
  'Saúde': '🏥',
  'Transporte': '🚌',
  'Carro': '🚗',
  'Educação': '📚',
  'Investimentos': '📈',
  'Salário': '💰',
  'Freelance': '💻',
  'Outros': '📦'
};

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const YEARS = ['2025', '2026', '2027'];

export interface Installment {
  id: string | number;
  name: string;
  totalValue: number | string;
  monthlyValue: number | string;
  startMonth?: number;
  startYear?: number;
  endMonth?: number;
  endYear?: number;
  finalMonth: number;
  finalYear: number;
  paidUntilMonth: number;
  paidUntilYear: number;
}
