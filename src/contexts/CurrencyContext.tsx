
import React, { createContext, useContext, useEffect, useState } from 'react';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number) => string;
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
  const [currency, setCurrencyState] = useState('Br');

  useEffect(() => {
    // Load saved currency from localStorage, default to Birr
    const savedCurrency = localStorage.getItem('currency') || 'Br';
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

  const formatCurrency = (amount: number) => {
    return `birr{currency}birr{amount.toFixed(2)}`;
  };

  const value = {
    currency,
    setCurrency,
    formatCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
