export interface FixedAccount {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDay: number; // Dia do mês (1-31)
  status: 'ativa' | 'paga' | 'atrasada';
  createdAt: Date;
}
