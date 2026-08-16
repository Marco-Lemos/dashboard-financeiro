/**
 * Design: Glassmorphism Financeiro Sofisticado
 * Recap animado estilo "stories", exibido uma vez por dia ao logar, com um
 * resumo rápido e visualmente marcante da situação financeira do mês.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useFinanceData } from '@/hooks/useFinanceData';
import { MONTHS } from '@/types/finance';

const SLIDE_DURATION_MS = 5000;

function useCountUp(target: number, active: boolean, duration = 1.1) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) {
      setDisplay(0);
      return;
    }
    const controls = animate(0, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [target, active, duration]);

  return display;
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function storySeenKey(userId: string) {
  return `financial-story-seen-${userId}`;
}

export function hasSeenStoryToday(userId: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return localStorage.getItem(storySeenKey(userId)) === today;
}

function markStorySeenToday(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(storySeenKey(userId), today);
}

function GlowBackground({ colorClass }: { colorClass: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className={`absolute -top-32 -left-24 w-96 h-96 rounded-full blur-3xl opacity-30 ${colorClass}`}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`absolute -bottom-32 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 ${colorClass}`}
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

interface FinancialStoryProps {
  onDismiss: () => void;
}

export function FinancialStory({ onDismiss }: FinancialStoryProps) {
  const { user } = useAuth();
  const { receitas, despesas, saldo, economia, categoryExpenses, selectedMonth } = useFinanceData();

  const topCategory = [...categoryExpenses].sort((a, b) => b.value - a.value)[0];
  const firstName = user?.name?.split(' ')[0] || '';
  const monthName = MONTHS[selectedMonth];

  const slides = [
    'greeting',
    'saldo',
    ...(topCategory ? ['maior-gasto'] : []),
    'economia',
  ] as const;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = slides[index];

  const finish = () => {
    if (user) markStorySeenToday(user.id);
    onDismiss();
  };

  const goNext = () => {
    if (index >= slides.length - 1) {
      finish();
    } else {
      setIndex((i) => i + 1);
    }
  };

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(goNext, SLIDE_DURATION_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused]);

  const saldoPositivo = saldo >= 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-background flex items-center justify-center overflow-hidden"
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Barra de progresso estilo stories */}
      <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-10">
        {slides.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
            {i < index && <div className="h-full w-full bg-white" />}
            {i === index && (
              <motion.div
                className="h-full bg-white"
                initial={{ width: '0%' }}
                animate={{ width: paused ? undefined : '100%' }}
                transition={{ duration: SLIDE_DURATION_MS / 1000, ease: 'linear' }}
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={finish}
        className="absolute top-8 right-4 z-10 text-white/70 hover:text-white smooth-transition p-2"
        aria-label="Fechar"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Áreas de toque pra navegar */}
      <button onClick={goPrev} className="absolute left-0 top-0 bottom-0 w-1/3 z-[5]" aria-label="Anterior" />
      <button onClick={goNext} className="absolute right-0 top-0 bottom-0 w-1/3 z-[5]" aria-label="Próximo" />

      <AnimatePresence mode="wait">
        {current === 'greeting' && (
          <motion.div
            key="greeting"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="relative w-full h-full flex items-center justify-center text-center px-8"
          >
            <GlowBackground colorClass="bg-primary" />
            <div className="relative z-[1]">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-muted-foreground mb-3"
              >
                {getGreeting()}{firstName ? `, ${firstName}` : ''}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-4xl md:text-5xl font-bold font-display tracking-tight"
              >
                Vamos ver como está<br />{monthName} pra você
              </motion.h1>
            </div>
          </motion.div>
        )}

        {current === 'saldo' && (
          <SaldoSlide key="saldo" saldo={saldo} receitas={receitas} despesas={despesas} monthName={monthName} active={current === 'saldo'} saldoPositivo={saldoPositivo} />
        )}

        {current === 'maior-gasto' && topCategory && (
          <MaiorGastoSlide key="maior-gasto" category={topCategory} despesas={despesas} active={current === 'maior-gasto'} />
        )}

        {current === 'economia' && (
          <EconomiaSlide key="economia" economia={economia} monthName={monthName} active={current === 'economia'} onEnter={finish} />
        )}
      </AnimatePresence>

      {index > 0 && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-[6] text-white/40 pointer-events-none hidden md:block">
          <ChevronLeft className="w-8 h-8" />
        </div>
      )}
      {current !== 'economia' && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-[6] text-white/40 pointer-events-none hidden md:block">
          <ChevronRight className="w-8 h-8" />
        </div>
      )}
    </div>
  );
}

function SaldoSlide({ saldo, receitas, despesas, monthName, active, saldoPositivo }: {
  saldo: number; receitas: number; despesas: number; monthName: string; active: boolean; saldoPositivo: boolean;
}) {
  const value = useCountUp(Math.abs(saldo), active, 1.2);
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4 }}
      className="relative w-full h-full flex items-center justify-center text-center px-8"
    >
      <GlowBackground colorClass={saldoPositivo ? 'bg-primary' : 'bg-destructive'} />
      <div className="relative z-[1]">
        <p className="text-lg text-muted-foreground mb-3">Seu saldo em {monthName}</p>
        <div className={`flex items-center justify-center gap-3 ${saldoPositivo ? 'text-primary' : 'text-destructive'}`}>
          {saldoPositivo ? <TrendingUp className="w-9 h-9" /> : <TrendingDown className="w-9 h-9" />}
          <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight">
            {saldoPositivo ? '' : '-'}{formatBRL(value)}
          </h1>
        </div>
        <p className="text-muted-foreground mt-6 text-sm md:text-base">
          {formatBRL(receitas)} em receitas · {formatBRL(despesas)} em despesas
        </p>
      </div>
    </motion.div>
  );
}

function MaiorGastoSlide({ category, despesas, active }: {
  category: { name: string; value: number; color: string }; despesas: number; active: boolean;
}) {
  const value = useCountUp(category.value, active, 1.2);
  const pct = despesas > 0 ? (category.value / despesas) * 100 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4 }}
      className="relative w-full h-full flex items-center justify-center text-center px-8"
    >
      <GlowBackground colorClass="bg-orange-500" />
      <div className="relative z-[1]">
        <p className="text-lg text-muted-foreground mb-3">Sua maior despesa foi com</p>
        <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight" style={{ color: category.color }}>
          {category.name}
        </h1>
        <p className="text-4xl md:text-5xl font-bold font-display mt-4">
          {formatBRL(value)}
        </p>
        <p className="text-muted-foreground mt-6 text-sm md:text-base">
          {pct.toFixed(0)}% de tudo que você gastou este mês
        </p>
      </div>
    </motion.div>
  );
}

function EconomiaSlide({ economia, monthName, active, onEnter }: {
  economia: number; monthName: string; active: boolean; onEnter: () => void;
}) {
  const positivo = economia >= 0;
  const value = useCountUp(Math.abs(economia), active, 1.2);
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4 }}
      className="relative w-full h-full flex items-center justify-center text-center px-8"
    >
      <GlowBackground colorClass={positivo ? 'bg-emerald-500' : 'bg-orange-500'} />
      <div className="relative z-[1]">
        <PiggyBank className="w-10 h-10 mx-auto mb-4 text-primary" />
        <p className="text-lg text-muted-foreground mb-3">
          {positivo ? `Você guardou em ${monthName}` : `Você usou a mais do que ganhou em ${monthName}`}
        </p>
        <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight">
          {positivo ? '' : '-'}{formatBRL(value)}
        </h1>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onEnter}
          className="mt-10 px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold smooth-transition inline-flex items-center gap-2"
        >
          <Wallet className="w-5 h-5" />
          Ver meu painel completo
        </motion.button>
      </div>
    </motion.div>
  );
}
