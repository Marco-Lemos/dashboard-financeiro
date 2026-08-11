/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Página de contas fixas com edição inline
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit2, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useFinanceData } from '@/hooks/useFinanceData';

// Nota: o schema do banco só guarda name, value, dueDay e status ('pago'/'pendente').
// O formulário original também tinha "categoria" e um terceiro status ("atrasada"),
// mas nenhum dos dois existe no banco — "categoria" nunca foi persistida e "atrasada"
// nunca chegava a ser atribuída pelo próprio código (só alternava ativa/paga).
export default function FixedAccounts() {
  const { fixedAccounts, addFixedAccount, updateFixedAccount, deleteFixedAccount } = useFinanceData();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    amount: '',
    dueDay: '1',
  });

  const handleAddAccount = async () => {
    if (!newAccount.name || !newAccount.amount) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      await addFixedAccount({
        name: newAccount.name,
        value: parseFloat(newAccount.amount),
        dueDay: parseInt(newAccount.dueDay),
        status: 'pendente',
      });
      setNewAccount({ name: '', amount: '', dueDay: '1' });
      setOpenDialog(false);
      toast.success('Conta fixa adicionada!');
    } catch (error) {
      toast.error('Não foi possível adicionar a conta fixa. Tente novamente.');
    }
  };

  const handleEdit = (account: any) => {
    setEditingId(account.id);
    setEditValues({
      name: account.name,
      amount: typeof account.value === 'string' ? parseFloat(account.value) : account.value,
      dueDay: account.dueDay,
    });
  };

  const handleSave = async () => {
    if (editingId === null) return;
    try {
      await updateFixedAccount(editingId, {
        name: editValues.name,
        value: editValues.amount,
        dueDay: editValues.dueDay,
        status: fixedAccounts.find((a: any) => a.id === editingId)?.status || 'pendente',
      });
      setEditingId(null);
      toast.success('Conta atualizada!');
    } catch (error) {
      toast.error('Não foi possível atualizar a conta. Tente novamente.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFixedAccount(id);
      toast.success('Conta deletada!');
    } catch (error) {
      toast.error('Não foi possível deletar a conta. Tente novamente.');
    }
  };

  const handleToggleStatus = async (account: any) => {
    const newStatus = account.status === 'pago' ? 'pendente' : 'pago';
    try {
      await updateFixedAccount(account.id, {
        name: account.name,
        value: typeof account.value === 'string' ? parseFloat(account.value) : account.value,
        dueDay: account.dueDay,
        status: newStatus,
      });
    } catch (error) {
      toast.error('Não foi possível atualizar o status. Tente novamente.');
    }
  };

  const totalMensal = fixedAccounts.reduce((sum: number, a: any) => {
    const value = typeof a.value === 'string' ? parseFloat(a.value) : a.value;
    return sum + value;
  }, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl">
        <div className="container py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight">
                Contas Fixas
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie suas contas recorrentes
              </p>
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-on-hover">
                  <Plus className="w-5 h-5 mr-2" />
                  Nova Conta Fixa
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">Nova Conta Fixa</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Conta</Label>
                    <Input
                      id="name"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                      placeholder="Ex: Aluguel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newAccount.amount}
                      onChange={(e) => setNewAccount({ ...newAccount, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDay">Dia do Vencimento</Label>
                    <Select value={newAccount.dueDay} onValueChange={(value) => setNewAccount({ ...newAccount, dueDay: value })}>
                      <SelectTrigger id="dueDay">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Dia {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleAddAccount} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    Adicionar Conta
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        {/* Total */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Total Mensal</p>
          <h2 className="text-4xl font-bold font-display">
            R$ {totalMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fixedAccounts.length === 0 ? (
            <div className="col-span-full glass-card rounded-2xl p-8 text-center">
              <p className="text-muted-foreground">Nenhuma conta fixa cadastrada</p>
            </div>
          ) : (
            fixedAccounts.map((account: any) => (
              <div key={account.id} className="glass-card rounded-2xl p-6 smooth-transition hover:shadow-2xl">
                {editingId === account.id ? (
                  <div className="space-y-4">
                    <Input
                      value={editValues.name || ''}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      className="glass-card border-border"
                      placeholder="Nome"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={editValues.amount || ''}
                      onChange={(e) => setEditValues({ ...editValues, amount: parseFloat(e.target.value) })}
                      className="glass-card border-border"
                      placeholder="Valor"
                    />
                    <Select value={editValues.dueDay?.toString() || ''} onValueChange={(value) => setEditValues({ ...editValues, dueDay: parseInt(value) })}>
                      <SelectTrigger className="glass-card border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Dia {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90">
                        Salvar
                      </Button>
                      <Button onClick={() => setEditingId(null)} variant="outline" className="flex-1">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{account.name}</h3>
                      </div>
                      <button
                        onClick={() => handleToggleStatus(account)}
                        className="smooth-transition hover:scale-110"
                      >
                        {account.status === 'pago' ? (
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-destructive" />
                        )}
                      </button>
                    </div>

                    <div className="mb-4">
                      <p className="text-3xl font-bold font-display text-primary">
                        R$ {(typeof account.value === 'string' ? parseFloat(account.value) : account.value).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Vencimento: Dia {account.dueDay} · {account.status === 'pago' ? 'Paga' : 'Pendente'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(account)}
                        className="flex-1 hover:bg-white/10"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(account.id)}
                        className="flex-1 hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
