
import React, { createContext, useContext, useEffect, useState } from 'react';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState('$');

  useEffect(() => {
    // Load saved currency from localStorage
    const savedCurrency = localStorage.getItem('currency') || '$';
    setCurrencyState(savedCurrency);

    // Listen for currency changes from settings
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrencyState(event.detail);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, []);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const value = {
    currency,
    setCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
