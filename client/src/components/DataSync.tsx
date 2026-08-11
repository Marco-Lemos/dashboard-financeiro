/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Componente para exportar e importar dados
 */

import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRef } from 'react';

export function DataSync() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      // Obter todos os dados do localStorage
      const transactions = localStorage.getItem('transactions') || '[]';
      const categories = localStorage.getItem('categories') || '[]';
      const fixedAccounts = localStorage.getItem('fixedAccounts') || '[]';
      const installments = localStorage.getItem('installments') || '[]';

      const data = {
        exportDate: new Date().toLocaleString('pt-BR'),
        transactions: JSON.parse(transactions),
        categories: JSON.parse(categories),
        fixedAccounts: JSON.parse(fixedAccounts),
        installments: JSON.parse(installments),
      };

      // Criar arquivo JSON
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Criar link de download
      const link = document.createElement('a');
      link.href = url;
      link.download = `controle-financeiro-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('✅ Dados exportados com sucesso!');
    } catch (error) {
      toast.error('❌ Erro ao exportar dados');
      console.error(error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);

          // Validar estrutura do arquivo
          if (!data.transactions || !data.categories || !data.fixedAccounts) {
            toast.error('❌ Arquivo inválido. Verifique o formato.');
            return;
          }

          // Salvar dados no localStorage
          localStorage.setItem('transactions', JSON.stringify(data.transactions));
          localStorage.setItem('categories', JSON.stringify(data.categories));
          localStorage.setItem('fixedAccounts', JSON.stringify(data.fixedAccounts));
          if (data.installments) {
            localStorage.setItem('installments', JSON.stringify(data.installments));
          }

          toast.success('✅ Dados importados com sucesso! Recarregue a página.');
          
          // Recarregar página após 1.5 segundos
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (parseError) {
          toast.error('❌ Erro ao ler o arquivo JSON');
          console.error(parseError);
        }
      };
      reader.readAsText(file);

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('❌ Erro ao importar dados');
      console.error(error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="gap-2"
        title="Exportar dados para enviar por email"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Exportar</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="gap-2"
        title="Importar dados de outro dispositivo"
      >
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline">Importar</span>
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}
