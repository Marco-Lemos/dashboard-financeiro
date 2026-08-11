/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Gráfico de rosca para visualização de investimentos
 * Com efeito 3D fluido ao passar o mouse
 */

import { InvestmentData } from '@/types/finance';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTilt3D } from '@/hooks/useTilt3D';

interface InvestmentDonutChartProps {
  data: InvestmentData;
}

export function InvestmentDonutChart({ data }: InvestmentDonutChartProps) {
  const { cardRef, tiltState, handleMouseMove, handleMouseLeave } = useTilt3D();
  
  const percentage = Math.min(data.percentage, 100);
  const remaining = 100 - percentage;
  
  const chartData = [
    { name: 'Investido', value: percentage, color: '#10B981' },
    { name: 'Disponível', value: remaining, color: '#E5E7EB' }
  ];

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
        <h3 className="text-xl font-bold font-display mb-6">Investimentos</h3>
        
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-[200px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={0}
                  dataKey="value"
                  animationDuration={1200}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold font-display text-primary">
                  {percentage.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">da renda</p>
              </div>
            </div>
          </div>
          
          <div className="w-full mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }} />
                <span className="text-sm font-medium">Investido</span>
              </div>
              <span className="text-sm font-bold font-display">
                R$ {data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
