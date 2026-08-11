/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Gráfico de rosca com cores vibrantes, porcentagens e legenda detalhada
 * Com efeito 3D fluido ao passar o mouse
 */

import { CategoryExpense } from '@/types/finance';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useState } from 'react';
import { useTilt3D } from '@/hooks/useTilt3D';

interface ExpensesDonutChartProps {
  data: CategoryExpense[];
}

export function ExpensesDonutChart({ data }: ExpensesDonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { cardRef, tiltState, handleMouseMove, handleMouseLeave } = useTilt3D();
  
  // Calcular total para porcentagens
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
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
        <h3 className="text-xl font-bold font-display mb-6">Despesas por Categoria</h3>
        
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-full lg:w-1/2">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={1200}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.5}
                      style={{ transition: 'opacity 0.3s ease' }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(18, 27, 45, 0.95)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '0.75rem',
                    backdropFilter: 'blur(20px)',
                    color: '#ffffff',
                    padding: '8px 12px',
                  }}
                  labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full lg:w-1/2 space-y-3">
            {data.map((item, index) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between gap-3 p-2 rounded-lg transition-all duration-300 cursor-pointer"
                  style={{
                    backgroundColor: hoveredIndex === index ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: hoveredIndex === index ? '#fff' : 'inherit',
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
