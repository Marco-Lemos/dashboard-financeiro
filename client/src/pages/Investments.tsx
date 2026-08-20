/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Investimentos — cada um é uma posição com saldo próprio. Aportar soma,
 * resgatar subtrai — ambos criam uma transação real ligada ao investimento,
 * então o saldo nunca é um número solto, é sempre a soma do que realmente
 * aconteceu.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit2, Plus, TrendingUp, ArrowUpCircle, ArrowDownCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useFinanceData } from '@/hooks/useFinanceData';
import { INVESTMENT_CATEGORIES } from '@/types/finance';

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Investments() {
  const { investments, addInvestment, updateInvestment, deleteInvestment, contributeToInvestment, withdrawFromInvestment } = useFinanceData();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'aporte' | 'resgate' | null>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', category: INVESTMENT_CATEGORIES[0] as string });

  const resetForm = () => {
    setForm({ name: '', category: INVESTMENT_CATEGORIES[0] });
    setEditingId(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleEdit = (investment: any) => {
    setForm({ name: investment.name, category: investment.category });
    setEditingId(investment.id);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error('Digite um nome para o investimento');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await updateInvestment(editingId, form);
        toast.success('Investimento atualizado!');
      } else {
        await addInvestment(form);
        toast.success('Investimento criado!');
      }
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      toast.error('Não foi possível salvar o investimento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteInvestment(id);
      toast.success('Investimento removido!');
    } catch (error) {
      toast.error('Não foi possível remover o investimento. Tente novamente.');
    }
  };

  const openAction = (id: number, type: 'aporte' | 'resgate') => {
    setActionId(id);
    setActionType(type);
    setActionAmount('');
  };

  const closeAction = () => {
    setActionId(null);
    setActionType(null);
    setActionAmount('');
  };

  const handleConfirmAction = async (investment: any) => {
    const value = parseFloat(actionAmount);
    if (!value || value <= 0) {
      toast.error('Digite um valor válido');
      return;
    }
    if (actionType === 'resgate' && value > investment.balance) {
      toast.error('Esse resgate é maior que o saldo disponível nesse investimento');
      return;
    }

    setSubmitting(true);
    try {
      if (actionType === 'aporte') {
        await contributeToInvestment(investment.id, value, investment.name, investment.category);
        toast.success('Aporte adicionado!');
      } else {
        await withdrawFromInvestment(investment.id, value, investment.name, investment.category);
        toast.success('Resgate registrado!');
      }
      closeAction();
    } catch (error) {
      toast.error('Não foi possível concluir. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalInvestido = investments.reduce((sum: number, i: any) => sum + i.balance, 0);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 backdrop-blur-xl">
        <div className="container py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight">Investimentos</h1>
              <p className="text-muted-foreground mt-1">
                Aporte ou resgate — o saldo de cada investimento reflete exatamente isso
              </p>
            </div>

            <Dialog open={openDialog} onOpenChange={(open) => { setOpenDialog(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenNew} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-on-hover">
                  <Plus className="w-5 h-5 mr-2" />
                  Novo Investimento
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">
                    {editingId ? 'Editar Investimento' : 'Novo Investimento'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="inv-name">Nome</Label>
                    <Input
                      id="inv-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex: Carteira de Bitcoin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INVESTMENT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleSave} disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    {editingId ? 'Salvar' : 'Criar investimento'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="glass-card rounded-2xl p-6 mb-8">
          <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Total Investido</p>
          <h2 className="text-4xl font-bold font-display text-primary">{formatBRL(totalInvestido)}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investments.length === 0 ? (
            <div className="col-span-full glass-card rounded-2xl p-10 text-center">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum investimento ainda — crie o primeiro</p>
            </div>
          ) : (
            investments.map((investment: any) => (
              <div key={investment.id} className="glass-card rounded-2xl p-6 smooth-transition hover:shadow-2xl">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-lg">{investment.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{investment.category}</p>

                <p className="text-3xl font-bold font-display mb-4">{formatBRL(investment.balance)}</p>

                {actionId === investment.id ? (
                  <div className="flex gap-2 mb-3">
                    <Input
                      type="number"
                      step="0.01"
                      autoFocus
                      value={actionAmount}
                      onChange={(e) => setActionAmount(e.target.value)}
                      placeholder="Valor"
                      className="flex-1"
                    />
                    <Button size="sm" disabled={submitting} onClick={() => handleConfirmAction(investment)} className="bg-primary hover:bg-primary/90">
                      OK
                    </Button>
                    <Button size="sm" variant="outline" onClick={closeAction}>
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 mb-3">
                    <Button size="sm" onClick={() => openAction(investment.id, 'aporte')} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                      <ArrowUpCircle className="w-4 h-4 mr-1" />
                      Aportar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openAction(investment.id, 'resgate')} className="flex-1">
                      <ArrowDownCircle className="w-4 h-4 mr-1" />
                      Resgatar
                    </Button>
                  </div>
                )}

                {investment.transactions.length > 0 && (
                  <button
                    onClick={() => setExpandedId(expandedId === investment.id ? null : investment.id)}
                    className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground smooth-transition mb-2"
                  >
                    <span>Histórico ({investment.transactions.length})</span>
                    {expandedId === investment.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}

                {expandedId === investment.id && (
                  <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
                    {investment.transactions.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between text-xs bg-background/50 rounded-lg px-3 py-2">
                        <span className="text-muted-foreground">
                          {new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </span>
                        <span className={t.amount >= 0 ? 'text-primary font-semibold' : 'text-destructive font-semibold'}>
                          {t.amount >= 0 ? '+' : ''}{formatBRL(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(investment)} className="flex-1 hover:bg-white/10">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(investment.id)} className="flex-1 hover:bg-destructive/10 text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
