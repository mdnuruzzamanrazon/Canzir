import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem('canzir_currency') || 'BDT');

  const exchangeRate = 120; // 1 USD = 120 BDT

  const toggleCurrency = () => {
    const nextCurr = currency === 'BDT' ? 'USD' : 'BDT';
    setCurrency(nextCurr);
    localStorage.setItem('canzir_currency', nextCurr);
  };

  const formatPrice = (amountInBDT) => {
    if (amountInBDT === undefined || amountInBDT === null) return '';
    if (currency === 'USD') {
      const usdVal = (amountInBDT / exchangeRate).toFixed(2);
      return `$${usdVal}`;
    }
    return `৳${Number(amountInBDT).toLocaleString('en-IN')}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, toggleCurrency, formatPrice, exchangeRate }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
