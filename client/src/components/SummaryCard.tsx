/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Card semi-transparente com backdrop-blur, bordas luminosas e transições suaves
 * Efeito 3D fluido com mouse tracking e brilho dinâmico
 */

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export function SummaryCard({ title, value, icon: Icon, iconColor, iconBgColor }: SummaryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calcular posição relativa ao centro do card (0-100%)
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // Calcular ângulos de rotação (máximo ±15 graus)
    const rotateX = ((yPercent - 50) / 50) * -15;
    const rotateY = ((xPercent - 50) / 50) * 15;

    // Aplicar transformação 3D
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);

    // Atualizar posição do brilho
    setGlowPosition({ x: xPercent, y: yPercent });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
    setGlowPosition({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      className="glass-card rounded-2xl p-6 smooth-transition hover:shadow-2xl relative overflow-hidden"
      style={{
        transform,
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
          background: `radial-gradient(circle 200px at ${glowPosition.x}% ${glowPosition.y}%, rgba(255, 255, 255, 0.15) 0%, transparent 80%)`,
          transition: 'background 0.05s ease-out',
        }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {title}
          </p>
          <h3 className="text-3xl font-bold font-display tracking-tight">
            {value}
          </h3>
        </div>
        <div 
          className={cn(
            "p-3 rounded-xl",
            iconBgColor
          )}
        >
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
      </div>
    </div>
  );
}
