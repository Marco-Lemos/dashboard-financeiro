/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Dialog para adicionar novas transações com formulário completo
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { TransactionType, Category, EXPENSE_CATEGORIES, INCOME_CATEGORIES, INVESTMENT_CATEGORIES } from '@/types/finance';
import { toast } from 'sonner';

interface AddTransactionDialogProps {
  onAddTransaction: (transaction: {
    type: 'receita' | 'despesa' | 'investimento';
    category: string;
    description: string;
    amount: number;
    date: string;
  }) => void;
  categories: Array<{ name: string; type: string }>;
  selectedMonth?: number;
  selectedYear?: number;
}

export function AddTransactionDialog({ onAddTransaction, categories: allCategories, selectedMonth, selectedYear }: AddTransactionDialogProps) {
  const getDefaultDate = () => {
    if (selectedMonth !== undefined && selectedYear !== undefined) {
      const today = new Date();
      const isCurrentMonth = selectedMonth === today.getMonth() && selectedYear === today.getFullYear();
      
      let day = 1;
      if (isCurrentMonth) {
        day = today.getDate();
      }
      
      // Formatar como YYYY-MM-DD sem problemas de timezone
      const month = String(selectedMonth + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      return `${selectedYear}-${month}-${dayStr}`;
    }
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'receita' | 'despesa' | 'investimento'>('despesa');
  const [category, setCategory] = useState<Category | ''>('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<string>(() => getDefaultDate());

  // Atualizar data quando o diálogo abre ou quando mês/ano mudam
  useEffect(() => {
    setDate(getDefaultDate());
  }, [open, selectedMonth, selectedYear]);

  const getCategories = () => {
    // Categorias cadastradas pelo usuário (banco de dados) para o tipo selecionado.
    // Se ainda não cadastrou nenhuma, cai nas categorias padrão.
    const custom = allCategories.filter(c => c.type === type).map(c => c.name);
    if (custom.length > 0) {
      return [...new Set(custom)];
    }
    if (type === 'despesa') return EXPENSE_CATEGORIES;
    if (type === 'receita') return INCOME_CATEGORIES;
    return INVESTMENT_CATEGORIES;
  }

  const categories = getCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !description || !amount) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const amountNumber = parseFloat(amount.replace(/\./g, '').replace(/,/g, '.'));
    if (isNaN(amountNumber) || amountNumber <= 0) {
      toast.error('Por favor, insira um valor válido');
      return;
    }

    try {
      await onAddTransaction({
        type,
        category: category as string,
        description,
        amount: amountNumber,
        date: date,
      });

      toast.success('Transação adicionada com sucesso!');
      
      // Reset form
      setCategory('');
      setDescription('');
      setAmount('');
      setOpen(false);
    } catch (error) {
      toast.error('Erro ao adicionar transação');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-on-hover">
          <Plus className="w-5 h-5 mr-2" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Nova Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(value) => {
              setType(value as TransactionType);
              setCategory('');
            }}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
                <SelectItem value="investimento">Investimento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value === '') {
                  setAmount('');
                } else {
                  const numValue = parseInt(value) / 100;
                  setAmount(numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                }
              }}
              placeholder="0,00"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            Adicionar Transação
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
