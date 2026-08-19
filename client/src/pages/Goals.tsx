/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Metas financeiras — contribuir gera uma transação de investimento real,
 * ligada à meta, então o progresso nunca desalinha do que realmente aconteceu.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit2, Plus, Target, PiggyBank } from 'lucide-react';
import { toast } from 'sonner';
import { useFinanceData } from '@/hooks/useFinanceData';
import { MONTHS, YEARS } from '@/types/finance';

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, contributeToGoal } = useFinanceData();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [contributingId, setContributingId] = useState<number | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    targetValue: '',
    hasDate: false,
    targetMonth: new Date().getMonth().toString(),
    targetYear: new Date().getFullYear().toString(),
  });

  const resetForm = () => {
    setForm({
      name: '',
      targetValue: '',
      hasDate: false,
      targetMonth: new Date().getMonth().toString(),
      targetYear: new Date().getFullYear().toString(),
    });
    setEditingId(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleEdit = (goal: any) => {
    setForm({
      name: goal.name,
      targetValue: goal.targetValue.toString(),
      hasDate: goal.targetMonth != null && goal.targetYear != null,
      targetMonth: (goal.targetMonth ?? new Date().getMonth()).toString(),
      targetYear: (goal.targetYear ?? new Date().getFullYear()).toString(),
    });
    setEditingId(goal.id);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    const target = parseFloat(form.targetValue);
    if (!form.name || !target || target <= 0) {
      toast.error('Preencha nome e valor da meta corretamente');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        targetValue: target,
        targetMonth: form.hasDate ? parseInt(form.targetMonth) : undefined,
        targetYear: form.hasDate ? parseInt(form.targetYear) : undefined,
      };
      if (editingId) {
        await updateGoal(editingId, payload);
        toast.success('Meta atualizada!');
      } else {
        await addGoal(payload);
        toast.success('Meta criada!');
      }
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      toast.error('Não foi possível salvar a meta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteGoal(id);
      toast.success('Meta removida!');
    } catch (error) {
      toast.error('Não foi possível remover a meta. Tente novamente.');
    }
  };

  const handleContribute = async (goal: any) => {
    const value = parseFloat(contributionAmount);
    if (!value || value <= 0) {
      toast.error('Digite um valor válido');
      return;
    }
    setSubmitting(true);
    try {
      await contributeToGoal(goal.id, value, goal.name);
      toast.success('Contribuição adicionada!');
      setContributingId(null);
      setContributionAmount('');
    } catch (error) {
      toast.error('Não foi possível adicionar a contribuição. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 backdrop-blur-xl">
        <div className="container py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight">Metas</h1>
              <p className="text-muted-foreground mt-1">
                Defina um objetivo e acompanhe o progresso de verdade
              </p>
            </div>

            <Dialog open={openDialog} onOpenChange={(open) => { setOpenDialog(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenNew} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-on-hover">
                  <Plus className="w-5 h-5 mr-2" />
                  Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">
                    {editingId ? 'Editar Meta' : 'Nova Meta'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-name">Nome da meta</Label>
                    <Input
                      id="goal-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex: Viagem para a praia"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal-target">Valor alvo (R$)</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      step="0.01"
                      value={form.targetValue}
                      onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                      placeholder="5000.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={form.hasDate}
                        onChange={(e) => setForm({ ...form, hasDate: e.target.checked })}
                      />
                      Definir um prazo
                    </label>
                  </div>

                  {form.hasDate && (
                    <div className="grid grid-cols-2 gap-3">
                      <Select value={form.targetMonth} onValueChange={(v) => setForm({ ...form, targetMonth: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((month, idx) => (
                            <SelectItem key={idx} value={idx.toString()}>{month}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={form.targetYear} onValueChange={(v) => setForm({ ...form, targetYear: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {YEARS.map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button onClick={handleSave} disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    {editingId ? 'Salvar' : 'Criar meta'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.length === 0 ? (
            <div className="col-span-full glass-card rounded-2xl p-10 text-center">
              <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhuma meta ainda — crie a primeira e comece a acompanhar</p>
            </div>
          ) : (
            goals.map((goal: any) => {
              const isComplete = goal.percentage >= 100;
              const hasDeadline = goal.targetMonth != null && goal.targetYear != null;

              return (
                <div key={goal.id} className="glass-card rounded-2xl p-6 smooth-transition hover:shadow-2xl">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg pr-2">{goal.name}</h3>
                    {isComplete && <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full whitespace-nowrap">Concluída 🎉</span>}
                  </div>

                  {hasDeadline && (
                    <p className="text-xs text-muted-foreground mb-3">Meta: {MONTHS[goal.targetMonth]}/{goal.targetYear}</p>
                  )}

                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-display">{formatBRL(goal.currentValue)}</span>
                    <span className="text-sm text-muted-foreground">de {formatBRL(goal.targetValue)}</span>
                  </div>

                  <div className="w-full bg-background rounded-full h-2.5 mb-1">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all"
                      style={{ width: `${goal.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{goal.percentage.toFixed(0)}% concluído</p>

                  {contributingId === goal.id ? (
                    <div className="flex gap-2 mb-3">
                      <Input
                        type="number"
                        step="0.01"
                        autoFocus
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        placeholder="Valor"
                        className="flex-1"
                      />
                      <Button size="sm" disabled={submitting} onClick={() => handleContribute(goal)} className="bg-primary hover:bg-primary/90">
                        OK
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setContributingId(null); setContributionAmount(''); }}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setContributingId(goal.id)}
                      className="w-full mb-3 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <PiggyBank className="w-4 h-4 mr-2" />
                      Contribuir
                    </Button>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(goal)} className="flex-1 hover:bg-white/10">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(goal.id)} className="flex-1 hover:bg-destructive/10 text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
