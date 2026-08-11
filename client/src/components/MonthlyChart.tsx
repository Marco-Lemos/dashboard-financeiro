/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Gráfico de linha com animações suaves e cores vibrantes
 * Com efeito 3D fluido ao passar o mouse
 */

import { MonthlyData } from '@/types/finance';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { useTilt3D } from '@/hooks/useTilt3D';

interface MonthlyChartProps {
  data: MonthlyData[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { cardRef, tiltState, handleMouseMove, handleMouseLeave } = useTilt3D();
  
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const axisColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const tooltipBg = isDark ? 'rgba(18, 27, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const textColor = isDark ? '#fff' : '#000';

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
        <h3 className="text-xl font-bold font-display mb-6">Visão Mensal</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <defs>
              <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="month" 
              stroke={axisColor}
              style={{ fontSize: '0.875rem' }}
            />
            <YAxis 
              stroke={axisColor}
              style={{ fontSize: '0.875rem' }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '0.75rem',
                backdropFilter: 'blur(20px)',
              }}
              labelStyle={{ color: textColor, fontWeight: 600 }}
              formatter={(value: number) => [`R$ ${value.toFixed(2)}`, '']}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '1rem' }}
              iconType="circle"
            />
            <Line 
              type="monotone" 
              dataKey="receitas" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7 }}
              name="Receitas"
              animationDuration={1200}
            />
            <Line 
              type="monotone" 
              dataKey="despesas" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ fill: '#ef4444', r: 5 }}
              activeDot={{ r: 7 }}
              name="Despesas"
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
