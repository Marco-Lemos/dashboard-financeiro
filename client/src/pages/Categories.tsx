/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Categorias — todas são linhas reais no banco (as padrão são semeadas
 * automaticamente na primeira visita), então todas podem ser editadas ou
 * removidas, sem distinção especial na tela.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useFinanceData } from '@/hooks/useFinanceData';

export default function Categories() {
  const { allCategories, addCategory, updateCategory, deleteCategory } = useFinanceData();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'despesa' as 'receita' | 'despesa' | 'investimento',
    color: '#10b981',
  });

  const expenseCategories = allCategories.filter((c: any) => c.type === 'despesa');
  const incomeCategories = allCategories.filter((c: any) => c.type === 'receita');
  const investmentCategories = allCategories.filter((c: any) => c.type === 'investimento');

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast.error('Digite um nome para a categoria');
      return;
    }

    try {
      await addCategory({
        name: newCategory.name,
        type: newCategory.type,
        color: newCategory.color,
      });
      setNewCategory({ name: '', type: 'despesa', color: '#10b981' });
      setOpenDialog(false);
      toast.success('Categoria adicionada!');
    } catch (error) {
      toast.error('Não foi possível adicionar a categoria. Tente novamente.');
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setEditValues({ name: category.name, color: category.color });
  };

  const handleSave = async () => {
    if (editingId === null) return;
    try {
      await updateCategory(editingId, {
        name: editValues.name,
        color: editValues.color,
      });
      setEditingId(null);
      toast.success('Categoria atualizada!');
    } catch (error) {
      toast.error('Não foi possível atualizar a categoria. Tente novamente.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      toast.success('Categoria deletada!');
    } catch (error) {
      toast.error('Não foi possível deletar a categoria. Tente novamente.');
    }
  };

  const colors = [
    '#2563EB', '#7C3AED', '#059669', '#DC2626',
    '#0891B2', '#EA580C', '#10B981', '#6B7280',
    '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6',
    '#F7931A', '#00AA44', '#8B4513', '#D4A574'
  ];

  const renderCategorySection = (title: string, categoryList: any[]) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold font-display mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryList.length === 0 ? (
          <div className="col-span-full glass-card rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">Nenhuma categoria de {title.toLowerCase()}</p>
          </div>
        ) : (
          categoryList.map((category) => (
            <div key={category.id} className="glass-card rounded-2xl p-4">
              {editingId === category.id ? (
                <div className="space-y-3">
                  <Input
                    value={editValues.name || ''}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    className="glass-card border-border"
                    placeholder="Nome"
                  />
                  <div>
                    <p className="text-sm font-semibold mb-2">Cor:</p>
                    <div className="grid grid-cols-6 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditValues({ ...editValues, color })}
                          className={`w-6 h-6 rounded-lg smooth-transition ${
                            editValues.color === color ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-sm">
                      Salvar
                    </Button>
                    <Button onClick={() => setEditingId(null)} variant="outline" className="flex-1 text-sm">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-6 h-6 rounded-lg"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold">{category.name}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(category)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete(category.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Deletar
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl">
        <div className="container py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight">
                Categorias
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie suas categorias de transações (Receita, Despesa e Investimento)
              </p>
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-on-hover">
                  <Plus className="w-5 h-5 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">Nova Categoria</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Categoria</Label>
                    <Input
                      id="name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="Ex: Assinaturas"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="despesa"
                          checked={newCategory.type === 'despesa'}
                          onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'receita' | 'despesa' | 'investimento' })}
                        />
                        <span>Despesa</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="receita"
                          checked={newCategory.type === 'receita'}
                          onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'receita' | 'despesa' | 'investimento' })}
                        />
                        <span>Receita</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="investimento"
                          checked={newCategory.type === 'investimento'}
                          onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'receita' | 'despesa' | 'investimento' })}
                        />
                        <span>Investimento</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <div className="grid grid-cols-6 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewCategory({ ...newCategory, color })}
                          className={`w-8 h-8 rounded-lg smooth-transition ${
                            newCategory.color === color ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAddCategory} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    Adicionar Categoria
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        {renderCategorySection('Categorias de Despesa', expenseCategories)}
        {renderCategorySection('Categorias de Receita', incomeCategories)}
        {renderCategorySection('Categorias de Investimento', investmentCategories)}
      </main>
    </div>
  );
}
