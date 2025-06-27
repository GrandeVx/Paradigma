import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { withSpring, SharedValue } from 'react-native-reanimated';

interface MonthContextType {
  currentMonth: number;
  currentYear: number;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  handleMonthChange: (month: number, year: number, animationValue?: SharedValue<number>) => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export const useMonth = () => {
  const context = useContext(MonthContext);
  if (context === undefined) {
    throw new Error('useMonth must be used within a MonthProvider');
  }
  return context;
};

interface MonthProviderProps {
  children: ReactNode;
}

export const MonthProvider: React.FC<MonthProviderProps> = ({ children }) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  // Memoized month change handler with optional animation support
  const handleMonthChange = useCallback((month: number, year: number, animationValue?: SharedValue<number>) => {
    // Animate transition if animation value is provided
    if (animationValue) {
      animationValue.value = withSpring(0.95, { duration: 200 }, () => {
        animationValue.value = withSpring(1, { duration: 300 });
      });
    }

    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  const value: MonthContextType = {
    currentMonth,
    currentYear,
    setCurrentMonth,
    setCurrentYear,
    handleMonthChange,
  };

  return (
    <MonthContext.Provider value={value}>
      {children}
    </MonthContext.Provider>
  );
}; 