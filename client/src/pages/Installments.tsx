/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Página de Parcelamentos com CRUD completo
 */

import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinanceData } from '@/hooks/useFinanceData';
import { MONTHS } from '@/types/finance';
import { toast } from 'sonner';

// Os campos aqui batem exatamente com o que o banco/servidor esperam
// (finalMonth/finalYear). O formulário original tinha também startMonth/startYear,
// mas esses campos nunca existiram no schema — eram descartados silenciosamente.
interface InstallmentFormData {
  name: string;
  totalValue: number;
  monthlyValue: number;
  finalMonth: number;
  finalYear: number;
  paidUntilMonth: number;
  paidUntilYear: number;
}

export default function Installments() {
  const { installments, addInstallment, updateInstallment, deleteInstallment, selectedMonth, selectedYear } = useFinanceData();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<InstallmentFormData>({
    name: '',
    totalValue: 0,
    monthlyValue: 0,
    finalMonth: selectedMonth,
    finalYear: selectedYear,
    paidUntilMonth: selectedMonth,
    paidUntilYear: selectedYear,
  });

  const handleOpenDialog = () => {
    setFormData({
      name: '',
      totalValue: 0,
      monthlyValue: 0,
      finalMonth: selectedMonth,
      finalYear: selectedYear,
      paidUntilMonth: selectedMonth,
      paidUntilYear: selectedYear,
    });
    setEditingId(null);
    setIsOpen(true);
  };

  const handleEdit = (installment: any) => {
    setFormData({
      name: installment.name,
      totalValue: typeof installment.totalValue === 'string' ? parseFloat(installment.totalValue) : installment.totalValue,
      monthlyValue: typeof installment.monthlyValue === 'string' ? parseFloat(installment.monthlyValue) : installment.monthlyValue,
      finalMonth: installment.finalMonth,
      finalYear: installment.finalYear,
      paidUntilMonth: installment.paidUntilMonth,
      paidUntilYear: installment.paidUntilYear,
    });
    setEditingId(installment.id);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || formData.totalValue <= 0 || formData.monthlyValue <= 0) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }

    try {
      if (editingId) {
        await updateInstallment(editingId, formData);
        toast.success('Parcelamento atualizado!');
      } else {
        await addInstallment(formData);
        toast.success('Parcelamento adicionado!');
      }
      setIsOpen(false);
    } catch (error) {
      toast.error('Não foi possível salvar o parcelamento. Tente novamente.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteInstallment(id);
      toast.success('Parcelamento removido!');
    } catch (error) {
      toast.error('Não foi possível remover o parcelamento. Tente novamente.');
    }
  };

  const calculateRemaining = (installment: any) => {
    const monthlyValue = typeof installment.monthlyValue === 'string' ? parseFloat(installment.monthlyValue) : installment.monthlyValue;
    const paidMonths = (installment.paidUntilYear * 12) + installment.paidUntilMonth;
    const totalMonths = (installment.finalYear * 12) + installment.finalMonth;
    const remainingMonths = Math.max(0, totalMonths - paidMonths);
    return remainingMonths * monthlyValue;
  };

  // Progresso em % baseado no valor já pago. A versão original dividia
  // paidUntilMonth por finalMonth diretamente, ignorando o ano por completo
  // e quebrando quando o mês final era Janeiro (índice 0 é "falsy" em JS).
  const calculateProgress = (installment: any) => {
    const totalValue = typeof installment.totalValue === 'string' ? parseFloat(installment.totalValue) : installment.totalValue;
    if (totalValue <= 0) return 0;
    const remaining = calculateRemaining(installment);
    const paid = Math.max(0, totalValue - remaining);
    return Math.min(100, (paid / totalValue) * 100);
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 backdrop-blur-xl">
        <div className="container py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight">
                Parcelamentos
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie seus parcelamentos e acompanhe o progresso
              </p>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={handleOpenDialog}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Parcelamento
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {editingId ? 'Editar Parcelamento' : 'Novo Parcelamento'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Nome</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Notebook"
                      className="bg-background border-border text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Valor Total</label>
                      <Input
                        type="number"
                        value={formData.totalValue}
                        onChange={(e) => setFormData({ ...formData, totalValue: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        step="0.01"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Valor da Parcela</label>
                      <Input
                        type="number"
                        value={formData.monthlyValue}
                        onChange={(e) => setFormData({ ...formData, monthlyValue: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        step="0.01"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Mês Final</label>
                      <Select value={formData.finalMonth.toString()} onValueChange={(v) => setFormData({ ...formData, finalMonth: parseInt(v) })}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {MONTHS.map((month, idx) => (
                            <SelectItem key={idx} value={idx.toString()}>{month}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Ano Final</label>
                      <Select value={formData.finalYear.toString()} onValueChange={(v) => setFormData({ ...formData, finalYear: parseInt(v) })}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {[2024, 2025, 2026, 2027].map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Pago até (Mês)</label>
                      <Select value={formData.paidUntilMonth.toString()} onValueChange={(v) => setFormData({ ...formData, paidUntilMonth: parseInt(v) })}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {MONTHS.map((month, idx) => (
                            <SelectItem key={idx} value={idx.toString()}>{month}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Pago até (Ano)</label>
                      <Select value={formData.paidUntilYear.toString()} onValueChange={(v) => setFormData({ ...formData, paidUntilYear: parseInt(v) })}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {[2024, 2025, 2026, 2027].map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {editingId ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Lista de Parcelamentos */}
      <main className="container py-8">
        <div className="space-y-4">
          {installments && installments.length > 0 ? (
            installments.map((installment: any) => (
              <div key={installment.id} className="bg-card border border-border rounded-lg p-6 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{installment.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(installment.monthlyValue)} por mês
                  </p>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span>Total: {formatCurrency(installment.totalValue)}</span>
                    <span>Restante: {formatCurrency(calculateRemaining(installment))}</span>
                  </div>
                  <div className="mt-3 w-full">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progresso</span>
                      <span>{Math.round(calculateProgress(installment))}%</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${calculateProgress(installment)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(installment)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(installment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum parcelamento cadastrado</p>
          )}
        </div>
      </main>
    </div>
  );
}
