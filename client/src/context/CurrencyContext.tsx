import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'USD' | 'LKR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amountUSD: number, amountLKR?: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-currency');
      return (saved as Currency) || 'USD';
    }
    return 'USD';
  });

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('app-currency', newCurrency);
  };

  const formatPrice = (amountUSD: number, amountLKR?: number) => {
    if (currency === 'LKR') {
      // If a specific LKR amount is provided (for "nice" rounded numbers in reference image)
      const amount = amountLKR !== undefined ? amountLKR : amountUSD * 300; // Static conversion for others
      return `Rs. ${amount.toLocaleString()}`;
    }
    return `$${amountUSD.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
