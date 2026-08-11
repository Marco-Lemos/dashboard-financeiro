/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Lista de transações recentes com ícones e valores coloridos
 * Com efeito 3D fluido ao passar o mouse
 */

import { Transaction } from '@/types/finance';
import { 
  ShoppingCart, 
  Film, 
  FileText, 
  Heart, 
  Car, 
  GraduationCap,
  DollarSign,
  Briefcase,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  PiggyBank
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTilt3D } from '@/hooks/useTilt3D';

interface TransactionListProps {
  transactions: Transaction[];
}

const categoryIcons: Record<string, any> = {
  'Alimentação': ShoppingCart,
  'Entretenimento': Film,
  'Contas': FileText,
  'Saúde': Heart,
  'Transporte': Car,
  'Carro': Car,
  'Educação': GraduationCap,
  'Salário': DollarSign,
  'Freelance': Briefcase,
  'Investimentos': PiggyBank,
  'Outros': FileText,
};

export function TransactionList({ transactions }: TransactionListProps) {
  const { cardRef, tiltState, handleMouseMove, handleMouseLeave } = useTilt3D();

  return (
    <div
      ref={cardRef}
      className="glass-card rounded-2xl p-6 smooth-transition relative overflow-hidden"
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
        className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 200px at ${tiltState.glowPosition.x}% ${tiltState.glowPosition.y}%, rgba(255, 255, 255, 0.15) 0%, transparent 80%)`,
          transition: 'background 0.05s ease-out',
        }}
      />

      <div className="relative z-10">
        <h3 className="text-xl font-bold font-display mb-6">Transações Recentes</h3>
        
        <div className="space-y-3 custom-scrollbar max-h-[500px] overflow-y-auto pr-2">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma transação encontrada
            </p>
          ) : (
            [...transactions]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 6)
              .map((transaction) => {
              const Icon = categoryIcons[transaction.category] || FileText;
              const isIncome = transaction.type === 'receita';
              const StatusIcon = isIncome ? ArrowUpCircle : ArrowDownCircle;
              
              return (
                <div 
                  key={transaction.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 smooth-transition"
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    isIncome ? "bg-primary/20" : "bg-destructive/20"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      isIncome ? "text-primary" : "text-destructive"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium truncate",
                      transaction.type === 'receita' ? "text-green-400" : 
                      transaction.type === 'despesa' ? "text-red-400" : 
                      "text-blue-400"
                    )}>{transaction.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>
                        {new Date(transaction.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <StatusIcon className={cn(
                      "w-4 h-4",
                      isIncome ? "text-primary" : "text-destructive"
                    )} />
                    <span className={cn(
                      "font-bold font-display text-sm",
                      isIncome ? "text-primary" : "text-destructive"
                    )}>
                      {isIncome ? '+' : '-'}R$ {(typeof transaction.value === 'string' ? parseFloat(transaction.value) : transaction.value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
