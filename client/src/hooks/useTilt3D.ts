import { useRef, useState } from 'react';

interface Tilt3DState {
  transform: string;
  glowPosition: { x: number; y: number };
}

export function useTilt3D() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltState, setTiltState] = useState<Tilt3DState>({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
    glowPosition: { x: 50, y: 50 },
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calcular posição relativa ao centro do card (0-100%)
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // Calcular ângulos de rotação (máximo ±1 grau para cards grandes)
    const rotateX = ((yPercent - 50) / 50) * -1;
    const rotateY = ((xPercent - 50) / 50) * 1;

    // Aplicar transformação 3D
    setTiltState({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      glowPosition: { x: xPercent, y: yPercent },
    });
  };

  const handleMouseLeave = () => {
    setTiltState({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      glowPosition: { x: 50, y: 50 },
    });
  };

  return {
    cardRef,
    tiltState,
    handleMouseMove,
    handleMouseLeave,
  };
}
