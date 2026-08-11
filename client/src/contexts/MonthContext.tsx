import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface MonthContextType {
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function MonthProvider({ children }: { children: React.ReactNode }) {
  const [selectedMonth, setSelectedMonthState] = useState<number>(() => {
    // Tentar recuperar do localStorage
    const saved = localStorage.getItem('selectedMonth');
    if (saved) {
      return parseInt(saved, 10);
    }
    return new Date().getMonth();
  });
  
  const [selectedYear, setSelectedYearState] = useState<number>(() => {
    // Tentar recuperar do localStorage
    const saved = localStorage.getItem('selectedYear');
    if (saved) {
      return parseInt(saved, 10);
    }
    return new Date().getFullYear();
  });

  const setSelectedMonth = useCallback((month: number) => {
    setSelectedMonthState(month);
    localStorage.setItem('selectedMonth', month.toString());
  }, []);

  const setSelectedYear = useCallback((year: number) => {
    setSelectedYearState(year);
    localStorage.setItem('selectedYear', year.toString());
  }, []);

  // Sincronizar entre abas quando localStorage muda
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedMonth' && e.newValue) {
        setSelectedMonthState(parseInt(e.newValue, 10));
      }
      if (e.key === 'selectedYear' && e.newValue) {
        setSelectedYearState(parseInt(e.newValue, 10));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <MonthContext.Provider value={{ selectedMonth, selectedYear, setSelectedMonth, setSelectedYear }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const context = useContext(MonthContext);
  if (!context) {
    throw new Error('useMonth must be used within MonthProvider');
  }
  return context;
}
