/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Página de todas as transações com tabela editável
 * Com efeito 3D fluido ao passar o mouse
 */

import { useState } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useMonth } from '@/contexts/MonthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, MONTHS, YEARS } from '@/types/finance';
import { toast } from 'sonner';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { useTilt3D } from '@/hooks/useTilt3D';

export default function Transactions() {
  const {
    filteredTransactions,
    updateTransaction,
    deleteTransaction,
    addTransaction,
    allCategories,
  } = useFinanceData();

  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useMonth();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [openDialog, setOpenDialog] = useState(false);
  const { cardRef, tiltState, handleMouseMove, handleMouseLeave } = useTilt3D();

  const handleEdit = (transaction: any) => {
    setEditingId(transaction.id);
    setEditValues({
      ...transaction,
      // Normaliza a data para string (yyyy-mm-dd) uma única vez aqui.
      // Manter um Date por baixo quebrava o input (Date não tem .toISOString ao ser re-lido como string)
      // e fazia o backend rejeitar a validação quando o campo não era tocado.
      date: new Date(transaction.date).toISOString().split('T')[0],
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      await updateTransaction(editingId, {
        date: editValues.date,
        description: editValues.description,
        category: editValues.category,
        type: editValues.type,
        // O input de valor escreve em editValues.value (não .amount) — usar o campo certo
        // evita perder silenciosamente a edição do valor.
        amount: editValues.value,
      });
      setEditingId(null);
      toast.success('Transação atualizada com sucesso!');
    } catch (error) {
      toast.error('Não foi possível atualizar a transação. Tente novamente.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      toast.success('Transação deletada com sucesso!');
    } catch (error) {
      toast.error('Não foi possível deletar a transação. Tente novamente.');
    }
  };

  // Transações já vêm filtradas do hook, apenas ordenar
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const categories = (editValues.type === 'receita' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES) || [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl">
        <div className="container py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight">
                Todas as Transações
              </h1>
              <p className="text-muted-foreground mt-1">
                {MONTHS[selectedMonth]} {selectedYear}
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

              <AddTransactionDialog onAddTransaction={addTransaction} categories={allCategories} />
            </div>
          </div>
        </div>
      </header>

      {/* Table */}
      <main className="container py-8">
        <div
          ref={cardRef}
          className="glass-card rounded-2xl overflow-hidden relative"
          style={{
            transform: tiltState.transform,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.1s ease-out',
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Efeito de brilho dinâmico */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            style={{
              background: `radial-gradient(circle 200px at ${tiltState.glowPosition.x}% ${tiltState.glowPosition.y}%, rgba(255, 255, 255, 0.15) 0%, transparent 80%)`,
              transition: 'background 0.05s ease-out',
            }}
          />

          <div className="relative z-10 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Data</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Descrição</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Categoria</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Tipo</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground">Valor</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      Nenhuma transação encontrada
                    </td>
                  </tr>
                ) : (
                sortedTransactions.map((transaction: any) => (
                    <tr key={transaction.id} className="border-b border-border/50 hover:bg-white/5 smooth-transition">
                      <td className="px-6 py-4 text-sm">
                        {editingId === transaction.id ? (
                          <Input
                            type="date"
                            value={editValues.date || ''}
                            onChange={(e) => setEditValues({ ...editValues, date: e.target.value })}
                            className="glass-card border-border"
                          />
                        ) : (
                          new Date(transaction.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingId === transaction.id ? (
                          <Input
                            value={editValues.description || ''}
                            onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                            className="glass-card border-border"
                          />
                        ) : (
                          <span style={{
                            color: transaction.type === 'receita' ? '#22c55e' : transaction.type === 'despesa' ? '#ef4444' : '#3b82f6'
                          }}>
                            {transaction.description}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingId === transaction.id ? (
                          <Select
                            value={editValues.category || ''}
                            onValueChange={(value) => setEditValues({ ...editValues, category: value })}
                          >
                            <SelectTrigger className="glass-card border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          transaction.category
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingId === transaction.id ? (
                          <Select
                            value={editValues.type || ''}
                            onValueChange={(value) => setEditValues({ ...editValues, type: value })}
                          >
                            <SelectTrigger className="glass-card border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="receita">Receita</SelectItem>
                              <SelectItem value="despesa">Despesa</SelectItem>
                              <SelectItem value="investimento">Investimento</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span style={{
                            color: transaction.type === 'receita' ? '#22c55e' : transaction.type === 'despesa' ? '#ef4444' : '#3b82f6'
                          }}>
                            {transaction.type === 'receita' ? 'Receita' : transaction.type === 'despesa' ? 'Despesa' : 'Investimento'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        {editingId === transaction.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editValues.value || ''}
                            onChange={(e) => setEditValues({ ...editValues, value: parseFloat(e.target.value) })}
                            className="glass-card border-border"
                          />
                        ) : (
                        (() => {
                          const raw = transaction.amount ?? transaction.value;
                          const isNegative = raw < 0;
                          const sign = transaction.type === 'receita' ? '+' : transaction.type === 'despesa' ? '-' : (isNegative ? '-' : '+');
                          return (
                            <span className="font-bold" style={{
                              color: transaction.type === 'receita' ? '#22c55e' : transaction.type === 'despesa' ? '#ef4444' : '#3b82f6'
                            }}>
                              {sign}R$ {Math.abs(raw).toFixed(2)}
                            </span>
                          );
                        })()
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editingId === transaction.id ? (
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              onClick={handleSave}
                              className="bg-primary hover:bg-primary/90"
                            >
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(transaction)}
                              className="hover:bg-white/10"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(transaction.id)}
                              className="hover:bg-destructive/10 text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
